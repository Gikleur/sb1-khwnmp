import React, { useState, useEffect } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import RoomList from './components/RoomList';
import ChatRoom from './components/ChatRoom';
import ParticipantList from './components/ParticipantList';
import ProfileSetup from './components/ProfileSetup';
import { websocketClient } from './lib/websocket';
import type { Message, Room, UserProfile, Participant, Report } from './types';

const MAX_PARTICIPANTS = 100;

const DEFAULT_ROOMS: Room[] = [
  { 
    id: 'general', 
    name: 'General', 
    isPrivate: false, 
    participants: [],
    owner: 'system',
    bannedUsers: [],
    lastActivityTimestamp: Date.now()
  },
  { 
    id: 'random', 
    name: 'Random', 
    isPrivate: false, 
    participants: [],
    owner: 'system',
    bannedUsers: [],
    lastActivityTimestamp: Date.now()
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [activeRoom, setActiveRoom] = useState<string>(DEFAULT_ROOMS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [showRoomList, setShowRoomList] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);

  useEffect(() => {
    if (currentUser) {
      websocketClient.connect(currentUser);
      
      const messageCleanup = websocketClient.onMessage((message) => {
        setMessages(prev => ({
          ...prev,
          [activeRoom]: [...(prev[activeRoom] || []), message]
        }));
      });

      const usersCleanup = websocketClient.onUsersUpdate((users) => {
        setRooms(prevRooms =>
          prevRooms.map(room => ({
            ...room,
            participants: users
          }))
        );
      });

      const roomCleanup = websocketClient.onRoomCreated((room) => {
        setRooms(prev => [...prev, room]);
      });

      return () => {
        messageCleanup();
        usersCleanup();
        roomCleanup();
        websocketClient.disconnect();
      };
    }
  }, [currentUser, activeRoom]);

  const handleProfileComplete = (profile: UserProfile) => {
    const newUser: Participant = {
      ...profile,
      id: crypto.randomUUID(),
      isOnline: true,
      reports: []
    };
    setCurrentUser(newUser);
  };

  const handleSendMessage = (content: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!currentUser) return;
    websocketClient.sendMessage(content, activeRoom, type, mediaUrl);
  };

  const handleCreateRoom = (name: string, isPrivate: boolean) => {
    if (!currentUser) return;

    const newRoom: Room = {
      id: crypto.randomUUID(),
      name,
      isPrivate,
      participants: isPrivate ? [currentUser] : rooms[0].participants,
      owner: currentUser.id,
      invites: [],
      bannedUsers: [],
      lastActivityTimestamp: Date.now()
    };

    if (newRoom.participants.length >= MAX_PARTICIPANTS) {
      alert(`Le salon ne peut pas contenir plus de ${MAX_PARTICIPANTS} participants.`);
      return;
    }

    websocketClient.createRoom(newRoom);
    setActiveRoom(newRoom.id);
  };

  const handleInviteToRoom = (roomId: string, participantId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.isPrivate || room.owner !== currentUser?.id) return;

    if (room.participants.length >= MAX_PARTICIPANTS) {
      alert(`Le salon ne peut pas contenir plus de ${MAX_PARTICIPANTS} participants.`);
      return;
    }

    setRooms(prevRooms => 
      prevRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            invites: [...(r.invites || []), participantId]
          };
        }
        return r;
      })
    );
  };

  const handleAcceptInvite = (roomId: string) => {
    if (!currentUser) return;
    websocketClient.joinRoom(roomId);
  };

  const handleCloseRoom = (roomId: string) => {
    if (!currentUser) return;

    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.isPrivate || room.owner !== currentUser.id) return;

    setRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));
    setActiveRoom(DEFAULT_ROOMS[0].id);
  };

  const handleReportParticipant = (participantId: string, reason: string) => {
    if (!currentUser) return;

    const report: Report = {
      id: crypto.randomUUID(),
      reporterId: currentUser.id,
      reason,
      timestamp: Date.now()
    };

    setRooms(prevRooms =>
      prevRooms.map(room => ({
        ...room,
        participants: room.participants.map(p =>
          p.id === participantId
            ? { ...p, reports: [...(p.reports || []), report] }
            : p
        )
      }))
    );

    const participant = rooms[0].participants.find(p => p.id === participantId);
    if (participant && participant.reports && participant.reports.length >= 3) {
      setRooms(prevRooms =>
        prevRooms.map(room => ({
          ...room,
          bannedUsers: [...room.bannedUsers, participantId],
          participants: room.participants.filter(p => p.id !== participantId)
        }))
      );
    }
  };

  if (!currentUser) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  const currentRoom = rooms.find(r => r.id === activeRoom)!;
  const pendingInvites = rooms.filter(r => r.invites?.includes(currentUser.id));

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className={`fixed md:relative z-20 h-full transition-all duration-300 ease-in-out ${
        showRoomList ? 'translate-x-0' : '-translate-x-64'
      }`}>
        <div className="w-64 h-full bg-gray-900 border-r border-gray-800">
          <RoomList
            rooms={rooms}
            activeRoom={activeRoom}
            onRoomSelect={setActiveRoom}
            onCreateRoom={handleCreateRoom}
            onCloseRoom={handleCloseRoom}
            currentUser={currentUser}
            pendingInvites={pendingInvites}
            onAcceptInvite={handleAcceptInvite}
          />
        </div>
      </div>

      <button
        onClick={() => setShowRoomList(!showRoomList)}
        className="fixed md:relative z-30 left-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-r-lg hover:bg-gray-700 transition-colors"
      >
        {showRoomList ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div className="flex-1 flex relative">
        <div className="flex-1 relative">
          <ChatRoom
            room={currentRoom}
            messages={messages[activeRoom] || []}
            onSendMessage={handleSendMessage}
          />
        </div>

        <div className={`fixed md:relative right-0 z-20 h-full transition-all duration-300 ease-in-out ${
          showParticipants ? 'translate-x-0' : 'translate-x-72'
        }`}>
          <ParticipantList
            participants={currentRoom.participants}
            onStartPrivateChat={() => {}}
            currentUser={currentUser}
            room={currentRoom}
            onInviteToRoom={handleInviteToRoom}
            onReportParticipant={handleReportParticipant}
          />
        </div>

        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="fixed md:relative z-30 right-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-l-lg hover:bg-gray-700 transition-colors"
        >
          {showParticipants ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  );
}