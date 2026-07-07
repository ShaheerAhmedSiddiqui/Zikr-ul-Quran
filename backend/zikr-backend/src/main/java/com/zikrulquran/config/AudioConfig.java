package com.zikrulquran.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AudioConfig implements WebMvcConfigurer {

    @Value("${app.audio.base-path:../audio/}")
    private String audioBasePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve audio files from the Audio directory
        registry.addResourceHandler("/audio/**")
                .addResourceLocations("file:" + audioBasePath)
                .setCachePeriod(3600); // Cache audio files for 1 hour

        // Optional: Serve frontend static files if needed
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}