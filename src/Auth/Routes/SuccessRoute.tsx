import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import styles from './Success.styles';

const CONFETTI_DOTS = [
  { top: '25%', left: '10%', color: Colors.primary, size: 10 },
  { top: '30%', right: '12%', color: Colors.accent, size: 7 },
  { top: '20%', left: '35%', color: Colors.success, size: 6 },
  { top: '28%', right: '30%', color: Colors.secondary, size: 9 },
  { top: '35%', left: '18%', color: Colors.warning, size: 5 },
  { top: '22%', right: '15%', color: Colors.primaryDark, size: 8 },
];

const READY_FEATURES = [
  { emoji: '📦', text: 'Add and manage your products' },
  { emoji: '📊', text: 'Track daily orders and revenue' },
  { emoji: '🤝', text: 'Connect with local customers' },
  { emoji: '💰', text: 'Fast payouts to your bank account' },
];

export default observer(function SuccessRoute() {
  const { sessionStore } = useStores();
  const insets = useSafeAreaInsets();

  // Animation values
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const outerRingScale = useRef(new Animated.Value(0.5)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const featuresOp = useRef(new Animated.Value(0)).current;
  const ctaY = useRef(new Animated.Value(20)).current;
  const ctaOp = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(CONFETTI_DOTS.map(() => ({
    y: new Animated.Value(-20),
    op: new Animated.Value(0),
    scale: new Animated.Value(0),
  }))).current;

  const launchAnimation = useCallback(() => {
    Animated.sequence([
      // Outer ring
      Animated.parallel([
        Animated.spring(outerRingScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      ]),
      // Check icon pops in
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 5 }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      // Confetti burst
      Animated.parallel(
        confettiAnims.map((a, i) =>
          Animated.sequence([
            Animated.delay(i * 40),
            Animated.parallel([
              Animated.spring(a.y, { toValue: 0, useNativeDriver: true, tension: 70, friction: 8 }),
              Animated.timing(a.op, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.spring(a.scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
            ]),
          ])
        )
      ),
      // Title
      Animated.parallel([
        Animated.spring(titleY, { toValue: 0, useNativeDriver: true, tension: 70, friction: 9 }),
        Animated.timing(titleOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      // Features
      Animated.timing(featuresOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      // CTA
      Animated.parallel([
        Animated.spring(ctaY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(ctaOp, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    launchAnimation();
  }, []);

  const handleDashboard = () => router.replace('/(tabs)/home');

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {/* Blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* Confetti dots */}
        {CONFETTI_DOTS.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiDot,
              {
                top: dot.top,
                left: (dot as any).left,
                right: (dot as any).right,
                width: dot.size,
                height: dot.size,
                borderRadius: dot.size / 2,
                backgroundColor: dot.color,
                opacity: confettiAnims[i].op,
                transform: [
                  { translateY: confettiAnims[i].y },
                  { scale: confettiAnims[i].scale },
                ],
              } as any,
            ]}
          />
        ))}

        {/* Check circle */}
        <Animated.View
          style={[styles.checkCircleOuter, { transform: [{ scale: outerRingScale }] }]}
        >
          <Animated.View
            style={[
              styles.checkCircleInner,
              { opacity: checkOpacity, transform: [{ scale: checkScale }] },
            ]}
          >
            <Check size={36} color={Colors.white} strokeWidth={3} />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{ opacity: titleOp, transform: [{ translateY: titleY }], alignItems: 'center' }}
        >
          <Text style={styles.title}>
            {'🎉 '}
            <Text style={styles.storeName}>
              {sessionStore.storeName || 'Your store'}
            </Text>
            {'\nis live!'}
          </Text>
          <Text style={styles.subtitle}>
            Your merchant account is set up and ready to accept orders from local customers.
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featureList, { opacity: featuresOp }]}>
          {READY_FEATURES.map(({ emoji, text }, i) => (
            <View key={i} style={styles.featureItem}>
              <Text style={styles.featureEmoji}>{emoji}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View
          style={[
            { alignSelf: 'stretch' },
            { opacity: ctaOp, transform: [{ translateY: ctaY }] },
          ]}
        >
          <TouchableOpacity style={styles.cta} onPress={handleDashboard} activeOpacity={0.88}>
            <Text style={styles.ctaText}>Go to Dashboard →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
});
