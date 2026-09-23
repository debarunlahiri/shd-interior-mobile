import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Task } from "../data";
import { AttendanceEntry } from "../hooks/useAttendance";
import { FinanceRecord } from "../hooks/useFinance";
import { IssueStatus, SiteIssue } from "../hooks/useIssues";
import { TaskUpdateInput } from "../hooks/useTasks";
import { colors, radius } from "../theme";
import { FontAwesomeIcon } from "../types/icons";
import { useAppDialog } from "../components/AppDialog";
import { formatDate, formatDateTime } from "../utils/date";
import { DataTable, DataTableColumn } from "../components/DataTable";

const attendanceColumns: DataTableColumn<AttendanceEntry>[] = [
  {
    key: "date",
    label: "DATE",
    width: 100,
    render: (row) => formatDate(row.date),
  },
  {
    key: "worker",
    label: "WORKER",
    width: 130,
    render: (row) => row.workerName,
  },
  { key: "trade", label: "TRADE", width: 100, render: (row) => row.trade },
  { key: "status", label: "STATUS", width: 90, render: (row) => row.status },
  {
    key: "hours",
    label: "IN / OUT",
    width: 110,
    render: (row) =>
      row.inTime && row.outTime ? `${row.inTime} / ${row.outTime}` : "—",
  },
  {
    key: "overtime",
    label: "OT",
    width: 70,
    render: (row) => `${row.overtimeHours}h`,
  },
  {
    key: "remarks",
    label: "REMARKS",
    width: 150,
    render: (row) => row.remarks ?? "—",
  },
];

function nextIssueAction(status: IssueStatus): {
  status: IssueStatus;
  label: string;
  note: string;
  icon: FontAwesomeIcon;
} | null {
  if (status === "Open") {
    return {
      status: "Assigned",
      label: "Assign issue",
      note: "Assigned for action by Company Admin.",
      icon: "user-check",
    };
  }
  if (status === "Assigned") {
    return {
      status: "In Progress",
      label: "Start resolution",
      note: "Resolution work started.",
      icon: "play",
    };
  }
  if (status === "In Progress") {
    return {
      status: "Resolved",
      label: "Mark resolved",
      note: "",
      icon: "circle-check",
    };
  }
  if (status === "Resolved") {
    return {
      status: "Closed",
      label: "Close record",
      note: "Resolution confirmed and record closed.",
      icon: "lock",
    };
  }
  return null;
}

