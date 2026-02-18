package com.learn.rabbitmq.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessageNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyConsumption(String exchangeType, String queue, String consumer, Object message) {
        Map<String, Object> event = Map.of(
                "exchangeType", exchangeType,
                "queue", queue,
                "consumer", consumer,
                "message", message.toString(),
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/messages", event);
    }
}
