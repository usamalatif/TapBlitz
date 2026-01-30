// Haptic Feedback Service
// Uses react-native-haptic-feedback for iOS and Vibration API for Android

import {Vibration, Platform} from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';
import {useUserStore} from '../store/userStore';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Haptic feedback options for iOS
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

class HapticService {
  private isSupported = true;

  trigger(type: HapticType = 'light') {
    const hapticEnabled = useUserStore.getState().hapticEnabled;
    if (!hapticEnabled) return;

    if (Platform.OS === 'ios') {
      // Use native iOS haptic feedback
      const iosHapticTypes: Record<HapticType, HapticFeedbackTypes> = {
        light: HapticFeedbackTypes.impactLight,
        medium: HapticFeedbackTypes.impactMedium,
        heavy: HapticFeedbackTypes.impactHeavy,
        success: HapticFeedbackTypes.notificationSuccess,
        warning: HapticFeedbackTypes.notificationWarning,
        error: HapticFeedbackTypes.notificationError,
      };
      ReactNativeHapticFeedback.trigger(iosHapticTypes[type], hapticOptions);
    } else {
      // Android - use Vibration API
      const durations: Record<HapticType, number> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: 40,
        warning: 50,
        error: 100,
      };
      Vibration.vibrate(durations[type] || 10);
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

    if (Platform.OS === 'ios') {
      // Use soft impact for rapid tapping on iOS
      ReactNativeHapticFeedback.trigger(
        HapticFeedbackTypes.soft,
        hapticOptions,
      );
    } else {
      // Android - minimal vibration
      Vibration.vibrate(5);
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
