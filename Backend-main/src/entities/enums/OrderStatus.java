package entities.enums;

public enum OrderStatus implements StringEnum {
  CREATED("created"),
  PAID("paid"),
  COMPLETED("completed");

  private final String value;

  OrderStatus(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static OrderStatus fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (OrderStatus status : values()) {
      if (status.value.equals(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown OrderStatus: " + value);
  }
}
