import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import type { ShopType } from '../../ShopSetup/Store';

function ShopTypeCard({
  item,
  isSelected,
  onPress,
}: {
  item: ShopType;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{item.name}</Text>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Check size={14} color={Colors.white} strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
}

function SuccessBanner({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.successBanner, { opacity }]} pointerEvents="none">
      <Text style={styles.successText}>Shop types updated successfully</Text>
    </Animated.View>
  );
}

export default observer(function EditShopTypesRoute() {
  const { shopSetupStore } = useStores();
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const [initialised, setInitialised] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isLoading = shopSetupStore.state === 'loading';
  const isSubmitting = shopSetupStore.state === 'submitting';

  useEffect(() => {
    async function load() {
      await Promise.all([
        shopSetupStore.fetchAvailableTypes(),
        shopSetupStore.fetchMyShopTypes(),
      ]);
      setInitialised(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (initialised) {
      setLocalSelected(shopSetupStore.myTypes.map((t) => t.id));
    }
  }, [initialised]);

  const toggleType = (id: string) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const originalIds = shopSetupStore.myTypes.map((t) => t.id);
    const toAdd = localSelected.filter((id) => !originalIds.includes(id));
    const toRemove = originalIds.filter((id) => !localSelected.includes(id));

    let ok = true;
    if (toAdd.length > 0) {
      const result = await shopSetupStore.assignShopTypes(toAdd);
      if (!result) ok = false;
    }
    for (const id of toRemove) {
      const result = await shopSetupStore.removeShopType(id);
      if (!result) ok = false;
    }

    if (ok) {
      setShowSuccess(true);
      // re-sync local state with server truth
      setLocalSelected(shopSetupStore.myTypes.map((t) => t.id));
    }
  };

  const myTypeIds = shopSetupStore.myTypes.map((t) => t.id);
  const currentTypes = shopSetupStore.availableTypes.filter((t) =>
    localSelected.includes(t.id),
  );
  const availableTypes = shopSetupStore.availableTypes.filter(
    (t) => !localSelected.includes(t.id),
  );

  const isDirty =
    initialised &&
    (localSelected.some((id) => !myTypeIds.includes(id)) ||
      myTypeIds.some((id) => !localSelected.includes(id)));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Edit Shop Types</Text>
          <Text style={styles.headerSub}>Tap to add or remove categories</Text>
        </View>
      </View>

      <SuccessBanner visible={showSuccess} />

      {isLoading && !initialised ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading shop types…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Current shop types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Current Shop Types</Text>
            {currentTypes.length === 0 ? (
              <Text style={styles.emptyState}>No shop types selected yet.</Text>
            ) : (
              currentTypes.map((item) => (
                <ShopTypeCard
                  key={item.id}
                  item={item}
                  isSelected
                  onPress={() => toggleType(item.id)}
                />
              ))
            )}
          </View>

          {/* Available shop types */}
          {availableTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Shop Types</Text>
              {availableTypes.map((item) => (
                <ShopTypeCard
                  key={item.id}
                  item={item}
                  isSelected={false}
                  onPress={() => toggleType(item.id)}
                />
              ))}
            </View>
          )}

          {shopSetupStore.error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{shopSetupStore.error}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, isDirty && !isSubmitting ? styles.ctaEnabled : styles.ctaDisabled]}
          onPress={handleSave}
          disabled={!isDirty || isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.ctaText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textSecondary },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  emptyState: { fontSize: 14, color: Colors.textMuted, fontStyle: 'italic' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  cardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  cardLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardLabelSelected: { color: Colors.primary },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  successBanner: {
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  successText: { fontSize: 14, fontWeight: '600', color: Colors.primary, textAlign: 'center' },
});
