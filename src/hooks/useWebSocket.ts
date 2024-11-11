import { useEffect, useRef } from 'react';
import { WebSocketClient } from '../lib/websocket';
import type { Message, Participant } from '../types';

export function useWebSocket() {
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocketClient();
    return () => wsRef.current?.disconnect();
  }, []);

  return wsRef.current;
}