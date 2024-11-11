import { useEffect, useCallback } from 'react';
import type { Room, Message } from '../types';

const MIN_PARTICIPANTS = 5;
const ROOM_CLEANUP_DELAY = 10 * 60 * 1000; // 10 minutes
const WARNING_DELAY = 9 * 60 * 1000; // 9 minutes - avertissement 1 minute avant

export function useRoomCleanup(
  rooms: Room[],
  activeRoom: string,
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>,
  setActiveRoom: React.Dispatch<React.SetStateAction<string>>,
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>
) {
  const checkAndCleanupRoom = useCallback((room: Room) => {
    if (room.owner === 'system') return; // Ne pas nettoyer les salons système
    
    const timeSinceLastActivity = Date.now() - room.lastActivityTimestamp;
    const hasLowActivity = room.participants.length < MIN_PARTICIPANTS;

    // Envoyer un avertissement 1 minute avant la suppression
    if (
      hasLowActivity && 
      timeSinceLastActivity >= WARNING_DELAY &&
      timeSinceLastActivity < ROOM_CLEANUP_DELAY
    ) {
      const warningMessage: Message = {
        id: crypto.randomUUID(),
        content: `⚠️ Attention: Le salon "${room.name}" sera fermé dans 1 minute en raison d'une activité insuffisante (minimum ${MIN_PARTICIPANTS} participants requis).`,
        sender: 'system',
        timestamp: Date.now(),
        type: 'system'
      };

      setMessages(prev => ({
        ...prev,
        [room.id]: [...(prev[room.id] || []), warningMessage]
      }));
    }

    // Nettoyer le salon après le délai
    if (hasLowActivity && timeSinceLastActivity >= ROOM_CLEANUP_DELAY) {
      const closeMessage: Message = {
        id: crypto.randomUUID(),
        content: `Le salon "${room.name}" a été fermé en raison d'une activité insuffisante.`,
        sender: 'system',
        timestamp: Date.now(),
        type: 'system'
      };

      // Ajouter le message de fermeture au salon général
      setMessages(prev => ({
        ...prev,
        general: [...(prev.general || []), closeMessage]
      }));

      // Rediriger vers le salon général si nécessaire
      if (activeRoom === room.id) {
        setActiveRoom('general');
      }

      // Supprimer le salon
      setRooms(prevRooms => prevRooms.filter(r => r.id !== room.id));
    }
  }, [activeRoom, setActiveRoom, setMessages, setRooms]);

  useEffect(() => {
    const interval = setInterval(() => {
      rooms.forEach(checkAndCleanupRoom);
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [rooms, checkAndCleanupRoom]);

  return { checkAndCleanupRoom };
}