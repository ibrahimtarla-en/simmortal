package entities.enums;

public enum MemorialContributionStatus implements StringEnum {
  DRAFT("draft"),
  PUBLISHED("published"),
  IN_REVIEW("in-review"),
  REJECTED("rejected"),
  REMOVED("removed");

  private final String value;

  MemorialContributionStatus(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialContributionStatus fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialContributionStatus status : values()) {
      if (status.value.equals(value)) {
        return status;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialContributionStatus: " + value);
  }
}
