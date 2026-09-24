import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { ActionSheet, TaskSheet } from "../components/AppSheets";
import { BottomTabs } from "../components/BottomTabs";
import { Task } from "../data";
import { defaultTabForRole, roleTabs } from "../config/roles";
import { useDailyReports } from "../hooks/useDailyReports";
import { useAttendance } from "../hooks/useAttendance";
import { useFinance } from "../hooks/useFinance";
import { useIssues } from "../hooks/useIssues";
import { AlertInput, useCommunications } from "../hooks/useCommunications";
import { useDocuments } from "../hooks/useDocuments";
import { useSiteVisits } from "../hooks/useSiteVisits";
import { toIsoDate } from "../utils/date";
import { AuthSession } from "../hooks/useAuth";
import { useAdminMasters } from "../hooks/useAdminMasters";
import { useAdminProjects } from "../hooks/useAdminProjects";
import { useMaterialRequests } from "../hooks/useMaterialRequests";
import { useSiteProgress } from "../hooks/useSiteProgress";
import { useSiteInventory } from "../hooks/useSiteInventory";
import { useTasks } from "../hooks/useTasks";
import { HomeScreen } from "../screens/HomeScreen";
import { AdminApprovalsScreen } from "../screens/AdminApprovalsScreen";
import { AdminMasterDataScreen } from "../screens/AdminMasterDataScreen";
import { AdminProjectsScreen } from "../screens/AdminProjectsScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { RoleDashboardScreen } from "../screens/RoleDashboardScreen";
import { RoleModuleScreen } from "../screens/RoleModuleScreen";
import { SiteScreen } from "../screens/SiteScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { SheetName, TabName } from "../types/navigation";
import { UserRole } from "../types/roles";

