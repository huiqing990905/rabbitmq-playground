export default function ConsumerLog({ messages, onClear }) {
  return (
    <div className="consumer-log">
      <div className="log-header">
        <h3>Consumer Log</h3>
        {messages.length > 0 && (
          <button className="clear-btn" onClick={onClear}>Clear</button>
        )}
      </div>
      <div className="log-entries">
        {messages.length === 0 && (
          <div className="log-empty">
            <div className="log-empty-icon">~</div>
            <div>No messages yet</div>
            <div className="log-empty-hint">Send a message to see it flow through RabbitMQ</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`log-entry exchange-${msg.exchangeType}`}>
            <div className="log-entry-header">
              <span className="log-queue">{msg.queue}</span>
              <span className="log-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="log-body">{msg.message}</div>
            <div className="log-footer">
              consumed by <strong>{msg.consumer}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
