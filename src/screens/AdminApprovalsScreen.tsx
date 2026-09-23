import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Task } from "../data";
import { TaskUpdateInput } from "../hooks/useTasks";
import { colors, radius } from "../theme";
import { useAppDialog } from "../components/AppDialog";
import { formatDateTime } from "../utils/date";

export function AdminApprovalsScreen({
  tasks,
  onVerify,
}: {
  tasks: Task[];
  onVerify: (input: TaskUpdateInput) => void;
}) {
  const dialog = useAppDialog();
  const reviewTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "Completed" || task.status === "Verified",
      ),
    [tasks],
  );
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const verifyTask = (task: Task) => {
    dialog.show(
      "Verify completed task?",
      `${task.id} will be marked as verified by Admin.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify task",
          onPress: () => {
            onVerify({
              taskId: task.id,
              status: "Verified",
              progress: 100,
              remark: "Completion reviewed and verified by Admin",
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <FontAwesome6
            name="clipboard-check"
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Task verification</Text>
          <Text style={styles.subtitle}>
            Review completed site work before approval
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <Summary
            label="Waiting"
            value={
              reviewTasks.filter((task) => task.status === "Completed").length
            }
            icon="clock"
          />
          <Summary
            label="Verified"
            value={
              reviewTasks.filter((task) => task.status === "Verified").length
            }
            icon="circle-check"
          />
        </View>

        {reviewTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6
              name="clipboard-check"
              size={24}
              color={colors.inkMuted}
            />
            <Text style={styles.emptyTitle}>No tasks awaiting review</Text>
            <Text style={styles.emptyCopy}>
              Supervisor-completed tasks will appear here.
            </Text>
          </View>
        ) : (
          reviewTasks.map((task) => {
            const expanded = expandedTaskId === task.id;
            const evidence = task.updates
              .flatMap((update) => [
                update.beforeMediaName,
                update.duringMediaName,
                update.afterMediaName,
                update.evidenceName,
              ])
              .filter((name): name is string => Boolean(name));

            return (
              <View key={task.id} style={styles.card}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setExpandedTaskId(expanded ? null : task.id)}
                  style={styles.cardHeader}
                >
                  <View style={styles.cardHeading}>
                    <Text style={styles.taskId}>{task.id}</Text>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.meta}>{task.area}</Text>
                  </View>
                  <View style={styles.statusWrap}>
                    <View
                      style={[
                        styles.status,
                        task.status === "Verified" && styles.statusVerified,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          task.status === "Verified" &&
                            styles.statusTextVerified,
                        ]}
                      >
                        {task.status}
                      </Text>
                    </View>
                    <FontAwesome6
                      name={expanded ? "chevron-up" : "chevron-down"}
                      size={13}
                      color={colors.inkMuted}
                    />
                  </View>
                </Pressable>

                {expanded ? (
                  <View style={styles.details}>
                    <Text style={styles.description}>{task.description}</Text>
                    <View style={styles.detailRow}>
                      <Detail label="Progress" value={`${task.progress}%`} />
                      <Detail
                        label="Updates"
                        value={`${task.updates.length}`}
                      />
                      <Detail label="Evidence" value={`${evidence.length}`} />
                    </View>
                    {task.updates.length > 0 ? (
                      <View style={styles.history}>
                        <Text style={styles.sectionLabel}>LATEST UPDATE</Text>
                        <Text style={styles.historyRemark}>
                          {task.updates[0].remark}
                        </Text>
                        <Text style={styles.historyMeta}>
                          {formatDateTime(task.updates[0].createdAt)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noHistory}>
                        No submitted update history is available for this demo
                        task.
                      </Text>
                    )}
                    {evidence.length > 0 ? (
                      <View style={styles.evidenceList}>
                        <Text style={styles.sectionLabel}>EVIDENCE</Text>
                        {evidence.map((name, index) => (
                          <View
                            key={`${name}-${index}`}
                            style={styles.evidenceRow}
                          >
                            <FontAwesome6
                              name="paperclip"
                              size={12}
                              color={colors.primary}
                            />
                            <Text style={styles.evidenceName}>{name}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {task.status === "Completed" ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => verifyTask(task)}
                        style={styles.verifyButton}
                      >
                        <FontAwesome6
                          name="circle-check"
                          size={15}
                          color={colors.white}
                        />
                        <Text style={styles.verifyButtonText}>Verify task</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.verifiedNote}>
                        <FontAwesome6
                          name="circle-check"
                          size={14}
                          color={colors.success}
                        />
                        <Text style={styles.verifiedNoteText}>
                          Admin verification recorded in task history
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Summary({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: "clock" | "circle-check";
}) {
  return (
    <View style={styles.summaryCard}>
      <FontAwesome6 name={icon} size={15} color={colors.primary} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  content: { paddingHorizontal: 20, paddingBottom: 112, gap: 10 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  summaryCard: {
    flex: 1,
    minHeight: 78,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  summaryLabel: { color: colors.inkMuted, fontSize: 10, marginTop: 2 },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardHeader: {
    minHeight: 88,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardHeading: { flex: 1 },
  taskId: { color: colors.inkMuted, fontSize: 9, fontWeight: "800" },
  taskTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  meta: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
  statusWrap: { alignItems: "flex-end", gap: 12 },
  status: {
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusVerified: { backgroundColor: colors.primarySoft },
  statusText: { color: colors.warning, fontSize: 9, fontWeight: "800" },
  statusTextVerified: { color: colors.success },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 15,
    gap: 14,
  },
  description: { color: colors.inkMuted, fontSize: 11, lineHeight: 17 },
  detailRow: { flexDirection: "row", gap: 8 },
  detail: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: 10,
  },
  detailValue: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  detailLabel: { color: colors.inkMuted, fontSize: 9, marginTop: 3 },
  history: { gap: 4 },
  sectionLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  historyRemark: { color: colors.ink, fontSize: 11, lineHeight: 16 },
  historyMeta: { color: colors.inkMuted, fontSize: 9 },
  noHistory: { color: colors.warning, fontSize: 10, lineHeight: 15 },
  evidenceList: { gap: 7 },
  evidenceRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  evidenceName: { flex: 1, color: colors.ink, fontSize: 10 },
  verifyButton: {
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  verifyButtonText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  verifiedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 3,
  },
  verifiedNoteText: { color: colors.success, fontSize: 10, fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    padding: 28,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
  },
  emptyCopy: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
});
