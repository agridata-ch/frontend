import { Component, output, signal } from '@angular/core';
import { faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { I18nDirective } from '@/shared/i18n';
import { ButtonVariants } from '@/shared/ui/button';

/**
 * A banner component to celebrate the New Year with localStorage persistence.
 *
 * CommentLastReviewed: 2025-12-08
 */
@Component({
  selector: 'app-new-year-banner',
  imports: [I18nDirective, FontAwesomeModule],
  templateUrl: './new-year-banner.component.html',
  styleUrl: './new-year-banner.component.css',
})
export class NewYearBannerComponent {
  private readonly STORAGE_KEY = 'dismissNewYearBanner';

  public readonly closeBanner = output<void>();

  protected readonly currentYear = signal<number>(new Date().getFullYear());
  protected readonly showBanner = signal<boolean>(this.shouldShowBanner());

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly closeIcon = faClose;

  protected handleClose(): void {
    this.showBanner.set(false);

    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.closeBanner.emit();
  }

  private isWithinNewYearPeriod(): boolean {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1); // January 1st
    const endDate = new Date(now.getFullYear(), 0, 16); // January 16th (exclusive)

    return now >= startDate && now < endDate;
  }

  private shouldShowBanner(): boolean {
    if (!this.isWithinNewYearPeriod()) {
      return false;
    }

    try {
      const dismissed = localStorage.getItem(this.STORAGE_KEY);
      return dismissed !== 'true';
    } catch (error) {
      console.error('Failed to read banner state from localStorage:', error);
      return true;
    }
  }
}
