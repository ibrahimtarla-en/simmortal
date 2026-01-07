package entities.enums;

public enum NotificationType implements StringEnum {
  MEMORIAL_LIKE("memorial-like"),
  MEMORY_REPORT("memory-report"),
  CONDOLENCE_REPORT("condolence-report"),
  MEMORY_REQUEST("memory-request"),
  CONDOLENCE_REQUEST("condolence-request"),
  MEMORY_APPROVED("memory-approved"),
  CONDOLENCE_APPROVED("condolence-approved"),
  DONATION_REPORT("donation-report");

  private final String value;

  NotificationType(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static NotificationType fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (NotificationType type : values()) {
      if (type.value.equals(value)) {
        return type;
      }
    }
    throw new IllegalArgumentException("Unknown NotificationType: " + value);
  }
}
