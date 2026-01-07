package com.simmortal.shop;

import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialTribute;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ShopService {
  private static final Logger logger = LoggerFactory.getLogger(ShopService.class);
  private final ShopRepository shopRepository;

  public ShopService(ShopRepository shopRepository) {
    this.shopRepository = shopRepository;
  }

  public Object getShopContent(String locale) {
    return shopRepository.getShopContent(locale);
  }

  public Object getShopItemBySlug(String slug, String locale, String userId) {
    return shopRepository.getShopItemBySlug(slug, locale);
  }

  public void handleSubscriptionCreated(Object event) {
    logger.info("Handled subscription created event");
  }

  public void handleSubscriptionUpdated(Object event) {
    logger.info("Handled subscription updated event");
  }

  public void handlePaymentIntentSucceeded(Object event) {
    logger.info("Handled payment intent succeeded event");
  }

  public void handleInvoicePaymentSucceeded(Object event) {
    logger.info("Handled invoice payment succeeded event");
  }

  public CreateOrderResponse createOrder(String userId, CreateOrderRequest request) {
    return shopRepository.createOrder(userId, request);
  }

  public Object getOrderById(String userId, String orderId, OrderStatus status) {
    Map<String, Object> order = shopRepository.getOrderById(orderId);
    if (order == null) {
      return Map.of("error", "Order not found");
    }
    if (status != null && !status.getValue().equals(order.get("status"))) {
      return Map.of("error", "Order status mismatch");
    }
    if (!userId.equals(order.get("userId"))) {
      return Map.of("error", "Order not accessible");
    }
    return order;
  }

  public void joinWaitlist(String userId, String itemId) {
    shopRepository.addToWaitlist(userId, itemId);
  }

  public Map<MemorialDecoration, String> getAllDecorationPrices() {
    return shopRepository.getAllDecorationPrices();
  }

  public Map<MemorialTribute, String> getAllTributePrices() {
    return shopRepository.getAllTributePrices();
  }

  public Map<MemorialDonationWreath, String> getAllWreathPrices() {
    return shopRepository.getAllWreathPrices();
  }

  public Object getAllOrders() {
    return shopRepository.getAllOrders();
  }

  public Object getOrderByIdAdmin(String id) {
    return shopRepository.getOrderById(id);
  }

  public Object updateOrderStatus(String id, OrderStatus status, String adminUserId) {
    shopRepository.updateOrderStatus(id, status);
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("id", id);
    response.put("status", status == null ? null : status.getValue());
    response.put("updatedBy", adminUserId);
    return response;
  }

  public Object updateDecorationPrice(MemorialDecoration decoration, Integer priceInCents) {
    shopRepository.updateDecorationPrice(decoration, priceInCents);
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("decoration", decoration == null ? null : decoration.getValue());
    response.put("price", priceInCents == null ? null : String.valueOf(priceInCents));
    return response;
  }

  public Object updateTributePrice(MemorialTribute tribute, Integer priceInCents) {
    shopRepository.updateTributePrice(tribute, priceInCents);
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("tribute", tribute == null ? null : tribute.getValue());
    response.put("price", priceInCents == null ? null : String.valueOf(priceInCents));
    return response;
  }

  public Object updateWreathPrice(MemorialDonationWreath wreath, Integer priceInCents) {
    shopRepository.updateWreathPrice(wreath, priceInCents);
    Map<String, Object> response = new java.util.HashMap<>();
    response.put("wreath", wreath == null ? null : wreath.getValue());
    response.put("price", priceInCents == null ? null : String.valueOf(priceInCents));
    return response;
  }

  public Object findCustomerByUserId(String userId) {
    return shopRepository.getCustomerByUserId(userId);
  }
}
