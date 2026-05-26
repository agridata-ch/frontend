import { Component, computed, effect, inject, resource, signal, untracked } from '@angular/core';
import { faBell } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NotificationService } from '@/entities/api/notification.service';
import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nDirective } from '@/shared/i18n';
import { PopoverComponent } from '@/shared/ui/popover';

import { NotificationOverlayContentComponent } from './notification-overlay-content/notification-overlay-content.component';

/**
 * Component responsible for displaying a notification overlay,
 * allowing users to view their notifications in a popover.
 * It utilizes the NotificationService to fetch notifications and
 * manages the visibility of the popover through a signal.
 *
 * CommentLastReviewed: 2026-05-06
 */
@Component({
  selector: 'app-notification-overlay',
  imports: [
    FontAwesomeModule,
    PopoverComponent,
    I18nDirective,
    NotificationOverlayContentComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './notification-overlay.component.html',
})
export class NotificationOverlayComponent {
  // Injects
  private readonly notificationService = inject(NotificationService);

  // Constants
  protected readonly faBell = faBell;

  // Signals
  protected readonly showPopover = signal(false);

  // Computed
  protected readonly hasUnreadNotifications = computed(() => {
    const notificationItems = this.notificationResource.value()?.items;
    return notificationItems
      ? notificationItems.some((notification) => !notification.isRead)
      : false;
  });

  // Resources
  readonly notificationResource = resource({
    loader: () => this.notificationService.fetchHeaderNotifications(),
  });

  // Effects
  private readonly syncEffect = effect(() => {
    const trigger = this.notificationService.mutationTrigger();
    if (trigger === 0) return;
    untracked(() => this.notificationResource.reload());
  });

  // Methods
  protected closeOverlay() {
    this.showPopover.set(false);
  }

  protected handleToggle() {
    this.showPopover.update((isOpen) => !isOpen);
  }
}
