package com.learn.rabbitmq.consumer;

import com.learn.rabbitmq.websocket.MessageNotifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SimpleConsumer {

    private final MessageNotifier notifier;

    @RabbitListener(queues = "ping-queue")
    public void handlePing(String message) {
        log.info("[PING] received: {}", message);
        notifier.notifyConsumption("default", "ping-queue", "PingHandler", message);
    }
}
