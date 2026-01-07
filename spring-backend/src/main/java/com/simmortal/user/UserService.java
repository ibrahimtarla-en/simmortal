package com.simmortal.user;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Object getUser(String userId) {
    return userRepository.getUserById(userId);
  }

  public Object sendPhoneNumberVerificationCode(String userId, String phoneNumber) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object verifyUserPhoneNumber(String userId, String phoneNumber, String code) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getDashboardUrl(String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object updateUserProfile(String userId, UpdateUserProfileRequest request, MultipartFile image) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object deleteUser(String userId) {
    return userRepository.deleteUser(userId);
  }

  public Object getAllUsers() {
    return userRepository.getAllUsers();
  }

  public Object getAdminUserDetails(String userId) {
    return userRepository.getAdminUserDetails(userId);
  }

  public Object updateUserStatus(String userId, UserAccountStatus status, String adminUserId) {
    return userRepository.updateUserStatus(userId, status, adminUserId);
  }
}
