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

    @RabbitListener(queues = "chat-channel")
    public void handleChat(Map<String, Object> message) {
        log.info("[CHAT] received broadcast: {}", message);
        notifier.notifyConsumption("fanout", "chat-channel", "ChatHandler", message);
    }

    @RabbitListener(queues = "leaderboard")
    public void handleLeaderboard(Map<String, Object> message) {
        log.info("[LEADERBOARD] received broadcast: {}", message);
        notifier.notifyConsumption("fanout", "leaderboard", "LeaderboardHandler", message);
    }

    @RabbitListener(queues = "achievement-tracker")
    public void handleAchievement(Map<String, Object> message) {
        log.info("[ACHIEVEMENT] received broadcast: {}", message);
        notifier.notifyConsumption("fanout", "achievement-tracker", "AchievementHandler", message);
    }
}
