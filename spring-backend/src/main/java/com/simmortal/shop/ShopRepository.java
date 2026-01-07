package com.simmortal.shop;

import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialTribute;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class ShopRepository {
  private static final String DEFAULT_PRICE = "0";
  private static final String LOCALE_DEFAULT = "en";
  private static final String ORDER_STATUS_KEY = "status";
  private static final String ORDER_ID_KEY = "id";
  private static final String ORDER_USER_KEY = "userId";
  private static final String ORDER_CREATED_KEY = "createdAt";
  private static final String ORDER_ITEMS_KEY = "items";
  private static final String ORDER_PAYMENT_LINK_KEY = "checkoutUrl";
  private static final String SHOP_ITEM_SLUG_KEY = "slug";
  private static final String SHOP_ITEM_LOCALE_KEY = "locale";

  private final Map<String, Map<String, Object>> orders = new ConcurrentHashMap<>();
  private final Map<String, Map<String, Object>> items = new ConcurrentHashMap<>();
  private final Map<String, String> waitlist = new ConcurrentHashMap<>();
  private final Map<String, String> customers = new ConcurrentHashMap<>();
  private final Map<MemorialDecoration, String> decorationPrices;
  private final Map<MemorialTribute, String> tributePrices;
  private final Map<MemorialDonationWreath, String> wreathPrices;

  public ShopRepository() {
    this.decorationPrices = initializePrices(MemorialDecoration.values(), "DECORATION");
    this.tributePrices = initializePrices(MemorialTribute.values(), "TRIBUTE");
    this.wreathPrices = initializePrices(MemorialDonationWreath.values(), "WREATH");
    initializeDefaultItems();
  }

  public Map<String, Object> getShopContent(String locale) {
    return Map.of(
        "locale", normalizeLocale(locale),
        "items", new ArrayList<>(items.values()));
  }

  public Map<String, Object> getShopItemBySlug(String slug, String locale) {
    Map<String, Object> item = items.get(slug);
    if (item == null) {
      return Map.of(
          SHOP_ITEM_SLUG_KEY, slug,
          SHOP_ITEM_LOCALE_KEY, normalizeLocale(locale),
          "available", false);
    }
    return item;
  }

  public CreateOrderResponse createOrder(String userId, CreateOrderRequest request) {
    String orderId = UUID.randomUUID().toString();
    String checkoutUrl = "https://checkout.simmortals.com/order/" + orderId;
    Map<String, Object> order = new ConcurrentHashMap<>();
    order.put(ORDER_ID_KEY, orderId);
    order.put(ORDER_USER_KEY, userId);
    order.put(ORDER_STATUS_KEY, OrderStatus.CREATED.getValue());
    order.put(ORDER_CREATED_KEY, System.currentTimeMillis());
    order.put(ORDER_ITEMS_KEY, List.of(request.itemId()));
    order.put(ORDER_PAYMENT_LINK_KEY, checkoutUrl);
    orders.put(orderId, order);
    customers.putIfAbsent(userId, "cus_" + UUID.randomUUID());
    return new CreateOrderResponse(checkoutUrl);
  }

  public Map<String, Object> getOrderById(String orderId) {
    return orders.get(orderId);
  }

  public List<Map<String, Object>> getAllOrders() {
    return new ArrayList<>(orders.values());
  }

  public void updateOrderStatus(String orderId, OrderStatus status) {
    Map<String, Object> order = orders.get(orderId);
    if (order != null) {
      order.put(ORDER_STATUS_KEY, status.getValue());
    }
  }

  public void addToWaitlist(String userId, String itemId) {
    waitlist.put(userId, itemId);
  }

  public Map<MemorialDecoration, String> getAllDecorationPrices() {
    return Map.copyOf(decorationPrices);
  }

  public Map<MemorialTribute, String> getAllTributePrices() {
    return Map.copyOf(tributePrices);
  }

  public Map<MemorialDonationWreath, String> getAllWreathPrices() {
    return Map.copyOf(wreathPrices);
  }

  public void updateDecorationPrice(MemorialDecoration decoration, Integer priceInCents) {
    decorationPrices.put(decoration, String.valueOf(priceInCents));
  }

  public void updateTributePrice(MemorialTribute tribute, Integer priceInCents) {
    tributePrices.put(tribute, String.valueOf(priceInCents));
  }

  public void updateWreathPrice(MemorialDonationWreath wreath, Integer priceInCents) {
    wreathPrices.put(wreath, String.valueOf(priceInCents));
  }

  public Map<String, String> getCustomerByUserId(String userId) {
    String customerId = customers.get(userId);
    return Map.of(
        "userId", userId,
        "customerId", customerId);
  }

  private <T extends Enum<T>> Map<T, String> initializePrices(T[] values, String prefix) {
    Map<T, String> prices = new EnumMap<>(values[0].getDeclaringClass());
    for (T value : values) {
      prices.put(value, getEnvPrice(prefix, value.name()));
    }
    return prices;
  }

  private String getEnvPrice(String prefix, String key) {
    String envKey = "SHOP_PRICE_" + prefix + "_" + key;
    return Optional.ofNullable(System.getenv(envKey)).orElse(DEFAULT_PRICE);
  }

  private String normalizeLocale(String locale) {
    return locale == null || locale.isBlank() ? LOCALE_DEFAULT : locale;
  }

  private void initializeDefaultItems() {
    for (MemorialDecoration decoration : MemorialDecoration.values()) {
      String slug = decoration.getValue();
      items.put(slug, Map.of("slug", slug, "type", "decoration", "price", decorationPrices.get(decoration)));
    }
    for (MemorialTribute tribute : MemorialTribute.values()) {
      String slug = tribute.getValue();
      items.put(slug, Map.of("slug", slug, "type", "tribute", "price", tributePrices.get(tribute)));
    }
    for (MemorialDonationWreath wreath : MemorialDonationWreath.values()) {
      String slug = wreath.getValue();
      items.put(slug, Map.of("slug", slug, "type", "wreath", "price", wreathPrices.get(wreath)));
    }
  }
}
