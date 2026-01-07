package entities.enums;

public enum MemorialFrame implements StringEnum {
  DEFAULT("default"),
  AURELIAN_SOVEREIGN("aurelian-sovereign"),
  BAROQUE_ARGENTUM("baroque-argentum"),
  BAROQUE_ROYALE("baroque-royale"),
  CHROMELINE_ELEGANCE("chromeline-elegance"),
  FROSTED_SOVEREIGN("frosted-sovereign"),
  GOLDEN_HERITAGE("golden-heritage"),
  IMPERIAL_GILDED_CREST("imperial-gilded-crest"),
  MAJESTIC_AUREATE("majestic-aureate"),
  SILVER_NOCTURNE("silver-nocturne"),
  SOVEREIGN_SILVERLEAF("sovereign-silverleaf");

  private final String value;

  MemorialFrame(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialFrame fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialFrame frame : values()) {
      if (frame.value.equals(value)) {
        return frame;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialFrame: " + value);
  }
}
