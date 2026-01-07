package entities.enums;

public enum MemorialFlagStatus implements StringEnum {
  OPEN("open"),
  APPROVED("approved"),
  REJECTED("rejected");

  private final String value;

  MemorialFlagStatus(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialFlagStatus fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialFlagStatus status : values()) {
      if (status.value.equals(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialFlagStatus: " + value);
  }
}
