export type GameState = 'idle' | 'waiting' | 'countdown' | 'playing' | 'finished';

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
}

export interface GameRoom {
  roomId: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameState: GameState;
  startTime: number | null;
  tapsToWin: number;
  countdownValue: number | null;
}

export interface GameConfig {
  tapsToWin: number;
  maxPlayers: number;
  countdownSeconds: number;
  gameTimeoutSeconds: number;
}

export interface GameResults {
  winners: Player[];
  allPlayers: Player[];
  gameDuration: number;
}

export type RootStackParamList = {
  Landing: undefined;
  Lobby: {
    roomId: string;
    isHost: boolean;
    username: string;
  };
  Game: {
    roomId: string;
  };
  Results: {
    results: GameResults;
    roomId: string;
  };
};
