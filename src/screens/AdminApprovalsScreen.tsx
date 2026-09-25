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
import { DailyReport } from "../hooks/useDailyReports";
import { SiteProgressEntry } from "../data";
import {
  MaterialRequest,
  MaterialRequestActionInput,
  MaterialRequestStatus,
} from "../hooks/useMaterialRequests";
import {
  InventoryBalance,
  InventoryTransaction,
} from "../hooks/useSiteInventory";
import { SiteVisit } from "../hooks/useSiteVisits";
import { ManagedUser } from "../hooks/useAdminMasters";
import { DropdownField } from "../components/DropdownField";
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

const progressColumns: DataTableColumn<SiteProgressEntry>[] = [
  {
    key: "date",
    label: "SUBMITTED",
    width: 130,
    render: (row) => formatDateTime(row.createdAt),
  },
  { key: "stage", label: "STAGE", width: 105, render: (row) => row.stage },
  {
    key: "progress",
    label: "PROGRESS",
    width: 80,
    render: (row) => `${row.progress}%`,
  },
  {
    key: "work",
    label: "WORK DESCRIPTION",
    width: 220,
    render: (row) => row.workDescription,
  },
  {
    key: "remarks",
    label: "REMARKS",
    width: 180,
    render: (row) => row.remarks || "—",
  },
  {
    key: "media",
    label: "EVIDENCE",
    width: 150,
    render: (row) => row.mediaName || "—",
  },
];

const reportColumns: DataTableColumn<DailyReport>[] = [
  {
    key: "date",
    label: "DATE",
    width: 100,
    render: (row) => formatDate(row.date),
  },
  {
    key: "site",
    label: "PROJECT / SITE",
    width: 190,
    render: (row) => `${row.project} · ${row.site}`,
  },
  {
    key: "supervisor",
    label: "SUPERVISOR",
    width: 130,
    render: (row) => row.supervisor,
  },
  {
    key: "workforce",
    label: "WORKFORCE",
    width: 90,
    render: (row) => String(row.workforce),
  },
  {
    key: "work",
    label: "WORK COMPLETED",
    width: 230,
    render: (row) => row.workCompleted,
  },
  {
    key: "pending",
    label: "PENDING TASKS",
    width: 120,
    render: (row) => row.pendingTaskIds.join(", ") || "—",
  },
  {
    key: "issues",
    label: "ISSUES",
    width: 190,
    render: (row) => row.issues || "—",
  },
  {
    key: "evidence",
    label: "EVIDENCE",
    width: 170,
    render: (row) =>
      [row.photoName, row.videoName].filter(Boolean).join(", ") || "—",
  },
];

const inventoryBalanceColumns: DataTableColumn<InventoryBalance>[] = [
  {
    key: "material",
    label: "MATERIAL",
    width: 180,
    render: (row) => row.materialName,
  },
  {
    key: "available",
    label: "AVAILABLE",
    width: 100,
    render: (row) => `${row.available} ${row.unit}`,
  },
  {
    key: "movements",
    label: "MOVEMENTS",
    width: 90,
    render: (row) => String(row.transactionCount),
  },
  {
    key: "stock",
    label: "STOCK STATUS",
    width: 110,
    render: (row) => (row.available <= 5 ? "Low stock" : "Available"),
  },
];

const inventoryMovementColumns: DataTableColumn<InventoryTransaction>[] = [
  {
    key: "date",
    label: "DATE",
    width: 100,
    render: (row) => formatDate(row.date),
  },
  {
    key: "material",
    label: "MATERIAL",
    width: 160,
    render: (row) => row.materialName,
  },
  { key: "type", label: "MOVEMENT", width: 100, render: (row) => row.type },
  {
    key: "quantity",
    label: "QUANTITY",
    width: 90,
    render: (row) => `${row.quantity} ${row.unit}`,
  },
  {
    key: "reference",
    label: "REFERENCE",
    width: 110,
    render: (row) => row.reference,
  },
  {
    key: "activity",
    label: "TASK / ACTIVITY",
    width: 200,
    render: (row) => row.activity,
  },
  {
    key: "remarks",
    label: "REMARKS",
    width: 180,
    render: (row) => row.remarks || "—",
  },
];

