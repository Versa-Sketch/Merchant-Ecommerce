import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerStep: { fontSize: 12, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },

  // ── Step progress ─────────────────────────────────────────────────────────
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressSegmentDone: { backgroundColor: Colors.primary },

  // ── Form body ─────────────────────────────────────────────────────────────
  form: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: { color: Colors.error, fontSize: 12, fontWeight: '600' },

  // ── Images ────────────────────────────────────────────────────────────────
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageTile: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  imagePreview: { width: '100%', height: '100%' },
  imageRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15,31,23,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePrimaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  imagePrimaryText: { fontSize: 9, fontWeight: '700', color: Colors.white },
  addImageTile: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  imagesHint: { fontSize: 12, color: Colors.textMuted, marginTop: 12, lineHeight: 18 },

  // ── Review ────────────────────────────────────────────────────────────────
  reviewCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    marginBottom: 14,
  },
  reviewCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 12,
  },
  reviewLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  reviewValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' },
  reviewImageRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  reviewImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: Colors.surface },

  // ── Footer nav ────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
});
