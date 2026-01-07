package entities.converters;

import entities.enums.MemorialLivePortraitEffect;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialLivePortraitEffectConverter extends StringEnumConverter<MemorialLivePortraitEffect> {
  public MemorialLivePortraitEffectConverter() {
    super(MemorialLivePortraitEffect.class);
  }
}
