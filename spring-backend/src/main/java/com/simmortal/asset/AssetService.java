package com.simmortal.asset;

import com.simmortal.storage.StorageService;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AssetService {
  private final StorageService storageService;

  public AssetService(StorageService storageService) {
    this.storageService = storageService;
  }

  public AssetPayload fetchAsset(String path, String rangeHeader) {
    StorageService.StorageObject storageObject = storageService.download(path);
    if (storageObject == null || storageObject.data() == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found or inaccessible");
    }

    String contentType = Optional.ofNullable(storageObject.contentType())
        .orElse("application/octet-stream");
    byte[] data = storageObject.data();
    long totalSize = data.length;
    boolean isVideo = contentType.startsWith("video/");

    if (isVideo && rangeHeader != null && rangeHeader.startsWith("bytes=")) {
      String rangeValue = rangeHeader.replace("bytes=", "").trim();
      String[] parts = rangeValue.split("-", 2);
      long start = parseRangePart(parts[0], 0);
      long end = parts.length > 1 && !parts[1].isBlank() ? parseRangePart(parts[1], totalSize - 1) : totalSize - 1;

      if (start > end || end >= totalSize) {
        throw new ResponseStatusException(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE, "Invalid range");
      }

      byte[] slice = java.util.Arrays.copyOfRange(data, (int) start, (int) end + 1);
      return new AssetPayload(slice, contentType, totalSize, start, end, true);
    }

    return new AssetPayload(data, contentType, totalSize, null, null, false);
  }

  private long parseRangePart(String value, long fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    try {
      return Long.parseLong(value);
    } catch (NumberFormatException ex) {
      return fallback;
    }
  }

  public record AssetPayload(
      byte[] data,
      String contentType,
      long totalSize,
      Long rangeStart,
      Long rangeEnd,
      boolean partial
  ) {}
}
