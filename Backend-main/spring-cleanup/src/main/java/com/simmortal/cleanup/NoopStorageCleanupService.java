package com.simmortal.cleanup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingBean(StorageCleanupService.class)
public class NoopStorageCleanupService implements StorageCleanupService {
    private static final Logger logger = LoggerFactory.getLogger(NoopStorageCleanupService.class);

    @Override
    public void delete(String assetPath) {
        logger.debug("No storage cleanup configured for asset path: {}", assetPath);
    }
}
