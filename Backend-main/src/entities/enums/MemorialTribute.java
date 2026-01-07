package entities.enums;

public enum MemorialTribute implements StringEnum {
  DEFAULT("default"),
  AMETHYST_TRANQUILITY("amethyst-tranquility"),
  BLOSSOM_OF_GRACE("blossom-of-grace"),
  CRIMSON_DEVOTION("crimson-devotion"),
  FLAMES_OF_REMEMBRANCE("flames-of-remembrance"),
  FROSTLIGHT_HARMONY("frostlight-harmony"),
  GOLDEN_SERENITY("golden-serenity"),
  LUNAR_SERENITY("lunar-serenity"),
  MIDNIGHT_SERENITY("midnight-serenity"),
  OCEAN_OF_LIGHT("ocean-of-light"),
  ROYAL_SUNRISE("royal-sunrise"),
  CELESTIAL_BLOOM("celestial-bloom"),
  MIDNIGHT_ELEGY("midnight-elegy");

  private final String value;

  MemorialTribute(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialTribute fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialTribute tribute : values()) {
      if (tribute.value.equals(value)) {
        return tribute;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialTribute: " + value);
  }
}
