/**
 * DevInspector
 *
 * A zero-dependency, dev-only element inspector for React Native / Expo.
 * Rendered only when __DEV__ === true. Does not ship to production.
 *
 * HOW IT WORKS
 * ─────────────
 * The @locator/babel-jsx babel plugin annotates every JSX element in your
 * source files with a "data-locatorjs-id" prop and stores location metadata
 * (file path + line number) in a module-level registry called __locatorData.
 *
 * This overlay:
 *  1. Shows a small floating "< >" button (bottom-right, above the tab bar).
 *  2. When tapped, enters INSPECT mode — a semi-transparent overlay captures
 *     all touches.
 *  3. On tap, walks the React fiber tree from the tapped element upward to
 *     find the nearest component that has __debugSource (set by Metro's
 *     JSX transform) or a meaningful displayName.
 *  4. Shows a bottom sheet with the component name, file path, and line.
 *  5. "Open in editor" fires the standard Expo source-map deep-link
 *     (expo://localhost:8081/open-file) which VS Code / WebStorm picks up.
 *
 * ACTIVATION
 * ──────────
 * Tap the "< >" fab → tap any element → see its source location.
 * Tap the overlay background (without moving) to exit inspect mode.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SourceInfo {
  componentName: string;
  fileName: string;
  lineNumber: number | null;
  columnNumber: number | null;
  ancestors: string[];
}

// ─── Fiber walking ────────────────────────────────────────────────────────────
/**
 * Walk up the React fiber tree from a given native view instance and collect
 * the first few meaningful component names + the nearest __debugSource.
 */
function getFiberInfo(instance: any): SourceInfo | null {
  try {
    // React Native exposes the fiber via _internalFiberInstanceHandleDEV
    // (RN 0.71+) or _reactInternals / _reactInternalFiber (older).
    const fiber: any =
      instance?._internalFiberInstanceHandleDEV ??
      instance?._reactInternals ??
      instance?._reactInternalFiber;

    if (!fiber) return null;

    const ancestors: string[] = [];
    let source: { fileName: string; lineNumber: number; columnNumber?: number } | null = null;
    let componentName = '';

    let node = fiber;
    let depth = 0;

    while (node && depth < 30) {
      const name =
        node.type?.displayName ??
        node.type?.name ??
        (typeof node.type === 'string' ? node.type : null);

      if (name && name !== 'RCTView' && name !== 'View' && !name.startsWith('RCT')) {
        if (!componentName) componentName = name;
        if (ancestors.length < 5) ancestors.push(name);
      }

      // __debugSource is added by Metro's JSX transform in dev mode.
      // It's the most reliable source of file + line info.
      if (!source && node._debugSource) {
        source = node._debugSource;
      }

      node = node.return;
      depth++;
    }

    if (!componentName && !source) return null;

    return {
      componentName: componentName || '(anonymous)',
      fileName: source?.fileName ?? '',
      lineNumber: source?.lineNumber ?? null,
      columnNumber: source?.columnNumber ?? null,
      ancestors,
    };
  } catch {
    return null;
  }
}

/** Shorten an absolute path to a project-relative one. */
function cropPath(filePath: string): string {
  const markers = ['src/', 'app/', 'components/', 'screens/'];
  for (const m of markers) {
    const idx = filePath.lastIndexOf(m);
    if (idx !== -1) return filePath.slice(idx);
  }
  // Fallback: last two path segments
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts.slice(-2).join('/');
}

/** Build the editor deep-link URL.
 *  VS Code: vscode://file/{path}:{line}:{col}
 *  Works if VS Code is set as the default editor for this scheme on the OS.
 */
