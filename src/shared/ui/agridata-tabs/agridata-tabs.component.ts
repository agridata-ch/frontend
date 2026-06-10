import { Component, input, model, output } from '@angular/core';
import { faWarning } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { Tab } from '@/shared/ui/agridata-tabs/agridata-tabs.model';

/**
 * Renders a horizontal tab bar with clickable tab labels. Tracks the active tab
 * and emits when the user switches tabs. Tab content is rendered by the consumer
 * outside this component.
 *
 * CommentLastReviewed: 2026-02-11
 */
@Component({
  selector: 'app-agridata-tabs',
  imports: [FontAwesomeModule],
  templateUrl: './agridata-tabs.component.html',
})
export class AgridataTabsComponent {
  readonly tabs = input.required<Tab[]>();

  readonly activeTabId = model.required<string>();

  readonly tabChange = output<string>();

  protected readonly faWarning = faWarning;

  protected handleTabClick(tab: Tab): void {
    if (tab.disabled) {
      return;
    }
    this.activeTabId.set(tab.id);
    this.tabChange.emit(tab.id);
  }
}
