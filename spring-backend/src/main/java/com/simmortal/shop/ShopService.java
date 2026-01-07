package com.simmortal.shop;

import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialTribute;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ShopService {
  private final ShopRepository shopRepository;

  public ShopService(ShopRepository shopRepository) {
    this.shopRepository = shopRepository;
  }

  public Object getShopContent(String locale) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getShopItemBySlug(String slug, String locale, String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void handleSubscriptionCreated(Object event) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void handleSubscriptionUpdated(Object event) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void handlePaymentIntentSucceeded(Object event) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void handleInvoicePaymentSucceeded(Object event) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public CreateOrderResponse createOrder(String userId, CreateOrderRequest request) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getOrderById(String userId, String orderId, OrderStatus status) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void joinWaitlist(String userId, String itemId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Map<MemorialDecoration, String> getAllDecorationPrices() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Map<MemorialTribute, String> getAllTributePrices() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Map<MemorialDonationWreath, String> getAllWreathPrices() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getAllOrders() {
    return shopRepository.getAllOrders();
  }

  public Object getOrderByIdAdmin(String id) {
    return shopRepository.getOrderById(id);
  }

  public Object updateOrderStatus(String id, OrderStatus status, String adminUserId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object updateDecorationPrice(MemorialDecoration decoration, Integer priceInCents) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object updateTributePrice(MemorialTribute tribute, Integer priceInCents) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object updateWreathPrice(MemorialDonationWreath wreath, Integer priceInCents) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object findCustomerByUserId(String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
