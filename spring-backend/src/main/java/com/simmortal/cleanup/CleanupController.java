package com.simmortal.cleanup;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cleanup")
public class CleanupController {
  private final CleanupService cleanupService;

  public CleanupController(CleanupService cleanupService) {
    this.cleanupService = cleanupService;
  }

  @PostMapping("/reserved-urls")
  public ResponseEntity<Map<String, String>> cleanupReservedUrls() {
    cleanupService.cleanupReservedUrls();
    return ResponseEntity.ok(Map.of("status", "reserved-urls cleanup triggered"));
  }

  @PostMapping("/memories")
  public ResponseEntity<Map<String, String>> cleanupMemories() {
    cleanupService.cleanupMemories();
    return ResponseEntity.ok(Map.of("status", "memories cleanup triggered"));
  }

  @PostMapping("/condolences")
  public ResponseEntity<Map<String, String>> cleanupCondolences() {
    cleanupService.cleanupCondolences();
    return ResponseEntity.ok(Map.of("status", "condolences cleanup triggered"));
  }
}
