package com.simmortal.memorial;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MemorialDonationWreath {
  SILVER("silver"),
  ROSE("rose"),
  GOLD("gold"),
  PURPLE("purple");

  private final String value;

  MemorialDonationWreath(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static MemorialDonationWreath fromValue(String value) {
    for (MemorialDonationWreath wreath : values()) {
      if (wreath.value.equalsIgnoreCase(value)) {
        return wreath;
      }
    }
    throw new IllegalArgumentException("Unknown wreath: " + value);
  }
}
