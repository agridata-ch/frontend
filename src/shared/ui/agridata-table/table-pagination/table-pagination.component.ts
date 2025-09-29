import { Component, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { I18nDirective } from '@/shared/i18n';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { PAGE_SIZES } from '@/shared/ui/agridata-table';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Renders a pagination component, allowing the user to navigate between the pages and select the number of items / page
 *
 * CommentLastReviewed: 2025-09-29
 **/
@Component({
  selector: 'app-table-pagination',
  imports: [AgridataSelectComponent, ButtonComponent, FaIconComponent, I18nDirective],
  templateUrl: './table-pagination.component.html',
})
export class TablePaginationComponent {
  // input signals
  readonly currentPageIndex = input(0);
  readonly totalPages = input(1);
  readonly pageSize = input<number>(PAGE_SIZES[0]);

  // output signals
  readonly pageSizeChange = output<number>();
  readonly pageChange = output<number>();

  readonly SELECTABLE_PAGE_SIZES: MultiSelectOption[] = PAGE_SIZES.map((item) => {
    return { value: item, label: item.toString() };
  });
  protected readonly faChevronLeft = faChevronLeft;
  protected readonly faChevronRight = faChevronRight;
  protected readonly ButtonVariants = ButtonVariants;

  protected navigateToPreviousPage(): void {
    this.pageChange.emit(Math.max(0, this.currentPageIndex() - 1));
  }

  protected navigateToNextPage(): void {
    const maxPage = this.totalPages() - 1;
    this.pageChange.emit(Math.min(maxPage, this.currentPageIndex() + 1));
  }

  protected canNavigateToPrevious(): boolean {
    return this.currentPageIndex() > 0;
  }

  protected canNavigateToNext(): boolean {
    return this.currentPageIndex() < this.totalPages() - 1;
  }

  setNewPageSize(pageSize: string | number | null) {
    this.pageSizeChange.emit(pageSize as number);
  }
}
