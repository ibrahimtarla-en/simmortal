package entities.enums;

public enum AssetType implements StringEnum {
  IMAGE("image"),
  VIDEO("video");

  private final String value;

  AssetType(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static AssetType fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (AssetType type : values()) {
      if (type.value.equals(value)) {
        return type;
      }
    }
    throw new IllegalArgumentException("Unknown AssetType: " + value);
  }
}
