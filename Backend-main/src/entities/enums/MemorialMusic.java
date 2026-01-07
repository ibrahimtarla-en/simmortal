package entities.enums;

public enum MemorialMusic implements StringEnum {
  CELLO_ONE("cello-one"),
  CELLO_TWO("cello-two"),
  PIANO("piano"),
  UD("ud"),
  VIOLIN_ONE("violin-one"),
  VIOLIN_TWO("violin-two");

  private final String value;

  MemorialMusic(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialMusic fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialMusic music : values()) {
      if (music.value.equals(value)) {
        return music;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialMusic: " + value);
  }
}
