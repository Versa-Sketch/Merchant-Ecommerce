import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </>
  );
}

export function Section({
  title,
  action,
  children,
  style,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'primary' | 'info';
}) {
  const toneStyle = badgeTones[tone] ?? badgeTones.neutral;
  return (
    <View style={[styles.badge, toneStyle.box]}>
      <Text style={[styles.badgeText, toneStyle.text]}>{label}</Text>
    </View>
  );
}

export function IconButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[styles.iconButton, style]}>
      {children}
    </TouchableOpacity>
  );
}

export function Toast({
  message,
  visible,
  type = 'success',
}: {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'neutral';
}) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        type === 'error' && styles.toastError,
        type === 'neutral' && styles.toastNeutral,
        { opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const badgeTones = {
  neutral: {
    box: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.border },
    text: { color: Colors.textSecondary },
  },
  success: {
    box: { backgroundColor: Colors.successBg, borderColor: 'rgba(82,183,136,0.30)' },
    text: { color: Colors.primaryDark },
  },
  warning: {
    box: { backgroundColor: Colors.warningBg, borderColor: 'rgba(244,162,97,0.35)' },
    text: { color: '#B45309' },
  },
  error: {
    box: { backgroundColor: Colors.errorBg, borderColor: 'rgba(230,57,70,0.25)' },
    text: { color: Colors.error },
  },
  primary: {
    box: { backgroundColor: Colors.primaryLight, borderColor: 'rgba(45,106,79,0.25)' },
    text: { color: Colors.primaryDark },
  },
  info: {
    box: { backgroundColor: Colors.infoBg, borderColor: 'rgba(33,150,243,0.25)' },
    text: { color: '#1565C0' },
  },
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    ...Shadows.card,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 999,
    ...Shadows.strong,
  },
  toastError: {
    backgroundColor: Colors.error,
  },
  toastNeutral: {
    backgroundColor: Colors.textSecondary,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
});
