package entities.converters;

import entities.enums.OrderStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class OrderStatusConverter extends StringEnumConverter<OrderStatus> {
  public OrderStatusConverter() {
    super(OrderStatus.class);
  }
}
