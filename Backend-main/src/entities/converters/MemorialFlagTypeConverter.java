package entities.converters;

import entities.enums.MemorialFlagType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialFlagTypeConverter extends StringEnumConverter<MemorialFlagType> {
  public MemorialFlagTypeConverter() {
    super(MemorialFlagType.class);
  }
}
