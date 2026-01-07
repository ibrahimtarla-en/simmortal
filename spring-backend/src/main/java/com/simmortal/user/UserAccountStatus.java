package com.simmortal.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserAccountStatus {
  ACTIVE("active"),
  SUSPENDED("suspended"),
  DELETED("deleted");

  private final String value;

  UserAccountStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static UserAccountStatus fromValue(String value) {
    for (UserAccountStatus status : values()) {
      if (status.value.equalsIgnoreCase(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown status: " + value);
  }
}
