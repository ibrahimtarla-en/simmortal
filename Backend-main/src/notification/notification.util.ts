import { NotificationEntity } from 'src/entities/NotificationEntity';
import {
  BaseNotification,
  NotificationType,
  UserNotification,
} from './interface/notification.interface';
import { MemorialFlagStatus, MemorialFlagType } from 'src/memorial/interface/memorial.interface';

export function mapNotificationEntityToNotification(entity: NotificationEntity): UserNotification {
  const baseNotification: BaseNotification = {
    id: entity.id,
    type: entity.type,
    createdAt: entity.createdAt,
    isRead: entity.isRead,
    actor: {
      displayName: entity.actor.displayName,
    },
    referenceId: entity.referenceId,
    payload: entity.payload,
    redirectUrl: entity.redirectUrl,
  };

  return baseNotification;
}

export function convertMemorialFlagToNotificationType(
  flagType: MemorialFlagType,
): NotificationType | null {
  switch (flagType) {
    case MemorialFlagType.MEMORY_REPORT:
      return NotificationType.MEMORY_REPORT;
    case MemorialFlagType.CONDOLENCE_REPORT:
      return NotificationType.CONDOLENCE_REPORT;
    case MemorialFlagType.MEMORY_REQUEST:
      return NotificationType.MEMORY_REQUEST;
    case MemorialFlagType.CONDOLENCE_REQUEST:
      return NotificationType.CONDOLENCE_REQUEST;
    case MemorialFlagType.DONATION_REPORT:
      return NotificationType.DONATION_REPORT;
    default:
      return null;
  }
}

export function deriveNotificationTypeFromMemorialFlagStatus(
  status: MemorialFlagStatus,
  flagType: MemorialFlagType,
): NotificationType | null {
  if (status === MemorialFlagStatus.APPROVED && flagType === MemorialFlagType.MEMORY_REQUEST) {
    return NotificationType.MEMORY_APPROVED;
  }
  if (status === MemorialFlagStatus.APPROVED && flagType === MemorialFlagType.CONDOLENCE_REQUEST) {
    return NotificationType.CONDOLENCE_APPROVED;
  }
  return null;
}
