import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePickerField } from "../components/DatePickerField";
import { DropdownField } from "../components/DropdownField";
import { useAppDialog } from "../components/AppDialog";
import {
  PrimaryButton,
  ProgressBar,
  StatusPill,
  Surface,
} from "../components/ui";
import {
  AdminProject,
  AdminProjectInput,
  ProjectStatus,
} from "../hooks/useAdminProjects";
import { colors } from "../theme";
import { MaterialRequest } from "../hooks/useMaterialRequests";
import { SiteDocument } from "../hooks/useDocuments";
import { SiteIssue } from "../hooks/useIssues";
import { SiteProgressEntry } from "../data";
import { AdminProjectDetailModal } from "../components/AdminProjectDetailModal";
import { ManagedUser } from "../hooks/useAdminMasters";
import { AdminSiteInput } from "../hooks/useAdminProjects";

const statuses: ProjectStatus[] = [
  "Planning",
  "Active",
  "On Hold",
  "Completed",
  "Cancelled",
];

type ProjectForm = {
  name: string;
  clientName: string;
  location: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  contractValue: string;
  amountReceived: string;
  totalExpense: string;
  siteCount: string;
  completion: string;
};

const emptyForm: ProjectForm = {
  name: "",
  clientName: "",
  location: "",
  status: "Planning",
  startDate: "",
  targetDate: "",
  contractValue: "",
  amountReceived: "",
  totalExpense: "",
  siteCount: "1",
  completion: "0",
};

