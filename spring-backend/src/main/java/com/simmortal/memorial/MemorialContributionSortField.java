package com.simmortal.memorial;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MemorialContributionSortField {
  DATE("date"),
  LIKES("totalLikes");

  private final String value;

  MemorialContributionSortField(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static MemorialContributionSortField fromValue(String value) {
    for (MemorialContributionSortField field : values()) {
      if (field.value.equalsIgnoreCase(value)) {
        return field;
      }
    }
    throw new IllegalArgumentException("Unknown sort field: " + value);
  }
}
