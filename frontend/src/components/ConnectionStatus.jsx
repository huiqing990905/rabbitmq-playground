export default function ConnectionStatus({ connected, backendReady }) {
  return (
    <div className="connection-status">
      <span className={`dot ${backendReady ? 'green' : 'red'}`} />
      <span>Backend: {backendReady ? 'Online' : 'Waking up...'}</span>
      <span className={`dot ${connected ? 'green' : 'yellow'}`} />
      <span>WebSocket: {connected ? 'Connected' : 'Connecting...'}</span>
    </div>
  );
}
