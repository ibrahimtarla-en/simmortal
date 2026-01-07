package entities.converters;

import entities.enums.MemorialFlagReason;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialFlagReasonConverter extends StringEnumConverter<MemorialFlagReason> {
  public MemorialFlagReasonConverter() {
    super(MemorialFlagReason.class);
  }
}
