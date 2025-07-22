import { NgClass } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faGear,
  faGlobe,
  faUnlockKeyhole,
} from '@fortawesome/free-solid-svg-icons';

import { I18nPipe } from '@/shared/i18n';
import { AuthService, UserData } from '@/shared/lib/auth';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { PopoverComponent } from '@/shared/ui/popover/popover.component';

@Component({
  selector: 'app-account-overlay',
  imports: [I18nPipe, NgClass, ButtonComponent, FaIconComponent, PopoverComponent],
  templateUrl: './account-overlay.component.html',
  styleUrl: './account-overlay.component.css',
})
export class AccountOverlayComponent {
  userData = input<UserData | null>(null);

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly keyHoleIcon = faUnlockKeyhole;
  protected readonly globeIcon = faGlobe;
  protected readonly gearIcon = faGear;

  initials = computed(() => this.getInitials(this.userData()?.name));
  overlayOpen = signal(false);
  dropdownIcon = computed(() => {
    return this.overlayOpen() ? faChevronUp : faChevronDown;
  });

  private readonly authService = inject(AuthService);

  logout = () => {
    this.authService.logout();
  };

  private getInitials(fullName: string | undefined): string {
    if (!fullName) return '';
    const tokens = fullName.trim().split(/\s+/);
    if (tokens.length === 0) return '';
    const first = tokens[0][0] || '';
    const last = tokens.length > 1 ? tokens[tokens.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  toggleOverlay() {
    this.overlayOpen.set(!this.overlayOpen());
  }
}
