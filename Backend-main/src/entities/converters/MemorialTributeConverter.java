package entities.converters;

import entities.enums.MemorialTribute;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialTributeConverter extends StringEnumConverter<MemorialTribute> {
  public MemorialTributeConverter() {
    super(MemorialTribute.class);
  }
}
