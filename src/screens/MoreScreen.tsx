import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { IconButton, SectionHeader, Surface } from "../components/ui";
import { useAppDialog } from "../components/AppDialog";
import { colors } from "../theme";
import { FontAwesomeIcon } from "../types/icons";
import { SheetName, TabName } from "../types/navigation";
import { UserRole } from "../types/roles";
import { useTranslation } from "../localization";

export function MoreScreen({
  onSheet,
  onTab,
  role,
  onSignOut,
  unreadMessageCount,
  accountName,
}: {
  onSheet: (sheet: SheetName) => void;
  onTab: (tab: TabName) => void;
  role: UserRole;
  onSignOut: () => Promise<void>;
  unreadMessageCount: number;
  accountName: string;
}) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const supervisorMenu: {
    label: string;
    copy: string;
    icon: FontAwesomeIcon;
    action: () => void;
  }[] = [
    {
      label: "Activity and site visits",
      copy: "Timeline, visitors, and site visit history",
      icon: "clock-rotate-left",
      action: () => onSheet("activity"),
    },
    {
      label: t("workspace.dailyReports"),
      copy: t("workspace.dailyReportsCopy"),
      icon: "file-lines",
      action: () => onSheet("report"),
    },
    {
      label: t("workspace.expenses"),
      copy: t("workspace.expensesCopy"),
      icon: "receipt",
      action: () => onSheet("expense"),
    },
    {
      label: t("workspace.cash"),
      copy: t("workspace.cashCopy"),
      icon: "wallet",
      action: () => onSheet("cash"),
    },
    {
      label: t("workspace.attendance"),
      copy: t("workspace.attendanceCopy"),
      icon: "people-group",
      action: () => onSheet("attendance"),
    },
    {
      label: t("workspace.issues"),
      copy: t("workspace.issuesCopy"),
      icon: "triangle-exclamation",
      action: () => onSheet("issue"),
    },
    {
      label: t("workspace.messages"),
      copy: unreadMessageCount
        ? `${unreadMessageCount} unread conversation updates`
        : "Project and site conversations",
      icon: "comments",
      action: () => onSheet("messages"),
    },
    {
      label: t("workspace.documents"),
      copy: t("workspace.supervisorDocumentsCopy"),
      icon: "folder-open",
      action: () => onSheet("documents"),
    },
  ];
  const adminMenu: typeof supervisorMenu = [
    {
      label: t("workspace.masterData"),
      copy: t("workspace.masterDataCopy"),
      icon: "sliders",
      action: () => onTab("AdminSetup"),
    },
    {
      label: t("workspace.messages"),
      copy: unreadMessageCount
        ? `${unreadMessageCount} unread conversation updates`
        : "Project and site conversations",
      icon: "comments",
      action: () => onSheet("messages"),
    },
    {
      label: t("workspace.documents"),
      copy: t("workspace.adminDocumentsCopy"),
      icon: "folder-open",
      action: () => onSheet("documents"),
    },
  ];
  const vendorMenu: typeof supervisorMenu = [
    {
      label: t("workspace.messages"),
      copy: unreadMessageCount
        ? `${unreadMessageCount} unread conversation updates`
        : "Project and site conversations",
      icon: "comments",
      action: () => onSheet("messages"),
    },
    {
      label: t("workspace.documents"),
      copy: t("workspace.vendorDocumentsCopy"),
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
          name: accountName,
          copy: "Company Admin · SHD Interior",
        }
      : role === "Vendor"
        ? {
            initials: "BM",
            name: accountName,
            copy: "Approved Vendor · SHD Interior",
          }
        : {
            initials: "AK",
            name: accountName,
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
          <Text style={styles.title}>{t("workspace.title")}</Text>
          <Text style={styles.subtitle}>
            {t("workspace.toolsAccount", { role })}
          </Text>
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
      <SectionHeader
        title={
          role === "Supervisor"
            ? t("workspace.siteOperations")
            : role === "Admin"
              ? t("workspace.management")
              : t("workspace.vendorOperations")
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
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          dialog.show(t("common.signOutQuestion"), t("common.signOutMessage"), [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("common.signOut"),
              style: "destructive",
              onPress: () => void onSignOut(),
            },
          ])
        }
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutButtonPressed,
        ]}
      >
        <FontAwesome6
          name="right-from-bracket"
          size={15}
          color={colors.danger}
        />
        <Text style={styles.signOutText}>{t("common.signOut")}</Text>
      </Pressable>
      <Text style={styles.version}>{t("workspace.version", { role })}</Text>
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
  menu: { paddingHorizontal: 15 },
  signOutButton: {
    minHeight: 48,
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutButtonPressed: { opacity: 0.7 },
  signOutText: { color: colors.danger, fontSize: 12, fontWeight: "700" },
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
