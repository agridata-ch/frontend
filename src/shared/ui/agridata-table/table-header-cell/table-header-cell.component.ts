import { Component, HostBinding, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/pro-light-svg-icons';

import { I18nPipe } from '@/shared/i18n';
import { ColumnDefinition, SortDirections } from '@/shared/ui/agridata-table';

/**
 * Renders a Header cell of an agridata table, featuring sort buttons and custom styles
 *
 * CommentLastReviewed: 2025-09-29
 **/
@Component({
  selector: 'app-table-header-cell',
  imports: [FaIconComponent, I18nPipe],
  templateUrl: './table-header-cell.component.html',
})
export class TableHeaderCellComponent<T> {
  readonly columnDefinition = input.required<ColumnDefinition<T>>();
  readonly sortDirection = input<SortDirections | undefined>(undefined);
  readonly sortChange = output<SortDirections | undefined>();

  @HostBinding('style.display') display = 'contents';

  protected toggleColumnSort(): void {
    if (this.columnDefinition().sortable) {
      const newDirection =
        this.sortDirection() === SortDirections.DESC ? SortDirections.ASC : SortDirections.DESC;
      this.sortChange.emit(newDirection);
    }
  }

  protected getSortIcon() {
    const direction = this.sortDirection();
    if (!direction) return undefined;

    return direction === SortDirections.DESC ? faArrowDown : faArrowUp;
  }
}
