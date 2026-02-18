import { useState, useEffect } from 'react';

const PRESETS = {
  default: {
    routingKey: 'simple-queue',
    message: 'Hello RabbitMQ!',
    showRoutingKey: false,
    quickKeys: [],
  },
  direct: {
    routingKey: 'pay.alipay',
    message: '',
    showRoutingKey: true,
    quickKeys: ['pay.alipay', 'pay.wechat', 'pay.creditcard'],
  },
  topic: {
    routingKey: 'order.error',
    message: 'Log message',
    showRoutingKey: true,
    quickKeys: ['order.error', 'order.info', 'payment.error', 'payment.info', 'user.warning'],
  },
  fanout: {
    routingKey: '',
    message: 'Broadcast event',
    showRoutingKey: false,
    quickKeys: [],
  },
};

export default function MessageForm({ exchange, onSend, onRoutingKeyChange, sending, predictedCount }) {
  const preset = PRESETS[exchange];
  const [routingKey, setRoutingKey] = useState(preset.routingKey);
  const [message, setMessage] = useState(preset.message);

  useEffect(() => {
    const newKey = PRESETS[exchange].routingKey;
    const newMsg = PRESETS[exchange].message;
    setRoutingKey(newKey);
    setMessage(newMsg);
    onRoutingKeyChange(newKey);
  }, [exchange]);

  const handleRoutingKeyChange = (val) => {
    setRoutingKey(val);
    onRoutingKeyChange(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(routingKey, message);
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      {preset.showRoutingKey && (
        <div className="form-group">
          <label>Routing Key</label>
          <input
            type="text"
            value={routingKey}
            onChange={(e) => handleRoutingKeyChange(e.target.value)}
            placeholder="Type any routing key to test..."
            className="routing-key-input"
          />
          {preset.quickKeys.length > 0 && (
            <div className="quick-keys">
              {preset.quickKeys.map((k) => (
                <button
                  type="button"
                  key={k}
                  className={`quick-key ${routingKey === k ? 'active' : ''}`}
                  onClick={() => handleRoutingKeyChange(k)}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
          {routingKey && (
            <div className={`prediction-hint ${predictedCount > 0 ? 'has-match' : 'no-match'}`}>
              {predictedCount > 0
                ? `${predictedCount} queue${predictedCount > 1 ? 's' : ''} will receive this message`
                : 'No queues match this routing key'}
            </div>
          )}
        </div>
      )}

      {!preset.showRoutingKey && exchange === 'fanout' && (
        <div className="form-note">
          Routing key is ignored — all 3 queues will receive this message.
        </div>
      )}

      {!preset.showRoutingKey && exchange === 'default' && (
        <div className="form-note">
          Routing key = "simple-queue" (equals the queue name).
        </div>
      )}

      <div className="form-group">
        <label>Message</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message..."
        />
      </div>
      <button type="submit" className="send-btn" disabled={sending}>
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
