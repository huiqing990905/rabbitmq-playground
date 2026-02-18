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

    @RabbitListener(queues = "alipay-queue")
    public void handleAlipay(String message) {
        log.info("[Alipay] received: {}", message);
        notifier.notifyConsumption("direct", "alipay-queue", "AlipayConsumer", message);
    }

    @RabbitListener(queues = "wechat-queue")
    public void handleWechat(String message) {
        log.info("[Wechat] received: {}", message);
        notifier.notifyConsumption("direct", "wechat-queue", "WechatConsumer", message);
    }
}
