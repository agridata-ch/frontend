import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { faExternalLink, faEye } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faMailbox } from '@awesome.me/kit-0b6d1ed528/icons/duotone/light';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NotificationService } from '@/entities/api/notification.service';
import { InboxEntryDto } from '@/entities/openapi';
import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { getNotificationRoute, markAllAsRead, toggleReadStatus } from '@/shared/notification';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { ToastService } from '@/shared/toast';
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
    RouterLink,
    ClickStopPropagationDirective,
  ],
  templateUrl: './notification-overlay-content.component.html',
})
export class NotificationOverlayContentComponent {
  // Injects
  private readonly notificationService = inject(NotificationService);
  protected readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  // Inputs
  readonly notifications = input<InboxEntryDto[]>();

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faEye = faEye;
  protected readonly faMailbox = faMailbox;
  protected readonly faLink = faExternalLink;
  protected readonly IconPosition = IconPosition;

  // Signals
  protected readonly isLoadingMarkAllAsRead = signal(false);

  // Computed signals
  protected readonly notificationRoutes = computed(
    () =>
      new Map(
        (this.notifications() ?? []).map((n) => [n.id!, getNotificationRoute(n, this.authService)]),
      ),
  );

  // Methods
  protected readonly handleToggleReadStatus = (notification: InboxEntryDto) =>
    toggleReadStatus(notification, this.notificationService, this.toastService, this.i18nService);

  protected readonly handleMarkAllAsRead = () => {
    this.isLoadingMarkAllAsRead.set(true);
    markAllAsRead(
      this.notifications() ?? [],
      this.notificationService,
      this.toastService,
      this.i18nService,
    ).finally(() => this.isLoadingMarkAllAsRead.set(false));
  };

  protected navigateToNotifications = () => {
    this.router.navigate([ROUTE_PATHS.NOTIFICATIONS_PATH]);
  };
}
