import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import { routeToOnboardingStep } from '../utils/routing';
import { useOnboardingBack } from '../hooks/useOnboardingBack';

type BusinessType = 'individual' | 'company' | 'partnership';

const OPTIONS: { type: BusinessType; label: string; description: string; icon: string }[] = [
  { type: 'individual', label: 'Individual / Sole Proprietor', description: 'You run the shop on your own', icon: '🧑‍💼' },
  { type: 'company', label: 'Company', description: 'Registered as a private or public limited company', icon: '🏢' },
  { type: 'partnership', label: 'Partnership', description: 'Two or more partners running the business', icon: '🤝' },
];

export default observer(function BusinessTypeRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [selected, setSelected] = useState<BusinessType | null>(null);
  const [touched, setTouched] = useState(false);
  const isLoading = onboardingStore.stepState === 'submitting';

  const handleBack = () => {
    router.replace('/(auth)/onboarding-shop-details');
  };

  useOnboardingBack(handleBack);

  const handleSubmit = async () => {
    setTouched(true);
    if (!selected || isLoading) return;
    const ok = await onboardingStore.submitBusinessType(selected);
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader
        currentStep={2}
        totalSteps={8}
        title="Business Type"
        subtitle="This determines which documents you'll need to provide."
        onBack={handleBack}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {touched && !selected ? <Text style={styles.fieldError}>Please select a business type</Text> : null}
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.type;
            return (
              <TouchableOpacity
                key={opt.type}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(opt.type)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{opt.label}</Text>
                  <Text style={styles.cardDesc}>{opt.description}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <Check size={14} color={Colors.white} strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {onboardingStore.stepError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{onboardingStore.stepError}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !isLoading ? styles.ctaEnabled : styles.ctaDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>Continue</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, marginBottom: 12 },
  cardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  cardIcon: { fontSize: 28 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  cardLabelSelected: { color: Colors.primary },
  cardDesc: { fontSize: 13, color: Colors.textSecondary },
  fieldError: { fontSize: 12, color: Colors.error, fontWeight: '500', marginBottom: 10 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
