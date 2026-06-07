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

export default observer(function IdentityDocsRoute() {
  const { onboardingStore, sessionStore } = useStores();
  
  const [panFile, setPanFile] = useState<PickedFile | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<PickedFile | null>(null);
  
  // Track existing document URLs
  const [existingPan, setExistingPan] = useState<string | null>(null);
  const [existingAadhaar, setExistingAadhaar] = useState<string | null>(null);

  const [touched, setTouched] = useState(false);
  const isCompleted = sessionStore.onboardingCompletedSteps.includes('IDENTITY_DOCS');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const handleBack = () => {
    router.replace('/(auth)/onboarding-business-type');
  };

  useOnboardingBack(handleBack);

  // Can submit if:
  // - In edit mode, and either files are already uploaded or we select new ones
  // - In create mode, both must be selected
  const canSubmit = isCompleted
    ? (!!panFile || !!existingPan) && (!!aadhaarFile || !!existingAadhaar)
    : !!panFile && !!aadhaarFile;

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchIdentityDocs().then((data) => {
        if (data) {
          if (data.pan_card) {
            setExistingPan(data.pan_card);
            setPanFile({ uri: data.pan_card, name: 'Uploaded PAN Card', type: 'image/jpeg' });
          }
          if (data.aadhaar_card) {
            setExistingAadhaar(data.aadhaar_card);
            setAadhaarFile({ uri: data.aadhaar_card, name: 'Uploaded Aadhaar Card', type: 'image/jpeg' });
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
      const patchFiles: { pan_card?: PickedFile; aadhaar_card?: PickedFile } = {};
      // Only upload if the file uri is a local path (not a remote server URL)
      if (panFile && !panFile.uri.startsWith('http')) {
        patchFiles.pan_card = panFile;
      }
      if (aadhaarFile && !aadhaarFile.uri.startsWith('http')) {
        patchFiles.aadhaar_card = aadhaarFile;
      }

      // If no new files picked, proceed
      if (Object.keys(patchFiles).length === 0) {
        ok = true;
      } else {
        ok = await onboardingStore.patchIdentityDocs(patchFiles);
      }
    } else {
      ok = await onboardingStore.submitIdentityDocs(panFile!, aadhaarFile!);
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={3} totalSteps={8} title="Identity Documents" subtitle="Upload your PAN card and Aadhaar card." onBack={handleBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <FilePickerField label="PAN Card" value={panFile} onChange={setPanFile} accept="any" required hint="PDF, JPG or PNG" error={touched && !panFile ? 'Required' : null} />
              <FilePickerField label="Aadhaar Card" value={aadhaarFile} onChange={setAadhaarFile} accept="any" required hint="PDF, JPG or PNG" error={touched && !aadhaarFile ? 'Required' : null} />
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
