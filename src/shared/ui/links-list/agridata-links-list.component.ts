import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { faExternalLink } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ViewSectionDirective } from '@/shared/view-section';

/**
 * Presentational read-only list of links. Renders each link as an external anchor (icon + text)
 * inside the shared view-section container. Holds no domain knowledge and does no fetching — used
 * both by the data-product links tab (view mode) and the public data catalog detail modal.
 *
 * CommentLastReviewed: 2026-09-02
 */
@Component({
  selector: 'app-agridata-links-list',
  imports: [FontAwesomeModule, ViewSectionDirective],
  templateUrl: './agridata-links-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgridataLinksListComponent {
  // Constants
  protected readonly faLink = faExternalLink;

  // Input properties
  readonly links = input<{ url?: string; displayText?: string }[]>([]);
}
