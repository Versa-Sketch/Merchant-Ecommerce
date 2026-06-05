import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Rect, Circle, Text as SvgText, Polyline } from 'react-native-svg';
import { Package, TrendingUp, Users, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import styles from './Welcome.styles';

function MerchantIllustration() {
  return (
    <Svg width={320} height={210} viewBox="0 0 320 210">
      {/* BG circle */}
      <Circle cx="160" cy="105" r="95" fill={Colors.primaryLight} opacity="0.5" />

      {/* Revenue card */}
      <Rect x="18" y="18" width="192" height="104" rx="18" fill="white" />
      <Rect x="18" y="18" width="192" height="5" rx={18} fill={Colors.primary} />
      <SvgText x="34" y="44" fill={Colors.textMuted} fontSize="10" fontWeight="600">Today&apos;s Revenue</SvgText>
      <SvgText x="34" y="72" fill={Colors.textPrimary} fontSize="26" fontWeight="800">₹12,840</SvgText>

      {/* Growth pill */}
      <Rect x="34" y="82" width="60" height="18" rx="9" fill={Colors.primaryLight} />
      <SvgText x="44" y="95" fill={Colors.primary} fontSize="10" fontWeight="700">↑ 18%</SvgText>

      {/* Sparkline */}
      <Polyline
        points="34,108 62,98 90,102 118,90 148,85 184,78"
        stroke={Colors.primary}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <Circle cx="184" cy="78" r="3.5" fill={Colors.primary} />

      {/* Orders card */}
      <Rect x="172" y="96" width="136" height="96" rx="18" fill="white" />
      <SvgText x="188" y="124" fill={Colors.textMuted} fontSize="10" fontWeight="600">Orders Today</SvgText>
      <SvgText x="188" y="156" fill={Colors.textPrimary} fontSize="30" fontWeight="800">42</SvgText>
      <SvgText x="188" y="174" fill={Colors.success} fontSize="10" fontWeight="600">↑ 12 vs yesterday</SvgText>

      {/* Mini bars */}
      <Rect x="264" y="148" width="9" height="22" rx="3" fill={Colors.primaryLight} />
      <Rect x="276" y="138" width="9" height="32" rx="3" fill={Colors.primary} opacity="0.5" />
      <Rect x="288" y="130" width="9" height="40" rx="3" fill={Colors.primary} />

      {/* Decorative dots */}
      <Circle cx="292" cy="30" r="5" fill={Colors.secondary} opacity="0.35" />
      <Circle cx="304" cy="44" r="3" fill={Colors.primary} opacity="0.25" />
      <Circle cx="22" cy="180" r="4" fill={Colors.primary} opacity="0.2" />
    </Svg>
  );
}

const FEATURES = [
  { icon: Package, text: 'Manage your products & inventory' },
  { icon: TrendingUp, text: 'Track revenue and growth metrics' },
  { icon: Users, text: 'Grow your hyperlocal customer base' },
];

export default function WelcomeRoute() {
  const insets = useSafeAreaInsets();

  const card1Y = useRef(new Animated.Value(40)).current;
  const card1Op = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(24)).current;
  const contentOp = useRef(new Animated.Value(0)).current;
  const featuresOp = useRef(new Animated.Value(0)).current;
  const ctaY = useRef(new Animated.Value(20)).current;
  const ctaOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(card1Y, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(card1Op, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(contentY, { toValue: 0, useNativeDriver: true, tension: 70, friction: 9 }),
        Animated.timing(contentOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(featuresOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(ctaY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(ctaOp, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const navigateToLogin = () => router.push('/(auth)/login');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration area */}
        <View style={[styles.illustrationArea, { paddingTop: insets.top > 20 ? 0 : 24 }]}>
          <View style={styles.blobTL} />
          <View style={styles.blobBR} />
          <View style={styles.dot1} />
          <View style={styles.dot2} />
          <Animated.View style={{ opacity: card1Op, transform: [{ translateY: card1Y }] }}>
            <MerchantIllustration />
          </Animated.View>
        </View>

        {/* Content card */}
        <Animated.View
          style={[
            styles.contentArea,
            { opacity: contentOp, transform: [{ translateY: contentY }] },
          ]}
        >
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Merchant Platform</Text>
          </View>

          <Text style={styles.headline}>
            {'Your store,\n'}
            <Text style={styles.headlineAccent}>powered locally</Text>
          </Text>

          <Text style={styles.subtext}>
            Join thousands of merchants running their hyperlocal business on ShopKeeper.
          </Text>

          <Animated.View style={[styles.features, { opacity: featuresOp }]}>
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Icon size={15} color={Colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.featureText}>{text}</Text>
                <Check size={14} color={Colors.primary} strokeWidth={2.5} />
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.footer, { opacity: ctaOp, transform: [{ translateY: ctaY }] }]}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              activeOpacity={0.88}
              onPress={navigateToLogin}
            >
              <Text style={styles.ctaPrimaryText}>Get Started →</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
