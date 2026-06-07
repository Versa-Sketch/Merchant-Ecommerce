import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';

export default observer(function ShopTypeSelectionRoute() {
  const { shopSetupStore } = useStores();
  const [touched, setTouched] = useState(false);
  const isLoading = shopSetupStore.state === 'loading';
  const isSubmitting = shopSetupStore.state === 'submitting';

  useEffect(() => {
    shopSetupStore.fetchAvailableTypes();
    if (!shopSetupStore.myTypesFetched) shopSetupStore.fetchMyShopTypes();
  }, []);

  const handleSubmit = async () => {
    setTouched(true);
    if (shopSetupStore.selectedIds.length === 0 || isSubmitting) return;
    const ok = await shopSetupStore.assignShopTypes(shopSetupStore.selectedIds);
    if (ok) router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>What does your shop sell?</Text>
        <Text style={styles.subtitle}>Choose one or more categories that describe your shop. You can change this later.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {touched && shopSetupStore.selectedIds.length === 0 ? (
            <Text style={styles.fieldError}>Please select at least one shop type</Text>
          ) : null}

          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
          ) : (
            shopSetupStore.availableTypes.map((opt) => {
              const isSelected = shopSetupStore.selectedIds.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => shopSetupStore.toggleSelection(opt.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{opt.name}</Text>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Check size={14} color={Colors.white} strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {shopSetupStore.error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{shopSetupStore.error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, !isSubmitting ? styles.ctaEnabled : styles.ctaDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>Continue</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, marginBottom: 12 },
  cardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  cardLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardLabelSelected: { color: Colors.primary },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  fieldError: { fontSize: 12, color: Colors.error, fontWeight: '500', marginBottom: 10 },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
