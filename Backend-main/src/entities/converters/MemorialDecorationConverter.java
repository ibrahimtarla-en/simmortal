package entities.converters;

import entities.enums.MemorialDecoration;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialDecorationConverter extends StringEnumConverter<MemorialDecoration> {
  public MemorialDecorationConverter() {
    super(MemorialDecoration.class);
  }
}
