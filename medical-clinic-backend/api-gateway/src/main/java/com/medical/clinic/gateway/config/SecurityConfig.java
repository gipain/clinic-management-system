package com.medical.clinic.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .cors(Customizer.withDefaults()) // Це підтягне налаштування з вашого CorsConfig.java
            .csrf(csrf -> csrf.disable())    // Вимикаємо CSRF для REST API
            .authorizeExchange(exchange -> exchange
                .anyExchange().permitAll()   // Дозволяємо всі запити (якщо авторизація на сервісах)
            );
        
        return http.build();
    }
}