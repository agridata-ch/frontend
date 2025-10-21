import { Component } from '@angular/core';

import { I18nDirective } from '@/shared/i18n';

/**
 * A simple component to display an empty state message or graphic
 * when there is no data to show in a table or list.
 *
 * CommentLastReviewed: 2025-10-21
 **/
@Component({
  selector: 'app-empty-state',
  imports: [I18nDirective],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {}
