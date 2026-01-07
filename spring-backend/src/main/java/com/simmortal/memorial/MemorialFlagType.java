package com.simmortal.memorial;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MemorialFlagType {
  MEMORY_REPORT("memory-report"),
  CONDOLENCE_REPORT("condolence-report"),
  MEMORY_REQUEST("memory-request"),
  CONDOLENCE_REQUEST("condolence-request"),
  MEMORIAL_REPORT("memorial-report"),
  DONATION_REPORT("donation-report");

  private final String value;

  MemorialFlagType(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static MemorialFlagType fromValue(String value) {
    for (MemorialFlagType type : values()) {
      if (type.value.equalsIgnoreCase(value)) {
        return type;
      }
    }
    throw new IllegalArgumentException("Unknown flag type: " + value);
  }
}
