const EXCHANGES = [
  { id: 'default', label: 'Default', desc: 'Point-to-point' },
  { id: 'direct', label: 'Direct', desc: 'Exact match' },
  { id: 'topic', label: 'Topic', desc: 'Wildcard match' },
  { id: 'fanout', label: 'Fanout', desc: 'Broadcast' },
];

const EXPLANATIONS = {
  default: {
    title: 'Default Exchange',
    how: 'Every RabbitMQ has a built-in default exchange (""). It routes where routing key = queue name.',
    rule: 'routing key must equal the queue name',
    example: 'Send with routing key "ping-queue" → message goes to ping-queue.',
  },
  direct: {
    title: 'Direct Exchange',
    how: 'Routes to queues whose binding key exactly matches the routing key.',
    rule: 'routing key must exactly match the binding key',
    example: '"action.attack" → attack-queue. "action.heal" → heal-queue. "action.fly" → dropped!',
  },
  topic: {
    title: 'Topic Exchange',
    how: 'Routes using wildcard patterns on dot-separated words. * = one word, # = zero or more words.',
    rule: '* matches one word, # matches zero or more',
    example: '"player.critical" matches *.critical, player.*, and # → 3 queues. "npc.info" → only # matches.',
  },
  fanout: {
    title: 'Fanout Exchange',
    how: 'Broadcasts to ALL bound queues. Routing key is completely ignored.',
    rule: 'routing key is ignored — all queues receive every message',
    example: 'Boss defeated → chat, leaderboard, and achievements all update simultaneously.',
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
          <span className="rule-label">Try:</span> {explanation.example}
        </div>
      </div>
    </div>
  );
}
