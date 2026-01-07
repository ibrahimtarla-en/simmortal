import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PublicAccess, Session } from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { Express, Request } from 'express';
import { MemorialService } from './memorial.service';
import {
  Memorial,
  MemorialFlag,
  MemorialFlagStatus,
  MemorialFlagType,
  OwnedMemorialPreview,
  PublishedMemorial,
  PublishMemorialPreview,
  TopContributor,
} from './interface/memorial.interface';
import { AIService } from 'src/ai/ai.service';
import { MemoryService } from './memory/memory.service';
import { PublicWithOptionalSession } from 'src/guard/optional-session.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  CheckSlugAvailabilityRequest,
  CreateMemorialFlagRequest,
  CreateMemorialRequest,
  PremiumPricesResponse,
  PurchasePremiumMemorialRequest,
  ValidatePurchaseResultResponse,
} from './interface/memorial.dto';
import { generateAssetUrl } from 'src/util/asset';

@Controller('memorial')
export class MemorialController {
  constructor(
    private readonly memorialService: MemorialService,
    private readonly memoryService: MemoryService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
      },
    }),
  )
  async createMemorial(
    @Session() session: SessionContainer,
    @Body() request: CreateMemorialRequest,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const userId = session.getUserId();
    return await this.memorialService.createMemorial(userId, request, image);
  }

  @PublicAccess()
  @Get('search')
  async searchMemorials(
    @Query('query') query: string,
    @Query('limit') limit: number,
  ): Promise<PublishedMemorial[]> {
    return this.memorialService.searchMemorialByName(query, limit);
  }

  @PublicAccess()
  @Get('featured')
  async getFeaturedMemorials(@Query('limit') limit: number): Promise<PublishedMemorial[]> {
    return this.memorialService.getFeaturedMemorials(limit);
  }

  @Post('preview/:memorialId')
  async createMemorialPreview(
    @Param('memorialId') memorialId: string,
    @Body() overrides: Partial<Memorial>,
  ) {
    return await this.memorialService.createMemorialPreview(memorialId, overrides);
  }

  @Get('publish-preview/:memorialId')
  async getMemorialPreview(
    @Param('memorialId') memorialId: string,
  ): Promise<PublishMemorialPreview> {
    return await this.memorialService.getPublishMemorialPreview(memorialId);
  }

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: {
        files: 1,
      },
    }),
  )
  async transcribeAudio(@UploadedFile() audio: Express.Multer.File) {
    const transcription = await this.aiService.transcribeAudio(audio);
    return { transcription };
  }

  @Post('check-slug')
  async checkSlugAvailability(@Body() request: CheckSlugAvailabilityRequest) {
    const isAvailable = await this.memorialService.checkSlugAvailability(
      request.slug,
      request.memorialId,
    );
    return { isAvailable };
  }

  @PublicAccess()
  @Get('premium-prices')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes
  async getPremiumSubscriptionPrices(): Promise<PremiumPricesResponse> {
    return this.memorialService.getPremiumSubscriptionPrices();
  }

  @Post('purchase-premium/:memorialId')
  async purchasePremiumMemorial(
    @Session() session: SessionContainer,
    @Param('memorialId') memorialId: string,
    @Body() { period }: PurchasePremiumMemorialRequest,
  ) {
    const userId = session.getUserId();
    return await this.memorialService.createPremiumSubscriptionLink(userId, memorialId, period);
  }

  @Post('validate-subscription/:sessionId')
  async validateSubscriptionResult(
    @Param('sessionId') sessionId: string,
    @Body() { publishOnValidation }: { publishOnValidation?: boolean },
  ): Promise<ValidatePurchaseResultResponse> {
    return this.memorialService.validateSubscriptionResult(sessionId, publishOnValidation);
  }

  @Post('publish-free/:memorialId')
  async publishFreeMemorial(
    @Session() session: SessionContainer,
    @Param('memorialId') memorialId: string,
  ) {
    const userId = session.getUserId();
    return await this.memorialService.publishFreeMemorial(userId, memorialId);
  }

  @PublicWithOptionalSession()
  @Get('published/:slug')
  async getPublishedMemorial(@Param('slug') slug: string, @Session() session?: SessionContainer) {
    const userId = session?.getUserId();
    return await this.memorialService.getPublishedMemorial(slug, userId);
  }

  @PublicAccess()
  @Get('published/id/:id')
  async getPublishedMemorialById(@Param('id') id: string): Promise<PublishedMemorial> {
    return await this.memorialService.getPublishedMemorialById(id);
  }

  @PublicAccess()
  @Post('published/:slug/view')
  async logPublishedMemorialView(@Param('slug') slug: string, @Req() req: Request): Promise<void> {
    return this.memorialService.incrementMemorialViewBySlug(slug, req);
  }

  @Post('published/:slug/like')
  async likePublishedMemorial(
    @Param('slug') slug: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    const memorialId = await this.memorialService.getMemorialIdBySlug(slug);
    if (!memorialId) {
      throw new Error('Memorial not found');
    }
    return this.memorialService.likeMemorial(memorialId, userId);
  }

  @Delete('published/:slug/like')
  async unlikePublishedMemorial(
    @Param('slug') slug: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    const userId = session.getUserId();
    const memorialId = await this.memorialService.getMemorialIdBySlug(slug);
    if (!memorialId) {
      throw new Error('Memorial not found');
    }
    return this.memorialService.unlikeMemorial(memorialId, userId);
  }

  @Get('owned/:memorialId')
  async getMemorial(
    @Session() session: SessionContainer,
    @Param('memorialId') memorialId: string,
    @Query('recommendSlug') recommendSlug?: boolean,
  ): Promise<Memorial> {
    const userId = session.getUserId();
    return await this.memorialService.getMemorial(userId, memorialId, recommendSlug);
  }

  @Get('owned-preview')
  async getOwnedMemorials(@Session() session: SessionContainer): Promise<OwnedMemorialPreview[]> {
    const userId = session.getUserId();
    return await this.memorialService.getOwnedMemorialPreviews(userId);
  }

  @Patch('owned/:memorialId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async updateMemorial(
    @Session() session: SessionContainer,
    @Param('memorialId') memorialId: string,
    @Body() request: Partial<Memorial>,
    @UploadedFiles() files?: { image?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
  ) {
    const userId = session.getUserId();
    return await this.memorialService.updateMemorial(userId, memorialId, request, {
      image: files?.image?.[0],
      coverImage: files?.coverImage?.[0],
    });
  }

  @Delete('owned/:memorialId')
  async deleteMemorial(
    @Session() session: SessionContainer,
    @Param('memorialId') memorialId: string,
  ) {
    const userId = session.getUserId();
    return await this.memorialService.deleteMemorial(userId, memorialId);
  }

  @Post('published/flag')
  async flagPublishedMemorial(
    @Session() session: SessionContainer,
    @Body() request: CreateMemorialFlagRequest,
  ): Promise<void> {
    const userId = session.getUserId();
    if (
      request.type !== MemorialFlagType.CONDOLENCE_REPORT &&
      request.type !== MemorialFlagType.MEMORY_REPORT &&
      request.type !== MemorialFlagType.MEMORIAL_REPORT &&
      request.type !== MemorialFlagType.DONATION_REPORT
    ) {
      throw new HttpException('Invalid flag type', HttpStatus.BAD_REQUEST);
    }
    return this.memorialService.createMemorialFlag(
      userId,
      request.type,
      request.referenceId,
      request.reason,
    );
  }

  @Get('published/:slug/flag')
  async getMemorialFlags(
    @Session() session: SessionContainer,
    @Param('slug') slug: string,
  ): Promise<MemorialFlag[]> {
    const userId = session.getUserId();
    return this.memorialService.getMemorialFlags(userId, slug);
  }

  @Patch('flag/:flagId')
  async handleMemorialFlag(
    @Session() session: SessionContainer,
    @Param('flagId') flagId: string,
    @Body() { status }: { status: MemorialFlagStatus.APPROVED | MemorialFlagStatus.REJECTED },
  ): Promise<void> {
    const userId = session.getUserId();
    return this.memorialService.handleMemorialUpdateFlag(userId, flagId, status);
  }

  @Get('ai-greeting/:memorialId')
  async getMemorialAiGreeting(
    @Param('memorialId') memorialId: string,
    @Session() session: SessionContainer,
  ) {
    await this.memorialService.verifyMemorialOwnership(session.getUserId(), memorialId);
    return this.aiService.getAiGreeting(memorialId);
  }

  @Delete('ai-greeting/:memorialId')
  async deleteMemorialAiVoice(
    @Param('memorialId') memorialId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    await this.memorialService.verifyMemorialOwnership(session.getUserId(), memorialId);
    return this.aiService.resetAiGreetingCreation(memorialId);
  }

  @Post('ai-greeting/voice/:memorialId')
  @UseInterceptors(FilesInterceptor('files'))
  async createMemorialVoice(
    @Param('memorialId') memorialId: string,
    @Session() session: SessionContainer,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('locale') locale?: 'tr' | 'en',
  ): Promise<{ path: string }> {
    await this.memorialService.verifyMemorialOwnership(session.getUserId(), memorialId);
    const voiceId = await this.aiService.createMemorialVoice(memorialId, files);
    const localeToUse = locale && ['tr', 'en'].includes(locale) ? locale : 'en';
    const path = await this.aiService.createMemorialGreetingAudio(memorialId, voiceId, localeToUse);
    return { path: generateAssetUrl(path) };
  }

  @Post('ai-greeting/image/:memorialId')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
      },
    }),
  )
  async uploadAiGreetingImage(
    @Param('memorialId') memorialId: string,
    @Session() session: SessionContainer,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<{ path: string }> {
    await this.memorialService.verifyMemorialOwnership(session.getUserId(), memorialId);
    const path = await this.aiService.uploadAiGreetingImage(memorialId, image);
    return { path: generateAssetUrl(path) };
  }

  @PublicAccess()
  @Get('published/:slug/top-contributors/candles')
  async getTopCandleContributors(@Param('slug') slug: string): Promise<TopContributor[]> {
    return this.memorialService.getTopCandleContributors(slug);
  }

  @PublicAccess()
  @Get('published/:slug/top-contributors/donations')
  async getTopDonors(@Param('slug') slug: string): Promise<TopContributor[]> {
    return this.memorialService.getTopDonors(slug);
  }

  @PublicAccess()
  @Get('published/:slug/top-contributors/flowers')
  async getTopFlowerContributors(@Param('slug') slug: string): Promise<TopContributor[]> {
    return this.memorialService.getTopFlowerContributors(slug);
  }

  @PublicAccess()
  @Get('published/:slug/top-contributors/trees')
  async getTopTreePlanters(@Param('slug') slug: string): Promise<TopContributor[]> {
    return this.memorialService.getTopTreePlanters(slug);
  }
}
