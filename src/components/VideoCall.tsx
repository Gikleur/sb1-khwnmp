import React, { useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
}

export default function VideoCall({
  localStream,
  remoteStream,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isVideoEnabled = localStream?.getVideoTracks()[0]?.enabled ?? false;
  const isAudioEnabled = localStream?.getAudioTracks()[0]?.enabled ?? false;

  return (
    <div className="relative h-full bg-gray-900">
      {remoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      )}
      {localStream && (
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full ${
            isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'
          }`}
        >
          {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button
          onClick={onToggleAudio}
          className={`p-4 rounded-full ${
            isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'
          }`}
        >
          {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button
          onClick={onEndCall}
          className="p-4 bg-red-600 rounded-full hover:bg-red-700"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}