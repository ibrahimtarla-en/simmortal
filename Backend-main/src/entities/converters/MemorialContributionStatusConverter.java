package entities.converters;

import entities.enums.MemorialContributionStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialContributionStatusConverter extends StringEnumConverter<MemorialContributionStatus> {
  public MemorialContributionStatusConverter() {
    super(MemorialContributionStatus.class);
  }
}
