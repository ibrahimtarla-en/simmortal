package entities.enums;

public enum UserAccountStatus implements StringEnum {
  ACTIVE("active"),
  SUSPENDED("suspended"),
  DELETED("deleted");

  private final String value;

  UserAccountStatus(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static UserAccountStatus fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (UserAccountStatus status : values()) {
      if (status.value.equals(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown UserAccountStatus: " + value);
  }
}
