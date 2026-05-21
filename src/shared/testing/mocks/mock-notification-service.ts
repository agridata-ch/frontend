import { NotificationService } from '@/entities/api/notification.service';
import { InboxEntryDto, PageResponseDtoInboxEntryDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export const mockInboxEntries: InboxEntryDto[] = [
  {
    id: '1',
    title: { de: 'Benachrichtigung 1' },
    text: { de: 'Testnachricht 1' },
    isRead: false,
    createdAt: '2026-05-11',
  },
  {
    id: '2',
    title: { de: 'Benachrichtigung 2' },
    text: { de: 'Testnachricht 2' },
    isRead: true,
    createdAt: '2026-05-10',
  },
  {
    id: '3',
    title: { de: 'Benachrichtigung 3' },
    text: { de: 'Testnachricht 3' },
    isRead: false,
    createdAt: '2026-05-09',
  },
];

export const mockHeaderNotifications: PageResponseDtoInboxEntryDto = {
  items: mockInboxEntries,
  totalItems: 3,
  currentPage: 0,
  pageSize: 10,
  totalPages: 1,
};

export type MockNotificationService = Mockify<NotificationService>;

/**
 * Factory that creates a strict mock implementation of NotificationService for tests.
 * All methods are jest.fn mocks returning the same default values as the standalone mocks above.
 *
 * CommentLastReviewed: 2026-05-11
 */
export function createMockNotificationService(): MockNotificationService {
  return {
    fetchHeaderNotifications: jest.fn().mockResolvedValue(mockHeaderNotifications),
    markNotificationAsRead: jest.fn().mockResolvedValue(undefined),
    markAllAsRead: jest.fn().mockResolvedValue(undefined),
  } satisfies MockNotificationService;
}
