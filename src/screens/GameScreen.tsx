import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {RootStackParamList} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, GAME_CONFIG} from '../constants/theme';
import {useGameStore} from '../store/gameStore';
import socketService from '../services/socketService';
import hapticService from '../services/hapticService';
import ProgressBar from '../components/ProgressBar';
import Countdown from '../components/Countdown';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;
type RoutePropType = RouteProp<RootStackParamList, 'Game'>;

const {width, height} = Dimensions.get('window');

const GameScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const {roomId} = route.params;

  const {
    players,
    currentPlayerId,
    gameState,
    countdownValue,
    results,
  } = useGameStore();

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const tapScale = useSharedValue(1);

  // Navigate to results when game ends
  useEffect(() => {
    if (gameState === 'finished' && results) {
      navigation.replace('Results', {results, roomId});
    }
  }, [gameState, results, navigation, roomId]);

  const handleTap = useCallback(() => {
    if (gameState !== 'playing') {
      return;
    }

    if (currentPlayer?.finished) {
      return;
    }

    // Haptic feedback
    hapticService.tap();

    // Animate tap
    tapScale.value = withSequence(
      withTiming(0.95, {duration: 50}),
      withSpring(1, {damping: 10, stiffness: 400}),
    );

    // Send tap to server
    socketService.sendTap();
  }, [gameState, currentPlayer, tapScale]);

  const tapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: tapScale.value}],
  }));

  // Sort players by progress for display
  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress);

  return (
    <View style={styles.container}>
      {/* Countdown Overlay */}
      {gameState === 'countdown' && countdownValue !== null && (
        <Countdown value={countdownValue} />
      )}

      {/* Header with tap count */}
      <View style={styles.header}>
        <Text style={styles.playerName}>
          {currentPlayer?.username || 'Player'}
        </Text>
        <View style={styles.tapCountContainer}>
          <Text style={styles.tapCount}>{currentPlayer?.taps || 0}</Text>
          <Text style={styles.tapLabel}>TAPS</Text>
        </View>
        <Text style={styles.targetText}>
          Goal: {GAME_CONFIG.TAPS_TO_WIN}
        </Text>
      </View>

      {/* Race Track */}
      <View style={styles.raceTrack}>
        {/* Finish Line */}
        <View style={styles.finishLine}>
          <Text style={styles.finishText}>🏁 FINISH</Text>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressBarsContainer}>
          {sortedPlayers.map((player, index) => (
            <ProgressBar
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayerId}
              totalPlayers={players.length}
              position={index}
            />
          ))}
        </View>

        {/* Start Line */}
        <View style={styles.startLine}>
          <Text style={styles.startText}>START</Text>
        </View>
      </View>

      {/* Tap Area */}
      <Animated.View style={[styles.tapAreaContainer, tapAnimatedStyle]}>
        <Pressable
          style={({pressed}) => [
            styles.tapArea,
            pressed && styles.tapAreaPressed,
            currentPlayer?.finished && styles.tapAreaFinished,
          ]}
          onPress={handleTap}
          disabled={gameState !== 'playing' || currentPlayer?.finished}>
          {currentPlayer?.finished ? (
            <View style={styles.finishedContainer}>
              <Text style={styles.finishedEmoji}>🎉</Text>
              <Text style={styles.finishedText}>
                {currentPlayer.finishPosition === 1
                  ? 'WINNER!'
                  : `${currentPlayer.finishPosition}${getOrdinalSuffix(currentPlayer.finishPosition || 0)} Place!`}
              </Text>
            </View>
          ) : gameState === 'playing' ? (
            <>
              <Text style={styles.tapText}>TAP!</Text>
              <Text style={styles.tapSubtext}>Tap anywhere!</Text>
            </>
          ) : (
            <Text style={styles.waitingText}>Get Ready...</Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  playerName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tapCountContainer: {
    alignItems: 'center',
  },
  tapCount: {
    fontSize: FONT_SIZES.giant,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  tapLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  targetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  raceTrack: {
    flex: 1,
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundMedium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishLine: {
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
  },
  finishText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  progressBarsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  startLine: {
    height: 30,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: COLORS.textMuted,
  },
  startText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  tapAreaContainer: {
    padding: SPACING.md,
  },
  tapArea: {
    height: 150,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapAreaPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  tapAreaFinished: {
    backgroundColor: COLORS.success,
  },
  tapText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tapSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  waitingText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    opacity: 0.8,
  },
  finishedContainer: {
    alignItems: 'center',
  },
  finishedEmoji: {
    fontSize: 48,
  },
  finishedText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
});

export default GameScreen;
