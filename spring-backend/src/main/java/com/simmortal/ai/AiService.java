package com.simmortal.ai;

import com.simmortal.storage.StorageService;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiService {
  private static final Logger logger = LoggerFactory.getLogger(AiService.class);
  private static final String DEFAULT_LOCALE = "en";
  private static final String GREETING_PREFIX = "ai-greeting";
  private final StorageService storageService;
  private final Map<String, AiGreeting> greetings = new ConcurrentHashMap<>();

  public AiService(StorageService storageService) {
    this.storageService = storageService;
  }

  public String transcribeAudio(MultipartFile audio) {
    if (audio == null || audio.isEmpty()) {
      return "";
    }
    logger.info("Received audio transcription request for filename={}", audio.getOriginalFilename());
    return "";
  }

  public AiGreeting getAiGreeting(String memorialId) {
    return greetings.getOrDefault(memorialId, AiGreeting.empty());
  }

  public void resetAiGreetingCreation(String memorialId) {
    AiGreeting greeting = greetings.remove(memorialId);
    if (greeting == null) {
      return;
    }
    deleteIfPresent(greeting.audioPath());
    deleteIfPresent(greeting.imagePath());
    greeting.voiceSamples().values().forEach(this::deleteIfPresent);
  }

  public String createMemorialVoice(String memorialId, List<MultipartFile> files) {
    String voiceId = UUID.randomUUID().toString();
    Map<String, String> storedSamples = new ConcurrentHashMap<>();
    for (MultipartFile file : files) {
      if (file.isEmpty()) {
        continue;
      }
      String path = buildAssetPath(memorialId, "voice-samples", file);
      storeFile(path, file);
      storedSamples.put(file.getOriginalFilename(), path);
    }
    AiGreeting greeting = greetings.getOrDefault(memorialId, AiGreeting.empty());
    greetings.put(
        memorialId,
        greeting.withVoiceId(voiceId).withVoiceSamples(storedSamples));
    return voiceId;
  }

  public String createMemorialGreetingAudio(String memorialId, String voiceId, String locale) {
    String normalizedLocale = normalizeLocale(locale);
    String path = buildAssetPath(memorialId, "greeting-audio", "greeting-" + voiceId + ".txt");
    String payload = "AI greeting audio generation is pending.";
    storageService.save(path, payload.getBytes(), "text/plain");
    AiGreeting greeting = greetings.getOrDefault(memorialId, AiGreeting.empty());
    greetings.put(
        memorialId,
        greeting.withVoiceId(voiceId).withAudioPath(path).withLocale(normalizedLocale));
    return path;
  }

  public String uploadAiGreetingImage(String memorialId, MultipartFile image) {
    String path = buildAssetPath(memorialId, "greeting-image", image);
    storeFile(path, image);
    AiGreeting greeting = greetings.getOrDefault(memorialId, AiGreeting.empty());
    greetings.put(memorialId, greeting.withImagePath(path));
    return path;
  }

  private void storeFile(String path, MultipartFile file) {
    try {
      storageService.save(path, file.getBytes(), file.getContentType());
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to store AI asset", ex);
    }
  }

  private void deleteIfPresent(String path) {
    if (path != null && !path.isBlank()) {
      storageService.delete(path);
    }
  }

  private String normalizeLocale(String locale) {
    if (locale == null || locale.isBlank()) {
      return DEFAULT_LOCALE;
    }
    String normalized = locale.toLowerCase(Locale.ROOT);
    if ("tr".equals(normalized) || "en".equals(normalized)) {
      return normalized;
    }
    return DEFAULT_LOCALE;
  }

  private String buildAssetPath(String memorialId, String type, MultipartFile file) {
    String filename = file.getOriginalFilename();
    String extension = extractExtension(filename);
    String id = UUID.randomUUID().toString();
    String suffix = extension.isBlank() ? id : id + "." + extension;
    return buildAssetPath(memorialId, type, suffix);
  }

  private String buildAssetPath(String memorialId, String type, String filename) {
    return "memorial/" + memorialId + "/" + GREETING_PREFIX + "/" + type + "/" + filename;
  }

  private String extractExtension(String filename) {
    if (filename == null || !filename.contains(".")) {
      return "";
    }
    return filename.substring(filename.lastIndexOf('.') + 1);
  }

  public record AiGreeting(
      String voiceId,
      String audioPath,
      String imagePath,
      String locale,
      Map<String, String> voiceSamples
  ) {
    static AiGreeting empty() {
      return new AiGreeting(null, null, null, DEFAULT_LOCALE, Map.of());
    }

    AiGreeting withVoiceId(String newVoiceId) {
      return new AiGreeting(newVoiceId, audioPath, imagePath, locale, voiceSamples);
    }

    AiGreeting withAudioPath(String newAudioPath) {
      return new AiGreeting(voiceId, newAudioPath, imagePath, locale, voiceSamples);
    }

    AiGreeting withImagePath(String newImagePath) {
      return new AiGreeting(voiceId, audioPath, newImagePath, locale, voiceSamples);
    }

    AiGreeting withLocale(String newLocale) {
      return new AiGreeting(voiceId, audioPath, imagePath, newLocale, voiceSamples);
    }

    AiGreeting withVoiceSamples(Map<String, String> samples) {
      return new AiGreeting(voiceId, audioPath, imagePath, locale, Map.copyOf(samples));
    }
  }
}
