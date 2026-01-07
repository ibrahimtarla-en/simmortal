package com.simmortal.contact;

import org.springframework.stereotype.Repository;

@Repository
public class ContactRepository {
  public Object getOpenContactForms() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getContactFormById(String id) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object closeContactForm(String adminUserId, String id) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void createContactForm(ContactFormRequest request, String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
