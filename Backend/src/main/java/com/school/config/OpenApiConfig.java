package com.school.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI schoolOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("School Management System API")
                        .version("1.0")
                        .description("Admin-only school management API"));
    }
}
