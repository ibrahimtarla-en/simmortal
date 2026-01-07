package com.simmortal.memorial;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MemorialFlagStatus {
  OPEN("open"),
  APPROVED("approved"),
  REJECTED("rejected");

  private final String value;

  MemorialFlagStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static MemorialFlagStatus fromValue(String value) {
    for (MemorialFlagStatus status : values()) {
      if (status.value.equalsIgnoreCase(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown flag status: " + value);
  }
}
