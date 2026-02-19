package com.learn.rabbitmq.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ====== Direct Exchange — exact match ======

    @Bean
    public DirectExchange directExchange() {
        return new DirectExchange("direct-ex");
    }

    @Bean
    public Queue attackQueue() {
        return new Queue("attack-queue");
    }

    @Bean
    public Queue healQueue() {
        return new Queue("heal-queue");
    }

    @Bean
    public Binding attackBinding() {
        return BindingBuilder.bind(attackQueue()).to(directExchange()).with("action.attack");
    }

    @Bean
    public Binding healBinding() {
        return BindingBuilder.bind(healQueue()).to(directExchange()).with("action.heal");
    }

    // ====== Topic Exchange — wildcard match ======

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange("topic-ex");
    }

    @Bean
    public Queue criticalLogQueue() {
        return new Queue("critical-log");
    }

    @Bean
    public Queue playerLogQueue() {
        return new Queue("player-log");
    }

    @Bean
    public Queue worldLogQueue() {
        return new Queue("world-log");
    }

    @Bean
    public Binding criticalBinding() {
        return BindingBuilder.bind(criticalLogQueue()).to(topicExchange()).with("*.critical");
    }

    @Bean
    public Binding playerBinding() {
        return BindingBuilder.bind(playerLogQueue()).to(topicExchange()).with("player.*");
    }

    @Bean
    public Binding worldBinding() {
        return BindingBuilder.bind(worldLogQueue()).to(topicExchange()).with("#");
    }

    // ====== Fanout Exchange — broadcast ======

    @Bean
    public FanoutExchange fanoutExchange() {
        return new FanoutExchange("fanout-ex");
    }

    @Bean
    public Queue chatQueue() {
        return new Queue("chat-channel");
    }

    @Bean
    public Queue leaderboardQueue() {
        return new Queue("leaderboard");
    }

    @Bean
    public Queue achievementQueue() {
        return new Queue("achievement-tracker");
    }

    @Bean
    public Binding chatBinding() {
        return BindingBuilder.bind(chatQueue()).to(fanoutExchange());
    }

    @Bean
    public Binding leaderboardBinding() {
        return BindingBuilder.bind(leaderboardQueue()).to(fanoutExchange());
    }

    @Bean
    public Binding achievementBinding() {
        return BindingBuilder.bind(achievementQueue()).to(fanoutExchange());
    }

    // ====== Default Exchange ======

    @Bean
    public Queue pingQueue() {
        return new Queue("ping-queue");
    }
}
