package entities.converters;

import entities.enums.AiGreetingState;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AiGreetingStateConverter extends StringEnumConverter<AiGreetingState> {
  public AiGreetingStateConverter() {
    super(AiGreetingState.class);
  }
}