export function AdminProjectsScreen({
  projects,
  onSave,
  materialRequests,
  documents,
  issues,
  progressEntries,
  supervisors,
  onSaveSite,
}: {
  projects: AdminProject[];
  onSave: (input: AdminProjectInput, projectId?: string) => void;
  materialRequests: MaterialRequest[];
  documents: SiteDocument[];
  issues: SiteIssue[];
  progressEntries: SiteProgressEntry[];
  supervisors: ManagedUser[];
  onSaveSite: (
    projectId: string,
    input: AdminSiteInput,
    siteId?: string,
  ) => void;
}) {
  const dialog = useAppDialog();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [editingProject, setEditingProject] = useState<AdminProject | null>(
    null,
  );
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter(
      (project) =>
        (status === "All statuses" || project.status === status) &&
        (!query ||
          [project.name, project.clientName, project.location, project.id].some(
            (value) => value.toLowerCase().includes(query),
          )),
    );
  }, [projects, search, status]);

  const totals = useMemo(
    () => ({
      active: projects.filter((project) => project.status === "Active").length,
      sites: projects.reduce((sum, project) => sum + project.siteCount, 0),
      value: projects.reduce((sum, project) => sum + project.contractValue, 0),
      outstanding: projects.reduce(
        (sum, project) =>
          sum + Math.max(0, project.contractValue - project.amountReceived),
        0,
      ),
    }),
    [projects],
  );

  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      clientName: project.clientName,
      location: project.location,
      status: project.status,
      startDate: project.startDate,
      targetDate: project.targetDate,
      contractValue: String(project.contractValue),
      amountReceived: String(project.amountReceived),
      totalExpense: String(project.totalExpense),
      siteCount: String(project.siteCount),
      completion: String(project.completion),
    });
    setFormOpen(true);
  };

  const submit = () => {
    const contractValue = parseAmount(form.contractValue);
    const amountReceived = parseAmount(form.amountReceived);
    const totalExpense = parseAmount(form.totalExpense);
    const siteCount = Number(form.siteCount);
    const completion = Number(form.completion);

    if (!form.name.trim() || !form.clientName.trim() || !form.location.trim()) {
      dialog.show(
        "Project details required",
        "Enter the project name, client name and location.",
      );
      return;
    }
    if (
      !form.startDate ||
      !form.targetDate ||
      form.targetDate < form.startDate
    ) {
      dialog.show(
        "Valid dates required",
        "Choose a target date that is on or after the project start date.",
      );
      return;
    }
    if (
      [contractValue, amountReceived, totalExpense].some(
        (value) => !Number.isFinite(value) || value < 0,
      ) ||
      !Number.isInteger(siteCount) ||
      siteCount < 1 ||
      !Number.isFinite(completion) ||
      completion < 0 ||
      completion > 100
    ) {
      dialog.show(
        "Valid values required",
        "Use positive amounts, at least one site, and completion from 0 to 100.",
      );
      return;
    }

    onSave(
      {
        name: form.name.trim(),
        clientName: form.clientName.trim(),
        location: form.location.trim(),
        status: form.status,
        startDate: form.startDate,
        targetDate: form.targetDate,
        contractValue,
        amountReceived,
        totalExpense,
        siteCount,
        completion,
      },
      editingProject?.id,
    );
    setFormOpen(false);
    dialog.show(
      editingProject ? "Project updated" : "Project added",
      `${form.name.trim()} has been saved to the local project register.`,
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>COMPANY ADMIN</Text>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>
            Project delivery and financial summary
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={openCreate}>
          <FontAwesome6 name="plus" size={15} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metrics}>
          <Metric label="Active" value={String(totals.active)} />
          <Metric label="Sites" value={String(totals.sites)} />
          <Metric label="Portfolio" value={formatCompactMoney(totals.value)} />
          <Metric
            label="Outstanding"
            value={formatCompactMoney(totals.outstanding)}
          />
        </View>

        <View style={styles.filters}>
          <View style={styles.searchField}>
            <FontAwesome6
              name="magnifying-glass"
              size={14}
              color={colors.inkMuted}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search project, client or location"
              placeholderTextColor={colors.placeholder}
              style={styles.searchInput}
            />
          </View>
          <DropdownField
            value={status}
            placeholder="Filter status"
            options={["All statuses", ...statuses]}
            onChange={setStatus}
          />
        </View>

        <View style={styles.listHeading}>
          <Text style={styles.listTitle}>Project register</Text>
          <Text style={styles.listCount}>
            {visibleProjects.length} projects
          </Text>
        </View>

        {visibleProjects.length ? (
          visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => setSelectedProjectId(project.id)}
            />
          ))
        ) : (
          <Surface style={styles.emptyState}>
            <FontAwesome6
              name="building-circle-xmark"
              size={24}
              color={colors.inkMuted}
            />
            <Text style={styles.emptyTitle}>No matching projects</Text>
            <Text style={styles.emptyCopy}>
              Change the search or status filter.
            </Text>
          </Surface>
        )}
      </ScrollView>

      <ProjectFormModal
        visible={formOpen}
        editing={Boolean(editingProject)}
        form={form}
        onChange={setForm}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
      />
      <AdminProjectDetailModal
        project={selectedProject}
        materialRequests={materialRequests}
        documents={documents}
        issues={issues}
        progressEntries={progressEntries}
        supervisors={supervisors}
        onClose={() => setSelectedProjectId(null)}
        onEdit={(project) => {
          setSelectedProjectId(null);
          openEdit(project);
        }}
        onSaveSite={onSaveSite}
      />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Surface style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Surface>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: AdminProject;
  onPress: () => void;
}) {
  const remaining = Math.max(0, project.contractValue - project.amountReceived);
  return (
    <Pressable onPress={onPress}>
      <Surface style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardHeading}>
            <Text style={styles.projectId}>{project.id}</Text>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectMeta}>
              {project.clientName} · {project.location}
            </Text>
          </View>
          <StatusPill label={project.status} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Completion</Text>
          <Text style={styles.progressValue}>{project.completion}%</Text>
        </View>
        <ProgressBar value={project.completion} />
        <View style={styles.financeGrid}>
          <ProjectValue
            label="Contract"
            value={formatMoney(project.contractValue)}
          />
          <ProjectValue
            label="Received"
            value={formatMoney(project.amountReceived)}
          />
          <ProjectValue
            label="Expense"
            value={formatMoney(project.totalExpense)}
          />
          <ProjectValue label="Outstanding" value={formatMoney(remaining)} />
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            {project.siteCount} {project.siteCount === 1 ? "site" : "sites"}
          </Text>
          <View style={styles.editHint}>
            <Text style={styles.editText}>View overview</Text>
            <FontAwesome6
              name="chevron-right"
              size={11}
              color={colors.primary}
            />
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}

function ProjectValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.projectValue}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

