import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DatePickerField } from "../components/DatePickerField";
import { DropdownField } from "../components/DropdownField";
import { ProgressBar, StatusPill } from "../components/ui";
import { Task } from "../data";
import { ManagedUser } from "../hooks/useAdminMasters";
import { AdminProject } from "../hooks/useAdminProjects";
import { CreateTaskInput, TaskUpdateInput } from "../hooks/useTasks";
import { colors, radius } from "../theme";
import { formatDate, formatDateTime } from "../utils/date";

type Props = {
  tasks: Task[];
  projects: AdminProject[];
  supervisors: ManagedUser[];
  onCreate: (input: CreateTaskInput) => void;
  onVerify: (input: TaskUpdateInput) => void;
  onBack: () => void;
};

const filters = [
  "All",
  "Assigned",
  "In progress",
  "Blocked",
  "Completed",
  "Verified",
];

export function AdminTasksScreen({
  tasks,
  projects,
  supervisors,
  onCreate,
  onVerify,
  onBack,
}: Props) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks.filter(
      (task) =>
        (filter === "All" || task.status === filter) &&
        (!normalizedQuery ||
          [
            task.id,
            task.title,
            task.projectName,
            task.siteName,
            task.supervisorName,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedQuery))),
    );
  }, [filter, query, tasks]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerButton}>
          <FontAwesome6 name="arrow-left" size={16} color={colors.ink} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Task management</Text>
          <Text style={styles.subtitle}>Assign and review site work</Text>
        </View>
        <Pressable onPress={() => setCreating(true)} style={styles.addButton}>
          <FontAwesome6 name="plus" size={15} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.search}>
        <FontAwesome6
          name="magnifying-glass"
          size={15}
          color={colors.inkMuted}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search task, project, or supervisor"
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                filter === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <Summary
            label="Open"
            value={
              tasks.filter(
                (task) => !["Completed", "Verified"].includes(task.status),
              ).length
            }
          />
          <Summary
            label="Review"
            value={tasks.filter((task) => task.status === "Completed").length}
          />
          <Summary
            label="Verified"
            value={tasks.filter((task) => task.status === "Verified").length}
          />
        </View>
        <Text style={styles.count}>{visible.length} TASKS</Text>
        {visible.map((task) => {
          const expanded = task.id === expandedId;
          return (
            <View key={task.id} style={styles.card}>
              <Pressable
                onPress={() => setExpandedId(expanded ? null : task.id)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardCopy}>
                    <Text style={styles.taskId}>{task.id}</Text>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.meta}>
                      {task.projectName ?? "Palm Grove Residence"} ·{" "}
                      {task.siteName ?? task.area}
                    </Text>
                  </View>
                  <StatusPill label={task.status} />
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progress}>
                    <ProgressBar value={task.progress} />
                  </View>
                  <Text style={styles.progressText}>{task.progress}%</Text>
                </View>
                <View style={styles.assignmentRow}>
                  <FontAwesome6
                    name="helmet-safety"
                    iconStyle="solid"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.assignmentText}>
                    {task.supervisorName ?? "Arjun Kumar"}
                  </Text>
                  <Text style={styles.dueText}>
                    {task.dueDate ? formatDate(task.dueDate) : task.due}
                  </Text>
                  <FontAwesome6
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={11}
                    color={colors.inkMuted}
                  />
                </View>
              </Pressable>
              {expanded ? (
                <View style={styles.details}>
                  <Text style={styles.description}>{task.description}</Text>
                  <Text style={styles.historyTitle}>UPDATE HISTORY</Text>
                  {task.updates.length ? (
                    task.updates.map((update) => (
                      <View key={update.id} style={styles.historyRow}>
                        <View style={styles.historyDot} />
                        <View style={styles.historyCopy}>
                          <Text style={styles.historyStatus}>
                            {update.status} · {update.progress}%
                          </Text>
                          <Text style={styles.historyRemark}>
                            {update.remark || "No remark provided"}
                          </Text>
                          {[
                            update.beforeMediaName,
                            update.duringMediaName,
                            update.afterMediaName,
                            update.evidenceName,
                          ].filter(Boolean).length ? (
                            <View style={styles.evidenceRow}>
                              <FontAwesome6
                                name="paperclip"
                                size={10}
                                color={colors.primary}
                              />
                              <Text style={styles.evidenceText}>
                                {[
                                  update.beforeMediaName,
                                  update.duringMediaName,
                                  update.afterMediaName,
                                  update.evidenceName,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </Text>
                            </View>
                          ) : null}
                          <Text style={styles.historyDate}>
                            {formatDateTime(update.createdAt)}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No progress updates yet.
                    </Text>
                  )}
                  {task.status === "Completed" ? (
                    <Pressable
                      onPress={() =>
                        onVerify({
                          taskId: task.id,
                          status: "Verified",
                          progress: 100,
                          remark: "Completion reviewed and verified by Admin",
                        })
                      }
                      style={styles.verifyButton}
                    >
                      <FontAwesome6
                        name="circle-check"
                        size={15}
                        color={colors.white}
                      />
                      <Text style={styles.verifyText}>
                        Verify completed task
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}
        {!visible.length ? (
          <Text style={styles.emptyText}>No tasks match this view.</Text>
        ) : null}
      </ScrollView>

      <CreateTaskModal
        visible={creating}
        projects={projects}
        supervisors={supervisors}
        onClose={() => setCreating(false)}
        onCreate={(input) => {
          onCreate(input);
          setCreating(false);
        }}
      />
    </View>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function CreateTaskModal({
  visible,
  projects,
  supervisors,
  onClose,
  onCreate,
}: {
  visible: boolean;
  projects: AdminProject[];
  supervisors: ManagedUser[];
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => void;
}) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [description, setDescription] = useState("");
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [error, setError] = useState("");
  const project = projects.find((item) => item.id === projectId);
  const site = project?.sites.find((item) => item.id === siteId);
  const supervisor = supervisors.find((item) => item.id === supervisorId);

  const submit = () => {
    if (
      !title.trim() ||
      !project ||
      !site ||
      !supervisor ||
      !dueDate ||
      !description.trim()
    ) {
      setError("Complete all required fields before assigning the task.");
      return;
    }
    onCreate({
      title: title.trim(),
      area: `${site.name} · ${site.location}`,
      due: formatDate(dueDate),
      dueDate,
      priority,
      description: description.trim(),
      evidenceRequired,
      projectId: project.id,
      projectName: project.name,
      siteId: site.id,
      siteName: site.name,
      supervisorId: supervisor.id,
      supervisorName: supervisor.name,
    });
    setTitle("");
    setProjectId("");
    setSiteId("");
    setSupervisorId("");
    setDueDate("");
    setPriority("Medium");
    setDescription("");
    setError("");
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modal, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Create task</Text>
            <Text style={styles.subtitle}>
              Assign work to a site Supervisor
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.headerButton}>
            <FontAwesome6 name="xmark" size={18} color={colors.ink} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Field label="Task title">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter work item"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>
          <Field label="Project">
            <DropdownField
              value={projectId}
              placeholder="Select project"
              options={projects.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              onChange={(value) => {
                setProjectId(value);
                setSiteId("");
              }}
            />
          </Field>
          <Field label="Site">
            <DropdownField
              value={siteId}
              placeholder="Select site"
              options={(project?.sites ?? []).map((item) => ({
                label: `${item.name} · ${item.location}`,
                value: item.id,
              }))}
              onChange={setSiteId}
              disabled={!project}
            />
          </Field>
          <Field label="Supervisor">
            <DropdownField
              value={supervisorId}
              placeholder="Select Supervisor"
              options={supervisors.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              onChange={setSupervisorId}
            />
          </Field>
          <Field label="Due date">
            <DatePickerField value={dueDate} onChange={setDueDate} />
          </Field>
          <Field label="Priority">
            <DropdownField
              value={priority}
              placeholder="Select priority"
              options={["Critical", "High", "Medium", "Low"]}
              onChange={(value) => setPriority(value as Task["priority"])}
            />
          </Field>
          <Field label="Work description">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Scope, expected result, and instructions"
              placeholderTextColor={colors.placeholder}
              multiline
              style={[styles.input, styles.textarea]}
            />
          </Field>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.fieldLabel}>Completion evidence</Text>
              <Text style={styles.switchNote}>
                Require photo, video, or document proof
              </Text>
            </View>
            <Switch
              value={evidenceRequired}
              onValueChange={setEvidenceRequired}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={
                evidenceRequired ? colors.primary : colors.placeholder
              }
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={submit} style={styles.submitButton}>
            <FontAwesome6 name="paper-plane" size={15} color={colors.white} />
            <Text style={styles.submitText}>Create and assign task</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: { color: colors.inkMuted, fontSize: 12, marginTop: 3 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    marginHorizontal: 20,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 13 },
  filters: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.inkMuted, fontSize: 11, fontWeight: "700" },
  chipTextActive: { color: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 112, gap: 10 },
  summaryRow: { flexDirection: "row", gap: 9, marginBottom: 8 },
  summary: {
    flex: 1,
    padding: 13,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  summaryLabel: { color: colors.inkMuted, fontSize: 10, marginTop: 2 },
  count: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  card: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 15,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardCopy: { flex: 1 },
  taskId: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  taskTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  meta: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  progress: { flex: 1 },
  progressText: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  assignmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  assignmentText: {
    flex: 1,
    color: colors.ink,
    fontSize: 11,
    fontWeight: "600",
  },
  dueText: { color: colors.inkMuted, fontSize: 10 },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 14,
  },
  description: { color: colors.ink, fontSize: 12, lineHeight: 18 },
  historyTitle: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 10,
  },
  historyRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  historyCopy: { flex: 1 },
  historyStatus: { color: colors.ink, fontSize: 11, fontWeight: "700" },
  historyRemark: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  evidenceText: {
    flex: 1,
    color: colors.primary,
    fontSize: 10,
  },
  historyDate: { color: colors.inkMuted, fontSize: 9, marginTop: 3 },
  emptyText: {
    color: colors.inkMuted,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 18,
  },
  verifyButton: {
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  verifyText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { color: colors.ink, fontSize: 23, fontWeight: "800" },
  form: { padding: 20, paddingBottom: 48, gap: 16 },
  field: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 11, fontWeight: "700" },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 13,
  },
  textarea: { minHeight: 105, paddingTop: 13, textAlignVertical: "top" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  switchCopy: { flex: 1 },
  switchNote: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  error: { color: colors.danger, fontSize: 11 },
  submitButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  submitText: { color: colors.white, fontSize: 14, fontWeight: "700" },
});
