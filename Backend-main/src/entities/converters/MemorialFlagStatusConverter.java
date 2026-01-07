package entities.converters;

import entities.enums.MemorialFlagStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialFlagStatusConverter extends StringEnumConverter<MemorialFlagStatus> {
  public MemorialFlagStatusConverter() {
    super(MemorialFlagStatus.class);
  }
}
