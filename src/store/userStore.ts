import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStore {
  // User preferences
  username: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  preferredMaxPlayers: number;

  // Stats
  totalGames: number;
  totalWins: number;
  totalTaps: number;
  bestTapSpeed: number;

  // Actions
  setUsername: (username: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setPreferredMaxPlayers: (maxPlayers: number) => void;

  // Stats actions
  incrementTotalGames: () => void;
  incrementTotalWins: () => void;
  addTaps: (taps: number) => void;
  updateBestTapSpeed: (speed: number) => void;
  resetStats: () => void;

  // Computed
  getWinRate: () => number;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      username: '',
      soundEnabled: true,
      hapticEnabled: true,
      preferredMaxPlayers: 4,
      totalGames: 0,
      totalWins: 0,
      totalTaps: 0,
      bestTapSpeed: 0,

      // Preference actions
      setUsername: username => set({username}),
      setSoundEnabled: soundEnabled => set({soundEnabled}),
      setHapticEnabled: hapticEnabled => set({hapticEnabled}),
      setPreferredMaxPlayers: preferredMaxPlayers => set({preferredMaxPlayers}),

      // Stats actions
      incrementTotalGames: () =>
        set(state => ({totalGames: state.totalGames + 1})),

      incrementTotalWins: () =>
        set(state => ({totalWins: state.totalWins + 1})),

      addTaps: taps => set(state => ({totalTaps: state.totalTaps + taps})),

      updateBestTapSpeed: speed =>
        set(state => ({
          bestTapSpeed: Math.max(state.bestTapSpeed, speed),
        })),

      resetStats: () =>
        set({
          totalGames: 0,
          totalWins: 0,
          totalTaps: 0,
          bestTapSpeed: 0,
        }),

      // Computed
      getWinRate: () => {
        const state = get();
        if (state.totalGames === 0) {
          return 0;
        }
        return Math.round((state.totalWins / state.totalGames) * 100);
      },
    }),
    {
      name: 'tapblitz-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
