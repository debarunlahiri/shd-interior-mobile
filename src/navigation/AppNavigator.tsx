import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { ActionSheet, TaskSheet } from "../components/AppSheets";
import { BottomTabs } from "../components/BottomTabs";
import { Task } from "../data";
import { defaultTabForRole, roleTabs } from "../config/roles";
import { useDailyReports } from "../hooks/useDailyReports";
import { useAdminMasters } from "../hooks/useAdminMasters";
import { useMaterialRequests } from "../hooks/useMaterialRequests";
import { useSiteProgress } from "../hooks/useSiteProgress";
import { useSiteInventory } from "../hooks/useSiteInventory";
import { useTasks } from "../hooks/useTasks";
import { useOperationalRecords } from "../hooks/useOperationalRecords";
import { HomeScreen } from "../screens/HomeScreen";
import { AdminApprovalsScreen } from "../screens/AdminApprovalsScreen";
import { AdminMasterDataScreen } from "../screens/AdminMasterDataScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { RoleDashboardScreen } from "../screens/RoleDashboardScreen";
import { RoleModuleScreen } from "../screens/RoleModuleScreen";
import { SiteScreen } from "../screens/SiteScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { SheetName, TabName } from "../types/navigation";
import { UserRole } from "../types/roles";

export function AppNavigator({
  role,
  onSignOut,
}: {
  role: UserRole;
  onSignOut: () => Promise<void>;
}) {
  const [tab, setTab] = useState<TabName>(() => defaultTabForRole[role]);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tabHistory = useRef<TabName[]>([]);
  const { tasks, updateTask } = useTasks();
  const { masters, addUser, addVendor, addMaterial, addUnit } =
    useAdminMasters();
  const {
    transactions: inventoryTransactions,
    balances: inventoryBalances,
    addTransaction: addInventoryTransaction,
  } = useSiteInventory(masters.materials, masters.units);
  const { entries: progressEntries, addProgress } = useSiteProgress();
  const { reports: dailyReports, addReport } = useDailyReports();
  const { records: operationalRecords, addRecord: addOperationalRecord } =
    useOperationalRecords();
  const {
    requests: materialRequests,
    addRequest: addMaterialRequest,
    confirmReceived: confirmMaterialReceived,
  } = useMaterialRequests();

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
        />
      ) : null}
      {tab === "More" ? (
        <MoreScreen
          onSheet={setSheet}
          onTab={navigateToTab}
          role={role}
          onSignOut={onSignOut}
        />
      ) : null}
      {tab === "AdminDashboard" ? <RoleDashboardScreen role="Admin" /> : null}
      {tab === "VendorHome" ? <RoleDashboardScreen role="Vendor" /> : null}
      {tab === "Projects" ? <RoleModuleScreen module="Projects" /> : null}
      {tab === "Approvals" ? (
        <AdminApprovalsScreen tasks={tasks} onVerify={updateTask} />
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
        operationalRecords={operationalRecords}
        onAddOperationalRecord={addOperationalRecord}
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
