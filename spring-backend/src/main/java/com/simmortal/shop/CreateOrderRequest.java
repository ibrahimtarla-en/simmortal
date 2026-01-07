package com.simmortal.shop;

public record CreateOrderRequest(
    String memorialId,
    String firstName,
    String lastName,
    String country,
    String city,
    String address,
    String postCode,
    String state,
    String email,
    String phoneNumber,
    String itemId,
    Integer quantity,
    String message
) {}
