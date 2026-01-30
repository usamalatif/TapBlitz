import React, {useRef, useEffect} from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/game.types';
import {COLORS} from '../constants/theme';
import socketService from '../services/socketService';

import LandingScreen from '../screens/LandingScreen';
import LobbyScreen from '../screens/LobbyScreen';
import GameScreen from '../screens/GameScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    socketService.setNavigationRef(navigationRef);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: COLORS.backgroundDark},
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            gestureEnabled: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
