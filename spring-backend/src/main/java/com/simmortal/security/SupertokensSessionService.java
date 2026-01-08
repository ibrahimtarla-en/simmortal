package com.simmortal.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SupertokensSessionService {
  private static final String ACCESS_TOKEN_COOKIE = "sAccessToken";
  private static final String ANTI_CSRF_HEADER = "anti-csrf";
  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final String connectionUri;
  private final String apiKey;
  private final boolean antiCsrfEnabled;

  public SupertokensSessionService(
      @Value("${app.supertokens.connection-uri}") String connectionUri,
      @Value("${app.supertokens.api-key:}") String apiKey,
      @Value("${app.supertokens.anti-csrf:true}") boolean antiCsrfEnabled
  ) {
    this.connectionUri = connectionUri;
    this.apiKey = apiKey;
    this.antiCsrfEnabled = antiCsrfEnabled;
  }

  public Optional<String> verifySession(HttpServletRequest request) {
    String accessToken = getAccessToken(request);
    if (accessToken == null || accessToken.isBlank()) {
      return Optional.empty();
    }
    String antiCsrfToken = request.getHeader(ANTI_CSRF_HEADER);

    Map<String, Object> payload = new HashMap<>();
    payload.put("accessToken", accessToken);
    payload.put("antiCsrfToken", antiCsrfToken);
    payload.put("doAntiCsrfCheck", antiCsrfEnabled);
    payload.put("sessionRequired", true);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    if (apiKey != null && !apiKey.isBlank()) {
      headers.set("api-key", apiKey);
    }

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
    try {
      ResponseEntity<String> response = restTemplate.postForEntity(
          connectionUri + "/recipe/session/verify",
          entity,
          String.class
      );
      if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
        return Optional.empty();
      }
      Map<?, ?> responseBody = objectMapper.readValue(response.getBody(), Map.class);
      Object userId = responseBody.get("userId");
      return userId == null ? Optional.empty() : Optional.of(userId.toString());
    } catch (Exception ex) {
      return Optional.empty();
    }
  }

  private String getAccessToken(HttpServletRequest request) {
    if (request.getCookies() == null) {
      return null;
    }
    for (Cookie cookie : request.getCookies()) {
      if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
        return cookie.getValue();
      }
    }
    return null;
  }
}
