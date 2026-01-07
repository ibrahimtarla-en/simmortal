package com.simmortal.user;

public record UpdateUserProfileRequest(
    String firstName,
    String lastName,
    String dateOfBirth,
    String location,
    Boolean deleteAsset
) {}
