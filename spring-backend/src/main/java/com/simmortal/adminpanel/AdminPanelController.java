package com.simmortal.adminpanel;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminPanelController {
  @GetMapping({
      "/admin",
      "/admin/",
      "/admin/{path:[^\\.]*}",
      "/admin/**/{path:[^\\.]*}"
  })
  public String forwardToAdminIndex() {
    return "forward:/admin/index.html";
  }
}
