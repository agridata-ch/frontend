import { Directive, input } from '@angular/core';

/**
 * Applies the view-mode container styling (border + dividers) to the host element.
 * Classes are added in view mode and removed in edit mode.
 *
 * CommentLastReviewed: 2026-06-16
 */
@Directive({
  selector: '[appViewSection]',
  host: {
    class: 'flex flex-col transition-all duration-50 ease-in rounded-md border divide-y',
    '[class.border-transparent]': '!isViewMode()',
    '[class.divide-transparent]': '!isViewMode()',
    '[class.border-agridata-stroke]': 'isViewMode()',
    '[class.divide-agridata-stroke]': 'isViewMode()',
  },
})
export class ViewSectionDirective {
  readonly isViewMode = input.required<boolean>();
}
