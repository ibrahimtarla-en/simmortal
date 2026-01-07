package entities.converters;

import entities.enums.UserAccountStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserAccountStatusConverter extends StringEnumConverter<UserAccountStatus> {
  public UserAccountStatusConverter() {
    super(UserAccountStatus.class);
  }
}
