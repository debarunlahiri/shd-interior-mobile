import { FontAwesome6 } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontAwesomeIcon } from "../types/icons";
import { colors, radius, shadow } from "../theme";

export function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable hitSlop={10} onPress={onPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  badge,
}: {
  icon: FontAwesomeIcon;
  onPress?: () => void;
  badge?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <FontAwesome6 name={icon} size={18} color={colors.ink} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

export function ProgressBar({
  value,
  color = colors.accent,
}: {
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export function StatusPill({ label }: { label: string }) {
  const danger = [
    "Critical",
    "Blocked",
    "Absent",
    "Low stock",
    "Not marked",
  ].includes(label);
  const warning = ["High", "Pending", "Half day", "Assigned", "Leave"].includes(
    label,
  );
  const backgroundColor = danger
    ? colors.dangerSoft
    : warning
      ? colors.accentSoft
      : colors.primarySoft;
  const color = danger
    ? colors.danger
    : warning
      ? colors.warning
      : colors.success;
  return (
    <View style={[styles.statusPill, { backgroundColor }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: FontAwesomeIcon;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      {icon ? (
        <FontAwesome6 name={icon} size={17} color={colors.white} />
      ) : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Surface({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sectionAction: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: "absolute",
    right: 9,
    top: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  progressTrack: {
    height: 6,
    borderRadius: 5,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 5 },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
});
