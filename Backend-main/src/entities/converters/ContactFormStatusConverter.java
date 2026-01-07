package entities.converters;

import entities.enums.ContactFormStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ContactFormStatusConverter extends StringEnumConverter<ContactFormStatus> {
  public ContactFormStatusConverter() {
    super(ContactFormStatus.class);
  }
}
