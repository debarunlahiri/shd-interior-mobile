import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AdminProject,
  AdminSite,
  AdminSiteInput,
} from "../hooks/useAdminProjects";
import { ManagedUser } from "../hooks/useAdminMasters";
import { MaterialRequest } from "../hooks/useMaterialRequests";
import { SiteDocument } from "../hooks/useDocuments";
import { SiteIssue } from "../hooks/useIssues";
import { SiteProgressEntry } from "../data";
import { colors } from "../theme";
import { ProgressBar, StatusPill, Surface } from "./ui";
import { AdminSiteFormModal } from "./AdminSiteFormModal";

export function AdminProjectDetailModal({
  project,
  materialRequests,
  documents,
  issues,
  progressEntries,
  supervisors,
  onClose,
  onEdit,
  onSaveSite,
}: {
  project: AdminProject | null;
  materialRequests: MaterialRequest[];
  documents: SiteDocument[];
  issues: SiteIssue[];
  progressEntries: SiteProgressEntry[];
  supervisors: ManagedUser[];
  onClose: () => void;
  onEdit: (project: AdminProject) => void;
  onSaveSite: (
    projectId: string,
    input: AdminSiteInput,
    siteId?: string,
  ) => void;
}) {
  const [siteFormOpen, setSiteFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<AdminSite | null>(null);
  if (!project) return null;

  const projectRequests = materialRequests.filter(
    (request) => request.project === project.name,
  );
  const projectDocuments = documents.filter(
    (document) => document.project === project.name,
  );
  const projectIssues = issues.filter(
    (issue) => issue.project === project.name,
  );
  const openIssues = projectIssues.filter(
    (issue) => issue.status !== "Resolved" && issue.status !== "Closed",
  );
  const remaining = Math.max(0, project.contractValue - project.amountReceived);
  const margin = project.amountReceived - project.totalExpense;
  const currentProjectProgress =
    project.name === "Palm Grove Residence" ? progressEntries : [];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={onClose}>
            <FontAwesome6 name="arrow-left" size={16} color={colors.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.projectId}>{project.id}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
          <Pressable style={styles.editButton} onPress={() => onEdit(project)}>
            <FontAwesome6 name="pen" size={12} color={colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Surface style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.client}>{project.clientName}</Text>
                <Text style={styles.location}>{project.location}</Text>
              </View>
              <StatusPill label={project.status} />
            </View>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall completion</Text>
              <Text style={styles.progressValue}>{project.completion}%</Text>
            </View>
            <ProgressBar value={project.completion} />
            <View style={styles.dateRow}>
              <Meta
                icon="calendar-plus"
                label="Started"
                value={project.startDate}
              />
              <Meta
                icon="flag-checkered"
                label="Target"
                value={project.targetDate}
              />
            </View>
          </Surface>

          <SectionTitle title="Finance" />
          <View style={styles.grid}>
            <Summary
              label="Contract value"
              value={formatMoney(project.contractValue)}
            />
            <Summary
              label="Amount received"
              value={formatMoney(project.amountReceived)}
            />
            <Summary
              label="Project expense"
              value={formatMoney(project.totalExpense)}
            />
            <Summary label="Outstanding" value={formatMoney(remaining)} />
          </View>
          <Surface style={styles.balanceCard}>
            <View>
              <Text style={styles.balanceLabel}>
                Received less recorded expense
              </Text>
              <Text style={styles.balanceHint}>
                Local project-level calculation
              </Text>
            </View>
            <Text style={[styles.balanceValue, margin < 0 && styles.negative]}>
              {formatMoney(margin)}
            </Text>
          </Surface>

          <SectionTitle title="Operations" />
          <Surface style={styles.operations}>
            <Operation
              icon="location-dot"
              label="Sites"
              value={String(project.siteCount)}
            />
            <Operation
              icon="boxes-stacked"
              label="Material requests"
              value={String(projectRequests.length)}
            />
            <Operation
              icon="triangle-exclamation"
              label="Open issues"
              value={String(openIssues.length)}
            />
            <Operation
              icon="folder-open"
              label="Documents"
              value={String(projectDocuments.length)}
            />
          </Surface>

          <View style={styles.sectionHeading}>
            <SectionTitle title="Sites" />
            <Pressable
              style={styles.addSiteButton}
              onPress={() => {
                setEditingSite(null);
                setSiteFormOpen(true);
              }}
            >
              <FontAwesome6 name="plus" size={11} color={colors.primary} />
              <Text style={styles.addSiteText}>Add site</Text>
            </Pressable>
          </View>
          {project.sites.length ? (
            project.sites.map((site) => (
              <Pressable
                key={site.id}
                onPress={() => {
                  setEditingSite(site);
                  setSiteFormOpen(true);
                }}
              >
                <Surface style={styles.siteCard}>
                  <View style={styles.siteTop}>
                    <View style={styles.siteCopy}>
                      <Text style={styles.siteName}>{site.name}</Text>
                      <Text style={styles.siteLocation}>{site.location}</Text>
                    </View>
                    <StatusPill label={site.status} />
                  </View>
                  <View style={styles.siteMetaRow}>
                    <View style={styles.siteSupervisor}>
                      <FontAwesome6
                        name="user-tie"
                        size={12}
                        color={colors.primary}
                      />
                      <Text style={styles.siteSupervisorText}>
                        {site.supervisorName}
                      </Text>
                    </View>
                    <Text style={styles.siteProgress}>{site.completion}%</Text>
                  </View>
                  <ProgressBar value={site.completion} />
                  <Text style={styles.siteHint}>
                    Tap to edit or transfer Supervisor
                  </Text>
                </Surface>
              </Pressable>
            ))
          ) : (
            <EmptyState copy="No sites have been created for this project." />
          )}

          <SectionTitle title="Recent progress" />
          {currentProjectProgress.length ? (
            currentProjectProgress.slice(0, 3).map((entry) => (
              <Surface key={entry.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{entry.stage}</Text>
                  <Text style={styles.recordValue}>{entry.progress}%</Text>
                </View>
                <Text style={styles.recordCopy}>{entry.workDescription}</Text>
                <Text style={styles.recordMeta}>
                  {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                </Text>
              </Surface>
            ))
          ) : (
            <EmptyState copy="No linked progress updates for this project yet." />
          )}

          <SectionTitle title="Materials" />
          {projectRequests.length ? (
            projectRequests.slice(0, 3).map((request) => (
              <Surface key={request.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{request.material}</Text>
                  <StatusPill label={request.status} />
                </View>
                <Text style={styles.recordCopy}>
                  {request.quantity} {request.unit} · {request.site}
                </Text>
                <Text style={styles.recordMeta}>
                  Required {request.requiredDate}
                </Text>
              </Surface>
            ))
          ) : (
            <EmptyState copy="No material requests linked to this project." />
          )}

          <SectionTitle title="Documents and issues" />
          <View style={styles.splitSummary}>
            <Surface style={styles.compactSummary}>
              <FontAwesome6
                name="folder-open"
                size={17}
                color={colors.primary}
              />
              <Text style={styles.compactValue}>{projectDocuments.length}</Text>
              <Text style={styles.compactLabel}>Documents</Text>
            </Surface>
            <Surface style={styles.compactSummary}>
              <FontAwesome6
                name="triangle-exclamation"
                size={17}
                color={colors.warning}
              />
              <Text style={styles.compactValue}>{projectIssues.length}</Text>
              <Text style={styles.compactLabel}>Total issues</Text>
            </Surface>
          </View>

          <SectionTitle title="Client updates" />
          <EmptyState copy="No client-visible updates have been published locally." />
        </ScrollView>
        <AdminSiteFormModal
          visible={siteFormOpen}
          site={editingSite}
          supervisors={supervisors}
          onClose={() => setSiteFormOpen(false)}
          onSave={(input, siteId) => onSaveSite(project.id, input, siteId)}
        />
      </SafeAreaView>
    </Modal>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Surface style={styles.summary}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </Surface>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: "calendar-plus" | "flag-checkered";
  label: string;
  value: string;
}) {
  return (
    <View style={styles.meta}>
      <FontAwesome6 name={icon} size={12} color={colors.primary} />
      <View>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

function Operation({
  icon,
  label,
  value,
}: {
  icon:
    "location-dot" | "boxes-stacked" | "triangle-exclamation" | "folder-open";
  label: string;
  value: string;
}) {
  return (
    <View style={styles.operation}>
      <View style={styles.operationIcon}>
        <FontAwesome6 name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={styles.operationLabel}>{label}</Text>
      <Text style={styles.operationValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return (
    <Surface style={styles.empty}>
      <FontAwesome6 name="inbox" size={17} color={colors.inkMuted} />
      <Text style={styles.emptyCopy}>{copy}</Text>
    </Surface>
  );
}

function formatMoney(value: number) {
  const prefix = value < 0 ? "-₹" : "₹";
  return `${prefix}${Math.abs(value).toLocaleString("en-IN")}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  projectId: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  title: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 3 },
  editButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.primarySoft,
  },
  editText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  hero: { padding: 16, gap: 13 },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  heroCopy: { flex: 1 },
  client: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  location: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: { color: colors.inkMuted, fontSize: 10 },
  progressValue: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  dateRow: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  meta: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  metaLabel: {
    color: colors.inkMuted,
    fontSize: 8,
    textTransform: "uppercase",
  },
  metaValue: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 8,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  addSiteButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addSiteText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  siteCard: { padding: 14, gap: 10 },
  siteTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  siteCopy: { flex: 1 },
  siteName: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  siteLocation: { color: colors.inkMuted, fontSize: 9, marginTop: 3 },
  siteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  siteSupervisor: { flexDirection: "row", alignItems: "center", gap: 7 },
  siteSupervisorText: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  siteProgress: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  siteHint: { color: colors.inkMuted, fontSize: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summary: { width: "48.5%", padding: 13 },
  summaryLabel: { color: colors.inkMuted, fontSize: 9 },
  summaryValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  balanceCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  balanceLabel: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  balanceHint: { color: colors.inkMuted, fontSize: 8, marginTop: 3 },
  balanceValue: { color: colors.success, fontSize: 14, fontWeight: "800" },
  negative: { color: colors.danger },
  operations: { flexDirection: "row", flexWrap: "wrap", padding: 6 },
  operation: {
    width: "50%",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  operationIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  operationLabel: { flex: 1, color: colors.inkMuted, fontSize: 9 },
  operationValue: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  recordCard: { padding: 14, gap: 7 },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  recordTitle: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: "800" },
  recordValue: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  recordCopy: { color: colors.inkMuted, fontSize: 10, lineHeight: 15 },
  recordMeta: { color: colors.inkMuted, fontSize: 8 },
  splitSummary: { flexDirection: "row", gap: 10 },
  compactSummary: { flex: 1, padding: 14, alignItems: "center" },
  compactValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 7,
  },
  compactLabel: { color: colors.inkMuted, fontSize: 9, marginTop: 2 },
  empty: {
    minHeight: 62,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyCopy: { flex: 1, color: colors.inkMuted, fontSize: 10, lineHeight: 15 },
});
