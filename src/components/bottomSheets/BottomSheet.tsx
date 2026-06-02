import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number; // percentage of screen height (e.g. 0.5 to 0.9)
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  title,
  children,
  height = 0.75,
}) => {
  const sheetHeight = SCREEN_HEIGHT * height;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Slide up and fade in backdrop
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      backdropOpacity.value = withTiming(0.5, { duration: 250 });
    } else {
      // Slide down and fade out backdrop
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, sheetHeight]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dim Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.sheet, { height: sheetHeight }, animatedSheetStyle]}>
          {/* Drag Handle Drag Indicator */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>

          {/* Scrollable Content Container */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 100,
  },
  keyboardView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 101,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    ...Shadows.strong,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
});
