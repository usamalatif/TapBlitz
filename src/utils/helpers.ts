import {v4 as uuidv4} from 'uuid';
import {PLAYER_COLORS} from '../constants/theme';

export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const generatePlayerId = (): string => {
  return uuidv4();
};

export const getPlayerColor = (playerNumber: number): string => {
  return PLAYER_COLORS[playerNumber % PLAYER_COLORS.length];
};

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  return `${seconds}.${ms.toString().padStart(3, '0')}s`;
};

export const getOrdinalSuffix = (position: number): string => {
  const j = position % 10;
  const k = position % 100;

  if (j === 1 && k !== 11) {
    return position + 'st';
  }
  if (j === 2 && k !== 12) {
    return position + 'nd';
  }
  if (j === 3 && k !== 13) {
    return position + 'rd';
  }
  return position + 'th';
};

export const getMedalEmoji = (position: number): string => {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
