package com.simmortal.memorial;

public record CreateMemorialFlagRequest(
    MemorialFlagType type,
    String referenceId,
    String reason
) {}
