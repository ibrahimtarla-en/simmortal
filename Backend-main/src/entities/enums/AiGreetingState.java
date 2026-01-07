package entities.enums;

public enum AiGreetingState implements StringEnum {
  READY("ready"),
  PROCESSING_AUDIO("processing-audio"),
  PROCESSING_VIDEO("processing-video"),
  ERROR("error"),
  COMPLETED("completed");

  private final String value;

  AiGreetingState(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static AiGreetingState fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (AiGreetingState state : values()) {
      if (state.value.equals(value)) {
        return state;
      }
    }
    throw new IllegalArgumentException("Unknown AiGreetingState: " + value);
  }
}
