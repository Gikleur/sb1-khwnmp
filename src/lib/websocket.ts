import { io, Socket } from 'socket.io-client';
import type { UserProfile, Message, Room } from '../types';

export class WebSocketClient {
  private socket: Socket;
  private messageHandlers: ((message: Message) => void)[] = [];
  private userHandlers: ((users: UserProfile[]) => void)[] = [];
  private roomHandlers: ((room: Room) => void)[] = [];

  constructor() {
    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001');
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('message', (message: Message) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('userJoined', ({ users }) => {
      this.userHandlers.forEach(handler => handler(users));
    });

    this.socket.on('userLeft', ({ users }) => {
      this.userHandlers.forEach(handler => handler(users));
    });

    this.socket.on('roomCreated', (room: Room) => {
      this.roomHandlers.forEach(handler => handler(room));
    });
  }

  connect(userData: UserProfile) {
    this.socket.emit('join', userData);
  }

  sendMessage(content: string, room: string, type: Message['type'] = 'text', mediaUrl?: string) {
    this.socket.emit('message', { content, room, type, mediaUrl });
  }

  createRoom(roomData: Partial<Room>) {
    this.socket.emit('createRoom', roomData);
  }

  joinRoom(roomId: string) {
    this.socket.emit('joinRoom', roomId);
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onUsersUpdate(handler: (users: UserProfile[]) => void) {
    this.userHandlers.push(handler);
    return () => {
      this.userHandlers = this.userHandlers.filter(h => h !== handler);
    };
  }

  onRoomCreated(handler: (room: Room) => void) {
    this.roomHandlers.push(handler);
    return () => {
      this.roomHandlers = this.roomHandlers.filter(h => h !== handler);
    };
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const websocketClient = new WebSocketClient();