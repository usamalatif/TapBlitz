import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Player} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants/theme';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  showReadyStatus?: boolean;
  showProgress?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentPlayer,
  showReadyStatus = false,
  showProgress = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        isCurrentPlayer && styles.currentPlayerContainer,
      ]}>
      {/* Player Color Indicator */}
      <View style={[styles.colorBar, {backgroundColor: player.color}]} />

      {/* Player Info */}
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.username}>
            {player.username}
            {isCurrentPlayer && ' (You)'}
          </Text>
          <Text style={styles.playerNumber}>Player {player.playerNumber + 1}</Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          {showReadyStatus && (
            <View
              style={[
                styles.readyBadge,
                player.isReady ? styles.readyActive : styles.readyInactive,
              ]}>
              <Text
                style={[
                  styles.readyText,
                  player.isReady ? styles.readyTextActive : styles.readyTextInactive,
                ]}>
                {player.isReady ? '✓ Ready' : 'Waiting'}
              </Text>
            </View>
          )}

          {showProgress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {Math.round(player.progress)}%
              </Text>
              <Text style={styles.tapsText}>{player.taps} taps</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  currentPlayerContainer: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  colorBar: {
    width: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  mainInfo: {
    flex: 1,
  },
  username: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  playerNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  readyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  readyActive: {
    backgroundColor: COLORS.success,
  },
  readyInactive: {
    backgroundColor: COLORS.backgroundLight,
  },
  readyText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  readyTextActive: {
    color: COLORS.white,
  },
  readyTextInactive: {
    color: COLORS.textMuted,
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  tapsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});

export default PlayerCard;
