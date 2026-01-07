package com.simmortal.admin;

import com.simmortal.user.UserAccountStatus;

public record UpdateUserStatusRequest(UserAccountStatus status) {}
