import React, { useEffect, useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

// Spring config: feels physical — quick open, satisfying snap-back
const SPRING = { damping: 22, stiffness: 260, mass: 0.85 };

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number; // fraction of screen height, e.g. 0.72
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  title,
  children,
  height = 0.75,
}) => {
  const { height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetH = screenH * height;

  // mounted tracks whether the Modal should remain in the tree during close animation
  const [mounted, setMounted] = useState(isVisible);

  // Sheet Y position: 0 = fully open, sheetH = fully hidden
  const translateY = useSharedValue(sheetH);
  const backdropOpacity = useSharedValue(0);

  // ── Open / close on prop change ──────────────────────────────────────────
  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      translateY.value = sheetH;
      backdropOpacity.value = 0;
      translateY.value = withSpring(0, SPRING);
      backdropOpacity.value = withTiming(1, { duration: 320 });
    } else {
      translateY.value = withSpring(sheetH, { ...SPRING, stiffness: 300 });
      backdropOpacity.value = withTiming(0, { duration: 220 });
      // unmount after animation completes — no .value read during render
      const t = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const close = useCallback(() => {
    translateY.value = withSpring(sheetH, { ...SPRING, stiffness: 300 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 250);
  }, [onClose, sheetH]);

  // ── Drag gesture ─────────────────────────────────────────────────────────
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      // Only allow dragging downward (positive translation)
      const next = startY.value + e.translationY;
      translateY.value = Math.max(0, next);

      // Backdrop dims as sheet moves down
      const ratio = 1 - translateY.value / sheetH;
      backdropOpacity.value = Math.max(0, ratio);
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.velocityY > 600 || translateY.value > sheetH * 0.38;

      if (shouldDismiss) {
        translateY.value = withSpring(sheetH, { ...SPRING, stiffness: 300 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        // Snap back open
        translateY.value = withSpring(0, SPRING);
        backdropOpacity.value = withTiming(1, { duration: 220 });
      }
    });

  // ── Animated styles ──────────────────────────────────────────────────────
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Backdrop opacity is smooth and delayed — starts appearing when sheet
  // is at 80% of its final position, not at the very beginning
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [sheetH, sheetH * 0.25, 0],
      [0, 0, 0.48],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop — taps to close, fades in late */}
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents={isVisible ? 'auto' : 'none'}
        >
          <Animated.View
            style={StyleSheet.absoluteFill}
            onTouchEnd={close}
          />
        </Animated.View>

        {/* Sheet */}
        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheet,
                { height: sheetH, paddingBottom: insets.bottom + 8 },
                sheetStyle,
              ]}
            >
              {/* Drag handle */}
              <View style={styles.handleBar}>
                <View style={styles.handle} />
              </View>

              {/* Title */}
              {title ? (
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{title}</Text>
                </View>
              ) : null}

              {/* Content */}
              <View style={styles.content}>{children}</View>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(10, 24, 16, 0.52)',
  },
  sheetContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#0F1F17',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 20,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  titleRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});
