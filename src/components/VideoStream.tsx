import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Minimize2, Maximize2, MonitorSmartphone } from 'lucide-react';

interface VideoStreamProps {
  stream: MediaStream | null;
  username: string;
  muted?: boolean;
  controls?: boolean;
  minimizable?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onSwitchCamera?: () => void;
}

export default function VideoStream({
  stream,
  username,
  muted = false,
  controls = false,
  minimizable = false,
  onToggleVideo,
  onToggleAudio,
  onSwitchCamera
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
      } catch (error) {
        console.error('Erreur lors du chargement des périphériques:', error);
      }
    };

    loadDevices();
  }, []);

  const handleToggleVideo = () => {
    if (stream && onToggleVideo) {
      setIsVideoEnabled(!isVideoEnabled);
      onToggleVideo();
    }
  };

  const handleToggleAudio = () => {
    if (stream && onToggleAudio) {
      setIsAudioEnabled(!isAudioEnabled);
      onToggleAudio();
    }
  };

  const handleToggleSize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-800 transition-all duration-300 ${
      isMinimized ? 'w-72 h-48 fixed bottom-4 right-4 z-50 shadow-lg' : 'w-full h-full'
    }`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{username}</span>
          {controls && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleVideo}
                className={`p-1.5 rounded-full ${
                  isVideoEnabled ? 'bg-gray-700/50' : 'bg-red-500/50'
                }`}
                title={isVideoEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
              >
                {isVideoEnabled ? (
                  <Camera size={16} className="text-white" />
                ) : (
                  <CameraOff size={16} className="text-white" />
                )}
              </button>
              <button
                onClick={handleToggleAudio}
                className={`p-1.5 rounded-full ${
                  isAudioEnabled ? 'bg-gray-700/50' : 'bg-red-500/50'
                }`}
                title={isAudioEnabled ? 'Couper le micro' : 'Activer le micro'}
              >
                {isAudioEnabled ? (
                  <Mic size={16} className="text-white" />
                ) : (
                  <MicOff size={16} className="text-white" />
                )}
              </button>
              {devices.length > 1 && (
                <button
                  onClick={onSwitchCamera}
                  className="p-1.5 rounded-full bg-gray-700/50"
                  title="Changer de caméra"
                >
                  <MonitorSmartphone size={16} className="text-white" />
                </button>
              )}
              {minimizable && (
                <button
                  onClick={handleToggleSize}
                  className="p-1.5 rounded-full bg-gray-700/50"
                  title={isMinimized ? 'Agrandir' : 'Réduire'}
                >
                  {isMinimized ? (
                    <Maximize2 size={16} className="text-white" />
                  ) : (
                    <Minimize2 size={16} className="text-white" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}