function ProjectFormModal({
  visible,
  editing,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  editing: boolean;
  form: ProjectForm;
  onChange: (form: ProjectForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const update = (key: keyof ProjectForm, value: string) =>
    onChange({ ...form, [key]: value });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalScreen} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>
              {editing ? "Edit project" : "New project"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Delivery and finance details
            </Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <FontAwesome6 name="xmark" size={17} color={colors.ink} />
          </Pressable>
        </View>
        <KeyboardAvoidingView
          style={styles.modalBody}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FormField label="Project name">
              <Input
                value={form.name}
                onChangeText={(value) => update("name", value)}
                placeholder="Project name"
              />
            </FormField>
            <FormField label="Client name">
              <Input
                value={form.clientName}
                onChangeText={(value) => update("clientName", value)}
                placeholder="Client or company"
              />
            </FormField>
            <FormField label="Location">
              <Input
                value={form.location}
                onChangeText={(value) => update("location", value)}
                placeholder="City or project location"
              />
            </FormField>
            <FormField label="Status">
              <DropdownField
                value={form.status}
                placeholder="Select status"
                options={statuses}
                onChange={(value) => update("status", value)}
              />
            </FormField>
            <View style={styles.splitRow}>
              <FormField label="Start date" style={styles.splitField}>
                <DatePickerField
                  value={form.startDate}
                  onChange={(value) => update("startDate", value)}
                />
              </FormField>
              <FormField label="Target date" style={styles.splitField}>
                <DatePickerField
                  value={form.targetDate}
                  minimumDate={form.startDate || undefined}
                  onChange={(value) => update("targetDate", value)}
                />
              </FormField>
            </View>
            <FormField label="Contract value">
              <Input
                value={form.contractValue}
                onChangeText={(value) => update("contractValue", value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </FormField>
            <View style={styles.splitRow}>
              <FormField label="Amount received" style={styles.splitField}>
                <Input
                  value={form.amountReceived}
                  onChangeText={(value) => update("amountReceived", value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </FormField>
              <FormField label="Total expense" style={styles.splitField}>
                <Input
                  value={form.totalExpense}
                  onChangeText={(value) => update("totalExpense", value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </FormField>
            </View>
            <View style={styles.splitRow}>
              <FormField label="Site count" style={styles.splitField}>
                <Input
                  value={form.siteCount}
                  onChangeText={(value) => update("siteCount", value)}
                  placeholder="1"
                  keyboardType="number-pad"
                />
              </FormField>
              <FormField label="Completion %" style={styles.splitField}>
                <Input
                  value={form.completion}
                  onChangeText={(value) => update("completion", value)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </FormField>
            </View>
            <PrimaryButton
              label={editing ? "Save changes" : "Create project"}
              icon="floppy-disk"
              onPress={onSubmit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function FormField({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.formField, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.placeholder}
      style={styles.input}
    />
  );
}

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.]/g, ""));
}

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatCompactMoney(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return formatMoney(value);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerCopy: { flex: 1 },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: { color: colors.ink, fontSize: 25, fontWeight: "800", marginTop: 4 },
  subtitle: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 20, paddingBottom: 112, gap: 14 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { width: "48.5%", padding: 14 },
  metricValue: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  metricLabel: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  filters: { gap: 10, marginTop: 4 },
  searchField: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 13 },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  listTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  listCount: { color: colors.inkMuted, fontSize: 10 },
  card: { padding: 15, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardHeading: { flex: 1 },
  projectId: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  projectName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  projectMeta: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { color: colors.inkMuted, fontSize: 10 },
  progressValue: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  financeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  projectValue: {
    width: "48.5%",
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  valueLabel: {
    color: colors.inkMuted,
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  valueText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: { color: colors.inkMuted, fontSize: 10 },
  editHint: { flexDirection: "row", alignItems: "center", gap: 6 },
  editText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  emptyState: { alignItems: "center", padding: 28 },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyCopy: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
  modalScreen: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  modalSubtitle: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { flex: 1 },
  form: { padding: 20, paddingBottom: 36, gap: 15 },
  formField: { gap: 7 },
  fieldLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 13,
    paddingHorizontal: 14,
  },
  splitRow: { flexDirection: "row", gap: 10 },
  splitField: { flex: 1 },
});
