package com.simmortal.admin;

import com.simmortal.shop.OrderStatus;

public record UpdateOrderStatusRequest(OrderStatus status) {}
