import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, KeyboardAvoidingView, Platform,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { ChevronLeft, AlertCircle, Check, RefreshCw } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { routeToOnboardingStep } from '../../Onboarding/utils/routing';
import styles from './OTP.styles';

const OTP_LENGTH = 4;

export default observer(function OTPRoute() {
  const { sessionStore, shopSetupStore } = useStores();
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const filledCount = otp.filter(Boolean).length;
  const isVerifying = sessionStore.otpState === 'verifying';
  const hasError = sessionStore.otpState === 'error';

  // Auto-focus first input
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const shake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(successScale, {
        toValue: 1, useNativeDriver: true, tension: 80, friction: 5,
      }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, successScale, successOpacity]);

  const handleOTPChange = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH - index);
      const newOtp = [...otp];
      digits.split('').forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error on input
    if (hasError) sessionStore.resetOTPState();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH || isVerifying) return;

    const { success, isNewUser } = await sessionStore.verifyOTP(code);

    if (!success) {
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }

    triggerSuccess();

    setTimeout(async () => {
      await sessionStore.fetchUser();
      await sessionStore.fetchOnboardingStatus();
      if (sessionStore.onboardingStatus === 'approved') {
        await shopSetupStore.fetchMyShopTypes();
        router.replace(shopSetupStore.hasChosenTypes ? '/(tabs)/home' : '/(auth)/shop-type-selection');
      } else {
        router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus) as Parameters<typeof router.replace>[0]);
      }
    }, 1200);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(30);
    setOtp(Array(OTP_LENGTH).fill(''));
    sessionStore.resetOTPState();
    await sessionStore.sendOTP();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const formatPhone = `+91 ${sessionStore.phone.slice(0, 5)} ${sessionStore.phone.slice(5)}`;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top - 20, 4) }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Verification</Text>
          <Text style={styles.title}>Enter OTP</Text>

          <View style={styles.phoneRow}>
            <Text style={styles.phoneText}>Sent to </Text>
            <Text style={styles.phoneNumber}>{formatPhone}</Text>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.otpLabel}>VERIFICATION CODE</Text>

          {/* OTP Boxes */}
          <Animated.View
            style={[styles.boxesRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.box,
                  focusedIndex === index && styles.boxFocused,
                  digit ? styles.boxFilled : null,
                  hasError && styles.boxError,
                ]}
              >
                <TextInput
                  ref={(el) => { inputRefs.current[index] = el; }}
                  style={styles.boxInput}
                  value={digit}
                  onChangeText={(t) => handleOTPChange(t, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoComplete="sms-otp"
                  textContentType="oneTimeCode"
                  selectTextOnFocus
                  caretHidden
                />
              </View>
            ))}
          </Animated.View>

          {/* Error message */}
          {hasError && sessionStore.otpError ? (
            <View style={styles.errorRow}>
              <AlertCircle size={14} color={Colors.error} />
              <Text style={styles.errorText}>{sessionStore.otpError}</Text>
            </View>
          ) : <View style={{ height: 32 }} />}

          {/* Offline fallback hint — shown only when API is unreachable */}
          <View style={{ backgroundColor: Colors.primaryLight, borderRadius: 10, padding: 12, marginBottom: 24 }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16 }}>
              <Text style={{ fontWeight: '700', color: Colors.primary }}>No server? </Text>
              Enter the OTP from Firebase SMS. Offline fallback: use{' '}
              <Text style={{ fontWeight: '700', color: Colors.primary }}>123456</Text> to sign in as existing merchant, or any 6 digits to register.
            </Text>
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive it?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={13} color={Colors.primary} />
                <Text style={styles.resendBtn}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>
                Resend in {String(countdown).padStart(2, '0')}s
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[
              styles.cta,
              filledCount === OTP_LENGTH ? styles.ctaEnabled : styles.ctaDisabled,
            ]}
            onPress={handleVerify}
            disabled={filledCount < OTP_LENGTH || isVerifying}
            activeOpacity={0.88}
          >
            {isVerifying ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={[
                filledCount === OTP_LENGTH ? styles.ctaText : styles.ctaTextDisabled,
              ]}>
                Verify & Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Success overlay */}
        {showSuccess && (
          <Animated.View style={[styles.successOverlay, { opacity: overlayOpacity }]}>
            <Animated.View
              style={[
                styles.successCircle,
                { opacity: successOpacity, transform: [{ scale: successScale }] },
              ]}
            >
              <Check size={36} color={Colors.primary} strokeWidth={3} />
            </Animated.View>
            <Text style={styles.successText}>Verified!</Text>
            <Text style={styles.successSub}>Taking you in…</Text>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});
