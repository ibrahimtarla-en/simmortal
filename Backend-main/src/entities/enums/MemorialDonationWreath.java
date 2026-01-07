package entities.enums;

public enum MemorialDonationWreath implements StringEnum {
  SILVER("silver"),
  ROSE("rose"),
  GOLD("gold"),
  PURPLE("purple");

  private final String value;

  MemorialDonationWreath(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialDonationWreath fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialDonationWreath wreath : values()) {
      if (wreath.value.equals(value)) {
        return wreath;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialDonationWreath: " + value);
  }
}
