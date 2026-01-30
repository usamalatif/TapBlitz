import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {Player} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants/theme';

interface ProgressBarProps {
  player: Player;
  isCurrentPlayer: boolean;
  totalPlayers: number;
  position: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  player,
  isCurrentPlayer,
  totalPlayers,
  position,
}) => {
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(`${player.progress}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const glowOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(player.progress, [0, 50, 100], [0.3, 0.6, 1]),
    };
  });

  return (
    <View style={styles.container}>
      {/* Player indicator at top */}
      <View style={styles.playerIndicator}>
        <View
          style={[
            styles.playerDot,
            {backgroundColor: player.color},
            isCurrentPlayer && styles.currentPlayerDot,
          ]}
        />
        <Text
          style={[
            styles.playerNumber,
            isCurrentPlayer && styles.currentPlayerText,
          ]}
          numberOfLines={1}>
          {player.username.substring(0, 3).toUpperCase()}
        </Text>
      </View>

      {/* Track */}
      <View style={styles.track}>
        {/* Progress fill */}
        <Animated.View
          style={[
            styles.fill,
            {backgroundColor: player.color},
            progressAnimatedStyle,
          ]}>
          {/* Glow effect for current player */}
          {isCurrentPlayer && (
            <Animated.View
              style={[
                styles.glow,
                {backgroundColor: player.color},
                glowOpacity,
              ]}
            />
          )}
        </Animated.View>

        {/* Finish indicator */}
        {player.finished && (
          <View style={styles.finishBadge}>
            <Text style={styles.finishText}>
              {player.finishPosition === 1 ? '🥇' :
               player.finishPosition === 2 ? '🥈' :
               player.finishPosition === 3 ? '🥉' : '✓'}
            </Text>
          </View>
        )}
      </View>

      {/* Tap count */}
      <Text style={[styles.tapCount, isCurrentPlayer && styles.currentPlayerText]}>
        {player.taps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  playerIndicator: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  playerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 2,
  },
  currentPlayerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  playerNumber: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  currentPlayerText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  track: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
  },
  finishBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  finishText: {
    fontSize: 20,
  },
  tapCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
});

export default ProgressBar;
