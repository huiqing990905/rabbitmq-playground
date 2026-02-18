export default function ConsumerLog({ messages, onClear }) {
  return (
    <div className="consumer-log">
      <div className="log-header">
        <h3>Consumer Log</h3>
        <button className="clear-btn" onClick={onClear}>Clear</button>
      </div>
      <div className="log-entries">
        {messages.length === 0 && (
          <div className="log-empty">No messages yet. Send one!</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`log-entry exchange-${msg.exchangeType}`}>
            <div className="log-entry-header">
              <span className="log-queue">{msg.queue}</span>
              <span className="log-consumer">{msg.consumer}</span>
            </div>
            <div className="log-message">{msg.message}</div>
            <div className="log-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
