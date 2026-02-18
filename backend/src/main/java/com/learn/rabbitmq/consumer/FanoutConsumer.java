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
public class FanoutConsumer {

    private final MessageNotifier notifier;

    @RabbitListener(queues = "notify-sms-queue")
    public void handleSms(Map<String, Object> message) {
        log.info("[SMS] received broadcast: {}", message);
        notifier.notifyConsumption("fanout", "notify-sms-queue", "SmsConsumer", message);
    }

    @RabbitListener(queues = "notify-email-queue")
    public void handleEmail(Map<String, Object> message) {
        log.info("[Email] received broadcast: {}", message);
        notifier.notifyConsumption("fanout", "notify-email-queue", "EmailConsumer", message);
    }

    @RabbitListener(queues = "notify-push-queue")
    public void handlePush(Map<String, Object> message) {
        log.info("[Push] received broadcast: {}", message);
        notifier.notifyConsumption("fanout", "notify-push-queue", "PushConsumer", message);
    }
}
