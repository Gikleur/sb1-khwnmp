import { useCallback } from 'react';
import type { Room } from '../types';

export function useRoomActivity(
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>
) {
  const updateRoomActivity = useCallback((roomId: string) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? { ...room, lastActivityTimestamp: Date.now() }
          : room
      )
    );
  }, [setRooms]);

  return { updateRoomActivity };
}