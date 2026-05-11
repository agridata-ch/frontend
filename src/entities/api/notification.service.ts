import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MarkAsReadRequestDto, NotificationsService } from '../openapi';

/**
 * Service for interacting with participant-related API endpoints. Provides methods to retrieve UIDs
 * that the current user is authorized to access, ensuring proper scoping of data operations.
 *
 * CommentLastReviewed: 2026-05-11
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiService = inject(NotificationsService);

  fetchHeaderNotifications() {
    const page = 0; // Fetch the first page of notifications
    const size = 5; // Limit to 5 notifications for the header
    return firstValueFrom(this.apiService.getInbox(page, undefined, size));
  }

  markNotificationAsRead(notificationId: string): Promise<void> {
    if (!notificationId) {
      return Promise.reject(new Error('Notification ID is required to mark as read.'));
    }
    const requestDto: MarkAsReadRequestDto = { inboxIds: [notificationId] };
    return firstValueFrom(this.apiService.markInboxAsRead(requestDto));
  }

  markAllAsRead(inbox: MarkAsReadRequestDto) {
    return firstValueFrom(this.apiService.markInboxAsRead(inbox));
  }
}
