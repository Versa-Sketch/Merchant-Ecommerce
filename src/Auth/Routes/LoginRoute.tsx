import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { validateIndianPhone } from '../types/domain';
import styles from './Login.styles';

export default observer(function LoginRoute() {
  const { sessionStore } = useStores();
  const insets = useSafeAreaInsets();

  const [phoneFocused, setPhoneFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const phoneRef = useRef<TextInput>(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const { valid: phoneValid, error: phoneError } = validateIndianPhone(sessionStore.phone);
  const isLoading = sessionStore.loginState === 'loading';
  const apiError = sessionStore.loginState === 'error' ? sessionStore.loginError : null;

  const showPhoneError = touched && !phoneValid && !!sessionStore.phone;

  useEffect(() => {
    const t = setTimeout(() => phoneRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const handlePressIn = () => {
    if (!phoneValid) return;
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    sessionStore.setPhone(digits);
  };

  const handleContinue = async () => {
    setTouched(true);
    if (!phoneValid || isLoading) return;
    sessionStore.resetLoginState();
    const ok = await sessionStore.login();
    if (!ok) return;
    // Server sends OTP — go to OTP screen to verify
    router.push('/(auth)/otp');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top - 20, 4) }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Enter your registered mobile number to continue.
            </Text>

            {/* Mobile Number */}
            <Text style={[styles.inputLabel, { marginTop: 4 }]}>MOBILE NUMBER</Text>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => phoneRef.current?.focus()}
              style={[
                styles.phoneRow,
                phoneFocused && styles.phoneRowFocused,
                showPhoneError && styles.phoneRowError,
              ]}
            >
              <View style={styles.countryPrefix}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                ref={phoneRef}
                style={styles.phoneInput}
                value={sessionStore.phone}
                onChangeText={handlePhoneChange}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => { setPhoneFocused(false); setTouched(true); }}
                onSubmitEditing={handleContinue}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="9876543210"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </TouchableOpacity>
            {showPhoneError && phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            {/* API error */}
            {apiError ? (
              <View style={styles.apiErrorBox}>
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Fixed footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[
                styles.cta,
                phoneValid && !isLoading ? styles.ctaEnabled : styles.ctaDisabled,
              ]}
              onPress={handleContinue}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!phoneValid || isLoading}
              activeOpacity={1}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.ctaText, !phoneValid && styles.ctaTextDisabled]}>
                    Sign In
                  </Text>
                  {phoneValid && <ArrowRight size={18} color={Colors.white} strokeWidth={2.5} />}
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <TouchableOpacity
            style={styles.signUpRow}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/create-account')}
          >
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Text style={styles.signUpAccent}> Create Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});
