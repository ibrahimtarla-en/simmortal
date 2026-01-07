package com.simmortal.contact;

public record ContactFormRequest(
    String firstName,
    String lastName,
    String email,
    String phoneNumber,
    String message
) {}
