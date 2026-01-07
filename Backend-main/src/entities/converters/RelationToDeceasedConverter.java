package entities.converters;

import entities.enums.RelationToDeceased;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RelationToDeceasedConverter extends StringEnumConverter<RelationToDeceased> {
  public RelationToDeceasedConverter() {
    super(RelationToDeceased.class);
  }
}