const visitColumns: DataTableColumn<SiteVisit>[] = [
  {
    key: "date",
    label: "DATE",
    width: 100,
    render: (row) => formatDate(row.date),
  },
  {
    key: "visitor",
    label: "VISITOR",
    width: 150,
    render: (row) => row.visitor,
  },
  {
    key: "time",
    label: "IN / OUT",
    width: 110,
    render: (row) => `${row.inTime} / ${row.outTime}`,
  },
  {
    key: "purpose",
    label: "PURPOSE",
    width: 210,
    render: (row) => row.purpose,
  },
  {
    key: "remarks",
    label: "REMARKS",
    width: 190,
    render: (row) => row.remarks || "—",
  },
  {
    key: "images",
    label: "IMAGES",
    width: 80,
    render: (row) => String(row.imageNames.length),
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
  progressEntries,
  dailyReports,
  materialRequests,
  onUpdateMaterialRequest,
  inventoryBalances,
  inventoryTransactions,
  siteVisits,
  supervisors,
}: {
  tasks: Task[];
  onVerify: (input: TaskUpdateInput) => void;
  attendanceEntries: AttendanceEntry[];
  financeRecords: FinanceRecord[];
  onUpdateFinanceStatus: (id: string, status: "Approved" | "Rejected") => void;
  issues: SiteIssue[];
  onUpdateIssueStatus: (
    id: string,
    status: IssueStatus,
    note: string,
    assignee?: string,
  ) => void;
  progressEntries: SiteProgressEntry[];
  dailyReports: DailyReport[];
  materialRequests: MaterialRequest[];
  onUpdateMaterialRequest: (input: MaterialRequestActionInput) => void;
  inventoryBalances: InventoryBalance[];
  inventoryTransactions: InventoryTransaction[];
  siteVisits: SiteVisit[];
  supervisors: ManagedUser[];
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
  const [materialNotes, setMaterialNotes] = useState<Record<string, string>>(
    {},
  );
  const [issueAssignees, setIssueAssignees] = useState<Record<string, string>>(
    {},
  );
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

        <View style={styles.attendanceSection}>
          <View>
            <Text style={styles.sectionTitle}>Site visits</Text>
            <Text style={styles.sectionCopy}>
              Visitor activity submitted by the Site Supervisor
            </Text>
          </View>
          <DataTable
            title="Site visit history"
            columns={visitColumns}
            rows={[...siteVisits].sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
            )}
            rowKey={(row) => row.id}
            emptyMessage="No site visits have been recorded yet."
          />
        </View>

        <View style={styles.financeSection}>
          <View>
            <Text style={styles.sectionTitle}>Material approvals</Text>
            <Text style={styles.sectionCopy}>
              Review requests and record each fulfilment stage
            </Text>
          </View>
          {materialRequests.map((request) => {
            const actions = getMaterialActions(request.status);
            const note = materialNotes[request.id] ?? "";
            return (
              <View key={request.id} style={styles.financeRow}>
                <View style={styles.financeRowTop}>
                  <View style={styles.cardHeading}>
                    <Text style={styles.taskTitle}>{request.material}</Text>
                    <Text style={styles.meta}>
                      {request.id} · {request.quantity} {request.unit} ·
                      Required {formatDate(request.requiredDate)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.status,
                      request.status === "Rejected" && styles.rejectedStatus,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        request.status === "Rejected" &&
                          styles.rejectedStatusText,
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.description}>{request.purpose}</Text>
                <Text style={styles.meta}>
                  {request.project} · {request.site}
                </Text>
                {actions.length ? (
                  <>
                    <TextInput
                      value={note}
                      onChangeText={(value) =>
                        setMaterialNotes((current) => ({
                          ...current,
                          [request.id]: value,
                        }))
                      }
                      placeholder="Approval quantity, stock source, vendor, or dispatch reference"
                      placeholderTextColor={colors.placeholder}
                      multiline
                      style={styles.resolutionInput}
                    />
                    <View style={styles.materialActions}>
                      {actions.map((action) => (
                        <Pressable
                          key={action.status}
                          onPress={() => {
                            if (!note.trim()) {
                              dialog.show(
                                "Action note required",
                                "Add the approved quantity, decision reason, stock source, vendor, or dispatch reference.",
                              );
                              return;
                            }
                            dialog.show(
                              `${action.label}?`,
                              `This will add ${action.status} to ${request.id}'s status history.`,
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: action.label,
                                  onPress: () => {
                                    onUpdateMaterialRequest({
                                      requestId: request.id,
                                      status: action.status,
                                      note: note.trim(),
                                    });
                                    setMaterialNotes((current) => ({
                                      ...current,
                                      [request.id]: "",
                                    }));
                                  },
                                },
                              ],
                            );
                          }}
                          style={[
                            styles.materialAction,
                            action.status === "Rejected" &&
                              styles.materialRejectAction,
                          ]}
                        >
                          <FontAwesome6
                            name={action.icon}
                            size={12}
                            color={
                              action.status === "Rejected"
                                ? colors.danger
                                : colors.white
                            }
                          />
                          <Text
                            style={[
                              styles.materialActionText,
                              action.status === "Rejected" &&
                                styles.materialRejectText,
                            ]}
                          >
                            {action.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.materialHistoryNote}>
                    <FontAwesome6
                      name="clock-rotate-left"
                      size={12}
                      color={colors.inkMuted}
                    />
                    <Text style={styles.meta}>
                      {request.history[0]?.note ?? "No status note"}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.attendanceSection}>
          <View>
            <Text style={styles.sectionTitle}>Site inventory monitoring</Text>
            <Text style={styles.sectionCopy}>
              Current balances calculated from all recorded movements
            </Text>
          </View>
          <DataTable
            title="Site stock balances"
            columns={inventoryBalanceColumns}
            rows={inventoryBalances}
            rowKey={(row) => row.materialId}
            emptyMessage="No site inventory is available."
          />
          <DataTable
            title="Consumption and movement history"
            columns={inventoryMovementColumns}
            rows={[...inventoryTransactions].sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
            )}
            rowKey={(row) => row.id}
            emptyMessage="No inventory movements have been recorded."
          />
        </View>

        <View style={styles.attendanceSection}>
          <View>
            <Text style={styles.sectionTitle}>Site progress review</Text>
            <Text style={styles.sectionCopy}>
              Chronological Supervisor updates and submitted evidence
            </Text>
          </View>
          <DataTable
            title="Progress history"
            columns={progressColumns}
            rows={[...progressEntries].sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
            )}
            rowKey={(row) => row.id}
            emptyMessage="No site progress has been submitted yet."
          />
        </View>

        <View style={styles.attendanceSection}>
          <View>
            <Text style={styles.sectionTitle}>Daily report review</Text>
            <Text style={styles.sectionCopy}>
              Workforce, completed work, pending tasks, and issues
            </Text>
          </View>
          <DataTable
            title="Daily report history"
            columns={reportColumns}
            rows={[...dailyReports].sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt),
            )}
            rowKey={(row) => row.id}
            emptyMessage="No daily reports have been submitted yet."
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
                {issue.assignee ? (
                  <View style={styles.materialHistoryNote}>
                    <FontAwesome6
                      name="user-check"
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={styles.meta}>
                      Assigned to {issue.assignee}
                    </Text>
                  </View>
                ) : null}
                {issue.status === "Open" ? (
                  <DropdownField
                    value={issueAssignees[issue.id]}
                    placeholder="Select responsible person"
                    options={supervisors.map((user) => ({
                      label: user.name,
                      value: user.name,
                    }))}
                    onChange={(value) =>
                      setIssueAssignees((current) => ({
                        ...current,
                        [issue.id]: value,
                      }))
                    }
                  />
                ) : null}
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
                    placeholderTextColor={colors.placeholder}
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
                      const assignee = issueAssignees[issue.id];
                      if (issue.status === "Open" && !assignee) {
                        dialog.show(
                          "Assignee required",
                          "Select the responsible Supervisor before assigning this issue.",
                        );
                        return;
                      }
                      const note =
                        issue.status === "Open"
                          ? `Assigned to ${assignee} by Company Admin.`
                          : issue.status === "In Progress"
                            ? resolutionNote.trim()
                            : next.note;
                      if (!note) {
                        dialog.show(
                          "Resolution required",
                          "Enter a resolution note before marking this record resolved.",
                        );
                        return;
                      }
                      onUpdateIssueStatus(
                        issue.id,
                        next.status,
                        note,
                        assignee,
                      );
                      setResolutionNotes((current) => ({
                        ...current,
                        [issue.id]: "",
                      }));
                      setIssueAssignees((current) => ({
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

function getMaterialActions(status: MaterialRequestStatus): {
  status: MaterialRequestActionInput["status"];
  label: string;
  icon: FontAwesomeIcon;
}[] {
  if (status === "Submitted") {
    return [
      { status: "Approved", label: "Approve", icon: "check" },
      {
        status: "Partially Approved",
        label: "Partial",
        icon: "circle-half-stroke",
      },
      { status: "Rejected", label: "Reject", icon: "xmark" },
    ];
  }
  if (status === "Approved" || status === "Partially Approved") {
    return [
      { status: "Allocated", label: "Allocate stock", icon: "boxes-stacked" },
      { status: "Purchased", label: "Record purchase", icon: "cart-shopping" },
    ];
  }
  if (status === "Allocated" || status === "Purchased") {
    return [{ status: "Dispatched", label: "Dispatch", icon: "truck" }];
  }
  return [];
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
  rejectedStatus: { backgroundColor: colors.dangerSoft },
  rejectedStatusText: { color: colors.danger },
  materialActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  materialAction: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  materialRejectAction: { backgroundColor: colors.dangerSoft },
  materialActionText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  materialRejectText: { color: colors.danger },
  materialHistoryNote: { flexDirection: "row", alignItems: "center", gap: 7 },
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
