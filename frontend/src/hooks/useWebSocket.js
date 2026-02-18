import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8099';

export function useWebSocket() {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      reconnectDelay: 3000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.onConnect = () => {
      setConnected(true);
      client.subscribe('/topic/messages', (msg) => {
        const event = JSON.parse(msg.body);
        setMessages((prev) => [event, ...prev].slice(0, 50));
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { connected, messages, clearMessages };
}

export async function sendMessage(exchange, routingKey, message) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8099';
  const res = await fetch(`${API_URL}/api/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exchange, routingKey, message }),
  });
  return res.json();
}

export async function checkHealth() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8099';
  const res = await fetch(`${API_URL}/api/health`);
  return res.json();
}