export function AppNavigator({
  session,
  onSignOut,
}: {
  session: AuthSession;
  onSignOut: () => Promise<void>;
}) {
  const role: UserRole = session.role;
  const activeProject = session.assignedProjects[0];
  const activeSite = activeProject?.sites[0];
  const [tab, setTab] = useState<TabName>(() => defaultTabForRole[role]);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tabHistory = useRef<TabName[]>([]);
  const { tasks, updateTask } = useTasks();
  const { masters, addUser, addVendor, addMaterial, addUnit } =
    useAdminMasters();
  const { projects: adminProjects, saveProject, saveSite } = useAdminProjects();
  const {
    transactions: inventoryTransactions,
    balances: inventoryBalances,
    addTransaction: addInventoryTransaction,
  } = useSiteInventory(masters.materials, masters.units);
  const { entries: progressEntries, addProgress } = useSiteProgress();
  const { reports: dailyReports, addReport } = useDailyReports();
  const { entries: attendanceEntries, saveAttendance } = useAttendance();
  const {
    records: financeRecords,
    balance: cashBalance,
    addRecord: addFinanceRecord,
    updateStatus: updateFinanceStatus,
  } = useFinance();
  const { issues, addIssue, updateStatus: updateIssueStatus } = useIssues();
  const {
    requests: materialRequests,
    addRequest: addMaterialRequest,
    confirmReceived: confirmMaterialReceived,
  } = useMaterialRequests();
  const {
    conversations,
    notifications,
    sendMessage,
    markConversationRead,
    markNotificationRead,
    markAllNotificationsRead,
    syncAlerts,
  } = useCommunications();
  const { documents, addDocument } = useDocuments();
  const { visits: siteVisits, addVisit: addSiteVisit } = useSiteVisits();

  useEffect(() => {
    const alerts: AlertInput[] = [];
    tasks
      .filter(
        (task) =>
          (task.due.startsWith("Today") || isOverdueDue(task.due)) &&
          task.status !== "Completed" &&
          task.status !== "Verified",
      )
      .forEach((task) =>
        alerts.push({
          eventKey: `task:${task.id}:${task.status}:${task.due}`,
          category: "Task",
          title: task.due.startsWith("Today")
            ? "Task deadline approaching"
            : "Task overdue",
          detail: `${task.id} · ${task.title} · ${task.due}`,
          audience: ["Admin", "Supervisor"],
        }),
      );
    materialRequests
      .filter((request) => request.status === "Rejected")
      .forEach((request) =>
        alerts.push({
          eventKey: `material:${request.id}:rejected`,
          category: "Material",
          title: "Material request rejected",
          detail: `${request.id} · ${request.material}`,
          audience: ["Admin", "Supervisor"],
        }),
      );
    inventoryBalances
      .filter((balance) => balance.available <= 5)
      .forEach((balance) =>
        alerts.push({
          eventKey: `inventory:${balance.materialId}:low:${balance.available}`,
          category: "Material",
          title: "Material shortage",
          detail: `${balance.materialName} · ${balance.available} ${balance.unit} available`,
          audience: ["Admin", "Supervisor"],
        }),
      );
    financeRecords
      .filter((record) => record.status === "Rejected")
      .forEach((record) =>
        alerts.push({
          eventKey: `finance:${record.id}:rejected`,
          category: "Expense",
          title: `${record.kind} rejected`,
          detail: `${record.reference} · ₹${record.amount.toLocaleString("en-IN")}`,
          audience: ["Supervisor"],
        }),
      );
    const today = toIsoDate(new Date());
    if (!dailyReports.some((report) => report.date === today)) {
      alerts.push({
        eventKey: `daily-report:${today}:reminder`,
        category: "Report",
        title: "Daily report reminder",
        detail: "Today’s site report has not been submitted.",
        audience: ["Supervisor"],
      });
    }
    syncAlerts(alerts);
  }, [
    dailyReports,
    financeRecords,
    inventoryBalances,
    materialRequests,
    syncAlerts,
    tasks,
  ]);
  const navigateToTab = useCallback(
    (nextTab: TabName) => {
      setTab((currentTab) => {
        if (currentTab === nextTab) {
          return currentTab;
        }

        if (nextTab === defaultTabForRole[role]) {
          tabHistory.current = [];
        } else {
          tabHistory.current.push(currentTab);
        }

        return nextTab;
      });
    },
    [role],
  );

  useEffect(() => {
    const tabBelongsToRole =
      roleTabs[role].some((item) => item.key === tab) ||
      (role === "Admin" && tab === "AdminSetup");

    if (!tabBelongsToRole) {
      tabHistory.current = [];
      setTab(defaultTabForRole[role]);
    }
  }, [role, tab]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selectedTask) {
          setSelectedTask(null);
          return true;
        }

        if (sheet) {
          setSheet(null);
          return true;
        }

        const homeTab = defaultTabForRole[role];
        if (tab === homeTab) {
          return false;
        }

        const allowedTabs = new Set<TabName>([
          ...roleTabs[role].map((item) => item.key),
          ...(role === "Admin" ? (["AdminSetup"] as TabName[]) : []),
        ]);

        let previousTab = tabHistory.current.pop();
        while (previousTab && !allowedTabs.has(previousTab)) {
          previousTab = tabHistory.current.pop();
        }

        const destination = previousTab ?? homeTab;
        if (destination === homeTab) {
          tabHistory.current = [];
        }
        setTab(destination);
        return true;
      },
    );

    return () => subscription.remove();
  }, [role, selectedTask, sheet, tab]);

  const currentTask = selectedTask
    ? (tasks.find((task) => task.id === selectedTask.id) ?? null)
    : null;

  return (
    <View style={styles.container}>
      {tab === "Home" ? (
        <HomeScreen
          onTab={navigateToTab}
          onSheet={setSheet}
          onTask={setSelectedTask}
          tasks={tasks}
          issues={issues}
          unreadNotificationCount={
            notifications.filter(
              (item) =>
                item.audience.includes(role) && !item.readBy.includes(role),
            ).length
          }
          userName={session.name}
          projectName={activeProject?.name}
          siteName={activeSite?.name}
          siteLocation={activeSite?.location}
        />
      ) : null}
      {tab === "Tasks" ? (
        <TasksScreen onTask={setSelectedTask} tasks={tasks} />
      ) : null}
      {tab === "Site" ? (
        <SiteScreen
          onSheet={setSheet}
          materials={masters.materials}
          units={masters.units}
          balances={inventoryBalances}
          transactions={inventoryTransactions}
          taskOptions={tasks.map((task) => ({
            label: `${task.id} · ${task.title}`,
            value: `${task.id} · ${task.title}`,
          }))}
          onAddInventoryTransaction={addInventoryTransaction}
          attendanceEntries={attendanceEntries}
          projectName={activeProject?.name}
          siteName={activeSite?.name}
        />
      ) : null}
      {tab === "More" ? (
        <MoreScreen
          onSheet={setSheet}
          onTab={navigateToTab}
          role={role}
          onSignOut={onSignOut}
          unreadMessageCount={conversations.reduce(
            (count, conversation) =>
              conversation.participants.includes(role)
                ? count +
                  conversation.messages.filter(
                    (message) =>
                      message.senderRole !== role &&
                      !message.readBy.includes(role),
                  ).length
                : count,
            0,
          )}
          accountName={session.name}
        />
      ) : null}
      {tab === "AdminDashboard" ? (
        <RoleDashboardScreen role="Admin" projects={adminProjects} />
      ) : null}
      {tab === "VendorHome" ? <RoleDashboardScreen role="Vendor" /> : null}
      {tab === "Projects" ? (
        <AdminProjectsScreen
          projects={adminProjects}
          onSave={saveProject}
          materialRequests={materialRequests}
          documents={documents}
          issues={issues}
          progressEntries={progressEntries}
          supervisors={masters.users.filter(
            (user) => user.role === "Supervisor",
          )}
          onSaveSite={saveSite}
        />
      ) : null}
      {tab === "Approvals" ? (
        <AdminApprovalsScreen
          tasks={tasks}
          onVerify={updateTask}
          attendanceEntries={attendanceEntries}
          financeRecords={financeRecords}
          onUpdateFinanceStatus={updateFinanceStatus}
          issues={issues}
          onUpdateIssueStatus={updateIssueStatus}
        />
      ) : null}
      {tab === "AdminSetup" ? (
        <AdminMasterDataScreen
          masters={masters}
          onBack={() => {
            tabHistory.current = [];
            setTab("More");
          }}
          onAddUser={addUser}
          onAddVendor={addVendor}
          onAddMaterial={addMaterial}
          onAddUnit={addUnit}
        />
      ) : null}
      {tab === "Orders" ? <RoleModuleScreen module="Orders" /> : null}
      {tab === "Deliveries" ? <RoleModuleScreen module="Deliveries" /> : null}
      <BottomTabs
        active={tab}
        onChange={navigateToTab}
        items={roleTabs[role]}
      />
      <ActionSheet
        kind={sheet}
        onClose={() => setSheet(null)}
        progressEntries={progressEntries}
        onAddProgress={addProgress}
        tasks={tasks}
        dailyReports={dailyReports}
        onAddDailyReport={addReport}
        materialRequests={materialRequests}
        onAddMaterialRequest={addMaterialRequest}
        onConfirmMaterialReceived={confirmMaterialReceived}
        managedMaterials={masters.materials}
        managedUnits={masters.units}
        attendanceEntries={attendanceEntries}
        onSaveAttendance={saveAttendance}
        financeRecords={financeRecords}
        cashBalance={cashBalance}
        onAddFinanceRecord={addFinanceRecord}
        issues={issues}
        onAddIssue={addIssue}
        role={role}
        conversations={conversations}
        notifications={notifications}
        onSendMessage={sendMessage}
        onReadConversation={markConversationRead}
        onReadNotification={markNotificationRead}
        onReadAllNotifications={markAllNotificationsRead}
        documents={documents}
        onUploadDocument={addDocument}
        accountName={session.name}
        accountPhone={session.phoneNumber}
        assignedProjectName={activeProject?.name}
        assignedSiteName={activeSite?.name}
        siteVisits={siteVisits}
        onAddSiteVisit={addSiteVisit}
      />
      <TaskSheet
        task={currentTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });

function isOverdueDue(due: string) {
  if (due.startsWith("Tomorrow") || due.startsWith("Today")) return false;
  const match = due.match(/^(\d{1,2}) ([A-Za-z]{3})$/);
  if (!match) return false;
  const parsed = new Date(
    `${match[2]} ${match[1]}, ${new Date().getFullYear()}`,
  );
  return !Number.isNaN(parsed.getTime()) && parsed < new Date();
}
