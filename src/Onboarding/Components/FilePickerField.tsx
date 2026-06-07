import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Check, Upload, X } from "lucide-react-native";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../theme/colors";
import type { PickedFile } from "../Store";

type Accept = "image" | "pdf" | "any";

interface Props {
  label: string;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  accept?: Accept;
  required?: boolean;
  hint?: string;
  error?: string | null;
}

async function pickFile(accept: Accept): Promise<PickedFile | null> {
  try {
    if (accept === "image") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets[0]) return null;
      const asset = result.assets[0];
      const name = asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg";
      return {
        uri: asset.uri,
        name,
        type: asset.mimeType ?? "image/jpeg",
        file: (asset as { file?: Blob }).file,
      };
    }

    const mimeTypes =
      accept === "pdf"
        ? ["application/pdf"]
        : ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    const result = await DocumentPicker.getDocumentAsync({
      type: mimeTypes,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? "application/octet-stream",
      file: (asset as { file?: Blob }).file,
    };
  } catch {
    Alert.alert("Error", "Could not open file picker. Please try again.");
    return null;
  }
}

export default function FilePickerField({
  label,
  value,
  onChange,
  accept = "any",
  required,
  hint,
  error,
}: Props) {
  const handlePress = async () => {
    const file = await pickFile(accept);
    if (file) onChange(file);
  };

  const handleRemove = () => onChange(null);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>

      <TouchableOpacity
        style={[styles.tile, value && styles.tileFilled, error && styles.tileError]}
        onPress={handlePress}
        activeOpacity={0.75}
      >
        {value ? (
          <View style={styles.filledContent}>
            <View style={styles.checkCircle}>
              <Check size={16} color={Colors.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {value.name}
            </Text>
            <TouchableOpacity
              onPress={handleRemove}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <X size={16} color={Colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContent}>
            <View style={styles.uploadCircle}>
              <Upload size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.uploadLabel}>Tap to upload</Text>
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
          </View>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  labelRow: { flexDirection: "row", marginBottom: 8 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  required: { fontSize: 12, fontWeight: "700", color: Colors.error },
  tile: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 16,
    backgroundColor: Colors.background,
  },
  tileFilled: {
    borderStyle: "solid",
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  tileError: {
    borderColor: Colors.error,
  },
  errorText: { fontSize: 11, color: Colors.error, marginTop: 6 },
  emptyContent: { alignItems: "center", gap: 8 },
  uploadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadLabel: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  hint: { fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  filledContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
});
