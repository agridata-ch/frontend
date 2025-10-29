import { Component, input, OnDestroy, output, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  faClose,
  faMagnifyingGlass,
  faSpinner,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil, tap } from 'rxjs';
import { map } from 'rxjs/operators';

import { I18nDirective } from '@/shared/i18n';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';

/**
 * FilterInputComponent provides a search input with debounced filtering,
 * minimum character validation, and loading state management.
 * It emits search queries and loading states to parent components.
 * It also exposes methods to interact with the search input programmatically.
 * CommentLastReviewed: 2025-09-24
 */
@Component({
  selector: 'app-search-input',

  imports: [
    ReactiveFormsModule,
    FormsModule,
    AgridataInputComponent,
    FontAwesomeModule,
    I18nDirective,
  ],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements OnDestroy {
  readonly minSearchLength = input(3);
  readonly debounceTime = input(300);
  readonly isLoading = input<boolean>(false);

  readonly onInput = output<string>();

  protected readonly magnifyingGlassIcon = faMagnifyingGlass;
  protected readonly faClose = faClose;
  protected readonly faSpinner = faSpinner;
  private readonly destroy$ = new Subject<boolean>();

  protected readonly trimmedValue = signal('');
  protected readonly value = signal<string>('');

  constructor() {
    toObservable(this.value)
      .pipe(
        takeUntil(this.destroy$),
        map((value) => (value ? value.trim() : '')),
        tap((value) => this.trimmedValue.set(value)),
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        filter(
          (debouncedValue) =>
            debouncedValue === '' || debouncedValue.length >= this.minSearchLength(),
        ),
      )
      .subscribe((debouncedValue) => {
        this.onInput.emit(debouncedValue);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  clearSearch() {
    this.value.set('');
    this.onInput.emit('');
  }
}
