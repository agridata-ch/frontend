import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import {
  faBold,
  faH1,
  faH2,
  faH3,
  faItalic,
  faList,
  faListOl,
  faTextSlash,
  faUnderline,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Editor, Extension, getHTMLFromFragment } from '@tiptap/core';
import { OrderedList } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import { Plugin, PluginKey } from '@tiptap/pm/state';
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
 * TipTap serialises an empty paragraph as `<p></p>`, which has no height once rendered, so a blank
 * line between paragraphs or lists would vanish after saving. Store it as `<p><br></p>` instead, which
 * renders as one line and is read back as an empty paragraph.
 */
function keepEmptyParagraphs(html: string): string {
  return html.replaceAll('<p></p>', '<p><br></p>');
}

/**
 * Blocks input that would push the serialised HTML past `limit`, matching the backend's raw-HTML
 * maxLength. Deletions are always allowed so content already over the limit (e.g. loaded from the
 * API) can be edited down.
 */
function htmlLengthLimit(limit: number | null): Extension {
  return Extension.create({
    name: 'htmlLengthLimit',
    addProseMirrorPlugins() {
      const schema = this.editor.schema;
      return [
        new Plugin({
          key: new PluginKey('htmlLengthLimit'),
          filterTransaction: (tr, state) => {
            if (limit == null || !tr.docChanged) {
              return true;
            }
            const next = keepEmptyParagraphs(getHTMLFromFragment(tr.doc.content, schema)).length;
            return (
              next <= limit ||
              next <= keepEmptyParagraphs(getHTMLFromFragment(state.doc.content, schema)).length
            );
          },
        }),
      ];
    },
  });
}

const BLOCKS = 'p, ul, ol, h1, h2, h3';

/**
 * Pasted lists carry `<img>` placeholders, `<br>`s sitting directly between list items, and list items
 * that hold nothing but breaks. TipTap would show those as empty bullets. Drop the images and turn each
 * of those separators into an empty paragraph between two lists, so the break stays visible without a
 * bullet. A top-level `<br>` that follows a block (e.g. after a list) likewise becomes an empty paragraph;
 * one after inline text stays a line break.
 */
function cleanListHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((img) => img.remove());
  doc.body.querySelectorAll(':scope > br').forEach((br) => {
    const previous = br.previousSibling;
    const followsBlock =
      previous === null || (previous instanceof Element && previous.matches(BLOCKS));
    if (followsBlock) {
      br.replaceWith(doc.createElement('p'));
    }
  });
  doc.querySelectorAll('ul > br, ol > br, li:not(:has(li))').forEach((separator) => {
    const list = separator.parentElement;
    if (!list || (separator.tagName === 'LI' && separator.textContent?.trim())) {
      return;
    }
    const rest = list.cloneNode(false);
    while (separator.nextSibling) {
      rest.appendChild(separator.nextSibling);
    }
    // Keep numbered lists counting on across the break instead of restarting at 1.
    if (list instanceof HTMLOListElement && rest instanceof HTMLOListElement) {
      const itemsBefore = [...list.children].filter((c) => c !== separator && c.tagName === 'LI');
      rest.start = list.start + itemsBefore.length;
    }
    separator.remove();
    const gap = doc.createElement('p');
    list.after(gap);
    gap.after(rest);
    [list, rest].forEach((l) => l instanceof Element && !l.querySelector('li') && l.remove());
  });
  return doc.body.innerHTML;
}

/** Applies {@link cleanListHtml} to pasted HTML. */
const cleanPastedLists = Extension.create({
  name: 'cleanPastedLists',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('cleanPastedLists'),
        props: { transformPastedHTML: cleanListHtml },
      }),
    ];
  },
});

/**
 * Angular's stock `Validators.minLength` checks `control.value.length`, but this control stores
 * serialised HTML (e.g. `<p>ab</p>` is already 10 characters for 2 visible ones). Check the visible
 * text length instead so the "at least N characters" error reflects what the user actually typed.
 */
function minVisibleTextLength(min: number): ValidatorFn {
  return (control) => {
    const html = typeof control.value === 'string' ? control.value : '';
    const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
    return text.length < min ? { minlength: true } : null;
  };
}

