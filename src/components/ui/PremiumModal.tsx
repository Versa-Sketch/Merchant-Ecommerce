import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withTiming, runOnJS, Easing,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { X } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showClose?: boolean;
  snapHeight?: number; // 0–1 fraction of screen height
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isVisible,
  onClose,
  title,
  subtitle,
  children,
  showClose = true,
  snapHeight = 0.62,
}) => {
  const sheetHeight = SCREEN_HEIGHT * snapHeight;
  const translateY = useSharedValue(sheetHeight);
  const backdropOpacity = useSharedValue(0);
  const [render, setRender] = React.useState(isVisible);

  useEffect(() => {
    let frame: ReturnType<typeof requestAnimationFrame> | undefined;
    if (isVisible) {
      frame = requestAnimationFrame(() => setRender(true));
      translateY.value = withSpring(0, { damping: 22, stiffness: 180, mass: 0.8 });
      backdropOpacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
    } else {
      translateY.value = withTiming(sheetHeight, { duration: 280, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(setRender)(false);
      });
      backdropOpacity.value = withTiming(0, { duration: 220 });
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isVisible, backdropOpacity, sheetHeight, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!render) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { height: sheetHeight }, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {showClose && (
              <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
                <X color={Colors.textSecondary} size={16} />
              </Pressable>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlayBg,
    zIndex: 999,
  },
  sheetWrapper: {
    zIndex: 1001,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Shadows.strong,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
});
