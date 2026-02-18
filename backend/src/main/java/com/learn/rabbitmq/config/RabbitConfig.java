package com.learn.rabbitmq.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ========================================================
 *  RabbitMQ 核心概念配置
 * ========================================================
 *
 *  RabbitMQ 的消息流转：
 *
 *     Producer → Exchange → (Binding + Routing Key) → Queue → Consumer
 *
 *  把它想象成邮局：
 *     - Producer  = 寄信人
 *     - Exchange  = 邮局分拣中心（决定信往哪送）
 *     - Binding   = 分拣规则（什么条件送到哪个信箱）
 *     - RoutingKey = 信封上的地址
 *     - Queue     = 信箱（消息在这里排队等被取走）
 *     - Consumer  = 收信人
 *
 *  Exchange 有 4 种类型，下面逐一演示：
 *
 *  1. Direct Exchange  - 精确匹配 routing key
 *  2. Topic Exchange   - 模式匹配 routing key (支持 * 和 #)
 *  3. Fanout Exchange  - 广播，忽略 routing key
 *  4. Default Exchange - 无名 exchange，routing key = queue name
 */
@Configuration
public class RabbitConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ================================================================
    //  Lesson 1: Direct Exchange — 精确匹配
    // ================================================================
    //
    //  场景：订单系统 → 根据支付方式，精确路由到不同的处理队列
    //
    //                         ┌─ routing_key="pay.alipay" ──→ [alipay-queue] → 支付宝处理
    //  Producer → [direct-ex] ┤
    //                         └─ routing_key="pay.wechat" ──→ [wechat-queue] → 微信处理
    //
    //  如果 routing_key="pay.creditcard"，没有匹配的 binding → 消息丢弃

    @Bean
    public DirectExchange directExchange() {
        return new DirectExchange("direct-ex");
    }

    @Bean
    public Queue alipayQueue() {
        return new Queue("alipay-queue");
    }

    @Bean
    public Queue wechatQueue() {
        return new Queue("wechat-queue");
    }

    @Bean
    public Binding alipayBinding() {
        return BindingBuilder.bind(alipayQueue()).to(directExchange()).with("pay.alipay");
    }

    @Bean
    public Binding wechatBinding() {
        return BindingBuilder.bind(wechatQueue()).to(directExchange()).with("pay.wechat");
    }

    // ================================================================
    //  Lesson 2: Topic Exchange — 模式匹配
    // ================================================================
    //
    //  场景：日志系统 → 根据 "来源.级别" 灵活路由
    //
    //  Routing Key 格式: {source}.{level}
    //  例如: "order.error", "payment.info", "user.warning"
    //
    //  通配符:
    //    *  = 匹配一个词  (order.* 匹配 order.error, order.info)
    //    #  = 匹配零或多个词 (order.# 匹配 order, order.error, order.a.b.c)
    //
    //                        ┌─ "*.error"   ──→ [error-queue]     → 所有 error 日志
    //  Producer → [topic-ex] ┤
    //                        ├─ "order.*"   ──→ [order-log-queue] → order 的所有日志
    //                        │
    //                        └─ "#"         ──→ [all-log-queue]   → 所有日志 (兜底)

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange("topic-ex");
    }

    @Bean
    public Queue errorQueue() {
        return new Queue("error-queue");
    }

    @Bean
    public Queue orderLogQueue() {
        return new Queue("order-log-queue");
    }

    @Bean
    public Queue allLogQueue() {
        return new Queue("all-log-queue");
    }

    @Bean
    public Binding errorBinding() {
        return BindingBuilder.bind(errorQueue()).to(topicExchange()).with("*.error");
    }

    @Bean
    public Binding orderLogBinding() {
        return BindingBuilder.bind(orderLogQueue()).to(topicExchange()).with("order.*");
    }

    @Bean
    public Binding allLogBinding() {
        return BindingBuilder.bind(allLogQueue()).to(topicExchange()).with("#");
    }

    // ================================================================
    //  Lesson 3: Fanout Exchange — 广播
    // ================================================================
    //
    //  场景：支付成功后，同时通知多个系统
    //
    //                          ┌──→ [notify-sms-queue]   → 短信服务
    //  Producer → [fanout-ex]  ├──→ [notify-email-queue] → 邮件服务
    //                          └──→ [notify-push-queue]  → APP推送服务
    //
    //  Fanout 完全忽略 routing key，绑定的所有 queue 都会收到消息

    @Bean
    public FanoutExchange fanoutExchange() {
        return new FanoutExchange("fanout-ex");
    }

    @Bean
    public Queue smsQueue() {
        return new Queue("notify-sms-queue");
    }

    @Bean
    public Queue emailQueue() {
        return new Queue("notify-email-queue");
    }

    @Bean
    public Queue pushQueue() {
        return new Queue("notify-push-queue");
    }

    @Bean
    public Binding smsBinding() {
        return BindingBuilder.bind(smsQueue()).to(fanoutExchange());
    }

    @Bean
    public Binding emailBinding() {
        return BindingBuilder.bind(emailQueue()).to(fanoutExchange());
    }

    @Bean
    public Binding pushBinding() {
        return BindingBuilder.bind(pushQueue()).to(fanoutExchange());
    }

    // ================================================================
    //  Lesson 4: Default Exchange (不需要声明)
    // ================================================================
    //
    //  每个 RabbitMQ 都有一个隐藏的 Default Exchange (名字是空字符串 "")
    //  规则：routing key = queue name，直接投递到同名 queue
    //
    //  Producer 发消息到 "" exchange, routing_key="simple-queue"
    //     → 消息直接到 [simple-queue]
    //
    //  这就是最简单的 "点对点" 模式

    @Bean
    public Queue simpleQueue() {
        return new Queue("simple-queue");
    }
}
