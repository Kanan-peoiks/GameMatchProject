package com.example.chatservice.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // websocket endpoint
                .setAllowedOriginPatterns("*")
                .withSockJS(); // fallback SockJS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        // mesajlar burada yayımlanır
        registry.setApplicationDestinationPrefixes("/app");
        // client mesajları buraya göndərir
    }
}
