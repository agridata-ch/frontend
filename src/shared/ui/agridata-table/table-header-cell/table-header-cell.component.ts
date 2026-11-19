import { Component, computed, input, output } from '@angular/core';
import { faArrowDown, faArrowUp } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { I18nPipe } from '@/shared/i18n';
import { ColumnDefinition, SortDirections } from '@/shared/ui/agridata-table';

/**
 * Renders a Header cell of an agridata table, featuring sort buttons and custom styles.
 * Attribute selector so the host is the th itself.
 *
 * CommentLastReviewed: 2026-11-05
 **/
@Component({
  selector: 'th[app-table-header-cell]',
  imports: [FaIconComponent, I18nPipe],
  templateUrl: './table-header-cell.component.html',
  host: {
    class:
      'py-2 px-2 first:pl-4 last:pr-4 select-none text-slate-500 outline-0 focus:bg-gray-200 text-sm font-semibold align-middle h-12',
    '[class]': 'columnDefinition().headerCssClasses',
    '[class.hover:bg-gray-50]': 'columnDefinition().sortable',
    '[class.cursor-pointer]': 'columnDefinition().sortable',
    '[attr.tabindex]': 'columnDefinition().sortable ? 0 : null',
    '[attr.aria-sort]': 'ariaSort()',
    '(click)': 'toggleColumnSort()',
    '(keydown.enter)': 'toggleColumnSort()',
  },
})
export class TableHeaderCellComponent<T> {
  // Input properties
  readonly columnDefinition = input.required<ColumnDefinition<T>>();
  readonly sortDirection = input<SortDirections | undefined>(undefined);

  // Output properties
  readonly sortChange = output<SortDirections | undefined>();

  // Computed Signals
  protected readonly ariaSort = computed(() => {
    const direction = this.sortDirection();
    if (!direction) return null;
    return direction === SortDirections.DESC ? 'descending' : 'ascending';
  });

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
