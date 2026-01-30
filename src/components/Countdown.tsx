import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {COLORS, FONT_SIZES} from '../constants/theme';

interface CountdownProps {
  value: number;
}

const {width, height} = Dimensions.get('window');

const Countdown: React.FC<CountdownProps> = ({value}) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    scale.value = withSequence(
      withTiming(0.5, {duration: 0}),
      withSpring(1.2, {damping: 8, stiffness: 100}),
      withSpring(1, {damping: 10, stiffness: 200}),
    );
    opacity.value = withSequence(
      withTiming(0, {duration: 0}),
      withTiming(1, {duration: 150}),
    );

    // Animate out before next value
    const timer = setTimeout(() => {
      opacity.value = withTiming(0.3, {duration: 200});
      scale.value = withTiming(0.8, {duration: 200});
    }, 700);

    return () => clearTimeout(timer);
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  const getDisplayValue = () => {
    if (value === 0) {
      return 'GO!';
    }
    return value.toString();
  };

  const getColor = () => {
    switch (value) {
      case 3:
        return COLORS.danger;
      case 2:
        return COLORS.warning;
      case 1:
        return COLORS.success;
      case 0:
        return COLORS.primary;
      default:
        return COLORS.textPrimary;
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.countdownContainer, animatedStyle]}>
        <Text style={[styles.countdownText, {color: getColor()}]}>
          {getDisplayValue()}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 8,
  },
});

export default Countdown;
