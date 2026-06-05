import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  blob1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.primaryLight,
  },
  blob2: {
    position: 'absolute', bottom: -40, left: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(126,153,92,0.12)',
  },
  checkCircleOuter: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  checkCircleInner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  title: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 36, letterSpacing: -0.5, marginBottom: 12,
  },
  storeName: { color: Colors.primary },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40,
  },
  featureList: { gap: 12, alignSelf: 'stretch', marginBottom: 40 },
  featureItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.background, borderRadius: 14, padding: 14,
  },
  featureEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  featureText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  cta: {
    alignSelf: 'stretch', height: 56, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  confettiDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
});
