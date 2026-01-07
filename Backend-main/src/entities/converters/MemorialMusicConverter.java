package entities.converters;

import entities.enums.MemorialMusic;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialMusicConverter extends StringEnumConverter<MemorialMusic> {
  public MemorialMusicConverter() {
    super(MemorialMusic.class);
  }
}
