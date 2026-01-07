package com.simmortal.storage;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.Storage.BlobListOption;
import com.google.cloud.storage.StorageOptions;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StorageService {
  private static final Logger logger = LoggerFactory.getLogger(StorageService.class);
  private final Storage storage;
  private final String bucketName;

  public StorageService() {
    this.bucketName = Optional.ofNullable(System.getenv("GCLOUD_STORAGE_BUCKET")).orElse("simmortals-dev");
    this.storage = initializeStorage();
  }

  public void save(String path, byte[] data, String contentType) {
    ensureConfigured();
    BlobId blobId = BlobId.of(bucketName, path);
    BlobInfo info = BlobInfo.newBuilder(blobId).setContentType(contentType).build();
    storage.create(info, data);
  }

  public boolean exists(String path) {
    ensureConfigured();
    return storage.get(BlobId.of(bucketName, path)) != null;
  }

  public StorageObject download(String path) {
    ensureConfigured();
    Blob blob = storage.get(BlobId.of(bucketName, path));
    if (blob == null) {
      return null;
    }
    return new StorageObject(blob.getContent(), blob.getContentType());
  }

  public void delete(String path) {
    ensureConfigured();
    storage.delete(BlobId.of(bucketName, path));
  }

  public void deleteFolder(String prefix) {
    ensureConfigured();
    storage.list(bucketName, BlobListOption.prefix(prefix)).iterateAll().forEach(blob -> storage.delete(blob.getBlobId()));
  }

  public String generateSignedUrl(String path) {
    ensureConfigured();
    BlobInfo info = BlobInfo.newBuilder(BlobId.of(bucketName, path)).build();
    return storage.signUrl(info, 10, java.util.concurrent.TimeUnit.MINUTES).toString();
  }

  private Storage initializeStorage() {
    String credentialsJson = System.getenv("GCLOUD_STORAGE_CREDENTIALS_JSON");
    if (credentialsJson != null && !credentialsJson.isBlank()) {
      try {
        String decoded = decodeIfBase64(credentialsJson);
        GoogleCredentials credentials =
            GoogleCredentials.fromStream(new ByteArrayInputStream(decoded.getBytes(StandardCharsets.UTF_8)));
        return StorageOptions.newBuilder().setCredentials(credentials).build().getService();
      } catch (IOException ex) {
        logger.error("Failed to parse GCLOUD_STORAGE_CREDENTIALS_JSON", ex);
      }
    }
    logger.warn("GCLOUD_STORAGE_CREDENTIALS_JSON not configured; using default credentials");
    return StorageOptions.getDefaultInstance().getService();
  }

  private String decodeIfBase64(String value) {
    try {
      return new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
    } catch (IllegalArgumentException ex) {
      return value;
    }
  }

  private void ensureConfigured() {
    if (storage == null) {
      throw new IllegalStateException("Storage client is not configured.");
    }
  }

  public record StorageObject(byte[] data, String contentType) {}
}
