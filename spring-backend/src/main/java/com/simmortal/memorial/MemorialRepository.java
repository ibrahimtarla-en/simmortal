package com.simmortal.memorial;

import java.util.Map;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

@Repository
public class MemorialRepository {
  public Object createMemorial(String userId, Map<String, Object> request, MultipartFile image) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getMemorialById(String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object deleteMemorial(String memorialId, String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
