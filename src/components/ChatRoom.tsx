import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Video, Camera } from 'lucide-react';
import type { Message, Room, Participant } from '../types';
import StreamGrid from './StreamGrid';
import { useChat } from '../hooks/useChat';

interface ChatRoomProps {
  room: Room;
  currentUser: Participant;
}

export default function ChatRoom({ room, currentUser }: ChatRoomProps) {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat(room.id, currentUser);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim(), 'text');
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      stopTyping();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    
    if (textarea.value.length > 0) {
      startTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(stopTyping, 1000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
      return;
    }

    const type = file.type.startsWith('image/') ? 'image' : 'video';
    const url = URL.createObjectURL(file);
    sendMessage(file.name, type, url);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ... (rest of the streaming-related functions remain the same)

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-white">{room.name}</h2>
            <span className="text-sm text-gray-400">
              {room.participants.length} participants
            </span>
          </div>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`p-2 rounded-lg transition-colors ${
              isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Camera size={20} />
          </button>
        </div>
      </div>

      {isStreaming ? (
        <StreamGrid
          streams={[]}
          localStream={localStream}
          currentUsername={currentUser.username}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={msg.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {msg.sender[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className="font-medium text-white">{msg.sender}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {msg.type === 'text' ? (
                  <p className="text-gray-300 mt-1 break-words">{msg.content}</p>
                ) : msg.type === 'image' ? (
                  <img
                    src={msg.mediaUrl}
                    alt={msg.content}
                    className="max-w-sm rounded-lg mt-2 hover:opacity-90 transition-opacity cursor-pointer"
                    onClick={() => window.open(msg.mediaUrl, '_blank')}
                  />
                ) : (
                  <video
                    src={msg.mediaUrl}
                    controls
                    className="max-w-sm rounded-lg mt-2"
                  />
                )}
              </div>
            </div>
          ))}
          {typingUsers.size > 0 && (
            <div className="text-sm text-gray-400 italic">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'écrit' : 'écrivent'}...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-end space-x-2">
          <label className="p-2 text-gray-400 hover:text-white cursor-pointer">
            <Image size={24} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Écrivez votre message..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 pr-12 resize-none min-h-[40px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ height: '40px' }}
            />
            <button
              onClick={handleSend}
              className={`absolute right-2 bottom-2 p-1.5 transition-colors ${
                message.trim() ? 'text-blue-500 hover:text-blue-400' : 'text-gray-500'
              }`}
              disabled={!message.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}