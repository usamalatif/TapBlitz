export type GameState = 'waiting' | 'countdown' | 'playing' | 'finished';

export interface Player {
  id: string;
  socketId: string;
  playerNumber: number;
  username: string;
  color: string;
  progress: number;
  taps: number;
  isReady: boolean;
  finished: boolean;
  finishPosition: number | null;
  finishTime: number | null;
  lastTapTime: number;
}

export interface GameRoom {
  roomId: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameState: GameState;
  startTime: number | null;
  tapsToWin: number;
  finishedCount: number;
}

export interface ServerToClientEvents {
  'room-created': (data: { roomId: string; playerId: string }) => void;
  'room-joined': (data: { roomId: string; playerId: string; playerNumber: number }) => void;
  'room-updated': (room: GameRoom) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-ready-changed': (data: { playerId: string; isReady: boolean }) => void;
  'countdown-tick': (value: number) => void;
  'game-started': () => void;
  'player-progress': (data: { playerId: string; progress: number; taps: number }) => void;
  'player-finished': (data: { playerId: string; position: number; finishTime: number }) => void;
  'game-ended': (data: { winners: Player[]; allPlayers: Player[]; gameDuration: number }) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'create-room': (data: { username: string; maxPlayers: number }) => void;
  'join-room': (data: { roomId: string; username: string }) => void;
  'leave-room': () => void;
  'toggle-ready': (isReady: boolean) => void;
  'start-game': () => void;
  'tap': () => void;
}
