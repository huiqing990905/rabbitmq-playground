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
  const [routingKey, setRoutingKey] = useState('pay.alipay');
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
        <h1>RabbitMQ Playground</h1>
        <p className="subtitle">Interactive message routing visualizer</p>
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
