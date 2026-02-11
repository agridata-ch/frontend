import { Component, input, model, output } from '@angular/core';

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
  imports: [],
  templateUrl: './agridata-tabs.component.html',
})
export class AgridataTabsComponent {
  readonly tabs = input.required<Tab[]>();

  readonly activeTabId = model.required<string>();

  readonly tabChange = output<string>();

  protected handleTabClick(tab: Tab): void {
    if (tab.disabled) {
      return;
    }
    this.activeTabId.set(tab.id);
    this.tabChange.emit(tab.id);
  }
}
