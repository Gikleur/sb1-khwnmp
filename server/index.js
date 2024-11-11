import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-netlify-app.netlify.app'
      : 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

// Stocker les utilisateurs connectés
const connectedUsers = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  socket.on('join', (userData) => {
    connectedUsers.set(socket.id, userData);
    socket.join('general');
    
    io.to('general').emit('userJoined', {
      user: userData,
      users: Array.from(connectedUsers.values())
    });
  });

  socket.on('message', (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      io.to(data.room).emit('message', {
        ...data,
        sender: user.username,
        timestamp: Date.now()
      });
    }
  });

  socket.on('createRoom', (roomData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const room = {
        ...roomData,
        id: crypto.randomUUID(),
        owner: socket.id,
        participants: [user]
      };
      rooms.set(room.id, room);
      socket.join(room.id);
      io.emit('roomCreated', room);
    }
  });

  socket.on('joinRoom', (roomId) => {
    const user = connectedUsers.get(socket.id);
    const room = rooms.get(roomId);
    if (user && room) {
      room.participants.push(user);
      socket.join(roomId);
      io.to(roomId).emit('userJoinedRoom', { room, user });
    }
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      io.emit('userLeft', {
        user,
        users: Array.from(connectedUsers.values())
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});