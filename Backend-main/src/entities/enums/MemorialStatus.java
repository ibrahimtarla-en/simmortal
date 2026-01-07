package entities.enums;

public enum MemorialStatus implements StringEnum {
  DRAFT("draft"),
  PUBLISHED("published"),
  REMOVED("removed");

  private final String value;

  MemorialStatus(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialStatus fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialStatus status : values()) {
      if (status.value.equals(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialStatus: " + value);
  }
}
