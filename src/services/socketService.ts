import {io, Socket} from 'socket.io-client';
import {useGameStore} from '../store/gameStore';
import {Player, GameRoom, GameResults} from '../types/game.types';
import {Alert} from 'react-native';

// Update this URL to your server address
// Use your machine's local IP for physical device testing
const SERVER_URL = __DEV__
  ? 'http://192.168.1.33:3001' // For development (your machine's IP)
  : 'https://your-production-server.com'; // For production

interface ServerToClientEvents {
  'room-created': (data: {roomId: string; playerId: string}) => void;
  'room-joined': (data: {
    roomId: string;
    playerId: string;
    playerNumber: number;
  }) => void;
  'room-updated': (room: GameRoom) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-ready-changed': (data: {playerId: string; isReady: boolean}) => void;
  'countdown-tick': (value: number) => void;
  'game-started': () => void;
  'player-progress': (data: {
    playerId: string;
    progress: number;
    taps: number;
  }) => void;
  'player-finished': (data: {
    playerId: string;
    position: number;
    finishTime: number;
  }) => void;
  'game-ended': (data: {
    winners: Player[];
    allPlayers: Player[];
    gameDuration: number;
  }) => void;
  error: (message: string) => void;
}

interface ClientToServerEvents {
  'create-room': (data: {username: string; maxPlayers: number}) => void;
  'join-room': (data: {roomId: string; username: string}) => void;
  'leave-room': () => void;
  'toggle-ready': (isReady: boolean) => void;
  'start-game': () => void;
  tap: () => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private navigationRef: any = null;

  setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useGameStore.getState().setConnected(false);
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    const store = useGameStore.getState();

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      useGameStore.getState().setConnected(true);
      useGameStore.getState().setSocketId(this.socket?.id || null);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      useGameStore.getState().setConnected(false);
    });

    this.socket.on('connect_error', error => {
      console.error('Connection error:', error.message);
      useGameStore.getState().setConnected(false);
    });

    // Room events
    this.socket.on('room-created', ({roomId, playerId}) => {
      console.log('Room created:', roomId);
      const gameStore = useGameStore.getState();
      gameStore.setRoomId(roomId);
      gameStore.setIsHost(true);
      gameStore.setCurrentPlayer(playerId, 0);
      gameStore.setGameState('waiting');

      // Navigate to lobby
      if (this.navigationRef?.current) {
        this.navigationRef.current.navigate('Lobby', {
          roomId,
          isHost: true,
          username: gameStore.username,
        });
      }
    });

    this.socket.on('room-joined', ({roomId, playerId, playerNumber}) => {
      console.log('Joined room:', roomId);
      const gameStore = useGameStore.getState();
      gameStore.setRoomId(roomId);
      gameStore.setIsHost(false);
      gameStore.setCurrentPlayer(playerId, playerNumber);
      gameStore.setGameState('waiting');

      // Navigate to lobby
      if (this.navigationRef?.current) {
        this.navigationRef.current.navigate('Lobby', {
          roomId,
          isHost: false,
          username: gameStore.username,
        });
      }
    });

    this.socket.on('room-updated', room => {
      const gameStore = useGameStore.getState();
      gameStore.setPlayers(room.players);
      gameStore.setMaxPlayers(room.maxPlayers);
      gameStore.setGameState(room.gameState);
    });

    this.socket.on('player-joined', player => {
      console.log('Player joined:', player.username);
      useGameStore.getState().addPlayer(player);
    });

    this.socket.on('player-left', playerId => {
      console.log('Player left:', playerId);
      useGameStore.getState().removePlayer(playerId);
    });

    this.socket.on('player-ready-changed', ({playerId, isReady}) => {
      useGameStore.getState().setPlayerReady(playerId, isReady);
    });

    // Game events
    this.socket.on('countdown-tick', value => {
      console.log('Countdown:', value);
      const gameStore = useGameStore.getState();
      gameStore.setCountdownValue(value);
      if (value === 3) {
        gameStore.setGameState('countdown');
      }
    });

    this.socket.on('game-started', () => {
      console.log('Game started!');
      const gameStore = useGameStore.getState();
      gameStore.setCountdownValue(null);
      gameStore.setGameState('playing');
      gameStore.setStartTime(Date.now());
    });

    this.socket.on('player-progress', ({playerId, progress, taps}) => {
      useGameStore.getState().updatePlayerProgress(playerId, progress, taps);
    });

    this.socket.on('player-finished', ({playerId, position, finishTime}) => {
      console.log('Player finished:', playerId, 'Position:', position);
      useGameStore.getState().setPlayerFinished(playerId, position, finishTime);
    });

    this.socket.on('game-ended', ({winners, allPlayers, gameDuration}) => {
      console.log('Game ended!');
      const gameStore = useGameStore.getState();
      gameStore.setGameState('finished');
      gameStore.setResults({
        winners,
        allPlayers,
        gameDuration,
      });
    });

    // Error handling
    this.socket.on('error', message => {
      console.error('Socket error:', message);
      Alert.alert('Error', message);
    });
  }

  // Room actions
  createRoom(username: string, maxPlayers: number) {
    if (!this.socket?.connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }
    this.socket.emit('create-room', {username, maxPlayers});
  }

  joinRoom(roomId: string, username: string) {
    if (!this.socket?.connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }
    this.socket.emit('join-room', {roomId: roomId.toUpperCase(), username});
  }

  leaveRoom() {
    if (!this.socket?.connected) return;
    this.socket.emit('leave-room');
    useGameStore.getState().resetRoom();
  }

  // Game actions
  toggleReady(isReady: boolean) {
    if (!this.socket?.connected) return;
    this.socket.emit('toggle-ready', isReady);
  }

  startGame() {
    if (!this.socket?.connected) return;
    this.socket.emit('start-game');
  }

  sendTap() {
    if (!this.socket?.connected) return;
    this.socket.emit('tap');
  }
}

export default new SocketService();
