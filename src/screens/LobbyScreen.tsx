import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, Player} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants/theme';
import {useGameStore} from '../store/gameStore';
import socketService from '../services/socketService';
import PlayerCard from '../components/PlayerCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lobby'>;
type RoutePropType = RouteProp<RootStackParamList, 'Lobby'>;

const LobbyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const {roomId, isHost} = route.params;

  const {
    players,
    maxPlayers,
    currentPlayerId,
    areAllPlayersReady,
    gameState,
  } = useGameStore();

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isReady = currentPlayer?.isReady || false;
  const canStart = isHost && areAllPlayersReady() && players.length >= 2;

  useEffect(() => {
    // Navigate to game when game starts
    if (gameState === 'countdown' || gameState === 'playing') {
      navigation.replace('Game', {roomId});
    }
  }, [gameState, navigation, roomId]);

  const handleToggleReady = () => {
    socketService.toggleReady(!isReady);
  };

  const handleStartGame = () => {
    if (canStart) {
      socketService.startGame();
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert('Leave Room', 'Are you sure you want to leave?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          socketService.leaveRoom();
          navigation.replace('Landing');
        },
      },
    ]);
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my TapBlitz game! Room code: ${roomId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderPlayer = ({item}: {item: Player}) => (
    <PlayerCard
      player={item}
      isCurrentPlayer={item.id === currentPlayerId}
      showReadyStatus
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Leave</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lobby</Text>
          {isHost && <Text style={styles.hostBadge}>HOST</Text>}
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Room Code */}
      <TouchableOpacity style={styles.roomCodeContainer} onPress={handleShareCode}>
        <Text style={styles.roomCodeLabel}>Room Code</Text>
        <Text style={styles.roomCode}>{roomId}</Text>
        <Text style={styles.tapToShare}>Tap to share</Text>
      </TouchableOpacity>

      {/* Players Count */}
      <View style={styles.playersHeader}>
        <Text style={styles.playersTitle}>Players</Text>
        <Text style={styles.playersCount}>
          {players.length} / {maxPlayers}
        </Text>
      </View>

      {/* Players List */}
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.playersList}
        showsVerticalScrollIndicator={false}
      />

      {/* Waiting for players message */}
      {players.length < 2 && (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            Waiting for at least 2 players to start...
          </Text>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {/* Ready Button */}
        <TouchableOpacity
          style={[
            styles.button,
            isReady ? styles.readyButton : styles.notReadyButton,
          ]}
          onPress={handleToggleReady}>
          <Text style={styles.buttonText}>
            {isReady ? '✓ Ready!' : 'Not Ready'}
          </Text>
        </TouchableOpacity>

        {/* Start Button (Host Only) */}
        {isHost && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              !canStart && styles.buttonDisabled,
            ]}
            onPress={handleStartGame}
            disabled={!canStart}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Not all ready message */}
      {isHost && players.length >= 2 && !areAllPlayersReady() && (
        <Text style={styles.waitingReadyText}>
          Waiting for all players to be ready...
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundMedium,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  hostBadge: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.secondary,
    backgroundColor: COLORS.backgroundMedium,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  headerRight: {
    width: 60,
  },
  roomCodeContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundMedium,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  roomCodeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  roomCode: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  tapToShare: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  playersTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  playersCount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  playersList: {
    paddingHorizontal: SPACING.md,
  },
  waitingContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomActions: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  readyButton: {
    backgroundColor: COLORS.success,
  },
  notReadyButton: {
    backgroundColor: COLORS.backgroundMedium,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.backgroundLight,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  waitingReadyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingBottom: SPACING.md,
  },
});

export default LobbyScreen;
