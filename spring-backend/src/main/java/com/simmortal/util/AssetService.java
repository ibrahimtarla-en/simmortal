package com.simmortal.util;

import org.springframework.stereotype.Service;

@Service
public class AssetService {
  public String generateAssetUrl(String path) {
    if (path == null || path.isBlank()) {
      return path;
    }
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
      return path;
    }
    return "/api/v1/asset/" + path;
  }
}
