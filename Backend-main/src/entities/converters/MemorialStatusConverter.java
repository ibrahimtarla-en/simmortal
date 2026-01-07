package entities.converters;

import entities.enums.MemorialStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialStatusConverter extends StringEnumConverter<MemorialStatus> {
  public MemorialStatusConverter() {
    super(MemorialStatus.class);
  }
}
