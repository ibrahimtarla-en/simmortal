import { Body, Controller, Post } from '@nestjs/common';
import { ContactFormRequest } from './interface/contact.interface';
import { ContactService } from './contact.service';
import { PublicWithOptionalSession } from 'src/guard/optional-session.guard';
import { Session } from 'supertokens-nestjs';
import { SessionContainer } from 'supertokens-node/recipe/session';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @PublicWithOptionalSession()
  async createContactForm(
    @Body() request: ContactFormRequest,
    @Session() session?: SessionContainer,
  ): Promise<void> {
    const userId = session?.getUserId();
    await this.contactService.createContactFormEntry(request, userId);
  }
}
