import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { faExternalLink, faEye } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faMailbox } from '@awesome.me/kit-0b6d1ed528/icons/duotone/light';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NotificationService } from '@/entities/api/notification.service';
import { InboxEntryDto, MarkAsReadRequestDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';

/**
 * Component for displaying the content of the notification overlay, including a list of notifications with their details.
 *
 * CommentLastReviewed: 2026-05-06
 */
@Component({
  selector: 'app-notification-overlay-content',
  imports: [
    I18nDirective,
    AgridataDatePipe,
    ButtonComponent,
    FontAwesomeModule,
    ScrollFadeDirective,
  ],
  templateUrl: './notification-overlay-content.component.html',
})
export class NotificationOverlayContentComponent {
  // Injects
  private readonly notificationService = inject(NotificationService);
  protected readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Inputs
  readonly notifications = input<InboxEntryDto[]>();
  readonly reloadNotifications = output<void>();

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faEye = faEye;
  protected readonly faMailbox = faMailbox;
  protected readonly faLink = faExternalLink;
  protected readonly IconPosition = IconPosition;

  // Signals
  protected readonly isLoadingMarkAllAsRead = signal(false);

  // Methods
  protected readonly handleMarkAsRead = (notification: InboxEntryDto) => {
    if (!notification.id) {
      console.error('Notification ID is missing. Cannot mark as read.');
      return;
    }
    if (notification.isRead) return;

    this.notificationService
      .markNotificationAsRead(notification.id)
      .then(() => {
        this.reloadNotifications.emit();
      })
      .catch(() => {
        this.toastService.show(
          this.i18nService.translate('notifications.markAsRead.error.title'),
          this.i18nService.translate('notifications.markAsRead.error.message'),
          ToastType.Error,
        );
      });
  };

  protected readonly handleMarkAllAsRead = () => {
    this.isLoadingMarkAllAsRead.set(true);
    const inbox: MarkAsReadRequestDto = {
      inboxIds:
        this.notifications()
          ?.filter((n) => !n.isRead && n.id)
          .map((n) => n.id!) || [],
    };
    this.notificationService
      .markAllAsRead(inbox)
      .then(() => {
        this.reloadNotifications.emit();
        this.toastService.show(
          this.i18nService.translate('notifications.markAllAsRead.success.title'),
          this.i18nService.translate('notifications.markAllAsRead.success.message'),
          ToastType.Success,
        );
      })
      .catch((error) => {
        this.toastService.show(
          this.i18nService.translate('notifications.markAllAsRead.error.title'),
          this.i18nService.translate('notifications.markAllAsRead.error.message', {
            error: error.message,
          }),
          ToastType.Error,
        );
      })
      .finally(() => {
        this.isLoadingMarkAllAsRead.set(false);
      });
  };

  protected navigateToNotifications = () => {
    this.router.navigate([ROUTE_PATHS.NOTIFICATIONS_PATH]);
  };
}
