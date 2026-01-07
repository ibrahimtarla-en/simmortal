package com.simmortal.adminpanel;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AdminPanelConfig implements WebMvcConfigurer {
  private static final String DEFAULT_ADMIN_PANEL_PATH = "../Admin-Panel-main/out";

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/admin/**")
        .addResourceLocations("file:" + resolveAdminPanelPath() + "/");
  }

  private String resolveAdminPanelPath() {
    String configured = System.getenv("ADMIN_PANEL_PATH");
    if (configured == null || configured.isBlank()) {
      return normalizePath(DEFAULT_ADMIN_PANEL_PATH);
    }
    return normalizePath(configured);
  }

  private String normalizePath(String path) {
    Path resolved = Paths.get(path).toAbsolutePath().normalize();
    return resolved.toString();
  }
}
