package com.learn.rabbitmq.consumer;

import com.learn.rabbitmq.websocket.MessageNotifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class TopicConsumer {

    private final MessageNotifier notifier;

    @RabbitListener(queues = "critical-log")
    public void handleCritical(Map<String, Object> message) {
        log.info("[CRITICAL] received: {}", message);
        notifier.notifyConsumption("topic", "critical-log", "CriticalHandler", message);
    }

    @RabbitListener(queues = "player-log")
    public void handlePlayerLog(Map<String, Object> message) {
        log.info("[PLAYER] received: {}", message);
        notifier.notifyConsumption("topic", "player-log", "PlayerHandler", message);
    }

    @RabbitListener(queues = "world-log")
    public void handleWorldLog(Map<String, Object> message) {
        log.info("[WORLD] received: {}", message);
        notifier.notifyConsumption("topic", "world-log", "WorldHandler", message);
    }
}
