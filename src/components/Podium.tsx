import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {Player} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants/theme';
import {getMedalEmoji} from '../utils/helpers';

interface PodiumProps {
  winners: Player[];
  currentPlayerId: string | null;
}

const Podium: React.FC<PodiumProps> = ({winners, currentPlayerId}) => {
  const first = winners.find(p => p.finishPosition === 1);
  const second = winners.find(p => p.finishPosition === 2);
  const third = winners.find(p => p.finishPosition === 3);

  const renderPodiumSpot = (
    player: Player | undefined,
    position: number,
    height: number,
    delay: number,
  ) => {
    if (!player) {
      return (
        <View style={[styles.podiumSpot, {height}]}>
          <View style={[styles.podiumBlock, styles.emptyPodium, {height}]} />
        </View>
      );
    }

    const isCurrentPlayer = player.id === currentPlayerId;

    return (
      <Animated.View
        entering={FadeInUp.delay(delay).springify()}
        style={styles.podiumSpot}>
        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text style={styles.medal}>{getMedalEmoji(position)}</Text>
          <View
            style={[
              styles.avatarCircle,
              {backgroundColor: player.color},
              isCurrentPlayer && styles.currentPlayerAvatar,
            ]}>
            <Text style={styles.avatarText}>
              {player.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            style={[
              styles.playerName,
              isCurrentPlayer && styles.currentPlayerName,
            ]}
            numberOfLines={1}>
            {player.username}
          </Text>
          <Text style={styles.tapCount}>{player.taps} taps</Text>
        </View>

        {/* Podium Block */}
        <View
          style={[
            styles.podiumBlock,
            {height, backgroundColor: getPodiumColor(position)},
          ]}>
          <Text style={styles.positionText}>{position}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Second Place (Left) */}
      {renderPodiumSpot(second, 2, 80, 200)}

      {/* First Place (Center) */}
      {renderPodiumSpot(first, 1, 120, 0)}

      {/* Third Place (Right) */}
      {renderPodiumSpot(third, 3, 60, 400)}
    </View>
  );
};

const getPodiumColor = (position: number): string => {
  switch (position) {
    case 1:
      return '#FFD700'; // Gold
    case 2:
      return '#C0C0C0'; // Silver
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return COLORS.backgroundMedium;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingTop: SPACING.xl,
  },
  podiumSpot: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    width: 90,
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  medal: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  currentPlayerAvatar: {
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  playerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 80,
  },
  currentPlayerName: {
    color: COLORS.primary,
  },
  tapCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  podiumBlock: {
    width: '100%',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPodium: {
    backgroundColor: COLORS.backgroundMedium,
    opacity: 0.5,
  },
  positionText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.backgroundDark,
  },
});

export default Podium;
