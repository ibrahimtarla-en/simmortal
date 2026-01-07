package com.simmortal.cleanup;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.ZoneId;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupScheduler {
    private static final Logger logger = LoggerFactory.getLogger(CleanupScheduler.class);
    private final JdbcTemplate jdbcTemplate;
    private final CleanupJobGuard jobGuard;
    private final StorageCleanupService storageCleanupService;
    private final ZoneId zoneId;

    public CleanupScheduler(
        JdbcTemplate jdbcTemplate,
        CleanupJobGuard jobGuard,
        StorageCleanupService storageCleanupService,
        @Value("${cleanup.scheduler.timezone:UTC}") String timeZone
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.jobGuard = jobGuard;
        this.storageCleanupService = storageCleanupService;
        this.zoneId = ZoneId.of(timeZone);
    }

    @Scheduled(cron = "${cleanup.scheduler.cron.reserved-urls:0 0 * * * *}", zone = "${cleanup.scheduler.timezone:UTC}")
    public void cleanupReservedUrls() {
        executeJob(
            CleanupTaskCode.CLEAN_RESERVED_URLS,
            "cleanup-reserved-urls",
            CleanupJobGuard.Frequency.HOURLY,
            () -> {
                logger.info("Starting URL reservation cleanup");
                int updated = jdbcTemplate.update(
                    "UPDATE memorial SET premium_slug = NULL " +
                        "WHERE status <> 'published' " +
                        "AND premium_slug IS NOT NULL " +
                        "AND updated_at < now() - interval '24 hours'"
                );
                logger.info("Released {} expired premium slugs from unpublished memorials", updated);
            }
        );
    }

    @Scheduled(cron = "${cleanup.scheduler.cron.memories:0 0 2 * * *}", zone = "${cleanup.scheduler.timezone:UTC}")
    public void cleanupMemories() {
        executeJob(
            CleanupTaskCode.CLEAN_MEMORIES,
            "cleanup-memories",
            CleanupJobGuard.Frequency.DAILY,
            () -> {
                logger.info("Starting memory cleanup");
                List<MemoryRecord> memories = jdbcTemplate.query(
                    "SELECT id, asset_path FROM memory " +
                        "WHERE status <> 'published' " +
                        "AND updated_at < now() - interval '15 days'",
                    new MemoryRowMapper()
                );
                int assetDeletions = 0;
                for (MemoryRecord record : memories) {
                    if (record.assetPath() != null) {
                        storageCleanupService.delete(record.assetPath());
                        assetDeletions++;
                    }
                }
                int deleted = jdbcTemplate.update(
                    "DELETE FROM memory WHERE status <> 'published' AND updated_at < now() - interval '15 days'"
                );
                logger.info(
                    "Deleted {} old unpublished memories and removed {} associated assets",
                    deleted,
                    assetDeletions
                );
            }
        );
    }

    @Scheduled(cron = "${cleanup.scheduler.cron.condolences:0 0 3 * * *}", zone = "${cleanup.scheduler.timezone:UTC}")
    public void cleanupCondolences() {
        executeJob(
            CleanupTaskCode.CLEAN_CONDOLENCES,
            "cleanup-condolences",
            CleanupJobGuard.Frequency.DAILY,
            () -> {
                logger.info("Starting condolence cleanup");
                int deleted = jdbcTemplate.update(
                    "DELETE FROM condolence WHERE status <> 'published' AND updated_at < now() - interval '15 days'"
                );
                logger.info("Deleted {} old unpublished condolences", deleted);
            }
        );
    }

    private void executeJob(
        CleanupTaskCode taskCode,
        String jobName,
        CleanupJobGuard.Frequency frequency,
        Runnable action
    ) {
        boolean lockAcquired = jobGuard.acquireLock(taskCode);
        if (!lockAcquired) {
            logger.info("{} already running on another instance", jobName);
            return;
        }
        try {
            if (!jobGuard.shouldRunInProduction(jobName, zoneId, frequency)) {
                return;
            }
            action.run();
        } catch (Exception ex) {
            logger.error("Error during {}", jobName, ex);
        } finally {
            jobGuard.releaseLock(taskCode);
        }
    }

    private record MemoryRecord(String id, String assetPath) {}

    private static class MemoryRowMapper implements RowMapper<MemoryRecord> {
        @Override
        public MemoryRecord mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new MemoryRecord(rs.getString("id"), rs.getString("asset_path"));
        }
    }
}
