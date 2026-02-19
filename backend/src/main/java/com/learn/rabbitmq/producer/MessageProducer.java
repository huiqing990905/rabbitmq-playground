package com.learn.rabbitmq.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class MessageProducer {

    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/send")
    public Map<String, Object> send(@RequestBody SendRequest request) {
        String exchange = request.exchange();
        String routingKey = request.routingKey();
        String message = request.message();
        String timestamp = LocalDateTime.now().toString();

        return switch (exchange) {
            case "default" -> {
                rabbitTemplate.convertAndSend("", "ping-queue", message);
                log.info(">>> [PING] sent to ping-queue, msg={}", message);
                yield Map.of("success", true, "exchange", "default",
                        "routingKey", "ping-queue", "timestamp", timestamp);
            }
            case "direct" -> {
                rabbitTemplate.convertAndSend("direct-ex", routingKey, message);
                log.info(">>> [DIRECT] sent to direct-ex, routingKey={}", routingKey);
                yield Map.of("success", true, "exchange", "direct",
                        "routingKey", routingKey, "timestamp", timestamp);
            }
            case "topic" -> {
                Map<String, Object> payload = Map.of(
                        "source", routingKey.contains(".") ? routingKey.split("\\.")[0] : routingKey,
                        "level", routingKey.contains(".") ? routingKey.split("\\.")[1] : "unknown",
                        "message", message,
                        "time", timestamp
                );
                rabbitTemplate.convertAndSend("topic-ex", routingKey, payload);
                log.info(">>> [TOPIC] sent to topic-ex, routingKey={}", routingKey);
                yield Map.of("success", true, "exchange", "topic",
                        "routingKey", routingKey, "timestamp", timestamp);
            }
            case "fanout" -> {
                Map<String, Object> payload = Map.of(
                        "event", "broadcast",
                        "message", message,
                        "time", timestamp
                );
                rabbitTemplate.convertAndSend("fanout-ex", "", payload);
                log.info(">>> [FANOUT] broadcast to fanout-ex");
                yield Map.of("success", true, "exchange", "fanout",
                        "routingKey", "(ignored)", "timestamp", timestamp);
            }
            default -> Map.of("success", false, "error", "Unknown exchange type: " + exchange);
        };
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "timestamp", LocalDateTime.now().toString());
    }

    public record SendRequest(String exchange, String routingKey, String message) {}
}
