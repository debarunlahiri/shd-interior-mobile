import { FontAwesome6 } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppDialog } from "./AppDialog";
import { colors } from "../theme";
import { useTranslation } from "../localization";

export function AttachmentPicker({
  value,
  onChange,
  label,
  mediaOnly = false,
  mediaType,
  compact = false,
  onAssetChange,
}: {
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
  mediaOnly?: boolean;
  mediaType?: "images" | "videos";
  compact?: boolean;
  onAssetChange?: (asset: {
    name: string;
    uri: string;
    mimeType?: string;
    size?: number;
  }) => void;
}) {
  const { t } = useTranslation();
  const displayLabel = label ?? t("attachment.add");
  const dialog = useAppDialog();
  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      dialog.show(
        t("attachment.permissionTitle"),
        t("attachment.permissionMessage"),
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType ? [mediaType] : ["images", "videos"],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const name = asset.fileName ?? t("attachment.siteMedia");
      onChange(name);
      onAssetChange?.({
        name,
        uri: asset.uri,
        mimeType: asset.mimeType,
        size: asset.fileSize,
      });
    }
  };
  const chooseDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      onChange(asset.name);
      onAssetChange?.({
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType,
        size: asset.size,
      });
    }
  };
  const open = () => {
    if (mediaOnly) {
      choosePhoto();
      return;
    }
    dialog.show(t("attachment.dialogTitle"), t("attachment.dialogMessage"), [
      { text: t("attachment.photoVideo"), onPress: choosePhoto },
      { text: t("attachment.document"), onPress: chooseDocument },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={displayLabel}
      style={compact ? styles.compactBox : styles.box}
      onPress={open}
    >
      <FontAwesome6
        name={compact ? "paperclip" : value ? "circle-check" : "cloud-arrow-up"}
        size={compact ? 16 : 22}
        color={value ? colors.success : colors.primary}
      />
      {compact ? null : (
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {value ?? displayLabel}
          </Text>
          <Text style={styles.copy}>
            {value
              ? t("attachment.replace")
              : mediaOnly
                ? mediaType === "images"
                  ? t("attachment.images")
                  : mediaType === "videos"
                    ? t("attachment.videos")
                    : t("attachment.media")
                : t("attachment.all")}
          </Text>
        </View>
      )}
      {compact ? null : (
        <FontAwesome6
          name={value ? "arrow-right-arrow-left" : "circle-plus"}
          size={19}
          color={colors.primary}
        />
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  box: {
    minHeight: 70,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B5C3BE",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compactBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  title: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  copy: { color: colors.inkMuted, fontSize: 9, marginTop: 3 },
});
