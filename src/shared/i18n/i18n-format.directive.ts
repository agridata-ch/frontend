import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { Marked } from 'marked';

// Own marked instance because markdown.pipe.ts mutates the global marked state via setOptions.
const inlineMarked = new Marked({ gfm: true, breaks: false });

// Inline formatting is harmless no matter who authored the text, so it is kept. Everything else —
// anchors, images, anything carrying a URL or an attribute — is unwrapped to its text content: the
// bound string arrives with its translation params already interpolated, so an untrusted param value
// cannot be told apart from the trusted template at this point.
const ALLOWED_TAGS = new Set([
  'B',
  'BR',
  'CODE',
  'DEL',
  'EM',
  'I',
  'INS',
  'MARK',
  'S',
  'SMALL',
  'STRONG',
  'SUB',
  'SUP',
  'U',
]);

/**
 * Renders a translated string that contains inline markdown formatting (`**bold**`, `*italic*`,
 * `` `code` ``, `~~strikethrough~~`) into the host element. Angular interpolation escapes markup, so
 * a translation that should render formatting has to be bound with this directive instead of
 * `{{ t('key') }}`.
 *
 * Only inline formatting elements survive. Links, images and raw HTML are reduced to their text
 * content, because translation params are interpolated into the string before this directive sees it
 * and those values are untrusted (e.g. a consumer-defined organisation name). Use
 * `LinkedTextComponent` when a translation genuinely needs a link.
 *
 * CommentLastReviewed: 2026-08-03
 */
@Directive({
  selector: '[i18nFormat]',
})
export class I18nFormatDirective {
  // Injects
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  // Input properties
  readonly i18nFormat = input.required<string>();

  // Effects
  private readonly renderEffect = effect(() => {
    this.host.nativeElement.replaceChildren(...this.buildNodes(this.i18nFormat()));
  });

  private buildNodes(value: string): Node[] {
    const parsed = inlineMarked.parseInline(value);
    if (typeof parsed !== 'string') return [];

    // Inert document: no scripts run and nothing is attached to the live DOM.
    const body = new DOMParser().parseFromString(parsed, 'text/html').body;

    return this.rebuild(body);
  }

  /**
   * Rebuilds the children of `source`, keeping allowlisted formatting elements and copying no
   * attributes. A disallowed element is unwrapped: its children survive, the element itself does not.
   */
  private rebuild(source: Node): Node[] {
    const nodes: Node[] = [];

    for (const child of Array.from(source.childNodes)) {
      if (child instanceof Text) {
        nodes.push(this.renderer.createText(child.data));
        continue;
      }

      if (!(child instanceof Element)) continue;

      if (!ALLOWED_TAGS.has(child.tagName)) {
        nodes.push(...this.rebuild(child));
        continue;
      }

      const element = this.renderer.createElement(child.tagName.toLowerCase());
      for (const grandChild of this.rebuild(child)) {
        this.renderer.appendChild(element, grandChild);
      }
      nodes.push(element);
    }

    return nodes;
  }
}
