import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import gameManager from './gameManager';
import { ServerToClientEvents, ClientToServerEvents } from './types';

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create Room
  socket.on('create-room', ({ username, maxPlayers }) => {
    try {
      const room = gameManager.createRoom(socket.id, username, maxPlayers);
      const player = room.players[0];

      socket.join(room.roomId);
      socket.emit('room-created', { roomId: room.roomId, playerId: player.id });
      socket.emit('room-updated', room);

      console.log(`Room ${room.roomId} created by ${username}`);
    } catch (error) {
      socket.emit('error', 'Failed to create room');
    }
  });

  // Join Room
  socket.on('join-room', ({ roomId, username }) => {
    try {
      const result = gameManager.joinRoom(roomId, socket.id, username);

      if (!result) {
        socket.emit('error', 'Room not found, full, or game already started');
        return;
      }

      const { room, player } = result;

      socket.join(room.roomId);
      socket.emit('room-joined', {
        roomId: room.roomId,
        playerId: player.id,
        playerNumber: player.playerNumber,
      });

      // Notify all players in room
      io.to(room.roomId).emit('room-updated', room);
      socket.to(room.roomId).emit('player-joined', player);

      console.log(`${username} joined room ${room.roomId}`);
    } catch (error) {
      socket.emit('error', 'Failed to join room');
    }
  });

  // Leave Room
  socket.on('leave-room', () => {
    handleLeaveRoom(socket);
  });

  // Toggle Ready
  socket.on('toggle-ready', (isReady) => {
    const result = gameManager.toggleReady(socket.id, isReady);

    if (!result) {
      socket.emit('error', 'Failed to toggle ready state');
      return;
    }

    const { room, playerId } = result;
    io.to(room.roomId).emit('player-ready-changed', { playerId, isReady });
    io.to(room.roomId).emit('room-updated', room);
  });

  // Start Game
  socket.on('start-game', () => {
    const room = gameManager.canStartGame(socket.id);

    if (!room) {
      socket.emit('error', 'Cannot start game');
      return;
    }

    gameManager.startGame(room.roomId);
    io.to(room.roomId).emit('room-updated', gameManager.getRoom(room.roomId)!);

    console.log(`Game starting in room ${room.roomId}`);

    // Countdown sequence
    let countdown = 3;

    const countdownInterval = setInterval(() => {
      io.to(room.roomId).emit('countdown-tick', countdown);

      if (countdown === 0) {
        clearInterval(countdownInterval);

        // Start the actual game
        gameManager.setGamePlaying(room.roomId);
        io.to(room.roomId).emit('game-started');
        io.to(room.roomId).emit('room-updated', gameManager.getRoom(room.roomId)!);

        console.log(`Game started in room ${room.roomId}`);
      }

      countdown--;
    }, 1000);
  });

  // Handle Tap
  socket.on('tap', () => {
    const result = gameManager.handleTap(socket.id);

    if (!result) return;

    const { room, player, finished } = result;

    // Broadcast progress
    io.to(room.roomId).emit('player-progress', {
      playerId: player.id,
      progress: player.progress,
      taps: player.taps,
    });

    // If player finished
    if (finished) {
      io.to(room.roomId).emit('player-finished', {
        playerId: player.id,
        position: player.finishPosition!,
        finishTime: player.finishTime!,
      });

      console.log(`${player.username} finished in position ${player.finishPosition}`);

      // Check if game ended
      const gameEndResult = gameManager.checkGameEnd(room.roomId);

      if (gameEndResult && gameEndResult.ended) {
        io.to(room.roomId).emit('game-ended', {
          winners: gameEndResult.winners,
          allPlayers: gameEndResult.allPlayers,
          gameDuration: gameEndResult.gameDuration,
        });

        console.log(`Game ended in room ${room.roomId}`);
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    handleLeaveRoom(socket);
    console.log(`Player disconnected: ${socket.id}`);
  });
});

function handleLeaveRoom(socket: any) {
  const result = gameManager.leaveRoom(socket.id);

  if (result) {
    const { room, leftPlayerId } = result;
    socket.to(room.roomId).emit('player-left', leftPlayerId);
    socket.to(room.roomId).emit('room-updated', room);
    socket.leave(room.roomId);

    console.log(`Player left room ${room.roomId}`);
  }
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`TapBlitz server running on port ${PORT}`);
});
