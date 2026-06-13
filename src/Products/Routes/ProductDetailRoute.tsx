import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, ArrowLeft, Box, Plus } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedScreen } from "../../Common/components/AnimatedScreen";
import { BottomSheet } from "../../Common/components/BottomSheet";
import { useStores } from "../../Common/hooks/useStores";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../theme/colors";
import { ProductFormModal } from "../Components/ProductFormModal";
import { VariantFormModal } from "../Components/VariantFormModal";
import type { VariantSummary } from "../types/domain";
import styles from "./styles";

function Pill({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function DetailSkeleton() {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View style={{ opacity: pulse, gap: 12 }}>
      <View style={[styles.skeletonCard, { height: 160 }]} />
      <View style={[styles.skeletonCard, { height: 120 }]} />
      <View style={[styles.skeletonCard, { height: 120 }]} />
    </Animated.View>
  );
}

const VariantCard = observer(function VariantCard({
  variant,
  onEdit,
  onDeactivate,
}: {
  variant: VariantSummary;
  onEdit: (v: VariantSummary) => void;
  onDeactivate: (v: VariantSummary) => void;
}) {
  return (
    <View
      style={[
        styles.variantCard,
        !variant.is_active && styles.variantCardInactive,
      ]}
    >
      <View style={styles.variantTopRow}>
        {variant.image ? (
          <Image source={{ uri: variant.image }} style={styles.variantImg} />
        ) : (
          <View style={[styles.variantImg, styles.productImgPlaceholder]}>
            <Box size={16} color={Colors.border} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.variantName}>{variant.name}</Text>
          <Text style={styles.variantSub}>
            {variant.quantity_per_unit} {variant.unit?.symbol} · position{" "}
            {variant.position}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <View style={styles.variantPriceRow}>
            <Text style={styles.variantPrice}>₹{variant.selling_price}</Text>
            {Number(variant.mrp) > Number(variant.selling_price) ? (
              <Text style={styles.variantMrp}>₹{variant.mrp}</Text>
            ) : null}
          </View>
          <Pill
            label={variant.is_active ? "Active" : "Inactive"}
            color={variant.is_active ? Colors.success : Colors.error}
            bg={variant.is_active ? Colors.successBg : Colors.errorBg}
          />
        </View>
      </View>

      <View style={styles.variantMetaGrid}>
        <View style={styles.variantMetaItem}>
          <Text style={styles.variantMetaLabel}>UNIT</Text>
          <Text style={styles.variantMetaValue}>
            {variant.unit
              ? `${variant.unit.name} (${variant.unit.symbol})`
              : "—"}
          </Text>
        </View>
        <View style={styles.variantMetaItem}>
          <Text style={styles.variantMetaLabel}>MRP</Text>
          <Text style={styles.variantMetaValue}>₹{variant.mrp}</Text>
        </View>
        <View style={styles.variantMetaItem}>
          <Text style={styles.variantMetaLabel}>SKU</Text>
          <Text style={styles.variantMetaValue}>{variant.sku || "—"}</Text>
        </View>
        <View style={styles.variantMetaItem}>
          <Text style={styles.variantMetaLabel}>BARCODE</Text>
          <Text style={styles.variantMetaValue}>{variant.barcode || "—"}</Text>
        </View>
      </View>

      <View style={styles.variantActions}>
        <Button
          label="Edit"
          variant="view"
          size="sm"
          onPress={() => onEdit(variant)}
          style={{ flex: 1 }}
        />
        {variant.is_active ? (
          <Button
            label="Deactivate"
            variant="outline"
            size="sm"
            onPress={() => onDeactivate(variant)}
            style={{ flex: 1 }}
          />
        ) : null}
      </View>
    </View>
  );
});

export default observer(function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productsStore } = useStores();
  const insets = useSafeAreaInsets();

  const [editOpen, setEditOpen] = useState(false);
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [editVariant, setEditVariant] = useState<VariantSummary | null>(null);
  const [confirmProductDeactivate, setConfirmProductDeactivate] =
    useState(false);
  const [confirmVariantDeactivate, setConfirmVariantDeactivate] =
    useState<VariantSummary | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    error?: boolean;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id) void productsStore.fetchProduct(id);
  }, [id, productsStore]);

  function showToast(message: string, error = false) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  const product = productsStore.detail?.id === id ? productsStore.detail : null;
  const isLoading = productsStore.detailState === "loading" && !product;
  const isError = productsStore.detailState === "error";

  async function handleDeactivateProduct() {
    setConfirmProductDeactivate(false);
    if (!product) return;
    const result = await productsStore.deactivateProduct(product.id);
    showToast(result.message, !result.ok);
  }

  async function handleDeactivateVariant() {
    const target = confirmVariantDeactivate;
    setConfirmVariantDeactivate(null);
    if (!product || !target) return;
    const result = await productsStore.deactivateVariant(product.id, target.id);
    showToast(result.message, !result.ok);
  }

  return (
    <AnimatedScreen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.headerTitle, { fontSize: 20 }]}
              numberOfLines={1}
            >
              {product?.name ?? "Product"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {product ? `${product.variants.length} variants` : "Loading…"}
            </Text>
          </View>
          {product ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setVariantFormOpen(true)}
              activeOpacity={0.85}
            >
              <Plus size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {toast ? (
        <View style={[styles.toastBanner, toast.error && styles.toastError]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.detailScroll,
          { paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={productsStore.detailState === "loading" && !!product}
            onRefresh={() => id && void productsStore.fetchProduct(id)}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <DetailSkeleton />
        ) : isError ? (
          <View style={styles.stateWrap}>
            <View style={[styles.stateIcon, styles.stateIconError]}>
              <AlertCircle size={26} color={Colors.error} strokeWidth={1.8} />
            </View>
            <Text style={styles.stateTitle}>Couldn't load product</Text>
            <Text style={styles.stateSub}>{productsStore.detailError}</Text>
            <Button
              label="Retry"
              onPress={() => id && void productsStore.fetchProduct(id)}
            />
          </View>
        ) : product ? (
          <>
            <View style={styles.detailCard}>
              <View style={styles.detailTopRow}>
                {product.image ? (
                  <Image
                    source={{ uri: product.image }}
                    style={styles.detailImg}
                  />
                ) : (
                  <View
                    style={[styles.detailImg, styles.productImgPlaceholder]}
                  >
                    <Box size={26} color={Colors.border} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailName}>{product.name}</Text>
                  <View style={[styles.badgeRow, { marginTop: 6 }]}>
                    <Pill
                      label={
                        product.is_perishable ? "Perishable" : "Non-perishable"
                      }
                      color={
                        product.is_perishable
                          ? Colors.warning
                          : Colors.textSecondary
                      }
                      bg={
                        product.is_perishable
                          ? Colors.warningBg
                          : Colors.background
                      }
                    />
                    <Pill
                      label={product.is_active ? "Active" : "Inactive"}
                      color={product.is_active ? Colors.success : Colors.error}
                      bg={product.is_active ? Colors.successBg : Colors.errorBg}
                    />
                  </View>
                </View>
              </View>

              {product.description ? (
                <Text style={styles.detailDesc}>{product.description}</Text>
              ) : null}

              <View style={styles.metaGrid}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category</Text>
                  <Text style={styles.metaValue}>
                    {product.category?.name ?? "—"}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Subcategory</Text>
                  <Text style={styles.metaValue}>
                    {product.subcategory?.name ?? "—"}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Brand</Text>
                  <Text style={styles.metaValue}>
                    {product.brand?.name ?? "—"}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Manufacturer</Text>
                  <Text style={styles.metaValue}>
                    {product.manufacturer || "—"}
                  </Text>
                </View>
                {product.is_perishable ? (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Shelf life</Text>
                    <Text style={styles.metaValue}>
                      {product.shelf_life_days != null
                        ? `${product.shelf_life_days} days from stock-in`
                        : "Not set"}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.detailActions}>
                <Button
                  label="Edit product"
                  variant="view"
                  size="sm"
                  onPress={() => setEditOpen(true)}
                  style={{ flex: 1 }}
                />
                {product.is_active ? (
                  <Button
                    label="Deactivate"
                    variant="outline"
                    size="sm"
                    onPress={() => setConfirmProductDeactivate(true)}
                    style={{ flex: 1 }}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                Variants ({product.variants.length})
              </Text>
              <Button
                label="Add variant"
                variant="ghost"
                size="sm"
                onPress={() => setVariantFormOpen(true)}
              />
            </View>

            {product.variants.length === 0 ? (
              <View style={styles.stateWrap}>
                <Text style={styles.stateTitle}>No variants</Text>
                <Text style={styles.stateSub}>
                  Add a variant so this product can be sold.
                </Text>
                <Button
                  label="Add variant"
                  onPress={() => setVariantFormOpen(true)}
                />
              </View>
            ) : (
              [...product.variants]
                .sort((a, b) => a.position - b.position)
                .map((v) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    onEdit={(variant) => setEditVariant(variant)}
                    onDeactivate={(variant) =>
                      setConfirmVariantDeactivate(variant)
                    }
                  />
                ))
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Confirm product deactivation */}
      <BottomSheet
        isVisible={confirmProductDeactivate}
        onClose={() => setConfirmProductDeactivate(false)}
        title="Deactivate product?"
        height={0.32}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.confirmText}>
            "{product?.name}" will be hidden from your catalog and customers.
            You can reactivate it later from Edit Product.
          </Text>
          <View style={styles.confirmActions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => setConfirmProductDeactivate(false)}
              style={{ flex: 1 }}
            />
            <Button
              label="Deactivate"
              variant="danger"
              loading={productsStore.saving}
              onPress={() => void handleDeactivateProduct()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheet>

      {/* Confirm variant deactivation */}
      <BottomSheet
        isVisible={confirmVariantDeactivate !== null}
        onClose={() => setConfirmVariantDeactivate(null)}
        title="Deactivate variant?"
        height={0.32}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.confirmText}>
            "{confirmVariantDeactivate?.name}" will no longer be visible to
            customers. You can reactivate it later from Edit Variant.
          </Text>
          <View style={styles.confirmActions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => setConfirmVariantDeactivate(null)}
              style={{ flex: 1 }}
            />
            <Button
              label="Deactivate"
              variant="danger"
              loading={productsStore.saving}
              onPress={() => void handleDeactivateVariant()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheet>

      <ProductFormModal
        visible={editOpen}
        mode="edit"
        product={product}
        onClose={() => setEditOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
      <VariantFormModal
        visible={variantFormOpen || editVariant !== null}
        productId={product?.id ?? ""}
        categoryId={product?.category?.id ?? null}
        variant={editVariant}
        onClose={() => {
          setVariantFormOpen(false);
          setEditVariant(null);
        }}
        onSuccess={(msg) => showToast(msg)}
      />
    </AnimatedScreen>
  );
});
