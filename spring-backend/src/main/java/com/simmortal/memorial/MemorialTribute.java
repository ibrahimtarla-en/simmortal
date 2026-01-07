package com.simmortal.memorial;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MemorialTribute {
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

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static MemorialTribute fromValue(String value) {
    for (MemorialTribute tribute : values()) {
      if (tribute.value.equalsIgnoreCase(value)) {
        return tribute;
      }
    }
    throw new IllegalArgumentException("Unknown tribute: " + value);
  }
}
