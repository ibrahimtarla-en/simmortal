package entities.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import entities.types.TimelineMemory;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Converter
public class TimelineMemoryListConverter implements AttributeConverter<List<TimelineMemory>, String> {
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final TypeReference<List<TimelineMemory>> TYPE = new TypeReference<>() {};

  @Override
  public String convertToDatabaseColumn(List<TimelineMemory> attribute) {
    if (attribute == null) {
      return null;
    }
    try {
      return MAPPER.writeValueAsString(attribute);
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("Failed to serialize timeline", e);
    }
  }

  @Override
  public List<TimelineMemory> convertToEntityAttribute(String dbData) {
    if (dbData == null || dbData.isBlank()) {
      return Collections.emptyList();
    }
    try {
      return MAPPER.readValue(dbData, TYPE);
    } catch (IOException e) {
      throw new IllegalArgumentException("Failed to deserialize timeline", e);
    }
  }
}
