import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Signal,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  faBold,
  faItalic,
  faList,
  faListOl,
  faTextSlash,
  faUnderline,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Editor } from '@tiptap/core';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { StarterKit } from '@tiptap/starter-kit';

import { I18nDirective } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { TooltipDirective } from '@/shared/tooltip';

/** A single toolbar toggle button: its icon, i18n label key, active-state signal and command. */
interface ToolbarButton {
  readonly icon: typeof faBold;
  readonly label: string;
  readonly isActive?: Signal<boolean>;
  readonly action: () => void;
}

/**
 * Implements a simple headless WYSIWYG rich-text editor based on TipTap. It binds to a reactive form
 * control, offers a minimal toolbar (bold, italic, underline, bullet + numbered lists, reset format),
 * supports error and disabled states, and a read-only view mode that renders the stored HTML. It emits
 * blur events for external handling.
 *
 * The TipTap schema is restricted to the supported formatting only. Any unsupported node (heading,
 * blockquote, code block, horizontal rule) or mark (inline code, strike, link) that arrives via paste
 * or from previously stored HTML is coerced to a plain paragraph / stripped to plain text on parse, so
 * unsupported formatting can never be saved.
 *
 * Security: view mode renders the stored HTML via [innerHTML], which Angular's built-in DomSanitizer
 * sanitizes automatically (the value is a plain string, never SafeHtml). This guards our own rendering
 * only; server-side sanitization remains the authoritative boundary since the API can be written
 * directly, bypassing the editor.
 *
 * CommentLastReviewed: 2026-07-09
 */
