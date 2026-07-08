import { inject, Service, signal } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { PageResponseDto, arrayToObjectSortParams, asPageResponse } from '@/shared/lib/api.helper';

import {
  InboxEntryDto,
  MarkAsReadRequestDto,
  NotificationsService,
  ResourceQueryDto,
} from '../openapi';

/**
 * Service for interacting with participant-related API endpoints. Provides methods to retrieve UIDs
 * that the current user is authorized to access, ensuring proper scoping of data operations.
 *
 * CommentLastReviewed: 2026-05-11
 */
@Service()
export class NotificationService {
  private readonly apiService = inject(NotificationsService);

  readonly mutationTrigger = signal(0);

  notifyMutation(): void {
    this.mutationTrigger.update((n) => n + 1);
  }

  fetchHeaderNotifications() {
    const page = 0; // Fetch the first page of notifications
    const size = 5; // Limit to 5 notifications for the header
    return firstValueFrom(this.apiService.getInbox(page, undefined, size));
  }

  fetchNotifications(queryDto?: ResourceQueryDto): Promise<PageResponseDto<InboxEntryDto>> {
    return firstValueFrom(
      this.apiService
        .getInbox(
          queryDto?.page,
          queryDto?.searchTerm,
          queryDto?.size,
          arrayToObjectSortParams(queryDto?.sortParams, 'sortBy'),
        )
        .pipe(map((response) => asPageResponse(response))),
    );
  }

  markNotificationAsRead(notificationId: string): Promise<void> {
    if (!notificationId) {
      return Promise.reject(new Error('Notification ID is required to mark as read.'));
    }
    const requestDto: MarkAsReadRequestDto = { inboxIds: [notificationId] };
    return firstValueFrom(this.apiService.markInboxAsRead(requestDto));
  }

  markNotificationAsUnread(notificationId: string): Promise<void> {
    if (!notificationId) {
      return Promise.reject(new Error('Notification ID is required to mark as unread.'));
    }
    const requestDto: MarkAsReadRequestDto = { inboxIds: [notificationId] };
    return firstValueFrom(this.apiService.markInboxAsUnread(requestDto));
  }

  toggleReadStatus(notification: InboxEntryDto): Promise<void> {
    const id = notification.id;
    if (!id) return Promise.reject(new Error('Notification ID is missing.'));
    return notification.isRead
      ? this.markNotificationAsUnread(id)
      : this.markNotificationAsRead(id);
  }

  markAllAsRead(inbox: MarkAsReadRequestDto) {
    return firstValueFrom(this.apiService.markInboxAsRead(inbox));
  }
}
