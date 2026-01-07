package com.simmortal.contact;

import org.springframework.stereotype.Service;

@Service
public class ContactService {
  private final ContactRepository contactRepository;

  public ContactService(ContactRepository contactRepository) {
    this.contactRepository = contactRepository;
  }

  public void createContactFormEntry(ContactFormRequest request, String userId) {
    contactRepository.createContactForm(request, userId);
  }

  public Object getOpenContactForms() {
    return contactRepository.getOpenContactForms();
  }

  public Object getContactFormById(String id) {
    return contactRepository.getContactFormById(id);
  }

  public Object closeContactForm(String adminUserId, String id) {
    return contactRepository.closeContactForm(adminUserId, id);
  }
}
