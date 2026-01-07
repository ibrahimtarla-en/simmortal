package com.simmortal.user;

import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  public Object getUserById(String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getAllUsers() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getAdminUserDetails(String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object updateUserStatus(String userId, UserAccountStatus status, String adminUserId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object deleteUser(String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
