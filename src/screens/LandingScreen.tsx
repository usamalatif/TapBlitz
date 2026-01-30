import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types/game.types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, GAME_CONFIG} from '../constants/theme';
import {useGameStore} from '../store/gameStore';
import {useUserStore} from '../store/userStore';
import socketService from '../services/socketService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

const LandingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {isConnected, setUsername: setGameUsername} = useGameStore();
  const {username: savedUsername, setUsername: saveUsername, preferredMaxPlayers, setPreferredMaxPlayers} = useUserStore();

  const [username, setUsername] = useState(savedUsername || '');
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(preferredMaxPlayers);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Connect to socket server on mount
    socketService.connect();
  }, []);

  const handleCreateGame = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server. Please wait...');
      return;
    }

    saveUsername(username.trim());
    setPreferredMaxPlayers(maxPlayers);
    setGameUsername(username.trim());

    socketService.createRoom(username.trim(), maxPlayers);
  };

  const handleJoinGame = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server. Please wait...');
      return;
    }

    saveUsername(username.trim());
    setGameUsername(username.trim());

    socketService.joinRoom(roomCode.trim().toUpperCase(), username.trim());
  };

  const renderPlayerCountSelector = () => {
    const options = [];
    for (let i = GAME_CONFIG.MIN_PLAYERS; i <= GAME_CONFIG.MAX_PLAYERS; i++) {
      options.push(i);
    }

    return (
      <View style={styles.playerCountContainer}>
        <Text style={styles.label}>Number of Players</Text>
        <View style={styles.playerCountRow}>
          {options.map(num => (
            <TouchableOpacity
              key={num}
              style={[
                styles.playerCountButton,
                maxPlayers === num && styles.playerCountButtonActive,
              ]}
              onPress={() => setMaxPlayers(num)}>
              <Text
                style={[
                  styles.playerCountText,
                  maxPlayers === num && styles.playerCountTextActive,
                ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={styles.title}>TapBlitz</Text>
          <Text style={styles.subtitle}>Race to 100 taps!</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: isConnected ? COLORS.success : COLORS.danger},
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={setUsername}
            maxLength={20}
            autoCapitalize="words"
          />
        </View>

        {/* Create Game Section */}
        {!isJoining ? (
          <>
            {renderPlayerCountSelector()}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateGame}
              disabled={!isConnected}>
              <Text style={styles.buttonText}>Create Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setIsJoining(true)}>
              <Text style={styles.linkText}>Have a room code? Join game</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Join Game Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Room Code</Text>
              <TextInput
                style={[styles.input, styles.roomCodeInput]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={COLORS.textMuted}
                value={roomCode}
                onChangeText={text => setRoomCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleJoinGame}
              disabled={!isConnected}>
              <Text style={styles.buttonText}>Join Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setIsJoining(false)}>
              <Text style={styles.linkText}>Back to create game</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.backgroundMedium,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
  },
  roomCodeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  playerCountContainer: {
    marginBottom: SPACING.lg,
  },
  playerCountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  playerCountButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
  },
  playerCountButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  playerCountText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  playerCountTextActive: {
    color: COLORS.white,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  linkButton: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
});

export default LandingScreen;
