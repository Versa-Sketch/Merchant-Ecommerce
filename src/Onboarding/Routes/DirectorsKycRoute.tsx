import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router, useFocusEffect } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import FilePickerField from '../Components/FilePickerField';
import { routeToOnboardingStep } from '../utils/routing';
import type { DirectorEntry } from '../Store';

import { useOnboardingBack } from '../hooks/useOnboardingBack';

function emptyDirector(): DirectorEntry {
  return { name: '', designation: 'director', panFile: null, aadhaarFile: null };
}

export default observer(function DirectorsKycRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [directors, setDirectors] = useState<DirectorEntry[]>([emptyDirector()]);
  const [touched, setTouched] = useState(false);
  
  const isCompleted = sessionStore.onboardingCompletedSteps.includes('DIRECTORS_KYC');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const isCompany = sessionStore.onboardingBusinessType === 'company';
  const designationLabel = isCompany ? 'Director' : 'Partner';

  const handleBack = () => {
    if (isCompany) {
      router.replace('/(auth)/onboarding-incorporation-docs');
    } else {
      router.replace('/(auth)/onboarding-business-registration');
    }
  };

  useOnboardingBack(handleBack);

  const canSubmit = directors.every((d) => d.name.trim().length >= 2 && d.panFile && d.aadhaarFile);

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchDirectorsKyc().then((data) => {
        if (data && data.length > 0) {
          const loadedDirectors = data.map((d: any) => ({
            name: d.name || '',
            designation: d.designation || 'director',
            panFile: d.pan_card ? { uri: d.pan_card, name: 'PAN Card', type: 'image/jpeg' } : null,
            aadhaarFile: d.aadhaar_card ? { uri: d.aadhaar_card, name: 'Aadhaar Card', type: 'image/jpeg' } : null,
          }));
          setDirectors(loadedDirectors);
        }
      });
    }, [])
  );

  const updateDirector = <K extends keyof DirectorEntry>(index: number, key: K, value: DirectorEntry[K]) => {
    setDirectors((prev) => prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)));
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;

    let ok = false;
    if (isCompleted) {
      // Build index patches
      const patchedDirectorsList = directors.map((d) => {
        const patch: any = {
          name: d.name,
          designation: d.designation,
        };
        if (d.panFile && !d.panFile.uri.startsWith('http')) {
          patch.panFile = d.panFile;
        }
        if (d.aadhaarFile && !d.aadhaarFile.uri.startsWith('http')) {
          patch.aadhaarFile = d.aadhaarFile;
        }
        return patch;
      });
      ok = await onboardingStore.patchDirectorsKyc(patchedDirectorsList);
    } else {
      ok = await onboardingStore.submitDirectorsKyc(directors);
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader
        currentStep={5}
        totalSteps={9}
        title={`${designationLabel}s' KYC`}
        subtitle={`Upload PAN and Aadhaar for each ${designationLabel.toLowerCase()}.`}
        onBack={handleBack}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {directors.map((dir, i) => (
                <View key={i} style={styles.directorCard}>
                  <View style={styles.directorCardHeader}>
                    <Text style={styles.directorTitle}>{designationLabel} {i + 1}</Text>
                    {directors.length > 1 && (
                      <TouchableOpacity onPress={() => setDirectors((p) => p.filter((_, idx) => idx !== i))} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Trash2 size={18} color={Colors.error} strokeWidth={2} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.label}>FULL NAME *</Text>
                  <TextInput
                    style={[styles.input, touched && dir.name.trim().length < 2 ? styles.inputError : null]}
                    value={dir.name}
                    onChangeText={(t) => updateDirector(i, 'name', t)}
                    placeholder={`${designationLabel} name`}
                    placeholderTextColor={Colors.textMuted}
                  />
                  {touched && dir.name.trim().length < 2 ? <Text style={styles.fieldError}>Required</Text> : null}
                  <Text style={[styles.label, { marginTop: 12 }]}>DESIGNATION</Text>
                  <View style={styles.toggleRow}>
                    {(['director', 'partner'] as const).map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.toggleBtn, dir.designation === d && styles.toggleBtnSelected]}
                        onPress={() => updateDirector(i, 'designation', d)}
                      >
                        <Text style={[styles.toggleText, dir.designation === d && styles.toggleTextSelected]}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ marginTop: 12 }}>
                    <FilePickerField
                      label="PAN Card"
                      value={dir.panFile}
                      onChange={(f) => updateDirector(i, 'panFile', f)}
                      accept="any"
                      required
                      error={touched && !dir.panFile ? 'Required' : null}
                    />
                    <FilePickerField
                      label="Aadhaar Card"
                      value={dir.aadhaarFile}
                      onChange={(f) => updateDirector(i, 'aadhaarFile', f)}
                      accept="any"
                      required
                      error={touched && !dir.aadhaarFile ? 'Required' : null}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addBtn} onPress={() => setDirectors((p) => [...p, emptyDirector()])} activeOpacity={0.75}>
                <Plus size={18} color={Colors.primary} strokeWidth={2.5} />
                <Text style={styles.addBtnText}>Add {designationLabel}</Text>
              </TouchableOpacity>

              {onboardingStore.stepError ? (
                <View style={styles.errorBox}><Text style={styles.errorBoxText}>{onboardingStore.stepError}</Text></View>
              ) : null}
            </View>
          </ScrollView>
        )}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.cta, !isLoading ? styles.ctaEnabled : styles.ctaDisabled]} onPress={handleSubmit} disabled={isLoading || isFetching} activeOpacity={0.88}>
            {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  directorCard: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  directorCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  directorTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6 },
  input: { height: 48, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.surface },
  inputError: { borderColor: Colors.error },
  fieldError: { fontSize: 11, color: Colors.error, marginTop: 4 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  toggleBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  toggleText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  toggleTextSelected: { color: Colors.primary },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed' },
  addBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
