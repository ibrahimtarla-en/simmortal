package com.simmortal.shop;

import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialTribute;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("shop")
public class ShopController {
  private final ShopService shopService;

  public ShopController(ShopService shopService) {
    this.shopService = shopService;
  }

  @GetMapping
  public Object getShopContent(@RequestParam(value = "locale", required = false) String locale) {
    return shopService.getShopContent(locale);
  }

  @GetMapping("/{slug}")
  public Object getShopItemBySlug(
      @PathVariable String slug,
      @RequestParam(value = "locale", required = false) String locale,
      @RequestHeader(value = "X-User-Id", required = false) String userId
  ) {
    return shopService.getShopItemBySlug(slug, locale, userId);
  }

  @PostMapping("webhook")
  public void handleWebhookEvent(@RequestBody Map<String, Object> event) {
    Object typeValue = event.get("type");
    String type = typeValue == null ? "" : typeValue.toString();
    if ("customer.subscription.created".equals(type)) {
      shopService.handleSubscriptionCreated(event);
    }
    if ("customer.subscription.updated".equals(type) || "customer.subscription.deleted".equals(type)) {
      shopService.handleSubscriptionUpdated(event);
    } else if ("payment_intent.succeeded".equals(type)) {
      shopService.handlePaymentIntentSucceeded(event);
    }
    if ("invoice.payment_succeeded".equals(type)) {
      shopService.handleInvoicePaymentSucceeded(event);
    }
  }

  @PostMapping("order")
  public CreateOrderResponse createOrder(
      @RequestBody CreateOrderRequest request,
      @RequestHeader("X-User-Id") String userId
  ) {
    return shopService.createOrder(userId, request);
  }

  @GetMapping("order/{orderId}")
  public Object getOrderById(
      @PathVariable String orderId,
      @RequestParam("status") OrderStatus status,
      @RequestHeader("X-User-Id") String userId
  ) {
    return shopService.getOrderById(userId, orderId, status);
  }

  @PostMapping("waitlist/{itemId}")
  public void joinWaitlist(
      @PathVariable String itemId,
      @RequestHeader("X-User-Id") String userId
  ) {
    shopService.joinWaitlist(userId, itemId);
  }

  @GetMapping("price/decoration")
  public Map<MemorialDecoration, String> getDecorationPrices() {
    return shopService.getAllDecorationPrices();
  }

  @GetMapping("price/tribute")
  public Map<MemorialTribute, String> getTributePrices() {
    return shopService.getAllTributePrices();
  }

  @GetMapping("price/wreath")
  public Map<MemorialDonationWreath, String> getWreathPrices() {
    return shopService.getAllWreathPrices();
  }
}
