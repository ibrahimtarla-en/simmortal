package com.simmortal.asset;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/asset")
public class AssetController {
  private final AssetService assetService;

  public AssetController(AssetService assetService) {
    this.assetService = assetService;
  }

  @GetMapping("/**")
  public void streamAsset(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String assetPath = resolveAssetPath(request);
    AssetService.AssetPayload payload = assetService.fetchAsset(assetPath, request.getHeader("Range"));

    response.setContentType(payload.contentType());
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    response.setHeader("Connection", "keep-alive");

    if (payload.partial()) {
      response.setStatus(HttpStatus.PARTIAL_CONTENT.value());
      response.setHeader("Accept-Ranges", "bytes");
      response.setHeader(
          "Content-Range",
          String.format("bytes %d-%d/%d", payload.rangeStart(), payload.rangeEnd(), payload.totalSize())
      );
      response.setContentLength(payload.data().length);
    } else {
      if (payload.contentType().startsWith("video/")) {
        response.setHeader("Accept-Ranges", "bytes");
      }
      response.setContentLengthLong(payload.totalSize());
    }

    response.getOutputStream().write(payload.data());
  }

  private String resolveAssetPath(HttpServletRequest request) {
    String requestUri = request.getRequestURI();
    String prefix = request.getContextPath() + "/asset/";
    if (!requestUri.startsWith(prefix)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found");
    }
    String path = requestUri.substring(prefix.length());
    if (path.isBlank()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found");
    }
    return path;
  }
}
