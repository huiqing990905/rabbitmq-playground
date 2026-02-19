import { useState, useEffect, useCallback } from 'react';
import { useWebSocket, sendMessage, checkHealth } from './hooks/useWebSocket';
import { predictMatches } from './utils/matchRoutingKey';
import ConnectionStatus from './components/ConnectionStatus';
import ExchangeSelector from './components/ExchangeSelector';
import MessageForm from './components/MessageForm';
import FlowDiagram from './components/FlowDiagram';
import ConsumerLog from './components/ConsumerLog';
import './App.css';

export default function App() {
  const { connected, messages, clearMessages } = useWebSocket();
  const [exchange, setExchange] = useState('direct');
  const [sending, setSending] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [routingKey, setRoutingKey] = useState('action.attack');
  const [predictedQueues, setPredictedQueues] = useState([]);

  useEffect(() => {
    const ping = async () => {
      try {
        await checkHealth();
        setBackendReady(true);
      } catch {
        setBackendReady(false);
        setTimeout(ping, 3000);
      }
    };
    ping();
  }, []);

  const handleRoutingKeyChange = useCallback((key) => {
    setRoutingKey(key);
    setPredictedQueues(predictMatches(exchange, key));
  }, [exchange]);

  const handleExchangeChange = useCallback((ex) => {
    setExchange(ex);
    setRoutingKey('');
    setPredictedQueues([]);
  }, []);

  const handleSend = async (rk, message) => {
    setSending(true);
    try {
      await sendMessage(exchange, rk, message);
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  const lastMessage = messages.length > 0 ? messages[0] : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div />
          <div className="header-title">
            <h1>RabbitMQ Playground</h1>
            <p className="subtitle">Interactive message routing visualizer</p>
          </div>
          <a
            href="https://github.com/huiqing990905/rabbitmq-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="View source on GitHub"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
        <ConnectionStatus connected={connected} backendReady={backendReady} />
      </header>

      <main className="app-main">
        <aside className="left-panel">
          <ExchangeSelector selected={exchange} onSelect={handleExchangeChange} />
          <MessageForm
            exchange={exchange}
            onSend={handleSend}
            onRoutingKeyChange={handleRoutingKeyChange}
            sending={sending}
            predictedCount={predictedQueues.length}
          />
        </aside>

        <section className="center-panel">
          <FlowDiagram
            exchangeType={exchange}
            routingKey={routingKey}
            predictedQueues={predictedQueues}
            lastMessage={lastMessage}
          />
        </section>

        <aside className="right-panel">
          <ConsumerLog messages={messages} onClear={clearMessages} />
        </aside>
      </main>
    </div>
  );
}
