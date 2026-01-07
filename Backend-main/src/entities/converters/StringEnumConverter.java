package entities.converters;

import entities.enums.StringEnum;
import jakarta.persistence.AttributeConverter;

public abstract class StringEnumConverter<E extends Enum<E> & StringEnum>
    implements AttributeConverter<E, String> {
  private final Class<E> enumType;

  protected StringEnumConverter(Class<E> enumType) {
    this.enumType = enumType;
  }

  @Override
  public String convertToDatabaseColumn(E attribute) {
    return attribute != null ? attribute.getValue() : null;
  }

  @Override
  public E convertToEntityAttribute(String dbData) {
    if (dbData == null) {
      return null;
    }
    for (E constant : enumType.getEnumConstants()) {
      if (constant.getValue().equals(dbData)) {
        return constant;
      }
    }
    throw new IllegalArgumentException(
        "Unknown " + enumType.getSimpleName() + " database value: " + dbData);
  }
}
