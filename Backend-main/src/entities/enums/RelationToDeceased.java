package entities.enums;

public enum RelationToDeceased implements StringEnum {
  FAMILY("family"),
  PARTNER("partner"),
  COLLEAGUE("colleague"),
  FRIEND("friend"),
  OTHER("other");

  private final String value;

  RelationToDeceased(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static RelationToDeceased fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (RelationToDeceased relation : values()) {
      if (relation.value.equals(value)) {
        return relation;
      }
    }
    throw new IllegalArgumentException("Unknown RelationToDeceased: " + value);
  }
}
