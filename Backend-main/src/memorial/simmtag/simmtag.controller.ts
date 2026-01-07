import { Body, Controller, Param, Post } from '@nestjs/common';
import { SimmTagService } from './simmtag.service';
import { SimmTagLocation } from './interface/simmtag.interface';
import { Session } from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';

@Controller('memorial/:id/simmtag')
export class SimmTagController {
  constructor(private readonly simmTagService: SimmTagService) {}

  @Post()
  async createOrUpdateSimmTag(
    @Param('id') id: string,
    @Session() session: SessionContainer,
    @Body() { location }: { location: SimmTagLocation },
  ) {
    return this.simmTagService.createOrUpdateLocation(session.getUserId(), id, location);
  }
}
