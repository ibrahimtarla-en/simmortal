package entities.converters;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class PostgresStringArrayConverter implements AttributeConverter<List<String>, String> {
  @Override
  public String convertToDatabaseColumn(List<String> attribute) {
    if (attribute == null) {
      return null;
    }
    return "{" + attribute.stream().map(this::escapeValue).collect(Collectors.joining(",")) + "}";
  }

  @Override
  public List<String> convertToEntityAttribute(String dbData) {
    if (dbData == null || dbData.length() < 2) {
      return Collections.emptyList();
    }
    String trimmed = dbData.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      trimmed = trimmed.substring(1, trimmed.length() - 1);
    }
    if (trimmed.isEmpty()) {
      return Collections.emptyList();
    }
    List<String> values = new ArrayList<>();
    for (String part : trimmed.split(",")) {
      values.add(unescapeValue(part));
    }
    return values;
  }

  private String escapeValue(String value) {
    if (value == null) {
      return "";
    }
    return "\"" + value.replace("\"", "\\\"") + "\"";
  }

  private String unescapeValue(String value) {
    String trimmed = value.trim();
    if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
      trimmed = trimmed.substring(1, trimmed.length() - 1);
    }
    return trimmed.replace("\\\"", "\"");
  }
}
