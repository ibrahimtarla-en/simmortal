package com.simmortal.ai;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiService {
  public String transcribeAudio(MultipartFile audio) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getAiGreeting(String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void resetAiGreetingCreation(String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public String createMemorialVoice(String memorialId, List<MultipartFile> files) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public String createMemorialGreetingAudio(String memorialId, String voiceId, String locale) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public String uploadAiGreetingImage(String memorialId, MultipartFile image) {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
