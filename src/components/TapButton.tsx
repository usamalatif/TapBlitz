import React from 'react';
import {StyleSheet, Pressable, Text, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../constants/theme';

interface TapButtonProps {
  onTap: () => void;
  disabled?: boolean;
  tapCount?: number;
  finished?: boolean;
  finishPosition?: number | null;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TapButton: React.FC<TapButtonProps> = ({
  onTap,
  disabled = false,
  tapCount = 0,
  finished = false,
  finishPosition = null,
}) => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(COLORS.primary);

  const handlePressIn = () => {
    if (disabled || finished) return;
    scale.value = withTiming(0.95, {duration: 50});
  };

  const handlePressOut = () => {
    if (disabled || finished) return;
    scale.value = withSpring(1, {damping: 10, stiffness: 400});
  };

  const handlePress = () => {
    if (disabled || finished) return;

    // Quick pulse animation
    scale.value = withSequence(
      withTiming(0.92, {duration: 30}),
      withSpring(1, {damping: 10, stiffness: 500}),
    );

    onTap();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <AnimatedPressable
      style={[
        styles.button,
        finished && styles.finishedButton,
        disabled && !finished && styles.disabledButton,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || finished}>
      {finished ? (
        <View style={styles.finishedContent}>
          <Text style={styles.finishedEmoji}>
            {finishPosition === 1 ? '🏆' : '🎉'}
          </Text>
          <Text style={styles.finishedText}>
            {finishPosition === 1
              ? 'WINNER!'
              : `${finishPosition}${getOrdinalSuffix(finishPosition || 0)} Place!`}
          </Text>
        </View>
      ) : disabled ? (
        <Text style={styles.waitingText}>Get Ready...</Text>
      ) : (
        <>
          <Text style={styles.tapText}>TAP!</Text>
          <Text style={styles.tapSubtext}>Tap anywhere to race!</Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 150,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  finishedButton: {
    backgroundColor: COLORS.success,
  },
  disabledButton: {
    backgroundColor: COLORS.backgroundMedium,
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
    marginTop: SPACING.xs,
  },
  waitingText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  finishedContent: {
    alignItems: 'center',
  },
  finishedEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  finishedText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default TapButton;
