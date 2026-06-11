import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useStores } from '../Common/hooks/useStores';
import { Colors } from '../theme/colors';
import { routeToOnboardingStep } from '../Onboarding/utils/routing';

function ShopkeeperLogo({ size = 72 }: { size?: number }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect width={size} height={size} rx={size * 0.26} fill={Colors.surface} />
      <Rect
        x={size * 0.18} y={size * 0.18}
        width={size * 0.64} height={size * 0.64}
        rx={size * 0.16}
        fill={Colors.primary}
      />
      {/* "S" visual shorthand: two overlapping circles */}
      <Circle cx={r - size * 0.06} cy={r - size * 0.1} r={size * 0.16} fill={Colors.white} opacity="0.9" />
      <Circle cx={r + size * 0.06} cy={r + size * 0.1} r={size * 0.16} fill={Colors.white} opacity="0.6" />
    </Svg>
  );
}

const SplashScreen = observer(function SplashScreen() {
  const { sessionStore, shopSetupStore } = useStores();

  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pop
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 6,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
      // App name
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 320,
        delay: 60,
        useNativeDriver: true,
      }),
      // Tagline
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        delay: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold then fade out and redirect
      setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(async () => {
          if (sessionStore.isAuthenticated) {
            await sessionStore.fetchUser();
            if (!sessionStore.isAuthenticated) {
              // fetchUser logged us out (expired/invalid session)
              router.replace('/(auth)/welcome');
              return;
            }
            await sessionStore.fetchOnboardingStatus();
            if (sessionStore.onboardingStatus === 'approved') {
              await shopSetupStore.fetchMyShopTypes();
              router.replace(shopSetupStore.hasChosenTypes ? '/(tabs)/home' : '/(auth)/shop-type-selection');
            } else {
              router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus) as Parameters<typeof router.replace>[0]);
            }
          } else {
            router.replace('/(auth)/welcome');
          }
        });
      }, 900);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Background blobs */}
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      {/* Logo + name */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <ShopkeeperLogo size={88} />
      </Animated.View>

      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        ShopKeeper
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Merchant Operating System
      </Animated.Text>

      {/* Bottom badge */}
      <View style={styles.bottomBadge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Powered by FreshMart Network</Text>
      </View>
    </Animated.View>
  );
});

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobTR: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  blobBL: {
    position: 'absolute', bottom: -80, left: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  badgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.success },
  badgeText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
});
