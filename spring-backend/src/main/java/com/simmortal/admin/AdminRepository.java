package com.simmortal.admin;

import org.springframework.stereotype.Repository;

@Repository
public class AdminRepository {
  public void verifyAdminAccess(String adminUserId) {
    if (adminUserId == null || adminUserId.isBlank()) {
      throw new IllegalArgumentException("Admin user ID is required.");
    }
  }
}
