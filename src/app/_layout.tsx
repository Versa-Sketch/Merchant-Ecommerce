import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider } from '../Common/providers/StoreProvider';
import { AuthGuard } from '../Common/components/AuthGuard';
import { rootStore } from '../stores/RootStore';

export default function RootLayout() {
  return (
    <StoreProvider value={rootStore}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="(auth)" options={{ animation: 'fade', gestureEnabled: false }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="analytics/index" />
              <Stack.Screen name="customers/index" />
              <Stack.Screen name="delivery/index" />
              <Stack.Screen name="payments/index" />
              <Stack.Screen name="profile/index" />
              <Stack.Screen name="settings/index" />
              <Stack.Screen name="support/index" />
            </Stack>
          </AuthGuard>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StoreProvider>
  );
}
