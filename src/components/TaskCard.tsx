import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Task } from "../data";
import { colors, radius } from "../theme";
import { ProgressBar, StatusPill } from "./ui";

export function TaskCard({
  task,
  onPress,
  detailed = false,
}: {
  task: Task;
  onPress: () => void;
  detailed?: boolean;
}) {
  const priorityColor =
    task.priority === "Critical"
      ? colors.danger
      : task.priority === "High"
        ? colors.accent
        : task.priority === "Medium"
          ? colors.success
          : colors.inkMuted;
  const progressColor =
    task.status === "Blocked"
      ? colors.danger
      : task.status === "Completed" || task.status === "Verified"
        ? colors.success
        : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.reference}>
            <View
              style={[styles.priorityDot, { backgroundColor: priorityColor }]}
            />
            <Text style={styles.id}>{task.id}</Text>
          </View>
          <StatusPill label={task.priority} />
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.areaRow}>
          <FontAwesome6 name="location-dot" size={10} color={colors.inkMuted} />
          <Text style={styles.area}>{task.area}</Text>
        </View>
        {detailed ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        <View style={styles.progressBlock}>
          <View style={styles.progressTop}>
            <View style={styles.statusRow}>
              <FontAwesome6
                name={
                  task.status === "Blocked"
                    ? "circle-exclamation"
                    : "bars-progress"
                }
                size={11}
                color={progressColor}
              />
              <Text style={[styles.status, { color: progressColor }]}>
                {task.status}
              </Text>
            </View>
            <Text style={styles.percent}>{task.progress}%</Text>
          </View>
          <ProgressBar value={task.progress} color={progressColor} />
        </View>
        <View style={styles.footer}>
          <FontAwesome6 name="clock" size={12} color={colors.inkMuted} />
          <Text style={styles.due}>{task.due}</Text>
          <FontAwesome6
            name="chevron-right"
            size={12}
            color={colors.placeholder}
            style={styles.chevron}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { padding: 16 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reference: { flexDirection: "row", alignItems: "center", gap: 7 },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  id: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  title: { color: colors.ink, fontSize: 15, fontWeight: "700", marginTop: 8 },
  areaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  area: { color: colors.inkMuted, fontSize: 11 },
  description: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  progressBlock: {
    marginTop: 13,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  status: { fontSize: 10, fontWeight: "700" },
  percent: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  due: { color: colors.inkMuted, fontSize: 10 },
  chevron: { marginLeft: "auto" },
  pressed: { opacity: 0.72 },
});