/**
 * Implements a simple headless WYSIWYG rich-text editor based on TipTap. It binds to a reactive form
 * control, offers a minimal toolbar in divided groups (bold/italic/underline; bullet + numbered lists;
 * optional headings H1-H3; reset format),
 * supports error and disabled states, and a read-only view mode that renders the stored HTML. It emits
 * blur events for external handling.
 *
 * The TipTap schema is restricted to the supported formatting only. Any unsupported node (blockquote,
 * code block, horizontal rule) or mark (inline code, strike, link) that arrives via paste or from
 * previously stored HTML is coerced to a plain paragraph / stripped to plain text on parse, so
 * unsupported formatting can never be saved. Headings (H1-H3) are opt-in via `allowHeadings`; without
 * it they are coerced to paragraphs as well.
 *
 * Security: view mode renders the stored HTML via [innerHTML], which Angular's built-in DomSanitizer
 * sanitizes automatically (the value is a plain string, never SafeHtml). This guards our own rendering
 * only; server-side sanitization remains the authoritative boundary since the API can be written
 * directly, bypassing the editor.
 *
 * CommentLastReviewed: 2026-11-04
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
  private readonly HEADING_ICONS = { 1: faH1, 2: faH2, 3: faH3 } as const;

  // Input properties
  readonly allowHeadings = input<boolean>(false);
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
  private editorAllowHeadings?: boolean;
  private editorCleanup?: () => void;
  private editorElement?: HTMLElement;
  private editorControl?: FormControlWithMessages;
  private editorPlaceholder?: string;
  private editorMaxCharacters?: number | null;
  private minLengthValidatedControl?: FormControlWithMessages;

  // Signals
  private readonly editorState = signal(0);

  // Computed Signals
  protected readonly isBold = computed(() => this.isActive('bold'));
  protected readonly isItalic = computed(() => this.isActive('italic'));
  protected readonly isUnderline = computed(() => this.isActive('underline'));
  protected readonly isBulletList = computed(() => this.isActive('bulletList'));
  protected readonly isOrderedList = computed(() => this.isActive('orderedList'));

  protected readonly formatButtons: readonly ToolbarButton[] = [
    { icon: faBold, label: 'bold', isActive: this.isBold, action: () => this.toggleBold() },
    { icon: faItalic, label: 'italic', isActive: this.isItalic, action: () => this.toggleItalic() },
    {
      icon: faUnderline,
      label: 'underline',
      isActive: this.isUnderline,
      action: () => this.toggleUnderline(),
    },
  ];

  protected readonly listButtons: readonly ToolbarButton[] = [
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

  protected readonly headingButtons: readonly ToolbarButton[] = ([1, 2, 3] as const).map(
    (level) => ({
      icon: this.HEADING_ICONS[level],
      label: `heading${level}`,
      isActive: computed(() => this.isActive('heading', { level })),
      action: () => this.toggleHeading(level),
    }),
  );

  // Effects
  // The #editorHost lives in the edit-mode branch and inside @defer / @switch blocks, so Angular can
  // swap it for a fresh element (view<->edit toggle, step change) without the effect ever observing a
  // null in between. Remount whenever the host element OR a create-time input (bound control,
  // placeholder, character limit) changes, otherwise the editor stays stuck on the old element/control
  // and renders empty or keeps stale config. The disabled state is applied live by editableEffect, so
  // it deliberately does not force a remount.
  private readonly initEditorEffect = effect(() => {
    const element = this.editorHost()?.nativeElement;
    const allowHeadings = this.allowHeadings();
    const control = this.control();
    const placeholder = this.placeholder();
    const maxCharacters = this.maxCharacters();
    if (
      element === this.editorElement &&
      allowHeadings === this.editorAllowHeadings &&
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
    this.editorAllowHeadings = allowHeadings;
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

  protected toggleHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
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

    if (control?.minLength != null && control !== this.minLengthValidatedControl) {
      control.addValidators(minVisibleTextLength(control.minLength));
      control.updateValueAndValidity();
      this.minLengthValidatedControl = control;
    }

    this.editor = new Editor({
      element,
      extensions: [
        // Restrict the schema to supported formatting only. Unsupported nodes/marks arriving via paste
        // or stored HTML are coerced to plain paragraphs / stripped to plain text on parse.
        StarterKit.configure({
          blockquote: false,
          code: false,
          codeBlock: false,
          heading: this.allowHeadings() ? { levels: [1, 2, 3] } : false,
          horizontalRule: false,
          link: false,
          strike: false,
          orderedList: false,
        }),
        // Only `start` survives (needed to keep numbering across a break); `type` and others are dropped.
        OrderedList.extend({
          addAttributes: () => ({
            start: {
              default: 1,
              parseHTML: (el: HTMLElement) => Number(el.getAttribute('start')) || 1,
            },
          }),
        }),
        cleanPastedLists,
        htmlLengthLimit(this.maxCharacters()),
        Placeholder.configure({ placeholder: this.placeholder() }),
      ],
      content: typeof control?.value === 'string' ? cleanListHtml(control.value) : '',
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
    const current = editor.isEmpty ? '' : keepEmptyParagraphs(editor.getHTML());
    if (next !== current) {
      editor.commands.setContent(cleanListHtml(next), { emitUpdate: false });
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
    control.setValue(editor.isEmpty ? '' : keepEmptyParagraphs(editor.getHTML()));
  }
}
