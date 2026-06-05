import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';

/**
 * Wraps a tab screen's content in a lightweight slide-from-right + fade
 * entrance animation. Runs every time the tab gains focus.
 */
export function AnimatedScreen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(18)).current;

  const enter = () => {
    opacity.setValue(0);
    translateX.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        damping: 22,
        stiffness: 280,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Run on every focus (tab press / back-nav)
  useFocusEffect(
    React.useCallback(() => {
      enter();
    }, [])
  );

  return (
    <Animated.View
      style={[
        styles.root,
        style,
        { opacity, transform: [{ translateX }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
