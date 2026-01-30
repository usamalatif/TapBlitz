import { GameRoom, Player, GameState } from './types';
import { v4 as uuidv4 } from 'uuid';

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#F97316', '#EC4899', '#06B6D4', '#84CC16', '#6366F1',
];

const TAPS_TO_WIN = 100;
const MAX_TAPS_PER_SECOND = 20;
const TAP_COOLDOWN_MS = 1000 / MAX_TAPS_PER_SECOND; // 50ms

class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRoomMap: Map<string, string> = new Map(); // socketId -> roomId

  generateRoomCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Make sure code is unique
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  createRoom(hostSocketId: string, username: string, maxPlayers: number): GameRoom {
    const roomId = this.generateRoomCode();
    const playerId = uuidv4();

    const hostPlayer: Player = {
      id: playerId,
      socketId: hostSocketId,
      playerNumber: 0,
      username,
      color: PLAYER_COLORS[0],
      progress: 0,
      taps: 0,
      isReady: false,
      finished: false,
      finishPosition: null,
      finishTime: null,
      lastTapTime: 0,
    };

    const room: GameRoom = {
      roomId,
      hostId: playerId,
      players: [hostPlayer],
      maxPlayers: Math.min(Math.max(maxPlayers, 2), 10),
      gameState: 'waiting',
      startTime: null,
      tapsToWin: TAPS_TO_WIN,
      finishedCount: 0,
    };

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(hostSocketId, roomId);

    return room;
  }

  joinRoom(roomId: string, socketId: string, username: string): { room: GameRoom; player: Player } | null {
    const room = this.rooms.get(roomId.toUpperCase());

    if (!room) {
      return null;
    }

    if (room.gameState !== 'waiting') {
      return null;
    }

    if (room.players.length >= room.maxPlayers) {
      return null;
    }

    const playerId = uuidv4();
    const playerNumber = room.players.length;

    const newPlayer: Player = {
      id: playerId,
      socketId,
      playerNumber,
      username,
      color: PLAYER_COLORS[playerNumber % PLAYER_COLORS.length],
      progress: 0,
      taps: 0,
      isReady: false,
      finished: false,
      finishPosition: null,
      finishTime: null,
      lastTapTime: 0,
    };

    room.players.push(newPlayer);
    this.playerRoomMap.set(socketId, roomId);

    return { room, player: newPlayer };
  }

  leaveRoom(socketId: string): { room: GameRoom; leftPlayerId: string } | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return null;

    const leftPlayerId = room.players[playerIndex].id;
    room.players.splice(playerIndex, 1);
    this.playerRoomMap.delete(socketId);

    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    // Reassign host if necessary
    if (room.hostId === leftPlayerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }

    return { room, leftPlayerId };
  }

  toggleReady(socketId: string, isReady: boolean): { room: GameRoom; playerId: string } | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'waiting') return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return null;

    player.isReady = isReady;

    return { room, playerId: player.id };
  }

  canStartGame(socketId: string): GameRoom | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if requester is host
    const player = room.players.find(p => p.socketId === socketId);
    if (!player || room.hostId !== player.id) return null;

    // Check if all players are ready and we have at least 2 players
    if (room.players.length < 2) return null;
    if (!room.players.every(p => p.isReady)) return null;

    return room;
  }

  startGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = 'countdown';
    room.finishedCount = 0;

    // Reset all players
    room.players.forEach(p => {
      p.progress = 0;
      p.taps = 0;
      p.finished = false;
      p.finishPosition = null;
      p.finishTime = null;
      p.lastTapTime = 0;
    });
  }

  setGamePlaying(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = 'playing';
    room.startTime = Date.now();
  }

  handleTap(socketId: string): {
    room: GameRoom;
    player: Player;
    finished: boolean;
  } | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player || player.finished) return null;

    // Rate limiting
    const now = Date.now();
    if (now - player.lastTapTime < TAP_COOLDOWN_MS) {
      return null;
    }
    player.lastTapTime = now;

    // Update progress
    player.taps += 1;
    player.progress = Math.min((player.taps / room.tapsToWin) * 100, 100);

    // Check if finished
    let finished = false;
    if (player.progress >= 100 && !player.finished) {
      player.finished = true;
      room.finishedCount += 1;
      player.finishPosition = room.finishedCount;
      player.finishTime = now;
      finished = true;
    }

    return { room, player, finished };
  }

  checkGameEnd(roomId: string, forceEnd: boolean = false): {
    ended: boolean;
    winners: Player[];
    allPlayers: Player[];
    gameDuration: number;
  } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Game ends when:
    // 1. For 2-player games: 1 player finishes (winner declared)
    // 2. For 3+ player games: 3 players finish OR all players finish
    // 3. Timer expired (forceEnd = true)
    const minWinnersNeeded = room.players.length === 2 ? 1 : Math.min(3, room.players.length);
    const gameEnded = forceEnd ||
      room.finishedCount >= room.players.length ||
      room.finishedCount >= minWinnersNeeded;

    if (gameEnded && room.gameState === 'playing') {
      room.gameState = 'finished';

      let winners: Player[];

      if (forceEnd) {
        // Timer expired - determine winners by most taps
        // First, mark all unfinished players with their positions based on tap count
        const unfinishedPlayers = room.players.filter(p => !p.finished);
        const finishedPlayers = room.players.filter(p => p.finished);

        // Sort unfinished players by taps (descending) - most taps = better position
        unfinishedPlayers.sort((a, b) => b.taps - a.taps);

        // If NO ONE finished (reached 100 taps), assign all positions by tap count
        if (finishedPlayers.length === 0) {
          // Everyone gets position based on tap count
          unfinishedPlayers.forEach((player, index) => {
            player.finishPosition = index + 1;
            player.finished = true;
          });
        } else {
          // Some players finished, assign remaining positions to unfinished players
          let nextPosition = finishedPlayers.length + 1;
          unfinishedPlayers.forEach(player => {
            player.finishPosition = nextPosition;
            player.finished = true;
            nextPosition++;
          });
        }

        // Winners are top 3 players (by finish position)
        winners = room.players
          .filter(p => p.finishPosition && p.finishPosition <= 3)
          .sort((a, b) => (a.finishPosition || 0) - (b.finishPosition || 0));

        console.log('Timer expired - Winners:', winners.map(w => ({ name: w.username, taps: w.taps, position: w.finishPosition })));
      } else {
        // Normal game end - winners are those who finished in top 3
        winners = room.players
          .filter(p => p.finished && p.finishPosition && p.finishPosition <= 3)
          .sort((a, b) => (a.finishPosition || 0) - (b.finishPosition || 0));
      }

      const gameDuration = room.startTime ? Date.now() - room.startTime : 0;

      return {
        ended: true,
        winners,
        allPlayers: room.players,
        gameDuration,
      };
    }

    return { ended: false, winners: [], allPlayers: room.players, gameDuration: 0 };
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  getRoomBySocketId(socketId: string): GameRoom | undefined {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  getPlayerBySocketId(socketId: string): Player | undefined {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return undefined;
    return room.players.find(p => p.socketId === socketId);
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }
}

export default new GameManager();
