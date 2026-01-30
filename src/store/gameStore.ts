import {create} from 'zustand';
import {GameState, Player, GameRoom, GameResults} from '../types/game.types';
import {GAME_CONFIG} from '../constants/theme';
import {getPlayerColor} from '../utils/helpers';

interface GameStore {
  // Connection state
  isConnected: boolean;
  socketId: string | null;

  // Room state
  roomId: string | null;
  isHost: boolean;
  players: Player[];
  maxPlayers: number;

  // Game state
  gameState: GameState;
  countdownValue: number | null;
  startTime: number | null;

  // Current player
  currentPlayerId: string | null;
  currentPlayerNumber: number | null;
  username: string;

  // Results
  results: GameResults | null;

  // Actions - Connection
  setConnected: (connected: boolean) => void;
  setSocketId: (socketId: string | null) => void;

  // Actions - Room
  setRoomId: (roomId: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setMaxPlayers: (maxPlayers: number) => void;

  // Actions - Players
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerProgress: (playerId: string, progress: number, taps: number) => void;
  setPlayerReady: (playerId: string, isReady: boolean) => void;
  setPlayerFinished: (
    playerId: string,
    position: number,
    finishTime: number,
  ) => void;

  // Actions - Game
  setGameState: (state: GameState) => void;
  setCountdownValue: (value: number | null) => void;
  setStartTime: (time: number | null) => void;
  setResults: (results: GameResults | null) => void;

  // Actions - Current Player
  setCurrentPlayer: (playerId: string, playerNumber: number) => void;
  setUsername: (username: string) => void;

  // Actions - Reset
  resetGame: () => void;
  resetRoom: () => void;
  resetAll: () => void;

  // Computed
  getCurrentPlayer: () => Player | undefined;
  getPlayerByNumber: (playerNumber: number) => Player | undefined;
  areAllPlayersReady: () => boolean;
  getFinishedPlayers: () => Player[];
}

const initialState = {
  isConnected: false,
  socketId: null,
  roomId: null,
  isHost: false,
  players: [],
  maxPlayers: GAME_CONFIG.MAX_PLAYERS,
  gameState: 'idle' as GameState,
  countdownValue: null,
  startTime: null,
  currentPlayerId: null,
  currentPlayerNumber: null,
  username: '',
  results: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Connection actions
  setConnected: connected => set({isConnected: connected}),
  setSocketId: socketId => set({socketId}),

  // Room actions
  setRoomId: roomId => set({roomId}),
  setIsHost: isHost => set({isHost}),
  setMaxPlayers: maxPlayers => set({maxPlayers}),

  // Player actions
  setPlayers: players => set({players}),

  addPlayer: player =>
    set(state => ({
      players: [...state.players, player],
    })),

  removePlayer: playerId =>
    set(state => ({
      players: state.players.filter(p => p.id !== playerId),
    })),

  updatePlayerProgress: (playerId, progress, taps) =>
    set(state => ({
      players: state.players.map(p =>
        p.id === playerId ? {...p, progress, taps} : p,
      ),
    })),

  setPlayerReady: (playerId, isReady) =>
    set(state => ({
      players: state.players.map(p =>
        p.id === playerId ? {...p, isReady} : p,
      ),
    })),

  setPlayerFinished: (playerId, position, finishTime) =>
    set(state => ({
      players: state.players.map(p =>
        p.id === playerId
          ? {...p, finished: true, finishPosition: position, finishTime}
          : p,
      ),
    })),

  // Game actions
  setGameState: gameState => set({gameState}),
  setCountdownValue: countdownValue => set({countdownValue}),
  setStartTime: startTime => set({startTime}),
  setResults: results => set({results}),

  // Current player actions
  setCurrentPlayer: (playerId, playerNumber) =>
    set({
      currentPlayerId: playerId,
      currentPlayerNumber: playerNumber,
    }),

  setUsername: username => set({username}),

  // Reset actions
  resetGame: () =>
    set(state => ({
      gameState: 'waiting',
      countdownValue: null,
      startTime: null,
      results: null,
      players: state.players.map(p => ({
        ...p,
        progress: 0,
        taps: 0,
        finished: false,
        finishPosition: null,
        finishTime: null,
        isReady: false,
      })),
    })),

  resetRoom: () =>
    set({
      roomId: null,
      isHost: false,
      players: [],
      gameState: 'idle',
      countdownValue: null,
      startTime: null,
      currentPlayerId: null,
      currentPlayerNumber: null,
      results: null,
    }),

  resetAll: () => set(initialState),

  // Computed
  getCurrentPlayer: () => {
    const state = get();
    return state.players.find(p => p.id === state.currentPlayerId);
  },

  getPlayerByNumber: playerNumber => {
    const state = get();
    return state.players.find(p => p.playerNumber === playerNumber);
  },

  areAllPlayersReady: () => {
    const state = get();
    return (
      state.players.length >= 2 && state.players.every(p => p.isReady)
    );
  },

  getFinishedPlayers: () => {
    const state = get();
    return state.players
      .filter(p => p.finished && p.finishPosition !== null)
      .sort((a, b) => (a.finishPosition || 0) - (b.finishPosition || 0));
  },
}));
