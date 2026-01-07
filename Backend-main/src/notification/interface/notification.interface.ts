export enum NotificationType {
  MEMORIAL_LIKE = 'memorial-like',
  MEMORY_REPORT = 'memory-report',
  CONDOLENCE_REPORT = 'condolence-report',
  MEMORY_REQUEST = 'memory-request',
  CONDOLENCE_REQUEST = 'condolence-request',
  MEMORY_APPROVED = 'memory-approved',
  CONDOLENCE_APPROVED = 'condolence-approved',
  DONATION_REPORT = 'donation-report',
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  createdAt: Date;
  isRead: boolean;
  actor: {
    displayName: string | null;
  };
  referenceId: string;
  payload: Record<string, unknown>;
  redirectUrl: string | null;
}
// For now, UserNotification is the same as BaseNotification, but we might extend it in the future
export type UserNotification = BaseNotification;
