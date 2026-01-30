// Haptic Feedback Service
// Note: For full haptic support on iOS, install react-native-haptic-feedback
// This implementation uses the built-in Vibration API as fallback

import {Vibration, Platform} from 'react-native';
import {useUserStore} from '../store/userStore';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class HapticService {
  private isSupported = true;

  trigger(type: HapticType = 'light') {
    const hapticEnabled = useUserStore.getState().hapticEnabled;
    if (!hapticEnabled) return;

    // Use built-in Vibration API
    // Duration in milliseconds
    const durations: Record<HapticType, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: 40,
      warning: 50,
      error: 100,
    };

    const duration = durations[type] || 10;

    if (Platform.OS === 'android') {
      Vibration.vibrate(duration);
    } else {
      // iOS - use pattern for simple vibration
      // For better iOS haptics, use react-native-haptic-feedback
      Vibration.vibrate([0, duration]);
    }
  }

  // Convenience methods
  light() {
    this.trigger('light');
  }

  medium() {
    this.trigger('medium');
  }

  heavy() {
    this.trigger('heavy');
  }

  success() {
    this.trigger('success');
  }

  warning() {
    this.trigger('warning');
  }

  error() {
    this.trigger('error');
  }

  // Tap feedback - optimized for rapid tapping
  tap() {
    const hapticEnabled = useUserStore.getState().hapticEnabled;
    if (!hapticEnabled) return;

    if (Platform.OS === 'android') {
      Vibration.vibrate(5);
    } else {
      // Minimal vibration for iOS
      Vibration.vibrate([0, 5]);
    }
  }

  // Countdown tick
  countdownTick() {
    this.medium();
  }

  // Player finished
  playerFinished(isWinner: boolean) {
    if (isWinner) {
      this.success();
    } else {
      this.medium();
    }
  }
}

export default new HapticService();
