import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Video, Phone } from 'lucide-react';
import VideoCall from './VideoCall';
import { WebRTCConnection } from '../lib/webrtc';

interface Message {
  id: string;
  type: 'text' | 'file';
  content: string;
  sender: 'me' | 'peer';
  timestamp: number;
  fileName?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  
  const webrtcRef = useRef<WebRTCConnection>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    webrtcRef.current = new WebRTCConnection(
      handleMessage,
      handleRemoteStream,
      handleConnectionState
    );

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.close();
        webrtcRef.current = undefined;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleMessage = (data: any) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: data.type || 'text',
      content: data.type === 'file' ? data.data : data.content,
      sender: 'peer',
      timestamp: Date.now(),
      fileName: data.name,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
  };

  const handleConnectionState = (state: RTCPeerConnectionState) => {
    setConnectionState(state);
    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      endCall();
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !webrtcRef.current) return;

    const message: Message = {
      id: crypto.randomUUID(),
      type: 'text',
      content: inputMessage,
      sender: 'me',
      timestamp: Date.now(),
    };

    webrtcRef.current.sendMessage({ content: inputMessage });
    setMessages((prev) => [...prev, message]);
    setInputMessage('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !webrtcRef.current) return;

    try {
      await webrtcRef.current.sendFile(file);
      
      const message: Message = {
        id: crypto.randomUUID(),
        type: 'file',
        content: URL.createObjectURL(file),
        sender: 'me',
        timestamp: Date.now(),
        fileName: file.name,
      };

      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier:', error);
      alert('Erreur lors de l\'envoi du fichier. Veuillez réessayer.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCall = async () => {
    try {
      const stream = await webrtcRef.current?.startLocalStream();
      if (stream) {
        setLocalStream(stream);
        setIsInCall(true);
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'appel:', error);
      alert('Impossible de démarrer l\'appel. Veuillez vérifier vos permissions de caméra et microphone.');
    }
  };

  const endCall = () => {
    if (webrtcRef.current) {
      webrtcRef.current.stopLocalStream();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setLocalStream(localStream);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setLocalStream(localStream);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {isInCall ? (
        <VideoCall
          localStream={localStream}
          remoteStream={remoteStream}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onEndCall={endCall}
        />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'me' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'me' ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  {msg.type === 'text' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <a
                      href={msg.content}
                      download={msg.fileName}
                      className="flex items-center space-x-2 text-blue-300 hover:text-blue-200"
                    >
                      <Image size={20} />
                      <span>{msg.fileName}</span>
                    </a>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={startCall}
                className={`p-2 text-gray-400 hover:text-white transition-colors ${
                  connectionState !== 'connected' && 'opacity-50 cursor-not-allowed'
                }`}
                disabled={connectionState !== 'connected'}
                title={connectionState !== 'connected' ? 'En attente de connexion...' : 'Démarrer un appel'}
              >
                <Phone size={24} />
              </button>
              <label className="p-2 text-gray-400 hover:text-white cursor-pointer">
                <Image size={24} />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,application/*"
                />
              </label>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 text-blue-500 hover:text-blue-400"
                disabled={!inputMessage.trim()}
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}