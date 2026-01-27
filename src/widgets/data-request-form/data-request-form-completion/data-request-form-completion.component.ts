import { Component, ElementRef, viewChild } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-data-request-form-completion',
  imports: [],
  templateUrl: './data-request-form-completion.component.html',
})
export class DataRequestFormCompletionComponent {
  // Throws an Angular error if the element isn't found (instead of undefined later)
  readonly mailTemplate = viewChild.required<ElementRef<HTMLElement>>('mailTemplate');

  async copy(e: MouseEvent) {
    e.preventDefault();

    const el = this.mailTemplate().nativeElement; // always defined if query matched
    const html = el.innerHTML.trim();
    const plain = el.innerText.trim();

    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plain], { type: 'text/plain' }),
    });

    await (navigator.clipboard as any).write([item]);
  }
}
