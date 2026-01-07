import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/NotificationEntity';
import { Brackets, Equal, LessThan, MoreThan, Repository } from 'typeorm';
import { NotificationType, UserNotification } from './interface/notification.interface';
import { createTypedCursor, encodeCursor, parseCursor } from 'src/util/pagination';
import {
  convertMemorialFlagToNotificationType,
  deriveNotificationTypeFromMemorialFlagStatus,
  mapNotificationEntityToNotification,
} from './notification.util';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { PaginatedNotificationResponse } from './interface/notification.dto';
import { MemorialFlagEntity } from 'src/entities/MemorialFlagEntity';

@Injectable()
export class NotificationService {
  private readonly PAGE_SIZE = 15;
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async createMemorialLikedNotification(memorial: MemorialEntity, actorId: string) {
    try {
      if (memorial.ownerId === actorId) {
        this.logger.log(
          `User ${actorId} liked their own memorial ${memorial.id}, skipping notification creation`,
        );
        return;
      }
      await this.notificationRepository.insert({
        userId: memorial.ownerId,
        actorId,
        referenceId: memorial.id,
        redirectUrl: `/memorial/${memorial.defaultSlug}`, //use default slug for possible slug changes, FE will redirect to dynamic slug
        type: NotificationType.MEMORIAL_LIKE,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to create memorial liked notification', error);
    }
  }

  async getPaginatedNotifications(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedNotificationResponse> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.actor', 'actor')
      .leftJoinAndSelect('notification.user', 'user')
      .where({ userId });
    if (cursor) {
      const config = parseCursor<NotificationEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      queryBuilder.andWhere(
        new Brackets((qb) =>
          qb.where({ [config.sortField]: LessThan(config.sortValue) }).orWhere({
            [config.sortField]: Equal(config.sortValue),
            id: MoreThan(config.id),
          }),
        ),
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      queryBuilder
        .orderBy('notification.createdAt', 'DESC')
        .addOrderBy('notification.id', 'DESC')
        .take(this.PAGE_SIZE + 1)
        .getMany(),
      this.getUnreadNotificationCount(userId),
    ]);

    const mappedNotifications = notifications.map(mapNotificationEntityToNotification);
    if (mappedNotifications.length <= this.PAGE_SIZE) {
      return { items: mappedNotifications, unreadCount };
    }
    const newCursor = createTypedCursor<UserNotification>(
      mappedNotifications[mappedNotifications.length - 1],
      'createdAt',
    );
    return {
      items: mappedNotifications.slice(0, this.PAGE_SIZE),
      unreadCount,
      cursor: encodeCursor(newCursor),
    };
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notificationRepository.count({ where: { userId, isRead: false } });
  }

  async createFlagNotification(memorialFlag: MemorialFlagEntity) {
    const type = convertMemorialFlagToNotificationType(memorialFlag.type);
    if (!type) {
      this.logger.log(
        `No notification defined for flag type ${memorialFlag.type}, skipping notification creation`,
      );
      return;
    }
    if (memorialFlag.userId === null) {
      this.logger.log(
        `No user ID found for memorial flag ${memorialFlag.id}, skipping notification creation`,
      );
      return;
    }
    if (memorialFlag.userId === memorialFlag.actorId) {
      this.logger.log(
        `User ${memorialFlag.actorId} flagged their own contribution ${memorialFlag.id}, skipping notification creation`,
      );
      return;
    }
    let activeTab: string;
    if (type === NotificationType.MEMORIAL_LIKE) {
      activeTab = 'memory';
    } else {
      activeTab = 'waitingApprovals';
    }
    try {
      await this.notificationRepository.insert({
        userId: memorialFlag.userId,
        actorId: memorialFlag.actorId,
        referenceId: memorialFlag.referenceId,
        redirectUrl: `/memorial/${memorialFlag.memorial.defaultSlug}?active_tab=${activeTab}&#memorial-tabs`, //use default slug for possible slug changes, FE will redirect to dynamic slug
        type,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to create flag notification', error);
    }
  }

  async createFlagHandledNotification(entity: MemorialFlagEntity) {
    try {
      if (entity.actorId === entity.userId) {
        this.logger.log(
          `User ${entity.actorId} handled their own flag ${entity.id}, skipping notification creation`,
        );
        return;
      }
      const notificationType = deriveNotificationTypeFromMemorialFlagStatus(
        entity.status,
        entity.type,
      );
      if (!notificationType) {
        this.logger.log(
          `No notification defined for ${entity.id} with status ${entity.status} and type ${entity.type}, skipping notification creation`,
        );
        return;
      }
      if (!entity.userId) {
        this.logger.log(
          `No user ID found for memorial flag ${entity.id}, skipping notification creation`,
        );
        return;
      }
      const activeTab =
        notificationType === NotificationType.MEMORY_APPROVED ? 'memory' : 'condolence';
      await this.notificationRepository.insert({
        userId: entity.actorId, // Notification is sent to the actor (contributor)
        actorId: entity.userId, // The user who approved the contribution (memorial owner/admin)
        referenceId: entity.id,
        redirectUrl: `/memorial/${entity.memorial.defaultSlug}?active_tab=${activeTab}&contribution_id=${entity.id}&#memorial-tabs`, //use default slug for possible slug changes, FE will redirect to dynamic slug
        type: notificationType,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to create contribution approved notification', error);
    }
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    if (notification.isRead) {
      return;
    }
    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
  }
}
