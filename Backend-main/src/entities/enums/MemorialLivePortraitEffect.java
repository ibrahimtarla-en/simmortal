package entities.enums;

public enum MemorialLivePortraitEffect implements StringEnum {
  EFFECT_ONE("effect-one"),
  EFFECT_TWO("effect-two");

  private final String value;

  MemorialLivePortraitEffect(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialLivePortraitEffect fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialLivePortraitEffect effect : values()) {
      if (effect.value.equals(value)) {
        return effect;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialLivePortraitEffect: " + value);
  }
}
