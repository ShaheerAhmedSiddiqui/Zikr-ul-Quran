package com.zikrulquran.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for API
                .csrf(csrf -> csrf.disable())

                // Configure CORS
                .cors(cors -> cors.configure(http))

                // Configure authorization - IMPORTANT: Use exact path matching
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints - exact matches
                        .requestMatchers("/api/status").permitAll()
                        .requestMatchers("/api/test").permitAll()
                        .requestMatchers("/api/endpoints").permitAll()
                        .requestMatchers("/api/users/register").permitAll()
                        .requestMatchers("/api/users/login").permitAll()
                        .requestMatchers("/api/users/check-username/**").permitAll()
                        .requestMatchers("/api/users/check-email/**").permitAll()
                        .requestMatchers("/api/surahs/**").permitAll()
                        .requestMatchers("/api/audio/**").permitAll()
                        .requestMatchers("/audio/**").permitAll()

                        // TEMPORARY: Allow ALL playlist endpoints without authentication
                        .requestMatchers("/api/playlists/**").permitAll()

                        // All other API endpoints
                        .requestMatchers("/api/**").authenticated()

                        // Allow all other requests
                        .anyRequest().permitAll()
                )

                // Disable form login and basic auth to prevent redirects
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // Stateless session management
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}