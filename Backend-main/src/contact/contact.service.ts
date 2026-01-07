import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactFormEntity } from 'src/entities/ContactFormEntity';
import { Repository } from 'typeorm';
import { ContactFormRequest, ContactFormStatus } from './interface/contact.interface';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactFormEntity)
    private readonly contactFormRepository: Repository<ContactFormEntity>,
  ) {}

  async createContactFormEntry(request: ContactFormRequest, userId?: string): Promise<void> {
    await this.contactFormRepository.insert({ ...request, userId });
  }

  async getOpenContactForms(): Promise<ContactFormEntity[]> {
    return this.contactFormRepository.find({ where: { status: ContactFormStatus.OPEN } });
  }

  async getContactFormById(id: string): Promise<ContactFormEntity | null> {
    return this.contactFormRepository.findOne({ where: { id } });
  }

  async closeContactForm(adminId: string, id: string): Promise<void> {
    await this.contactFormRepository.update(
      { id },
      { status: ContactFormStatus.CLOSED, closedBy: adminId },
    );
  }
}
