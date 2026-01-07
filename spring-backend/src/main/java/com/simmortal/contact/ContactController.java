package com.simmortal.contact;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("contact")
public class ContactController {
  private final ContactService contactService;

  public ContactController(ContactService contactService) {
    this.contactService = contactService;
  }

  @PostMapping
  public void createContactForm(
      @RequestBody ContactFormRequest request,
      @RequestHeader(value = "X-User-Id", required = false) String userId
  ) {
    contactService.createContactFormEntry(request, userId);
  }
}
