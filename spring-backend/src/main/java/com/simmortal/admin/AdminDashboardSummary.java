package com.simmortal.admin;

public record AdminDashboardSummary(
    int users,
    int memorials,
    int contactForms,
    int orders,
    int reports
) {}
