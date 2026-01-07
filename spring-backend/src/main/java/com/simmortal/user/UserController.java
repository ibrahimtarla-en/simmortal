package com.simmortal.user;

import com.simmortal.memorial.CondolenceService;
import com.simmortal.memorial.DonationService;
import com.simmortal.memorial.MemoryService;
import com.simmortal.memorial.MemorialContributionSortField;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

@RestController
@RequestMapping("user")
public class UserController {
  private final UserService userService;
  private final MemoryService memoryService;
  private final CondolenceService condolenceService;
  private final DonationService donationService;

  public UserController(
      UserService userService,
      MemoryService memoryService,
      CondolenceService condolenceService,
      DonationService donationService
  ) {
    this.userService = userService;
    this.memoryService = memoryService;
    this.condolenceService = condolenceService;
    this.donationService = donationService;
  }

  @GetMapping
  public Object getUserInfo(@RequestHeader("X-User-Id") String userId) {
    return userService.getUser(userId);
  }

  @PostMapping("phone-number/send-validation-code")
  public Object sendPhoneNumberValidationCode(
      @RequestHeader("X-User-Id") String userId,
      @RequestBody SendPhoneNumberValidationCodeRequest body
  ) {
    return userService.sendPhoneNumberVerificationCode(userId, body.phoneNumber());
  }

  @PostMapping("phone-number/consume-validation-code")
  public Object consumePhoneNumberValidationCode(
      @RequestHeader("X-User-Id") String userId,
      @RequestBody ConsumePhoneNumberValidationCodeRequest body
  ) {
    return userService.verifyUserPhoneNumber(userId, body.phoneNumber(), body.code());
  }

  @GetMapping("dashboard")
  public Object getDashboardUrl(@RequestHeader("X-User-Id") String userId) {
    return userService.getDashboardUrl(userId);
  }

  @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Object updateUserProfile(
      @RequestHeader("X-User-Id") String userId,
      @RequestPart("data") UpdateUserProfileRequest body,
      @RequestPart(value = "image", required = false) MultipartFile image
  ) {
    return userService.updateUserProfile(userId, body, image);
  }

  @GetMapping("liked-memories")
  public Object getLikedMemories(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "sort", required = false) MemorialContributionSortField sort,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "order", required = false) String order
  ) {
    return memoryService.getLikedMemories(sort, cursor, order, userId);
  }

  @GetMapping("owned-memories")
  public Object getOwnedMemories(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "sort", required = false) MemorialContributionSortField sort,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "order", required = false) String order
  ) {
    return memoryService.getOwnedMemories(sort, cursor, order, userId);
  }

  @GetMapping("liked-condolences")
  public Object getLikedCondolences(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "sort", required = false) MemorialContributionSortField sort,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "order", required = false) String order
  ) {
    return condolenceService.getLikedCondolences(sort, cursor, order, userId);
  }

  @GetMapping("owned-donations")
  public Object getOwnedDonations(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "sort", required = false) MemorialContributionSortField sort,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "order", required = false) String order
  ) {
    return donationService.getOwnedDonations(sort, cursor, order, userId);
  }

  @GetMapping("liked-donations")
  public Object getLikedDonations(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "sort", required = false) MemorialContributionSortField sort,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "order", required = false) String order
  ) {
    return donationService.getLikedDonations(sort, cursor, order, userId);
  }

  @GetMapping("owned-condolences")
  public Object getOwnedCondolences(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "sort", required = false) MemorialContributionSortField sort,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "order", required = false) String order
  ) {
    return condolenceService.getOwnedCondolences(sort, cursor, order, userId);
  }

  @DeleteMapping
  public Object deleteUser(@RequestHeader("X-User-Id") String userId) {
    return userService.deleteUser(userId);
  }
}
