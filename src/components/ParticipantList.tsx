import React, { useState, useMemo } from 'react';
import { MessageCircle, UserPlus, MapPin, Filter, AlertTriangle } from 'lucide-react';
import type { Participant, Room } from '../types';
import ReportDialog from './ReportDialog';

interface ParticipantListProps {
  participants: Participant[];
  onStartPrivateChat: (participant: Participant) => void;
  onInviteToRoom: (roomId: string, participantId: string) => void;
  onReportParticipant: (participantId: string, reason: string) => void;
  currentUser: Participant;
  room: Room;
}

export default function ParticipantList({
  participants,
  onStartPrivateChat,
  onInviteToRoom,
  onReportParticipant,
  currentUser,
  room
}: ParticipantListProps) {
  const [filter, setFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'homme' | 'femme' | 'autre'>('all');
  const [ageRange, setAgeRange] = useState<{ min: number; max: number }>({ min: 13, max: 120 });
  const [reportingParticipant, setReportingParticipant] = useState<Participant | null>(null);

  const canInvite = room.isPrivate && room.owner === currentUser.id;

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = 
        p.username.toLowerCase().includes(filter.toLowerCase()) ||
        p.city.toLowerCase().includes(filter.toLowerCase()) ||
        p.country.toLowerCase().includes(filter.toLowerCase());
      
      const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
      const matchesAge = p.age >= ageRange.min && p.age <= ageRange.max;
      
      return matchesSearch && matchesGender && matchesAge;
    });
  }, [participants, filter, genderFilter, ageRange]);

  const nonRoomParticipants = useMemo(() => {
    if (!room.isPrivate) return [];
    return participants.filter(p => 
      !room.participants.some(rp => rp.id === p.id) && 
      !room.invites?.includes(p.id) &&
      !room.bannedUsers?.includes(p.id)
    );
  }, [participants, room]);

  const handleReport = (participantId: string, reason: string) => {
    onReportParticipant(participantId, reason);
    setReportingParticipant(null);
  };

  return (
    <>
      <div className="w-72 bg-gray-800 border-l border-gray-700 h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Participants ({filteredParticipants.length})
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
              title="Filtres"
            >
              <Filter size={18} />
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Rechercher..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {showFilters && (
            <div className="mt-3 p-3 bg-gray-700 rounded-lg space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Genre</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as typeof genderFilter)}
                  className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Âge</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="13"
                    max={ageRange.max}
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-20 bg-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">à</span>
                  <input
                    type="number"
                    min={ageRange.min}
                    max="120"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-20 bg-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredParticipants.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Aucun participant ne correspond aux critères
            </div>
          ) : (
            filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 group transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="relative text-2xl">
                      {participant.avatar}
                      <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full ${
                        participant.isOnline ? 'bg-green-500' : 'bg-gray-500'
                      } ring-2 ring-gray-800`} />
                    </div>
                    <div className="truncate">
                      <span className={`font-medium ${
                        participant.id === currentUser.id ? 'text-blue-400' : 'text-white'
                      }`}>
                        {participant.id === currentUser.id ? 'Vous' : participant.username}
                      </span>
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{participant.city}, {participant.country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {participant.age} ans • {participant.gender}
                  </div>
                </div>
                {participant.id !== currentUser.id && (
                  <div className="hidden group-hover:flex items-center space-x-2">
                    <button
                      onClick={() => onStartPrivateChat(participant)}
                      className="text-gray-400 hover:text-blue-400"
                      title="Démarrer une conversation privée"
                    >
                      <MessageCircle size={16} />
                    </button>
                    {canInvite && !room.participants.some(p => p.id === participant.id) && (
                      <button
                        onClick={() => onInviteToRoom(room.id, participant.id)}
                        className="text-gray-400 hover:text-green-400"
                        title="Inviter dans ce salon"
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setReportingParticipant(participant)}
                      className="text-gray-400 hover:text-red-400"
                      title="Signaler ce participant"
                    >
                      <AlertTriangle size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {canInvite && nonRoomParticipants.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Inviter des participants
            </h3>
            <div className="space-y-1">
              {nonRoomParticipants.map(participant => (
                <button
                  key={participant.id}
                  onClick={() => onInviteToRoom(room.id, participant.id)}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 text-left"
                >
                  <UserPlus size={16} className="text-gray-400" />
                  <span className="text-sm text-white">{participant.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {reportingParticipant && (
        <ReportDialog
          participant={reportingParticipant}
          onReport={handleReport}
          onClose={() => setReportingParticipant(null)}
        />
      )}
    </>
  );
}