package entities.converters;

import entities.enums.NotificationType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class NotificationTypeConverter extends StringEnumConverter<NotificationType> {
  public NotificationTypeConverter() {
    super(NotificationType.class);
  }
}
