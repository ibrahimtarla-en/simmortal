import { PaginatedResult } from 'src/types/pagination';
import { UserNotification } from './notification.interface';

export interface PaginatedNotificationResponse extends PaginatedResult<UserNotification> {
  unreadCount: number;
}
