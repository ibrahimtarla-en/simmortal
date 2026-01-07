package entities.converters;

import entities.enums.MemorialFrame;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialFrameConverter extends StringEnumConverter<MemorialFrame> {
  public MemorialFrameConverter() {
    super(MemorialFrame.class);
  }
}
