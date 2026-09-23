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
}: {
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
  mediaOnly?: boolean;
  mediaType?: "images" | "videos";
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
    if (!result.canceled)
      onChange(result.assets[0].fileName ?? t("attachment.siteMedia"));
  };
  const chooseDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) onChange(result.assets[0].name);
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
    <Pressable style={styles.box} onPress={open}>
      <FontAwesome6
        name={value ? "circle-check" : "cloud-arrow-up"}
        size={22}
        color={value ? colors.success : colors.primary}
      />
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
      <FontAwesome6
        name={value ? "arrow-right-arrow-left" : "circle-plus"}
        size={19}
        color={colors.primary}
      />
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
  info: { flex: 1 },
  title: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  copy: { color: colors.inkMuted, fontSize: 9, marginTop: 3 },
});
