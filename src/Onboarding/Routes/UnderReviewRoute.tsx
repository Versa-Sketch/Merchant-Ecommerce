import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';

export default observer(function UnderReviewRoute() {
  const { sessionStore } = useStores();
  const status = sessionStore.onboardingStatus;
  const isRejected = status === 'rejected';

  const icon = isRejected
    ? <AlertCircle size={52} color={Colors.error} strokeWidth={1.5} />
    : <Clock size={52} color={Colors.warning} strokeWidth={1.5} />;

  const title = isRejected ? 'Application Rejected' : 'Under Review';
  const subtitle = isRejected
    ? 'Your application was reviewed and could not be approved at this time.'
    : 'We are reviewing your documents. This usually takes 1–2 business days.';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>{icon}</View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {isRejected && sessionStore.onboardingRejectionReason ? (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reason</Text>
              <Text style={styles.reasonText}>{sessionStore.onboardingRejectionReason}</Text>
            </View>
          ) : null}

          {!isRejected && (
            <View style={styles.stepsBox}>
              <StepRow icon="📋" text="Documents submitted" done />
              <StepRow icon="🔍" text="Under admin review" active />
              <StepRow icon="✅" text="Account activated" />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isRejected && (
          <TouchableOpacity style={styles.ctaPrimary} onPress={() => router.replace('/(auth)/onboarding-shop-details')} activeOpacity={0.88}>
            <Text style={styles.ctaPrimaryText}>Restart Application</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ctaOutline} onPress={() => Linking.openURL('mailto:support@shopkeeper.app')} activeOpacity={0.75}>
          <Text style={styles.ctaOutlineText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

function StepRow({ icon, text, done, active }: { icon: string; text: string; done?: boolean; active?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepIcon}>{icon}</Text>
      <Text style={[styles.stepText, done && styles.stepDone, active && styles.stepActive]}>{text}</Text>
      {done && <CheckCircle size={16} color={Colors.success} strokeWidth={2} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32, alignItems: 'center' },
  iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  reasonBox: { width: '100%', backgroundColor: Colors.errorBg, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: `${Colors.error}30` },
  reasonLabel: { fontSize: 11, fontWeight: '700', color: Colors.error, textTransform: 'uppercase', marginBottom: 6 },
  reasonText: { fontSize: 14, color: Colors.error, lineHeight: 20 },
  stepsBox: { width: '100%', backgroundColor: Colors.background, borderRadius: 16, padding: 16, gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon: { fontSize: 20, width: 28 },
  stepText: { flex: 1, fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  stepDone: { color: Colors.textPrimary },
  stepActive: { color: Colors.primary, fontWeight: '700' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  ctaPrimary: { height: 54, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  ctaPrimaryText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  ctaOutline: { height: 54, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  ctaOutlineText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
