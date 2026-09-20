import { FontAwesome6 } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function AttachmentPicker({
  value,
  onChange,
  label = "Add photo or document",
  mediaOnly = false,
}: {
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
  mediaOnly?: boolean;
}) {
  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo permission needed",
        "Allow photo access to attach site evidence.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });
    if (!result.canceled)
      onChange(result.assets[0].fileName ?? "Site media attached");
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
    Alert.alert("Add attachment", "Choose an attachment source", [
      { text: "Photo or video", onPress: choosePhoto },
      { text: "Document", onPress: chooseDocument },
      { text: "Cancel", style: "cancel" },
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
          {value ?? label}
        </Text>
        <Text style={styles.copy}>
          {value
            ? "Tap to replace attachment"
            : mediaOnly
              ? "JPG, PNG or MP4"
              : "JPG, PNG, MP4 or PDF"}
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
