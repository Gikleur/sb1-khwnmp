import { useState, useEffect, useCallback } from 'react';
import type { Message, Participant } from '../types';
import { useWebSocket } from './useWebSocket';

export function useChat(roomId: string, currentUser: Participant | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const ws = useWebSocket();

  useEffect(() => {
    if (!ws || !currentUser) return;

    ws.joinRoom(currentUser, roomId);

    ws.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    ws.onParticipantsUpdate((newParticipants) => {
      setParticipants(newParticipants);
    });

    ws.onUserTyping((username) => {
      setTypingUsers(prev => new Set(prev).add(username));
    });

    ws.onUserStoppedTyping((username) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    });
  }, [ws, roomId, currentUser]);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!ws) return;
    ws.sendMessage(roomId, { content, type, mediaUrl });
  }, [ws, roomId]);

  const startTyping = useCallback(() => {
    if (!ws) return;
    ws.startTyping(roomId);
  }, [ws, roomId]);

  const stopTyping = useCallback(() => {
    if (!ws) return;
    ws.stopTyping(roomId);
  }, [ws, roomId]);

  return {
    messages,
    participants,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  };
}