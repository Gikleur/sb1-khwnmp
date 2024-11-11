import React, { useState } from 'react';
import { Plus, Hash, Lock, Users, Bell } from 'lucide-react';
import type { Room, Participant } from '../types';

interface RoomListProps {
  rooms: Room[];
  activeRoom: string;
  currentUser: Participant;
  pendingInvites: Room[];
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: (name: string, isPrivate: boolean) => void;
  onCloseRoom: (roomId: string) => void;
  onAcceptInvite: (roomId: string) => void;
}

export default function RoomList({
  rooms,
  activeRoom,
  currentUser,
  pendingInvites,
  onRoomSelect,
  onCreateRoom,
  onCloseRoom,
  onAcceptInvite
}: RoomListProps) {
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName, isPrivate);
      setNewRoomName('');
      setIsPrivate(false);
      setShowNewRoomDialog(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-white">Rooms</h2>
        <button
          onClick={() => setShowNewRoomDialog(true)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
        >
          <Plus size={20} />
        </button>
      </div>

      {pendingInvites.length > 0 && (
        <div className="px-4 mb-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Invitations</h3>
          <div className="space-y-1">
            {pendingInvites.map(room => (
              <div
                key={room.id}
                className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
              >
                <div className="flex items-center space-x-2">
                  <Bell size={16} className="text-blue-400" />
                  <span className="text-sm text-white">{room.name}</span>
                </div>
                <button
                  onClick={() => onAcceptInvite(room.id)}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Rejoindre
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`group flex items-center justify-between p-3 rounded-lg transition-colors ${
              activeRoom === room.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <button
              onClick={() => onRoomSelect(room.id)}
              className="flex items-center space-x-2 min-w-0 flex-1"
            >
              {room.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
              <span className="truncate">{room.name}</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-gray-500">
                <Users size={14} />
                <span className="text-xs">{room.participants.length}</span>
              </div>
              {room.isPrivate && room.owner === currentUser.id && (
                <button
                  onClick={() => onCloseRoom(room.id)}
                  className="hidden group-hover:block p-1 text-red-400 hover:text-red-300 rounded"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewRoomDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New Room</h3>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center space-x-2 text-white mb-4">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span>Private Room</span>
            </label>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewRoomDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}