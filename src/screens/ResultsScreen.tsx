import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {RootStackParamList, Player} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants/theme';
import {useGameStore} from '../store/gameStore';
import {getMedalEmoji, formatTime, getOrdinalSuffix} from '../utils/helpers';
import socketService from '../services/socketService';
import Podium from '../components/Podium';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;
type RoutePropType = RouteProp<RootStackParamList, 'Results'>;

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const {results, roomId} = route.params;

  const {currentPlayerId, resetGame, isHost} = useGameStore();

  const currentPlayer = results.allPlayers.find(p => p.id === currentPlayerId);
  const isWinner = currentPlayer?.finishPosition === 1;

  const handlePlayAgain = () => {
    // Request server to reset the room first
    socketService.requestPlayAgain();
    resetGame();
    navigation.replace('Lobby', {
      roomId,
      isHost,
      username: currentPlayer?.username || '',
    });
  };

  const handleNewGame = () => {
    socketService.leaveRoom();
    navigation.replace('Landing');
  };

  // Sort all players by finish position (finished players first, then by progress)
  const sortedPlayers = [...results.allPlayers].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.finishPosition || 0) - (b.finishPosition || 0);
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.progress - a.progress;
  });

  const renderPlayerResult = ({item, index}: {item: Player; index: number}) => {
    const isCurrentPlayer = item.id === currentPlayerId;
    const position = item.finishPosition || index + 1;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.playerRow,
          isCurrentPlayer && styles.currentPlayerRow,
        ]}>
        <View style={styles.positionContainer}>
          {item.finished && position <= 3 ? (
            <Text style={styles.medalEmoji}>{getMedalEmoji(position)}</Text>
          ) : (
            <Text style={styles.positionText}>{position}</Text>
          )}
        </View>

        <View
          style={[
            styles.playerColorDot,
            {backgroundColor: item.color},
          ]}
        />

        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {item.username}
            {isCurrentPlayer && ' (You)'}
          </Text>
          <Text style={styles.playerStats}>
            {item.taps} taps
            {item.finishTime &&
              ` · ${formatTime(item.finishTime - (results.gameDuration || 0))}`}
          </Text>
        </View>

        <Text style={styles.progressText}>
          {item.progress >= 100 ? '100%' : `${Math.round(item.progress)}%`}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Winner Announcement */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.header}>
        <Text style={styles.resultEmoji}>
          {isWinner ? '🏆' : currentPlayer?.finished ? '🎉' : '😅'}
        </Text>
        <Text style={styles.resultTitle}>
          {isWinner
            ? 'You Won!'
            : currentPlayer?.finished
            ? `${getOrdinalSuffix(currentPlayer.finishPosition || 0)} Place!`
            : 'Game Over!'}
        </Text>
        {currentPlayer && (
          <Text style={styles.resultSubtitle}>
            {currentPlayer.taps} taps
          </Text>
        )}
      </Animated.View>

      {/* Podium for top 3 */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={styles.podiumContainer}>
        <Podium winners={results.winners} currentPlayerId={currentPlayerId} />
      </Animated.View>

      {/* All Players List */}
      <View style={styles.allPlayersContainer}>
        <Text style={styles.allPlayersTitle}>All Players</Text>
        <FlatList
          data={sortedPlayers}
          renderItem={renderPlayerResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.playersList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handlePlayAgain}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleNewGame}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            New Game
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  resultTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  resultSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  podiumContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  allPlayersContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  allPlayersTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  playersList: {
    paddingBottom: SPACING.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  currentPlayerRow: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  positionContainer: {
    width: 36,
    alignItems: 'center',
  },
  positionText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  medalEmoji: {
    fontSize: 24,
  },
  playerColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  playerStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  actions: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
  },
});

export default ResultsScreen;
