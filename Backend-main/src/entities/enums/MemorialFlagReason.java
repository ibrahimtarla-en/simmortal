package entities.enums;

public enum MemorialFlagReason implements StringEnum {
  DISLIKE("dislike"),
  BULLYING("bullying"),
  HARMFUL("harmful"),
  VIOLENCE("violence"),
  PROMOTING("promoting"),
  EXPLICIT("explicit"),
  SCAM("scam"),
  FALSE_INFO("false-info"),
  COPYRIGHT("copyright"),
  ILLEGAL("illegal");

  private final String value;

  MemorialFlagReason(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialFlagReason fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialFlagReason reason : values()) {
      if (reason.value.equals(value)) {
        return reason;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialFlagReason: " + value);
  }
}
