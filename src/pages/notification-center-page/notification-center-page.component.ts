import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { faBell, faEye } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { NotificationService } from '@/entities/api/notification.service';
import { InboxEntryDto, ResourceQueryDto } from '@/entities/openapi';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { PageResponseDto, createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { getNotificationRoute, markAllAsRead, toggleReadStatus } from '@/shared/notification';
import { ToastService } from '@/shared/toast';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';

/**
 * Displays all notifications in a server-side paginated table with mark-as-read actions.
 *
 * CommentLastReviewed: 2026-05-28
 */
@Component({
  selector: 'app-notification-center-page',
  imports: [
    AgridataTableComponent,
    AgridataDatePipe,
    ButtonComponent,
    ErrorOutletComponent,
    FontAwesomeModule,
    I18nDirective,
  ],
  templateUrl: './notification-center-page.component.html',
})
export class NotificationCenterPageComponent {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly errorService = inject(ErrorHandlerService);
  protected readonly i18nService = inject(I18nService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Constants
  protected readonly TITLE_HEADER = 'notificationCenter.table.title';
  protected readonly TEXT_HEADER = 'notificationCenter.table.text';
  protected readonly DATE_HEADER = 'notificationCenter.table.date';
  protected readonly ACTION_HEADER = 'notificationCenter.table.actions';
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly IconPosition = IconPosition;
  protected readonly faBell = faBell;
  protected readonly faEye = faEye;

  // Signals
  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);
  protected readonly isLoadingMarkAllAsRead = signal(false);

  // Template refs
  private readonly titleTemplate =
    viewChild<TemplateRef<{ $implicit: InboxEntryDto }>>('titleTemplate');
  private readonly textTemplate =
    viewChild<TemplateRef<{ $implicit: InboxEntryDto }>>('textTemplate');
  private readonly dateTemplate =
    viewChild<TemplateRef<{ $implicit: InboxEntryDto }>>('dateTemplate');
  private readonly actionTemplate =
    viewChild<TemplateRef<{ $implicit: InboxEntryDto }>>('actionTemplate');

  // Computed
  protected readonly tableMetaData = computed<TableMetadata<InboxEntryDto>>(() => ({
    idColumn: 'id',
    columns: [
      {
        name: this.TITLE_HEADER,
        renderer: {
          type: CellRendererTypes.TEMPLATE,
          template: this.titleTemplate(),
        },
      },
      {
        name: this.TEXT_HEADER,
        renderer: {
          type: CellRendererTypes.TEMPLATE,
          template: this.textTemplate(),
        },
      },
      {
        name: this.DATE_HEADER,
        sortable: true,
        sortField: 'createdAt',
        initialSortDirection: SortDirections.DESC,
        renderer: {
          type: CellRendererTypes.TEMPLATE,
          template: this.dateTemplate(),
        },
      },
      {
        name: this.ACTION_HEADER,
        renderer: {
          type: CellRendererTypes.TEMPLATE,
          template: this.actionTemplate(),
        },
      },
    ],
    showRowActionButton: true,
    rowAction: (item) => {
      const route = getNotificationRoute(item, this.authService);
      if (route) this.router.navigateByUrl(route);
    },
  }));

  // Resource
  readonly fetchNotificationsResource = resource({
    params: () => this.resourceQueryDto(),
    loader: ({ params }) => this.notificationService.fetchNotifications(params),
    defaultValue: {} as PageResponseDto<InboxEntryDto>,
  });

  // Effects
  private readonly syncEffect = effect(() => {
    const trigger = this.notificationService.mutationTrigger();
    if (trigger === 0) return;
    untracked(() => this.fetchNotificationsResource.reload());
  });
  fetchNotificationsErrorHandler = createResourceErrorHandlerEffect(
    this.fetchNotificationsResource,
    this.errorService,
  );

  // Methods
  protected handleMarkAllAsRead = () => {
    this.isLoadingMarkAllAsRead.set(true);
    markAllAsRead(
      this.fetchNotificationsResource.value()?.items ?? [],
      this.notificationService,
      this.toastService,
      this.i18nService,
    ).finally(() => this.isLoadingMarkAllAsRead.set(false));
  };

  protected handleToggleReadStatus = (notification: InboxEntryDto) =>
    toggleReadStatus(notification, this.notificationService, this.toastService, this.i18nService);
}
