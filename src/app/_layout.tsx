import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider, rootStore } from '../stores/RootStore';

export default function RootLayout() {
  return (
    <StoreProvider value={rootStore}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StoreProvider>
  );
}
