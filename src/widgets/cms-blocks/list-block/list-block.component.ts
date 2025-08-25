import { Component, input } from '@angular/core';

import { List } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

/**
 * Implements the logic for displaying headings and items, with support for icons sourced from the CMS.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-list-block',
  imports: [],
  templateUrl: './list-block.component.html',
})
export class ListBlockComponent {
  readonly list = input.required<List>();

  protected readonly generateMediaUrl = generateMediaUrl;
}
