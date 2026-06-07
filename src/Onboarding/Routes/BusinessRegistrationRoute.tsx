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

export default observer(function BusinessRegistrationRoute() {
  const { onboardingStore, sessionStore } = useStores();
  
  const [companyPan, setCompanyPan] = useState<PickedFile | null>(null);
  const [gstReg, setGstReg] = useState<PickedFile | null>(null);
  
  const [existingCompanyPan, setExistingCompanyPan] = useState<string | null>(null);
  const [existingGstReg, setExistingGstReg] = useState<string | null>(null);

  const [touched, setTouched] = useState(false);
  const isCompleted = sessionStore.onboardingCompletedSteps.includes('BUSINESS_REGISTRATION');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const handleBack = () => {
    router.replace('/(auth)/onboarding-business-type');
  };

  useOnboardingBack(handleBack);

  const canSubmit = isCompleted
    ? (!!companyPan || !!existingCompanyPan) && (!!gstReg || !!existingGstReg)
    : !!companyPan && !!gstReg;

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchBusinessRegistration().then((data) => {
        if (data) {
          if (data.company_pan) {
            setExistingCompanyPan(data.company_pan);
            setCompanyPan({ uri: data.company_pan, name: 'Company PAN Card', type: 'image/jpeg' });
          }
          if (data.gst_registration) {
            setExistingGstReg(data.gst_registration);
            setGstReg({ uri: data.gst_registration, name: 'GST Certificate', type: 'image/jpeg' });
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
      const patchFiles: { company_pan?: PickedFile; gst_registration?: PickedFile } = {};
      if (companyPan && !companyPan.uri.startsWith('http')) {
        patchFiles.company_pan = companyPan;
      }
      if (gstReg && !gstReg.uri.startsWith('http')) {
        patchFiles.gst_registration = gstReg;
      }

      if (Object.keys(patchFiles).length === 0) {
        ok = true;
      } else {
        ok = await onboardingStore.patchBusinessRegistration(patchFiles);
      }
    } else {
      ok = await onboardingStore.submitBusinessRegistration(companyPan!, gstReg!);
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={3} totalSteps={9} title="Business Registration" subtitle="Upload your company PAN and GST registration certificate." onBack={handleBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <FilePickerField label="Company PAN Card" value={companyPan} onChange={setCompanyPan} accept="any" required hint="PDF, JPG or PNG" error={touched && !companyPan ? 'Required' : null} />
              <FilePickerField label="GST Registration Certificate" value={gstReg} onChange={setGstReg} accept="any" required hint="PDF, JPG or PNG" error={touched && !gstReg ? 'Required' : null} />
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
