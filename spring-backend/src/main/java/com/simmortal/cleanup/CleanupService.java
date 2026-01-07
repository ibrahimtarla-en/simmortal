package com.simmortal.cleanup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CleanupService {
  private static final Logger logger = LoggerFactory.getLogger(CleanupService.class);

  @Scheduled(cron = "${cleanup.scheduler.cron.reserved-urls:0 0 * * * *}", zone = "${cleanup.scheduler.timezone:UTC}")
  public void cleanupReservedUrls() {
    logger.info("Starting URL reservation cleanup");
    logger.warn("CleanupReservedUrls is not yet connected to a persistence layer");
  }

  @Scheduled(cron = "${cleanup.scheduler.cron.memories:0 0 2 * * *}", zone = "${cleanup.scheduler.timezone:UTC}")
  public void cleanupMemories() {
    logger.info("Starting memory cleanup");
    logger.warn("CleanupMemories is not yet connected to a persistence layer");
  }

  @Scheduled(cron = "${cleanup.scheduler.cron.condolences:0 0 3 * * *}", zone = "${cleanup.scheduler.timezone:UTC}")
  public void cleanupCondolences() {
    logger.info("Starting condolence cleanup");
    logger.warn("CleanupCondolences is not yet connected to a persistence layer");
  }
}