export function AdminApprovalsScreen({
  tasks,
  onVerify,
  attendanceEntries,
  financeRecords,
  onUpdateFinanceStatus,
  issues,
  onUpdateIssueStatus,
}: {
  tasks: Task[];
  onVerify: (input: TaskUpdateInput) => void;
  attendanceEntries: AttendanceEntry[];
  financeRecords: FinanceRecord[];
  onUpdateFinanceStatus: (id: string, status: "Approved" | "Rejected") => void;
  issues: SiteIssue[];
  onUpdateIssueStatus: (id: string, status: IssueStatus, note: string) => void;
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
  const [resolutionNotes, setResolutionNotes] = useState<
    Record<string, string>
  >({});
  const submittedFinance = financeRecords.filter(
    (record) => record.kind === "Expense" || record.kind === "Local Purchase",
  );

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

        <View style={styles.attendanceSection}>
          <View>
            <Text style={styles.sectionTitle}>Workforce attendance</Text>
            <Text style={styles.sectionCopy}>
              Supervisor-submitted daily records
            </Text>
          </View>
          <DataTable
            title="Attendance history"
            columns={attendanceColumns}
            rows={attendanceEntries}
            rowKey={(row) => row.id}
            emptyMessage="No attendance has been submitted yet."
          />
        </View>

        <View style={styles.financeSection}>
          <View>
            <Text style={styles.sectionTitle}>Expense approvals</Text>
            <Text style={styles.sectionCopy}>
              Approved records are deducted from site cash
            </Text>
          </View>
          {submittedFinance.map((record) => (
            <View key={record.id} style={styles.financeRow}>
              <View style={styles.financeRowTop}>
                <View style={styles.cardHeading}>
                  <Text style={styles.taskTitle}>{record.purpose}</Text>
                  <Text style={styles.meta}>
                    {record.reference} · {formatDate(record.date)} ·{" "}
                    {record.paidTo}
                  </Text>
                </View>
                <Text style={styles.financeAmount}>
                  ₹{record.amount.toLocaleString("en-IN")}
                </Text>
              </View>
              {record.status === "Pending" ? (
                <View style={styles.financeActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onUpdateFinanceStatus(record.id, "Rejected")}
                    style={[styles.financeAction, styles.rejectAction]}
                  >
                    <FontAwesome6
                      name="xmark"
                      size={13}
                      color={colors.danger}
                    />
                    <Text style={styles.rejectActionText}>Reject</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onUpdateFinanceStatus(record.id, "Approved")}
                    style={[styles.financeAction, styles.approveAction]}
                  >
                    <FontAwesome6 name="check" size={13} color={colors.white} />
                    <Text style={styles.approveActionText}>Approve</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.financeStatusRow}>
                  <FontAwesome6
                    name={
                      record.status === "Approved"
                        ? "circle-check"
                        : "circle-xmark"
                    }
                    size={13}
                    color={
                      record.status === "Approved"
                        ? colors.success
                        : colors.danger
                    }
                  />
                  <Text
                    style={[
                      styles.financeStatusText,
                      record.status === "Rejected" &&
                        styles.financeRejectedText,
                    ]}
                  >
                    {record.status}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {submittedFinance.length === 0 ? (
            <Text style={styles.emptyCopy}>No expenses awaiting review.</Text>
          ) : null}
        </View>

        <View style={styles.financeSection}>
          <View>
            <Text style={styles.sectionTitle}>Issues and support</Text>
            <Text style={styles.sectionCopy}>
              Assign, resolve, and close site requests
            </Text>
          </View>
          {issues.map((issue) => {
            const next = nextIssueAction(issue.status);
            const resolutionNote = resolutionNotes[issue.id] ?? "";
            return (
              <View key={issue.id} style={styles.financeRow}>
                <View style={styles.financeRowTop}>
                  <View style={styles.cardHeading}>
                    <Text style={styles.taskTitle}>{issue.title}</Text>
                    <Text style={styles.meta}>
                      {issue.id} · {issue.kind} · {issue.priority}
                    </Text>
                  </View>
                  <View style={styles.status}>
                    <Text style={styles.statusText}>{issue.status}</Text>
                  </View>
                </View>
                <Text style={styles.description}>{issue.remarks}</Text>
                <Text style={styles.meta}>
                  {issue.photoNames.length + issue.videoNames.length}{" "}
                  attachments · {formatDate(issue.reportedDate)}
                </Text>
                {issue.status === "In Progress" ? (
                  <TextInput
                    value={resolutionNote}
                    onChangeText={(value) =>
                      setResolutionNotes((current) => ({
                        ...current,
                        [issue.id]: value,
                      }))
                    }
                    style={styles.resolutionInput}
                    placeholder="Enter the resolution before resolving"
                    placeholderTextColor="#969E9B"
                    multiline
                  />
                ) : null}
                {issue.resolution ? (
                  <View style={styles.resolutionNote}>
                    <FontAwesome6
                      name="circle-check"
                      size={13}
                      color={colors.success}
                    />
                    <Text style={styles.resolutionText}>
                      {issue.resolution}
                    </Text>
                  </View>
                ) : null}
                {next ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const note =
                        issue.status === "In Progress"
                          ? resolutionNote.trim()
                          : next.note;
                      if (!note) {
                        dialog.show(
                          "Resolution required",
                          "Enter a resolution note before marking this record resolved.",
                        );
                        return;
                      }
                      onUpdateIssueStatus(issue.id, next.status, note);
                      setResolutionNotes((current) => ({
                        ...current,
                        [issue.id]: "",
                      }));
                    }}
                    style={styles.issueAction}
                  >
                    <FontAwesome6
                      name={next.icon}
                      size={13}
                      color={colors.white}
                    />
                    <Text style={styles.approveActionText}>{next.label}</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Task verification</Text>

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
  attendanceSection: {
    gap: 10,
    padding: 14,
    marginBottom: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  sectionCopy: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  financeSection: {
    gap: 10,
    padding: 14,
    marginBottom: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  financeRow: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  financeRowTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  financeAmount: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  financeActions: { flexDirection: "row", gap: 8 },
  financeAction: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  rejectAction: { backgroundColor: colors.dangerSoft },
  approveAction: { backgroundColor: colors.primary },
  rejectActionText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  approveActionText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  financeStatusRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  financeStatusText: { color: colors.success, fontSize: 10, fontWeight: "800" },
  financeRejectedText: { color: colors.danger },
  resolutionInput: {
    minHeight: 70,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.ink,
    padding: 11,
    fontSize: 11,
    textAlignVertical: "top",
  },
  resolutionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  resolutionText: {
    flex: 1,
    color: colors.success,
    fontSize: 10,
    lineHeight: 15,
  },
  issueAction: {
    minHeight: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
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
