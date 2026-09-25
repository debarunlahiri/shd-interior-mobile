import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSyncStatus } from "../sync/SyncProvider";
import { colors } from "../theme";

export function NetworkStatusBanner() {
  const { connectivity } = useSyncStatus();

  if (connectivity !== "offline") return null;

  return (
    <View style={styles.container} accessibilityRole="text">
      <FontAwesome6 name="wifi" size={12} color={colors.danger} />
      <Text style={styles.text}>Offline · changes saved on this device</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 30,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderBottomWidth: 1,
    backgroundColor: colors.dangerSoft,
    borderBottomColor: colors.danger,
  },
  text: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
  },
});
