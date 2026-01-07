package com.simmortal.cleanup;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CleanupJobGuard {
    private static final Logger logger = LoggerFactory.getLogger(CleanupJobGuard.class);
    private final JdbcTemplate jdbcTemplate;
    private final Environment environment;

    public CleanupJobGuard(JdbcTemplate jdbcTemplate, Environment environment) {
        this.jdbcTemplate = jdbcTemplate;
        this.environment = environment;
        initializeIdempotencyTable();
    }

    public boolean acquireLock(CleanupTaskCode taskCode) {
        Boolean locked = jdbcTemplate.queryForObject(
            "SELECT pg_try_advisory_lock(?)",
            Boolean.class,
            taskCode.lockId()
        );
        return Boolean.TRUE.equals(locked);
    }

    public void releaseLock(CleanupTaskCode taskCode) {
        jdbcTemplate.queryForObject("SELECT pg_advisory_unlock(?)", Boolean.class, taskCode.lockId());
    }

    public boolean shouldRunInProduction(String jobName, ZoneId zoneId, Frequency frequency) {
        if (!isProduction()) {
            return true;
        }
        String runKey = buildRunKey(zoneId, frequency);
        int inserted = jdbcTemplate.update(
            "INSERT INTO cleanup_job_runs (job_name, run_key, run_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
            jobName,
            runKey,
            Instant.now()
        );
        if (inserted == 0) {
            logger.info("Skipping job {} because it already ran for key {}", jobName, runKey);
            return false;
        }
        return true;
    }

    public boolean isProduction() {
        String environmentValue = environment.getProperty("app.environment");
        if (environmentValue != null && environmentValue.equalsIgnoreCase("prod")) {
            return true;
        }
        for (String profile : environment.getActiveProfiles()) {
            if (profile.equalsIgnoreCase("prod") || profile.equalsIgnoreCase("production")) {
                return true;
            }
        }
        return false;
    }

    private void initializeIdempotencyTable() {
        jdbcTemplate.execute(
            "CREATE TABLE IF NOT EXISTS cleanup_job_runs (" +
                "job_name text NOT NULL," +
                "run_key text NOT NULL," +
                "run_at timestamptz NOT NULL DEFAULT now()," +
                "PRIMARY KEY (job_name, run_key)" +
            ")"
        );
    }

    public enum Frequency {
        HOURLY,
        DAILY
    }

    private String buildRunKey(ZoneId zoneId, Frequency frequency) {
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        if (frequency == Frequency.HOURLY) {
            return now.truncatedTo(ChronoUnit.HOURS).toString();
        }
        return now.toLocalDate().toString();
    }
}
