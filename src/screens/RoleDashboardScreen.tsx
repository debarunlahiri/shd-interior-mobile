import { FontAwesome6 } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SectionHeader, Surface } from "../components/ui";
import { colors } from "../theme";
import { FontAwesomeIcon } from "../types/icons";
import { UserRole } from "../types/roles";
import { AdminProject } from "../hooks/useAdminProjects";

const vendorRows = [
  ["PO-2048", "Palm Grove", "₹84,600", "Dispatch due"],
  ["PO-2039", "Orchid Suite", "₹46,250", "Part received"],
  ["PO-2027", "Lakeview", "₹22,900", "Completed"],
];

export function RoleDashboardScreen({
  role,
  projects = [],
}: {
  role: Exclude<UserRole, "Supervisor">;
  projects?: AdminProject[];
}) {
  const admin = role === "Admin";
  const activeProjects = projects.filter(
    (project) => project.status === "Active",
  ).length;
  const outstanding = projects.reduce(
    (total, project) =>
      total + Math.max(0, project.contractValue - project.amountReceived),
    0,
  );
  const expenses = projects.reduce(
    (total, project) => total + project.totalExpense,
    0,
  );
  const rows = admin
    ? projects
        .slice(0, 5)
        .map((project) => [
          project.name,
          `${project.completion}%`,
          project.status,
          formatCompactMoney(project.totalExpense),
        ])
    : vendorRows;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>
        {admin ? "COMPANY ADMIN" : "VENDOR PORTAL"}
      </Text>
      <Text style={styles.title}>
        {admin ? "Management dashboard" : "Welcome, BuildMart"}
      </Text>
      <Text style={styles.subtitle}>
        {admin
          ? "Projects, approvals and financial visibility"
          : "Orders, deliveries and payment status"}
      </Text>
      <View style={styles.metrics}>
        {admin ? (
          <>
            <Metric
              icon="building"
              value={String(activeProjects)}
              label="Active projects"
            />
            <Metric
              icon="clipboard-check"
              value="12"
              label="Pending approvals"
            />
            <Metric
              icon="wallet"
              value={formatCompactMoney(expenses)}
              label="Project expenses"
            />
            <Metric
              icon="indian-rupee-sign"
              value={formatCompactMoney(outstanding)}
              label="Outstanding"
            />
          </>
        ) : (
          <>
            <Metric icon="file-invoice" value="6" label="Open orders" />
            <Metric icon="truck" value="2" label="Due deliveries" />
            <Metric icon="circle-check" value="18" label="Completed" />
            <Metric
              icon="indian-rupee-sign"
              value="₹1.8L"
              label="Outstanding"
            />
          </>
        )}
      </View>
      <SectionHeader
        title={admin ? "Project overview" : "Recent purchase orders"}
      />
      <DataTable admin={admin} rows={rows} />
    </ScrollView>
  );
}

function formatCompactMoney(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: FontAwesomeIcon;
  value: string;
  label: string;
}) {
  return (
    <Surface style={styles.metric}>
      <View style={styles.metricIcon}>
        <FontAwesome6 name={icon} size={17} color={colors.primary} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Surface>
  );
}
function DataTable({ admin, rows }: { admin: boolean; rows: string[][] }) {
  const headers = admin
    ? ["Project", "Progress", "Status", "Expense"]
    : ["Order", "Project", "Amount", "Status"];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          {headers.map((header, index) => (
            <Text
              key={header}
              style={[
                styles.cell,
                index === 0 && styles.firstCell,
                styles.headerText,
              ]}
            >
              {header}
            </Text>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View
            key={row[0]}
            style={[styles.row, rowIndex % 2 === 1 && styles.altRow]}
          >
            {row.map((value, index) => (
              <Text
                key={`${row[0]}-${index}`}
                style={[styles.cell, index === 0 && styles.firstCell]}
              >
                {value}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 112 },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: { color: colors.ink, fontSize: 25, fontWeight: "800", marginTop: 6 },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 22,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 26,
  },
  metric: { width: "48.5%", padding: 14 },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },
  metricLabel: { color: colors.inkMuted, fontSize: 10, marginTop: 2 },
  table: {
    minWidth: 650,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  headerRow: { minHeight: 40, backgroundColor: colors.primarySoft },
  altRow: { backgroundColor: "#FAFBFA" },
  cell: { width: 120, paddingHorizontal: 12, color: colors.ink, fontSize: 10 },
  firstCell: { width: 220, fontWeight: "700" },
  headerText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
