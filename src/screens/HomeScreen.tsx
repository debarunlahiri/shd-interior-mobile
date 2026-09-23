import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Task } from "../data";
import { colors, shadow } from "../theme";
import { FontAwesomeIcon } from "../types/icons";
import { SheetName, TabName } from "../types/navigation";
import { TaskCard } from "../components/TaskCard";
import { IconButton, SectionHeader, Surface } from "../components/ui";

export function HomeScreen({
  onTab,
  onSheet,
  onTask,
  tasks,
}: {
  onTab: (tab: TabName) => void;
  onSheet: (sheet: SheetName) => void;
  onTask: (task: Task) => void;
  tasks: Task[];
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>SATURDAY, 20 SEPTEMBER</Text>
          <Text style={styles.greeting}>Good morning, Arjun</Text>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="bell"
            badge
            onPress={() => onSheet("notifications")}
          />
          <Pressable style={styles.avatar} onPress={() => onSheet("profile")}>
            <Text style={styles.avatarText}>AK</Text>
          </Pressable>
        </View>
      </View>
      <LinearGradient
        colors={["#173F35", "#255E4D"]}
        style={styles.projectCard}
      >
        <View style={styles.projectTop}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>ACTIVE SITE</Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={14}
            color="rgba(255,255,255,.75)"
          />
        </View>
        <Text style={styles.projectName}>Palm Grove Residence</Text>
        <View style={styles.location}>
          <FontAwesome6
            name="location-dot"
            size={13}
            color="rgba(255,255,255,.68)"
          />
          <Text style={styles.locationText}>Villa 18 · Gurugram, Haryana</Text>
        </View>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>Overall progress</Text>
          <Text style={styles.progressValue}>68%</Text>
        </View>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>
        <View style={styles.meta}>
          <View>
            <Text style={styles.metaLabel}>Start date</Text>
            <Text style={styles.metaValue}>12 Jun 2026</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.metaLabel}>Target completion</Text>
            <Text style={styles.metaValue}>30 Nov 2026</Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.stats}>
        <Stat
          icon="list-check"
          value="3"
          label="Today's tasks"
          onPress={() => onTab("Tasks")}
        />
        <Stat
          icon="people-group"
          value="26"
          label="Workforce"
          onPress={() => onSheet("attendance")}
        />
        <Stat
          icon="triangle-exclamation"
          value="2"
          label="Open issues"
          danger
          onPress={() => onSheet("issue")}
        />
      </View>
      <SectionHeader title="Quick actions" />
      <View style={styles.quickGrid}>
        <Quick
          icon="file-lines"
          label="Daily report"
          onPress={() => onSheet("report")}
        />
        <Quick
          icon="cubes"
          label="Request material"
          onPress={() => onSheet("material")}
        />
        <Quick
          icon="wallet"
          label="Add expense"
          onPress={() => onSheet("expense")}
        />
        <Quick
          icon="triangle-exclamation"
          label="Report issue"
          onPress={() => onSheet("issue")}
        />
      </View>
      <SectionHeader
        title="Today's tasks"
        action="View all"
        onPress={() => onTab("Tasks")}
      />
      <View style={styles.taskList}>
        {tasks.slice(0, 3).map((task) => (
          <TaskCard key={task.id} task={task} onPress={() => onTask(task)} />
        ))}
      </View>
      <SectionHeader
        title="Site activity"
        action="View site"
        onPress={() => onTab("Site")}
      />
      <Surface style={styles.activity}>
        <Activity
          icon="images"
          title="Progress update added"
          meta="False ceiling framework · 28 min ago"
        />
        <View style={styles.rowDivider} />
        <Activity
          icon="cubes"
          title="Material received"
          meta="12 gypsum boards · 1 hr ago"
        />
        <View style={styles.rowDivider} />
        <Activity
          icon="user-check"
          title="Attendance submitted"
          meta="26 workers · 8:42 AM"
        />
      </Surface>
    </ScrollView>
  );
}

function Stat({
  icon,
  value,
  label,
  danger,
  onPress,
}: {
  icon: FontAwesomeIcon;
  value: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const color = danger ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && styles.statPressed]}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <FontAwesome6 name={icon} size={17} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statFooter}>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
        <FontAwesome6 name="chevron-right" size={8} color={colors.inkMuted} />
      </View>
    </Pressable>
  );
}
function Quick({
  icon,
  label,
  onPress,
}: {
  icon: FontAwesomeIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, pressed && { opacity: 0.72 }]}
    >
      <View style={styles.quickIcon}>
        <FontAwesome6 name={icon} size={19} color={colors.primary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <FontAwesome6 name="chevron-right" size={11} color="#A5ABA8" />
    </Pressable>
  );
}
function Activity({
  icon,
  title,
  meta,
}: {
  icon: FontAwesomeIcon;
  title: string;
  meta: string;
}) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIcon}>
        <FontAwesome6 name={icon} size={16} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityMeta}>{meta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 112 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  greeting: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  actions: { flexDirection: "row", gap: 9 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.warning, fontSize: 13, fontWeight: "800" },
  projectCard: { borderRadius: 24, padding: 20, marginBottom: 16, ...shadow },
  projectTop: { flexDirection: "row", justifyContent: "space-between" },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8ED6A9" },
  liveText: {
    color: "#DFF4E7",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  projectName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 17,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  locationText: { color: "rgba(255,255,255,.68)", fontSize: 12 },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 8,
  },
  progressLabel: { color: "rgba(255,255,255,.76)", fontSize: 12 },
  progressValue: { color: colors.white, fontSize: 12, fontWeight: "800" },
  track: {
    height: 6,
    backgroundColor: "rgba(255,255,255,.16)",
    borderRadius: 5,
  },
  fill: {
    height: 6,
    width: "68%",
    backgroundColor: "#E7B45E",
    borderRadius: 5,
  },
  meta: { flexDirection: "row", marginTop: 20, alignItems: "center", gap: 18 },
  divider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,.17)" },
  metaLabel: { color: "rgba(255,255,255,.57)", fontSize: 9, marginBottom: 4 },
  metaValue: { color: colors.white, fontSize: 12, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 10, marginBottom: 26 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    marginTop: 2,
  },
  statLabel: { flex: 1, color: colors.inkMuted, fontSize: 10 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 27,
  },
  quick: {
    width: "48.5%",
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 9,
  },
  quickIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  taskList: { gap: 11, marginBottom: 27 },
  activity: { paddingHorizontal: 15 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  activityMeta: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  rowDivider: { height: 1, backgroundColor: colors.border },
});
