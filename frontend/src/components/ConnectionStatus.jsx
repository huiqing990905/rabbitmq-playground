export default function ConnectionStatus({ connected, backendReady }) {
  if (!backendReady) {
    return (
      <div className="cold-start-banner">
        <div className="spinner" />
        <span>Backend is waking up (free tier cold start, ~30s)...</span>
      </div>
    );
  }

  return (
    <div className="connection-status">
      <span className={`dot ${backendReady ? 'green' : 'red'}`} />
      <span>Backend: Online</span>
      <span className={`dot ${connected ? 'green' : 'yellow'}`} />
      <span>WebSocket: {connected ? 'Connected' : 'Connecting...'}</span>
    </div>
  );
}
