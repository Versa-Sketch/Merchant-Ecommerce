import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider } from '../Common/providers/StoreProvider';
import { rootStore } from '../stores/RootStore';
import { DevInspector } from '../components/dev/DevInspector';

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
          {/* Dev-only element inspector — zero cost in production */}
          {__DEV__ && <DevInspector />}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StoreProvider>
  );
}
