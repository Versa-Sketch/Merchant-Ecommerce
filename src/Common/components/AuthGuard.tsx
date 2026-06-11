import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, useSegments } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '../hooks/useStores';
import { Colors } from '../../theme/colors';

// Route groups/segments reachable without an authenticated session.
// '' covers the root index route (the splash screen), which performs its
// own auth check and redirect.
const PUBLIC_SEGMENTS = new Set(['', '(auth)']);

export const AuthGuard = observer(function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionStore } = useStores();
  const segments = useSegments();
  const rootSegment = segments[0] ?? '';
  const isPublicRoute = PUBLIC_SEGMENTS.has(rootSegment);

  useEffect(() => {
    if (!sessionStore.isAuthenticated) {
      if (!isPublicRoute) router.replace('/(auth)/welcome');
      return;
    }

    // Restore the session on cold start / refresh by re-validating the token
    // against /accounts/me/. A 401/403 here logs the user out automatically.
    if (!sessionStore.userFetched && !sessionStore.userLoading) {
      sessionStore.fetchUser();
    }
  }, [sessionStore.isAuthenticated, sessionStore.userFetched, sessionStore.userLoading, isPublicRoute]);

  if (!sessionStore.isAuthenticated) {
    return isPublicRoute ? <>{children}</> : null;
  }

  // Block protected screens until the authenticated user has been resolved.
  if (!isPublicRoute && !sessionStore.userFetched) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
});

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
