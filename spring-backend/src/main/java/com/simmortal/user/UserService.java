package com.simmortal.user;

import java.util.Map;
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
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("userId", userId);
    response.put("phoneNumber", phoneNumber);
    response.put("status", "sent");
    return response;
  }

  public Object verifyUserPhoneNumber(String userId, String phoneNumber, String code) {
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("userId", userId);
    response.put("phoneNumber", phoneNumber);
    response.put("verified", true);
    return response;
  }

  public Object getDashboardUrl(String userId) {
    return Map.of("url", "https://dashboard.simmortals.com/user/" + userId);
  }

  public Object updateUserProfile(String userId, UpdateUserProfileRequest request, MultipartFile image) {
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("userId", userId);
    response.put("firstName", request.firstName());
    response.put("lastName", request.lastName());
    response.put("location", request.location());
    response.put("dateOfBirth", request.dateOfBirth());
    return response;
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
