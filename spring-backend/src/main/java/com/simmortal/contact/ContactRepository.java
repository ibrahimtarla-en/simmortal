package com.simmortal.contact;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class ContactRepository {
  private final Map<String, Map<String, Object>> forms = new ConcurrentHashMap<>();

  public Object getOpenContactForms() {
    return new ArrayList<>(forms.values());
  }

  public Object getContactFormById(String id) {
    return forms.get(id);
  }

  public Object closeContactForm(String adminUserId, String id) {
    Map<String, Object> form = forms.get(id);
    if (form == null) {
      return null;
    }
    form.put("status", "closed");
    form.put("closedBy", adminUserId);
    form.put("closedAt", Instant.now().toString());
    return form;
  }

  public void createContactForm(ContactFormRequest request, String userId) {
    String id = UUID.randomUUID().toString();
    Map<String, Object> form = new ConcurrentHashMap<>();
    form.put("id", id);
    form.put("userId", userId);
    form.put("email", request.email());
    form.put("message", request.message());
    form.put("firstName", request.firstName());
    form.put("lastName", request.lastName());
    form.put("phoneNumber", request.phoneNumber());
    form.put("status", "open");
    form.put("createdAt", Instant.now().toString());
    forms.put(id, form);
  }
}
