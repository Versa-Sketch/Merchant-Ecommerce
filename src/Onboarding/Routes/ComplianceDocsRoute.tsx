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

export default observer(function ComplianceDocsRoute() {
  const { onboardingStore, sessionStore } = useStores();
  
  const [gstFile, setGstFile] = useState<PickedFile | null>(null);
  const [msmeFile, setMsmeFile] = useState<PickedFile | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<PickedFile | null>(null);

  const [existingGst, setExistingGst] = useState<string | null>(null);
  const [existingMsme, setExistingMsme] = useState<string | null>(null);
  const [existingTrade, setExistingTrade] = useState<string | null>(null);

  const isCompleted = sessionStore.onboardingCompletedSteps.includes('COMPLIANCE_DOCS');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const handleBack = () => {
    router.replace('/(auth)/onboarding-identity-docs');
  };

  useOnboardingBack(handleBack);

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchComplianceDocs().then((data) => {
        if (data) {
          if (data.gst_certificate) {
            setExistingGst(data.gst_certificate);
            setGstFile({ uri: data.gst_certificate, name: 'GST Certificate', type: 'image/jpeg' });
          }
          if (data.msme_certificate) {
            setExistingMsme(data.msme_certificate);
            setMsmeFile({ uri: data.msme_certificate, name: 'MSME Certificate', type: 'image/jpeg' });
          }
          if (data.trade_license) {
            setExistingTrade(data.trade_license);
            setTradeLicenseFile({ uri: data.trade_license, name: 'Trade License', type: 'image/jpeg' });
          }
        }
      });
    }, [])
  );

  const handleSubmit = async () => {
    if (isLoading) return;

    let ok = false;
    if (isCompleted) {
      const patchFiles: {
        gst_certificate?: PickedFile;
        msme_certificate?: PickedFile;
        trade_license?: PickedFile;
      } = {};
      if (gstFile && !gstFile.uri.startsWith('http')) {
        patchFiles.gst_certificate = gstFile;
      }
      if (msmeFile && !msmeFile.uri.startsWith('http')) {
        patchFiles.msme_certificate = msmeFile;
      }
      if (tradeLicenseFile && !tradeLicenseFile.uri.startsWith('http')) {
        patchFiles.trade_license = tradeLicenseFile;
      }

      if (Object.keys(patchFiles).length === 0) {
        ok = true;
      } else {
        ok = await onboardingStore.patchComplianceDocs(patchFiles);
      }
    } else {
      ok = await onboardingStore.submitComplianceDocs({
        gst_certificate: gstFile ?? undefined,
        msme_certificate: msmeFile ?? undefined,
        trade_license: tradeLicenseFile ?? undefined,
      });
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  const hasAnyFile = gstFile || msmeFile || tradeLicenseFile;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={4} totalSteps={8} title="Compliance Documents" subtitle="All documents are optional. Upload what you have." onBack={handleBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <FilePickerField label="GST Certificate" value={gstFile} onChange={setGstFile} accept="any" hint="Optional" />
              <FilePickerField label="MSME / Udyam Certificate" value={msmeFile} onChange={setMsmeFile} accept="any" hint="Optional" />
              <FilePickerField label="Trade License" value={tradeLicenseFile} onChange={setTradeLicenseFile} accept="any" hint="Optional" />
              <Text style={styles.note}>You can skip this step if you don't have any of these documents yet.</Text>
              {onboardingStore.stepError ? (
                <View style={styles.errorBox}><Text style={styles.errorBoxText}>{onboardingStore.stepError}</Text></View>
              ) : null}
            </View>
          </ScrollView>
        )}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.cta, styles.ctaEnabled]} onPress={handleSubmit} disabled={isLoading || isFetching} activeOpacity={0.88}>
            {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>{hasAnyFile ? 'Continue' : 'Skip'}</Text>}
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
  note: { fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
