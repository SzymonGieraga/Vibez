package com.vibez;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class VibezbackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(VibezbackendApplication.class, args);
    }

}
