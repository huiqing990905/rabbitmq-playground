package com.learn.rabbitmq.consumer;

import com.learn.rabbitmq.websocket.MessageNotifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DirectConsumer {

    private final MessageNotifier notifier;

    @RabbitListener(queues = "attack-queue")
    public void handleAttack(String message) {
        log.info("[ATTACK] received: {}", message);
        notifier.notifyConsumption("direct", "attack-queue", "AttackHandler", message);
    }

    @RabbitListener(queues = "heal-queue")
    public void handleHeal(String message) {
        log.info("[HEAL] received: {}", message);
        notifier.notifyConsumption("direct", "heal-queue", "HealHandler", message);
    }
}
