package entities.enums;

public enum MemorialFlagType implements StringEnum {
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

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialFlagType fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialFlagType type : values()) {
      if (type.value.equals(value)) {
        return type;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialFlagType: " + value);
  }
}
