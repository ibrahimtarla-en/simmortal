package entities.converters;

import entities.enums.AssetType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AssetTypeConverter extends StringEnumConverter<AssetType> {
  public AssetTypeConverter() {
    super(AssetType.class);
  }
}
