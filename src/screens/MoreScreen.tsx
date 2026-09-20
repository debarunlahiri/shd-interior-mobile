import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DropdownField } from "../components/DropdownField";
import { IconButton, SectionHeader, Surface } from "../components/ui";
import { colors } from "../theme";
import { FontAwesomeIcon } from "../types/icons";
import { SheetName, TabName } from "../types/navigation";
import { UserRole } from "../types/roles";

export function MoreScreen({
  onSheet,
  onTab,
  role,
  onRoleChange,
}: {
  onSheet: (sheet: SheetName) => void;
  onTab: (tab: TabName) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}) {
  const supervisorMenu: {
    label: string;
    copy: string;
    icon: FontAwesomeIcon;
    action: () => void;
  }[] = [
    {
      label: "Daily reports",
      copy: "Submit and view site reports",
      icon: "file-lines",
      action: () => onSheet("report"),
    },
    {
      label: "Materials",
      copy: "Requests and consumption",
      icon: "cubes",
      action: () => onTab("Site"),
    },
    {
      label: "Expenses",
      copy: "Site expenses and approvals",
      icon: "receipt",
      action: () => onSheet("expense"),
    },
    {
      label: "Cash in hand",
      copy: "Available balance ₹37,000",
      icon: "wallet",
      action: () => onSheet("cash"),
    },
    {
      label: "Attendance",
      copy: "Workers and site visits",
      icon: "people-group",
      action: () => onSheet("attendance"),
    },
    {
      label: "Issues & support",
      copy: "Report and track site issues",
      icon: "triangle-exclamation",
      action: () => onSheet("issue"),
    },
    {
      label: "Messages",
      copy: "2 unread instructions",
      icon: "comments",
      action: () => onSheet("messages"),
    },
    {
      label: "Documents",
      copy: "Drawings, bills and files",
      icon: "folder-open",
      action: () => onSheet("documents"),
    },
  ];
  const adminMenu: typeof supervisorMenu = [
    {
      label: "Projects & sites",
      copy: "Project and site management",
      icon: "building",
      action: () => onTab("Projects"),
    },
    {
      label: "Approvals",
      copy: "Tasks, materials and expenses",
      icon: "clipboard-check",
      action: () => onTab("Approvals"),
    },
    {
      label: "Messages",
      copy: "Supervisor and vendor communication",
      icon: "comments",
      action: () => onSheet("messages"),
    },
    {
      label: "Documents",
      copy: "Project and company documents",
      icon: "folder-open",
      action: () => onSheet("documents"),
    },
  ];
  const vendorMenu: typeof supervisorMenu = [
    {
      label: "Purchase orders",
      copy: "Open and completed orders",
      icon: "file-invoice",
      action: () => onTab("Orders"),
    },
    {
      label: "Deliveries",
      copy: "Dispatch and delivery status",
      icon: "truck",
      action: () => onTab("Deliveries"),
    },
    {
      label: "Messages",
      copy: "Communication with company Admin",
      icon: "comments",
      action: () => onSheet("messages"),
    },
    {
      label: "Documents",
      copy: "Invoices, challans and files",
      icon: "folder-open",
      action: () => onSheet("documents"),
    },
  ];
  const menu =
    role === "Admin"
      ? adminMenu
      : role === "Vendor"
        ? vendorMenu
        : supervisorMenu;
  const identity =
    role === "Admin"
      ? {
          initials: "DL",
          name: "Debarun Lahiri",
          copy: "Company Admin · SHD Interior",
        }
      : role === "Vendor"
        ? {
            initials: "BM",
            name: "BuildMart Supplies",
            copy: "Approved Vendor · SHD Interior",
          }
        : {
            initials: "AK",
            name: "Arjun Kumar",
            copy: "Site Supervisor · SHD Interior",
          };
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Workspace</Text>
          <Text style={styles.subtitle}>{role} tools and account</Text>
        </View>
        <IconButton icon="gear" />
      </View>
      <Surface style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{identity.initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{identity.name}</Text>
          <Text style={styles.profileRole}>{identity.copy}</Text>
        </View>
        <FontAwesome6 name="chevron-right" size={14} color={colors.inkMuted} />
      </Surface>
      <View style={styles.roleSelector}>
        <Text style={styles.roleLabel}>ACTIVE ROLE</Text>
        <DropdownField
          value={role}
          placeholder="Select role"
          options={["Supervisor", "Admin", "Vendor"]}
          onChange={(value) => onRoleChange(value as UserRole)}
        />
        <Text style={styles.clientNote}>
          Client access will be added later as a read-only role.
        </Text>
      </View>
      <SectionHeader
        title={
          role === "Supervisor"
            ? "Site operations"
            : role === "Admin"
              ? "Management"
              : "Vendor operations"
        }
      />
      <Surface style={styles.menu}>
        {menu.map((item, index) => (
          <View key={item.label}>
            {index ? <View style={styles.divider} /> : null}
            <Pressable
              onPress={item.action}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.icon}>
                <FontAwesome6
                  name={item.icon}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.meta}>{item.copy}</Text>
              </View>
              {item.label === "Messages" ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              ) : (
                <FontAwesome6 name="chevron-right" size={12} color="#9AA29F" />
              )}
            </Pressable>
          </View>
        ))}
      </Surface>
      <Text style={styles.version}>SHD Interior · {role} app v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 112 },
  header: {
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
  profile: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  profileInfo: { flex: 1, marginLeft: 13 },
  profileName: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  profileRole: { color: colors.inkMuted, fontSize: 11, marginTop: 4 },
  roleSelector: { marginBottom: 24 },
  roleLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  clientNote: { color: colors.inkMuted, fontSize: 9, marginTop: 7 },
  menu: { paddingHorizontal: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  icon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, marginLeft: 12 },
  label: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  meta: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  version: {
    color: colors.inkMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 22,
  },
});
