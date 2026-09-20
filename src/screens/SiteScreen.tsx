import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { attendance, inventory } from "../data";
import { colors, shadow } from "../theme";
import { SheetName } from "../types/navigation";
import {
  IconButton,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  StatusPill,
  Surface,
} from "../components/ui";

type Section = "Overview" | "Inventory" | "Attendance";
export function SiteScreen({
  onSheet,
}: {
  onSheet: (sheet: SheetName) => void;
}) {
  const [section, setSection] = useState<Section>("Overview");
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Palm Grove</Text>
          <Text style={styles.subtitle}>Villa 18 · Active site</Text>
        </View>
        <IconButton icon="ellipsis" />
      </View>
      <View style={styles.segmented}>
        {(["Overview", "Inventory", "Attendance"] as Section[]).map((item) => (
          <Pressable
            key={item}
            onPress={() => setSection(item)}
            style={[styles.segment, section === item && styles.segmentActive]}
          >
            <Text
              style={[
                styles.segmentText,
                section === item && styles.segmentTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {section === "Overview" ? (
          <Overview onSheet={onSheet} />
        ) : section === "Inventory" ? (
          <Inventory onSheet={onSheet} />
        ) : (
          <Attendance onSheet={onSheet} />
        )}
      </ScrollView>
    </View>
  );
}

function Overview({ onSheet }: { onSheet: (sheet: SheetName) => void }) {
  return (
    <>
      <Surface style={styles.summary}>
        <View style={styles.circle}>
          <Text style={styles.circleValue}>68%</Text>
          <Text style={styles.circleLabel}>complete</Text>
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Interior execution</Text>
          <Text style={styles.summaryMeta}>
            Day 100 of 171 · 71 days remaining
          </Text>
          <ProgressBar value={68} />
          <Text style={styles.phase}>Current phase: Ceiling & electrical</Text>
        </View>
      </Surface>
      <SectionHeader title="Today's snapshot" />
      <View style={styles.snapshotGrid}>
        <Snapshot icon="people-group" value="26" label="Workers" />
        <Snapshot icon="list-check" value="3/6" label="Tasks done" />
        <Snapshot icon="truck-ramp-box" value="2" label="Deliveries" />
        <Snapshot icon="wallet" value="₹4,050" label="Expenses" />
      </View>
      <SectionHeader
        title="Recent progress"
        action="Add update"
        onPress={() => onSheet("progress")}
      />
      <Surface style={styles.update}>
        <View style={styles.photo}>
          <FontAwesome6 name="images" size={28} color={colors.primary} />
          <Text style={styles.photoText}>+4 site photos</Text>
        </View>
        <View style={styles.updateBody}>
          <View style={styles.updateTop}>
            <Text style={styles.updateTitle}>False ceiling framework</Text>
            <StatusPill label="In progress" />
          </View>
          <Text style={styles.updateCopy}>
            Living room grid alignment completed. Electrical cut-outs are being
            marked.
          </Text>
          <Text style={styles.updateMeta}>Today, 10:24 AM · Arjun Kumar</Text>
        </View>
      </Surface>
    </>
  );
}
function Inventory({ onSheet }: { onSheet: (sheet: SheetName) => void }) {
  return (
    <>
      <View style={styles.inventoryHeader}>
        <View>
          <Text style={styles.inventoryCount}>4</Text>
          <Text style={styles.subtitle}>Tracked materials</Text>
        </View>
        <PrimaryButton
          label="Request"
          icon="plus"
          onPress={() => onSheet("material")}
        />
      </View>
      <Surface style={styles.listCard}>
        {inventory.map((item, index) => (
          <View key={item.name}>
            {index ? <View style={styles.divider} /> : null}
            <View style={styles.inventoryRow}>
              <View style={styles.rowIcon}>
                <FontAwesome6 name="cubes" size={17} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <StatusPill label={item.state} />
                </View>
                <View style={styles.stockMeta}>
                  <Text style={styles.rowMeta}>{item.quantity} available</Text>
                  <Text style={styles.rowMeta}>{item.level}%</Text>
                </View>
                <ProgressBar
                  value={item.level}
                  color={item.level < 30 ? colors.danger : colors.success}
                />
              </View>
            </View>
          </View>
        ))}
      </Surface>
    </>
  );
}
function Attendance({ onSheet }: { onSheet: (sheet: SheetName) => void }) {
  return (
    <>
      <View style={styles.attendanceHero}>
        <View>
          <Text style={styles.attendanceCount}>26</Text>
          <Text style={styles.attendanceLabel}>Present today</Text>
        </View>
        <View style={styles.attendanceRight}>
          <Text style={styles.attendanceLabel}>28 total workforce</Text>
          <PrimaryButton
            label="Mark"
            icon="user-plus"
            onPress={() => onSheet("attendance")}
          />
        </View>
      </View>
      <Surface style={styles.listCard}>
        {attendance.map((person, index) => (
          <View key={person.name}>
            {index ? <View style={styles.divider} /> : null}
            <View style={styles.personRow}>
              <View style={styles.personAvatar}>
                <Text style={styles.personInitial}>
                  {person.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{person.name}</Text>
                <Text style={styles.rowMeta}>{person.trade}</Text>
              </View>
              <StatusPill label={person.status} />
            </View>
          </View>
        ))}
      </Surface>
    </>
  );
}
function Snapshot({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof FontAwesome6>["name"];
  value: string;
  label: string;
}) {
  return (
    <Surface style={styles.snapshot}>
      <FontAwesome6 name={icon} size={18} color={colors.primary} />
      <Text style={styles.snapshotValue}>{value}</Text>
      <Text style={styles.snapshotLabel}>{label}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: { color: colors.inkMuted, fontSize: 12, marginTop: 4 },
  segmented: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 15,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  segmentActive: { backgroundColor: colors.surface, ...shadow },
  segmentText: { color: colors.inkMuted, fontSize: 11, fontWeight: "600" },
  segmentTextActive: { color: colors.primary, fontWeight: "800" },
  content: { paddingHorizontal: 20, paddingBottom: 112 },
  summary: {
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 25,
  },
  circle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 7,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  circleValue: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  circleLabel: { color: colors.inkMuted, fontSize: 8 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  summaryMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 4,
    marginBottom: 11,
  },
  phase: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 9,
  },
  snapshotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  snapshot: { width: "48.5%", padding: 14 },
  snapshotValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 11,
  },
  snapshotLabel: { color: colors.inkMuted, fontSize: 10, marginTop: 2 },
  update: { overflow: "hidden" },
  photo: {
    height: 130,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
  },
  updateBody: { padding: 15 },
  updateTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  updateTitle: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  updateCopy: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  updateMeta: { color: colors.inkMuted, fontSize: 9, marginTop: 10 },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  inventoryCount: { color: colors.ink, fontSize: 25, fontWeight: "800" },
  listCard: { paddingHorizontal: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  inventoryRow: { flexDirection: "row", gap: 12, paddingVertical: 15 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  rowInfo: { flex: 1 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  rowMeta: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  stockMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
    marginBottom: 7,
  },
  attendanceHero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  attendanceCount: { color: colors.white, fontSize: 27, fontWeight: "800" },
  attendanceLabel: { color: "rgba(255,255,255,.7)", fontSize: 10 },
  attendanceRight: { alignItems: "flex-end", gap: 9 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  personAvatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  personInitial: { color: colors.warning, fontSize: 11, fontWeight: "800" },
});
