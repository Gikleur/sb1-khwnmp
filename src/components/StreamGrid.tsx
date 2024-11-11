import React from 'react';
import VideoStream from './VideoStream';

interface Stream {
  id: string;
  username: string;
  stream: MediaStream;
}

interface StreamGridProps {
  streams: Stream[];
  localStream?: MediaStream | null;
  currentUsername?: string;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onSwitchCamera?: () => void;
}

export default function StreamGrid({
  streams,
  localStream,
  currentUsername,
  onToggleVideo,
  onToggleAudio,
  onSwitchCamera
}: StreamGridProps) {
  const totalStreams = streams.length + (localStream ? 1 : 0);
  
  const gridClassName = totalStreams <= 1
    ? 'grid-cols-1'
    : totalStreams <= 2
    ? 'grid-cols-2'
    : totalStreams <= 4
    ? 'grid-cols-2'
    : totalStreams <= 6
    ? 'grid-cols-3'
    : 'grid-cols-4';

  return (
    <div className={`grid ${gridClassName} gap-4 p-4 auto-rows-fr h-full`}>
      {localStream && currentUsername && (
        <VideoStream
          stream={localStream}
          username={`${currentUsername} (Vous)`}
          muted={true}
          controls={true}
          minimizable={true}
          onToggleVideo={onToggleVideo}
          onToggleAudio={onToggleAudio}
          onSwitchCamera={onSwitchCamera}
        />
      )}
      {streams.map(({ id, username, stream }) => (
        <VideoStream
          key={id}
          stream={stream}
          username={username}
        />
      ))}
    </div>
  );
}