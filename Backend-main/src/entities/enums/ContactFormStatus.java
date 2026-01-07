package entities.enums;

public enum ContactFormStatus implements StringEnum {
  OPEN("open"),
  CLOSED("closed");

  private final String value;

  ContactFormStatus(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static ContactFormStatus fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (ContactFormStatus status : values()) {
      if (status.value.equals(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown ContactFormStatus: " + value);
  }
}
