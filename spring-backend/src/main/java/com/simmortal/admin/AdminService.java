package com.simmortal.admin;

import com.simmortal.contact.ContactService;
import com.simmortal.memorial.CondolenceService;
import com.simmortal.memorial.DonationService;
import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialService;
import com.simmortal.memorial.MemorialTribute;
import com.simmortal.memorial.MemoryService;
import com.simmortal.shop.OrderStatus;
import com.simmortal.shop.ShopService;
import com.simmortal.user.UserAccountStatus;
import com.simmortal.user.UserService;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
  private final AdminRepository adminRepository;
  private final UserService userService;
  private final MemorialService memorialService;
  private final ContactService contactService;
  private final ShopService shopService;
  private final MemoryService memoryService;
  private final CondolenceService condolenceService;
  private final DonationService donationService;

  public AdminService(
      AdminRepository adminRepository,
      UserService userService,
      MemorialService memorialService,
      ContactService contactService,
      ShopService shopService,
      MemoryService memoryService,
      CondolenceService condolenceService,
      DonationService donationService
  ) {
    this.adminRepository = adminRepository;
    this.userService = userService;
    this.memorialService = memorialService;
    this.contactService = contactService;
    this.shopService = shopService;
    this.memoryService = memoryService;
    this.condolenceService = condolenceService;
    this.donationService = donationService;
  }

  public Object getAllUsers(String adminUserId) {
    adminRepository.verifyAdminAccess(adminUserId);
    return userService.getAllUsers();
  }

  public Object getUserById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return userService.getAdminUserDetails(id);
  }

  public Object getCustomerId(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.findCustomerByUserId(id);
  }

  public Object updateUserStatus(String adminUserId, String id, UserAccountStatus status) {
    adminRepository.verifyAdminAccess(adminUserId);
    return userService.updateUserStatus(id, status, adminUserId);
  }

  public Object getUserMemorials(String adminUserId, String userId) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memorialService.getOwnedMemorialPreviews(userId);
  }

  public Object getAllMemorials(String adminUserId) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memorialService.getAdminMemorials();
  }

  public Object getAdminMemorialById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memorialService.getAdminMemorialById(id);
  }

  public Object addFeaturedMemorial(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memorialService.addFeaturedMemorial(adminUserId, id);
  }

  public Object removeFeaturedMemorial(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memorialService.removeFeaturedMemorial(adminUserId, id);
  }

  public Object getOpenContactForms(String adminUserId) {
    adminRepository.verifyAdminAccess(adminUserId);
    return contactService.getOpenContactForms();
  }

  public Object getContactFormById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return contactService.getContactFormById(id);
  }

  public Object closeContactForm(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return contactService.closeContactForm(adminUserId, id);
  }

  public Object getAllOrders(String adminUserId) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.getAllOrders();
  }

  public Object getOrderById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.getOrderByIdAdmin(id);
  }

  public Object updateOrderStatus(String adminUserId, String id, OrderStatus status) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.updateOrderStatus(id, status, adminUserId);
  }

  public Object getOpenMemorialFlags(String adminUserId) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memorialService.getOpenAdminFlags();
  }

  public Object getMemoryById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return memoryService.getMemoryById(id);
  }

  public Object getCondolenceById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return condolenceService.getCondolenceById(id);
  }

  public Object getDonationById(String adminUserId, String id) {
    adminRepository.verifyAdminAccess(adminUserId);
    return donationService.getDonationById(id);
  }

  public Object updateDecorationPrice(String adminUserId, MemorialDecoration decoration, Integer priceInCents) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.updateDecorationPrice(decoration, priceInCents);
  }

  public Object updateTributePrice(String adminUserId, MemorialTribute tribute, Integer priceInCents) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.updateTributePrice(tribute, priceInCents);
  }

  public Object updateWreathPrice(String adminUserId, MemorialDonationWreath wreath, Integer priceInCents) {
    adminRepository.verifyAdminAccess(adminUserId);
    return shopService.updateWreathPrice(wreath, priceInCents);
  }
}
