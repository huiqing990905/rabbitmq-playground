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

    @RabbitListener(queues = "error-queue")
    public void handleError(Map<String, Object> message) {
        log.info("[ERROR log] received: source={}, message={}",
                message.get("source"), message.get("message"));
        notifier.notifyConsumption("topic", "error-queue", "ErrorConsumer", message);
    }

    @RabbitListener(queues = "order-log-queue")
    public void handleOrderLog(Map<String, Object> message) {
        log.info("[ORDER log] received: level={}, message={}",
                message.get("level"), message.get("message"));
        notifier.notifyConsumption("topic", "order-log-queue", "OrderLogConsumer", message);
    }

    @RabbitListener(queues = "all-log-queue")
    public void handleAllLog(Map<String, Object> message) {
        log.info("[ALL log] received: source={}, level={}, message={}",
                message.get("source"), message.get("level"), message.get("message"));
        notifier.notifyConsumption("topic", "all-log-queue", "AllLogConsumer", message);
    }
}
