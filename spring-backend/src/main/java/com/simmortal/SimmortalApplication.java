package com.simmortal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SimmortalApplication {
  public static void main(String[] args) {
    SpringApplication.run(SimmortalApplication.class, args);
  }
}
