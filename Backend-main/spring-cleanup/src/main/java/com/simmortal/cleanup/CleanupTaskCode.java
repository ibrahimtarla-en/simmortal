package com.simmortal.cleanup;

public enum CleanupTaskCode {
    CLEAN_RESERVED_URLS(1001L),
    CLEAN_MEMORIES(1002L),
    CLEAN_CONDOLENCES(1003L);

    private final long lockId;

    CleanupTaskCode(long lockId) {
        this.lockId = lockId;
    }

    public long lockId() {
        return lockId;
    }
}