@Component({
  selector: 'app-agridata-wysiwyg',
  imports: [I18nDirective, FaIconComponent, NgTemplateOutlet, TooltipDirective],
  templateUrl: './agridata-wysiwyg.component.html',
})
export class AgridataWysiwygComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Constants
  protected readonly faBold = faBold;
  protected readonly faItalic = faItalic;
  protected readonly faUnderline = faUnderline;
  protected readonly faList = faList;
  protected readonly faListOl = faListOl;
  protected readonly faTextSlash = faTextSlash;

  // Input properties
  readonly control = input<FormControlWithMessages>();
  readonly id = input<string>('');
  readonly placeholder = input<string>('');
  readonly maxCharacters = input<number | null>(1000);
  readonly hasError = input<boolean>(false);
  readonly isViewMode = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly handleBlur = output<void>();

  protected readonly editorHost = viewChild<ElementRef<HTMLElement>>('editorHost');

  private editor?: Editor;
  private editorCleanup?: () => void;
  private editorElement?: HTMLElement;
  private editorControl?: FormControlWithMessages;
  private editorPlaceholder?: string;
  private editorMaxCharacters?: number | null;

  // Signals
  private readonly editorState = signal(0);

  // Computed Signals
  protected readonly isBold = computed(() => this.isActive('bold'));
  protected readonly isItalic = computed(() => this.isActive('italic'));
  protected readonly isUnderline = computed(() => this.isActive('underline'));
  protected readonly isBulletList = computed(() => this.isActive('bulletList'));
  protected readonly isOrderedList = computed(() => this.isActive('orderedList'));
  protected readonly characterCount = computed(() => {
    // Re-read on every editor transaction so the counter stays reactive under zoneless CD.
    this.editorState();
    return this.editor?.storage.characterCount.characters() ?? 0;
  });

  protected readonly toolbarButtons: readonly ToolbarButton[] = [
    { icon: faBold, label: 'bold', isActive: this.isBold, action: () => this.toggleBold() },
    { icon: faItalic, label: 'italic', isActive: this.isItalic, action: () => this.toggleItalic() },
    {
      icon: faUnderline,
      label: 'underline',
      isActive: this.isUnderline,
      action: () => this.toggleUnderline(),
    },
    {
      icon: faList,
      label: 'bulletList',
      isActive: this.isBulletList,
      action: () => this.toggleBulletList(),
    },
    {
      icon: faListOl,
      label: 'orderedList',
      isActive: this.isOrderedList,
      action: () => this.toggleOrderedList(),
    },
  ];

  // Effects
  // The #editorHost lives in the edit-mode branch and inside @defer / @switch blocks, so Angular can
  // swap it for a fresh element (view<->edit toggle, step change) without the effect ever observing a
  // null in between. Remount whenever the host element OR a create-time input (bound control,
  // placeholder, character limit) changes, otherwise the editor stays stuck on the old element/control
  // and renders empty or keeps stale config. The disabled state is applied live by editableEffect, so
  // it deliberately does not force a remount.
  private readonly initEditorEffect = effect(() => {
    const element = this.editorHost()?.nativeElement;
    const control = this.control();
    const placeholder = this.placeholder();
    const maxCharacters = this.maxCharacters();
    if (
      element === this.editorElement &&
      control === this.editorControl &&
      placeholder === this.editorPlaceholder &&
      maxCharacters === this.editorMaxCharacters
    ) {
      return;
    }
    this.destroyEditor();
    if (element) {
      this.createEditor(element);
    }
    this.editorElement = element;
    this.editorControl = control;
    this.editorPlaceholder = placeholder;
    this.editorMaxCharacters = maxCharacters;
  });

  private readonly editableEffect = effect(() => {
    const disabled = this.disabled();
    this.editor?.setEditable(!disabled);
  });

  private readonly editorTeardown = this.destroyRef.onDestroy(() => this.destroyEditor());

  protected resetFormat(): void {
    this.editor?.chain().focus().unsetAllMarks().clearNodes().run();
  }

  protected toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  protected toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  protected toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  protected toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  protected toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  private createEditor(element: HTMLElement): void {
    const control = this.control();

    this.editor = new Editor({
      element,
      extensions: [
        // Restrict the schema to supported formatting only. Unsupported nodes/marks arriving via paste
        // or stored HTML are coerced to plain paragraphs / stripped to plain text on parse.
        StarterKit.configure({
          blockquote: false,
          code: false,
          codeBlock: false,
          heading: false,
          horizontalRule: false,
          link: false,
          strike: false,
        }),
        CharacterCount.configure({ limit: this.maxCharacters() }),
        Placeholder.configure({ placeholder: this.placeholder() }),
      ],
      content: typeof control?.value === 'string' ? control.value : '',
      editable: !this.disabled(),
      editorProps: {
        attributes: { class: 'rich-text-content min-h-40 px-4 py-3 focus:outline-none' },
      },
    });

    this.editor.on('update', () => this.syncToControl());
    this.editor.on('transaction', () => this.editorState.update((version) => version + 1));
    this.editor.on('blur', () => {
      control?.markAsTouched();
      this.handleBlur.emit();
    });

    const subscription = control?.valueChanges.subscribe((value: unknown) =>
      this.syncFromControl(value),
    );

    // Bump once so computeds (character count, toolbar state) reflect the initial content.
    this.editorState.update((version) => version + 1);

    // Per-editor teardown so recreating the editor on a mode toggle never stacks subscriptions or
    // leaks the previous TipTap instance. Idempotent, so the effect and onDestroy can both call it.
    this.editorCleanup = () => {
      subscription?.unsubscribe();
      this.editor?.destroy();
      this.editor = undefined;
    };
  }

  private destroyEditor(): void {
    this.editorCleanup?.();
    this.editorCleanup = undefined;
  }

  private isActive(name: string, attributes?: Record<string, unknown>): boolean {
    // Re-read on every editor transaction so toolbar state stays reactive under zoneless CD.
    this.editorState();
    return this.editor?.isActive(name, attributes) ?? false;
  }

  private syncFromControl(value: unknown): void {
    const editor = this.editor;
    if (!editor) {
      return;
    }

    const next = typeof value === 'string' ? value : '';
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }

  private syncToControl(): void {
    const editor = this.editor;
    const control = this.control();
    if (!editor || !control) {
      return;
    }

    // An "empty" TipTap document still serialises to <p></p>; normalise to '' so required/minLength
    // validation on the underlying control keeps working.
    control.setValue(editor.isEmpty ? '' : editor.getHTML());
  }
}
