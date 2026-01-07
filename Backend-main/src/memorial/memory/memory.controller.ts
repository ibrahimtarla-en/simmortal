import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Session } from 'supertokens-nestjs';
import { MemoryService } from './memory.service';
import { MemorialContributionSortField } from '../interface/memorial.interface';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublishMemorialContributionResponse } from '../interface/memorial.dto';
import { CreateMemoryRequest, UpdateMemoryPayload } from './interface/memory.dto';
import { PublicWithOptionalSession } from 'src/guard/optional-session.guard';
import { Memory } from './interface/memory.interface';

@Controller('memorial/:slug/memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @PublicWithOptionalSession()
  @Get()
  async getMemories(
    @Param('slug') slug: string,
    @Query('sort') sort: MemorialContributionSortField = MemorialContributionSortField.DATE,
    @Query('cursor') cursor?: string,
    @Session() session?: SessionContainer,
  ) {
    return await this.memoryService.getMemories({ slug, sort, cursor }, session?.getUserId());
  }

  @UseInterceptors(
    FileInterceptor('asset', {
      limits: {
        files: 1,
      },
    }),
  )
  @Post()
  async createMemory(
    @Param('slug') slug: string,
    @Session() session: SessionContainer,
    @Body() request: CreateMemoryRequest,
    @UploadedFile() asset?: Express.Multer.File,
  ) {
    const userId = session.getUserId();
    return await this.memoryService.createMemory({ ...request, slug, userId }, asset);
  }

  @UseInterceptors(
    FileInterceptor('asset', {
      limits: {
        files: 1,
      },
    }),
  )
  @Patch(':memoryId')
  async updateMemory(
    @Param('slug') slug: string,
    @Param('memoryId') memoryId: string,
    @Session() session: SessionContainer,
    @Body() payload: Partial<UpdateMemoryPayload>,
    @UploadedFile() asset?: Express.Multer.File,
  ) {
    const userId = session.getUserId();
    return await this.memoryService.updateMemory(userId, memoryId, payload, asset);
  }

  @Delete(':memoryId')
  async deleteMemory(
    @Param('memoryId') memoryId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.memoryService.deleteMemory(userId, memoryId);
  }

  @Post(':memoryId/preview')
  async getMemoryPreview(
    @Param('memoryId') memoryId: string,
    @Session() session: SessionContainer,
    @Body() overrides: Partial<Memory>,
  ) {
    return this.memoryService.getMemoryPreview(session.getUserId(), memoryId, overrides);
  }

  @Post(':memoryId/publish')
  async publishMemory(
    @Param('memoryId') memoryId: string,
    @Session() session: SessionContainer,
  ): Promise<PublishMemorialContributionResponse> {
    const userId = session.getUserId();
    return await this.memoryService.sendMemoryToReview(userId, memoryId);
  }

  @Post(':memoryId/validate-purchase')
  async validatePurchase(
    @Param('slug') slug: string,
    @Param('memoryId') memoryId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return await this.memoryService.validateMemoryContributionPayment(slug, memoryId, sessionId);
  }

  @Post(':memoryId/like')
  async likeMemory(
    @Param('memoryId') memoryId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.memoryService.likeMemory(userId, memoryId);
  }

  @Delete(':memoryId/like')
  async unlikeMemory(
    @Param('memoryId') memoryId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    return this.memoryService.unlikeMemory(userId, memoryId);
  }
}
