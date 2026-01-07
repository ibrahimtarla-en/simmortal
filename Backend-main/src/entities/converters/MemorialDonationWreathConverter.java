package entities.converters;

import entities.enums.MemorialDonationWreath;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MemorialDonationWreathConverter extends StringEnumConverter<MemorialDonationWreath> {
  public MemorialDonationWreathConverter() {
    super(MemorialDonationWreath.class);
  }
}
