const EXCHANGES = [
  { id: 'default', label: 'Default', desc: 'Point-to-point' },
  { id: 'direct', label: 'Direct', desc: 'Exact match' },
  { id: 'topic', label: 'Topic', desc: 'Wildcard match' },
  { id: 'fanout', label: 'Fanout', desc: 'Broadcast' },
];

const EXPLANATIONS = {
  default: {
    title: 'Default Exchange',
    how: 'Every RabbitMQ server has a built-in default exchange (empty string ""). It routes messages where routing key = queue name.',
    rule: 'routing key must exactly equal the queue name',
    example: 'Send to "" exchange with routing key "simple-queue" → message goes directly to simple-queue.',
  },
  direct: {
    title: 'Direct Exchange',
    how: 'Routes messages to queues whose binding key exactly matches the routing key. One routing key → one queue.',
    rule: 'routing key must exactly match the binding key',
    example: '"pay.alipay" → alipay-queue only. "pay.wechat" → wechat-queue only. "pay.creditcard" → no match, message dropped!',
  },
  topic: {
    title: 'Topic Exchange',
    how: 'Routes messages using wildcard patterns. Routing keys are dot-separated words (e.g. "order.error"). Bindings use * (one word) and # (zero or more words).',
    rule: '* = exactly one word, # = zero or more words',
    example: '"order.error" matches *.error, order.*, and # → 3 queues receive it. "payment.info" only matches # → 1 queue.',
  },
  fanout: {
    title: 'Fanout Exchange',
    how: 'Broadcasts messages to ALL bound queues. Routing key is completely ignored. Every bound queue gets a copy.',
    rule: 'routing key is ignored — all queues receive every message',
    example: 'One payment event → SMS service, Email service, and Push service all receive it simultaneously.',
  },
};

export default function ExchangeSelector({ selected, onSelect }) {
  const explanation = EXPLANATIONS[selected];

  return (
    <div className="exchange-selector">
      <h3>Exchange Type</h3>
      <div className="exchange-tabs">
        {EXCHANGES.map((ex) => (
          <button
            key={ex.id}
            className={`exchange-tab ${selected === ex.id ? 'active' : ''}`}
            onClick={() => onSelect(ex.id)}
          >
            <strong>{ex.label}</strong>
            <small>{ex.desc}</small>
          </button>
        ))}
      </div>

      <div className="explanation-box">
        <h4>{explanation.title}</h4>
        <p className="explanation-how">{explanation.how}</p>
        <div className="explanation-rule">
          <span className="rule-label">Rule:</span> {explanation.rule}
        </div>
        <div className="explanation-example">
          <span className="rule-label">Example:</span> {explanation.example}
        </div>
      </div>
    </div>
  );
}
