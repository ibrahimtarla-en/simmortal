package com.simmortal.storage;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/storage")
public class StorageController {
  private final StorageService storageService;

  public StorageController(StorageService storageService) {
    this.storageService = storageService;
  }

  @GetMapping("/download")
  public ResponseEntity<byte[]> download(@RequestParam @NotBlank String path) {
    StorageService.StorageObject object = storageService.download(path);
    if (object == null) {
      return ResponseEntity.notFound().build();
    }
    String contentType = object.contentType() != null ? object.contentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, contentType)
        .body(object.data());
  }

  @GetMapping("/signed-url")
  public ResponseEntity<Map<String, String>> signedUrl(@RequestParam @NotBlank String path) {
    return ResponseEntity.ok(Map.of("url", storageService.generateSignedUrl(path)));
  }
}