function buildEditorUrl(filePath: string, line: number | null): string {
  const l = line ?? 1;
  // VS Code scheme works on macOS and Windows when VS Code is installed.
  return `vscode://file/${encodeURI(filePath)}:${l}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DevInspector() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(false);
  const [result, setResult] = useState<SourceInfo | null>(null);
  const fabScale = useRef(new Animated.Value(1)).current;

  const activate = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
    ]).start();
    setResult(null);
    setActive(true);
  };

  const deactivate = () => {
    setActive(false);
    setResult(null);
  };

  const handleOverlayPress = useCallback((e: any) => {
    // The native view ref is accessible via the touch event's target.
    const target = e?.nativeEvent?.target;
    if (!target) { deactivate(); return; }

    // nativeFindNodeHandle is not needed — we have the raw node reference.
    // In React Native, the touch target IS the native view handle.
    // We look it up in the fiber map via the internal instance.
    const instance = (target as any)?._reactInternals
      ? target
      : (target as any)?._nativeTag
        ? target
        : null;

    const info = instance ? getFiberInfo(instance) : null;
    if (info) {
      setResult(info);
    } else {
      // No fiber found — just exit inspect mode
      deactivate();
    }
  }, []);

  return (
    <>
      {/* ── Floating toggle button ───────────────────────────────────── */}
      {!active && (
        <Animated.View
          style={[
            styles.fab,
            {
              bottom: Math.max(insets.bottom, 8) + 76, // above floating tab bar
              transform: [{ scale: fabScale }],
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.fabInner}
            onPress={activate}
            activeOpacity={0.85}
          >
            <Text style={styles.fabIcon}>{'</>'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Inspect overlay ──────────────────────────────────────────── */}
      {active && (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.overlay]}
          onPress={handleOverlayPress}
        >
          <View style={[styles.inspectBanner, { top: insets.top + 8 }]}>
            <View style={styles.inspectDot} />
            <Text style={styles.inspectBannerText}>Tap any element to inspect</Text>
            <TouchableOpacity onPress={deactivate} hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}>
              <Text style={styles.inspectClose}>✕</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}

      {/* ── Result bottom sheet ───────────────────────────────────────── */}
      <Modal
        visible={result !== null}
        transparent
        animationType="slide"
        onRequestClose={deactivate}
      >
        <Pressable style={styles.sheetOverlay} onPress={deactivate}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Component name */}
            <Text style={styles.sheetLabel}>COMPONENT</Text>
            <Text style={styles.sheetComponent}>{result?.componentName}</Text>

            {/* File path + line */}
            {result?.fileName ? (
              <>
                <Text style={styles.sheetLabel}>SOURCE</Text>
                <View style={styles.sheetFileRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.sheetFile}>
                      {cropPath(result.fileName)}
                      {result.lineNumber ? `:${result.lineNumber}` : ''}
                      {result.columnNumber ? `:${result.columnNumber}` : ''}
                    </Text>
                  </ScrollView>
                </View>
              </>
            ) : (
              <Text style={styles.sheetNoSource}>
                No source location found.{'\n'}
                Metro JSX transform must be enabled in dev mode.
              </Text>
            )}

            {/* Ancestor chain */}
            {result?.ancestors && result.ancestors.length > 1 && (
              <>
                <Text style={styles.sheetLabel}>TREE</Text>
                <Text style={styles.sheetAncestors}>
                  {result.ancestors.join(' → ')}
                </Text>
              </>
            )}

            {/* Actions */}
            <View style={styles.sheetActions}>
              {result?.fileName ? (
                <TouchableOpacity
                  style={styles.openBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (result.fileName) {
                      const url = buildEditorUrl(result.fileName, result.lineNumber);
                      Linking.canOpenURL(url)
                        .then(ok => ok && Linking.openURL(url))
                        .catch(() => {});
                    }
                    deactivate();
                  }}
                >
                  <Text style={styles.openBtnText}>Open in Editor</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.closeBtn} onPress={deactivate}>
                <Text style={styles.closeBtnText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
  },
  fabInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },

  // Inspect overlay
  overlay: {
    backgroundColor: 'rgba(15, 31, 23, 0.18)',
    zIndex: 9998,
  },
  inspectBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 12,
  },
  inspectDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  inspectBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  inspectClose: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },

  // Result sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  sheetComponent: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  sheetFileRow: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sheetFile: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  sheetNoSource: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  sheetAncestors: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  openBtn: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  closeBtn: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
