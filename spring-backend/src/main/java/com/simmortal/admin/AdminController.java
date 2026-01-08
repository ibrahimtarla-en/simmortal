package com.simmortal.admin;

import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialTribute;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("admin")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("users")
  public Object getAllUsers(@RequestHeader("X-User-Id") String adminUserId) {
    return adminService.getAllUsers(adminUserId);
  }

  @GetMapping("users/{id}")
  public Object getUserById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getUserById(adminUserId, id);
  }

  @GetMapping("users/{id}/customer")
  public Object getCustomerId(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getCustomerId(adminUserId, id);
  }

  @PatchMapping("users/{id}/status")
  public Object updateUserStatus(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id,
      @RequestBody UpdateUserStatusRequest body
  ) {
    return adminService.updateUserStatus(adminUserId, id, body.status());
  }

  @GetMapping("users/memorials/{userId}")
  public Object getUserMemorials(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("userId") String userId
  ) {
    return adminService.getUserMemorials(adminUserId, userId);
  }

  @GetMapping("memorials")
  public Object getAllMemorials(@RequestHeader("X-User-Id") String adminUserId) {
    return adminService.getAllMemorials(adminUserId);
  }

  @GetMapping("memorials/{id}")
  public Object getAdminMemorialById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getAdminMemorialById(adminUserId, id);
  }

  @PostMapping("memorials/featured/{id}")
  public Object addFeaturedMemorial(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.addFeaturedMemorial(adminUserId, id);
  }

  @DeleteMapping("memorials/featured/{id}")
  public Object removeFeaturedMemorial(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.removeFeaturedMemorial(adminUserId, id);
  }

  @GetMapping("contact-forms")
  public Object getOpenContactForms(@RequestHeader("X-User-Id") String adminUserId) {
    return adminService.getOpenContactForms(adminUserId);
  }

  @GetMapping("contact-forms/{id}")
  public Object getContactFormById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getContactFormById(adminUserId, id);
  }

  @PatchMapping("contact-forms/close/{id}")
  public Object closeContactForm(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.closeContactForm(adminUserId, id);
  }

  @GetMapping("shop/orders")
  public Object getAllOrders(@RequestHeader("X-User-Id") String adminUserId) {
    return adminService.getAllOrders(adminUserId);
  }

  @GetMapping("shop/orders/{id}")
  public Object getOrderById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getOrderById(adminUserId, id);
  }

  @PatchMapping("shop/orders/{id}/status")
  public Object updateOrderStatus(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id,
      @RequestBody UpdateOrderStatusRequest body
  ) {
    return adminService.updateOrderStatus(adminUserId, id, body.status());
  }

  @GetMapping("memorial-flags")
  public Object getOpenMemorialFlags(@RequestHeader("X-User-Id") String adminUserId) {
    return adminService.getOpenMemorialFlags(adminUserId);
  }

  @GetMapping("dashboard/summary")
  public AdminDashboardSummary getDashboardSummary(
      @RequestHeader("X-User-Id") String adminUserId
  ) {
    return adminService.getDashboardSummary(adminUserId);
  }

  @GetMapping("memory/{id}")
  public Object getMemoryById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getMemoryById(adminUserId, id);
  }

  @GetMapping("condolence/{id}")
  public Object getCondolenceById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getCondolenceById(adminUserId, id);
  }

  @GetMapping("donation/{id}")
  public Object getDonationById(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("id") String id
  ) {
    return adminService.getDonationById(adminUserId, id);
  }

  @PatchMapping("price/decoration/{decoration}")
  public Object updateDecorationPrice(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("decoration") MemorialDecoration decoration,
      @RequestBody UpdatePriceRequest body
  ) {
    return adminService.updateDecorationPrice(adminUserId, decoration, body.priceInCents());
  }

  @PatchMapping("price/tribute/{tribute}")
  public Object updateTributePrice(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("tribute") MemorialTribute tribute,
      @RequestBody UpdatePriceRequest body
  ) {
    return adminService.updateTributePrice(adminUserId, tribute, body.priceInCents());
  }

  @PatchMapping("price/wreath/{wreath}")
  public Object updateWreathPrice(
      @RequestHeader("X-User-Id") String adminUserId,
      @PathVariable("wreath") MemorialDonationWreath wreath,
      @RequestBody UpdatePriceRequest body
  ) {
    return adminService.updateWreathPrice(adminUserId, wreath, body.priceInCents());
  }
}
