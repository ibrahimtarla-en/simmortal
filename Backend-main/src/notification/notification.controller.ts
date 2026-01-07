import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Session } from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Session() session: SessionContainer, @Query('cursor') cursor?: string) {
    const userId = session.getUserId();
    return this.notificationService.getPaginatedNotifications(userId, cursor);
  }

  @Patch(':notificationId/read')
  async markNotificationRead(
    @Session() session: SessionContainer,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = session.getUserId();
    return this.notificationService.markNotificationRead(userId, notificationId);
  }
}
