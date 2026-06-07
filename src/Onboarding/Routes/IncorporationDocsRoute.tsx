import React, { useState, useCallback } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router, useFocusEffect } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import FilePickerField from '../Components/FilePickerField';
import { routeToOnboardingStep } from '../utils/routing';
import { useOnboardingBack } from '../hooks/useOnboardingBack';
import type { PickedFile } from '../Store';

export default observer(function IncorporationDocsRoute() {
  const { onboardingStore, sessionStore } = useStores();
  
  const [incCert, setIncCert] = useState<PickedFile | null>(null);
  const [moaAoa, setMoaAoa] = useState<PickedFile | null>(null);
  const [boardRes, setBoardRes] = useState<PickedFile | null>(null);
  const [estLicense, setEstLicense] = useState<PickedFile | null>(null);
  
  const [existingIncCert, setExistingIncCert] = useState<string | null>(null);
  const [existingMoaAoa, setExistingMoaAoa] = useState<string | null>(null);
  const [existingBoardRes, setExistingBoardRes] = useState<string | null>(null);
  const [existingEstLicense, setExistingEstLicense] = useState<string | null>(null);

  const [touched, setTouched] = useState(false);
  const isCompleted = sessionStore.onboardingCompletedSteps.includes('INCORPORATION_DOCS');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const handleBack = () => {
    router.replace('/(auth)/onboarding-business-registration');
  };

  useOnboardingBack(handleBack);

  const canSubmit = isCompleted
    ? (!!incCert || !!existingIncCert) && (!!moaAoa || !!existingMoaAoa)
    : !!incCert && !!moaAoa;

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchIncorporationDocs().then((data) => {
        if (data) {
          if (data.incorporation_certificate) {
            setExistingIncCert(data.incorporation_certificate);
            setIncCert({ uri: data.incorporation_certificate, name: 'Incorporation Certificate', type: 'image/jpeg' });
          }
          if (data.moa_aoa) {
            setExistingMoaAoa(data.moa_aoa);
            setMoaAoa({ uri: data.moa_aoa, name: 'MOA/AOA', type: 'image/jpeg' });
          }
          if (data.board_resolution) {
            setExistingBoardRes(data.board_resolution);
            setBoardRes({ uri: data.board_resolution, name: 'Board Resolution', type: 'image/jpeg' });
          }
          if (data.establishment_license) {
            setExistingEstLicense(data.establishment_license);
            setEstLicense({ uri: data.establishment_license, name: 'Establishment License', type: 'image/jpeg' });
          }
        }
      });
    }, [])
  );

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;

    let ok = false;
    if (isCompleted) {
      const patchFiles: {
        incorporation_certificate?: PickedFile;
        moa_aoa?: PickedFile;
        board_resolution?: PickedFile;
        establishment_license?: PickedFile;
      } = {};
      if (incCert && !incCert.uri.startsWith('http')) {
        patchFiles.incorporation_certificate = incCert;
      }
      if (moaAoa && !moaAoa.uri.startsWith('http')) {
        patchFiles.moa_aoa = moaAoa;
      }
      if (boardRes && !boardRes.uri.startsWith('http')) {
        patchFiles.board_resolution = boardRes;
      }
      if (estLicense && !estLicense.uri.startsWith('http')) {
        patchFiles.establishment_license = estLicense;
      }

      if (Object.keys(patchFiles).length === 0) {
        ok = true;
      } else {
        ok = await onboardingStore.patchIncorporationDocs(patchFiles);
      }
    } else {
      ok = await onboardingStore.submitIncorporationDocs({
        incorporation_certificate: incCert!,
        moa_aoa: moaAoa!,
        board_resolution: boardRes ?? undefined,
        establishment_license: estLicense ?? undefined,
      });
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={4} totalSteps={9} title="Incorporation Documents" subtitle="Required: incorporation cert + MOA/AOA. Others are optional." onBack={handleBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <FilePickerField label="Incorporation Certificate / Partnership Deed" value={incCert} onChange={setIncCert} accept="any" required hint="PDF, JPG or PNG" error={touched && !incCert ? 'Required' : null} />
              <FilePickerField label="Memorandum & Articles of Association (MOA/AOA)" value={moaAoa} onChange={setMoaAoa} accept="any" required hint="PDF, JPG or PNG" error={touched && !moaAoa ? 'Required' : null} />
              <FilePickerField label="Board Resolution / Authorization Letter" value={boardRes} onChange={setBoardRes} accept="any" hint="Optional" />
              <FilePickerField label="Shop Establishment / Trade License" value={estLicense} onChange={setEstLicense} accept="any" hint="Optional" />
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
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
