import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActionSheet, TaskSheet } from "../components/AppSheets";
import { BottomTabs } from "../components/BottomTabs";
import { Task } from "../data";
import { defaultTabForRole, roleTabs } from "../config/roles";
import { useDailyReports } from "../hooks/useDailyReports";
import { useMaterialRequests } from "../hooks/useMaterialRequests";
import { useSiteProgress } from "../hooks/useSiteProgress";
import { useTasks } from "../hooks/useTasks";
import { useUserRole } from "../hooks/useUserRole";
import { HomeScreen } from "../screens/HomeScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { RoleDashboardScreen } from "../screens/RoleDashboardScreen";
import { RoleModuleScreen } from "../screens/RoleModuleScreen";
import { SiteScreen } from "../screens/SiteScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { SheetName, TabName } from "../types/navigation";

export function AppNavigator() {
  const [tab, setTab] = useState<TabName>("Home");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks, updateTask } = useTasks();
  const { entries: progressEntries, addProgress } = useSiteProgress();
  const { reports: dailyReports, addReport } = useDailyReports();
  const {
    requests: materialRequests,
    addRequest: addMaterialRequest,
    confirmReceived: confirmMaterialReceived,
  } = useMaterialRequests();
  const { role, setRole } = useUserRole();

  useEffect(() => {
    const tabBelongsToRole = roleTabs[role].some((item) => item.key === tab);

    if (!tabBelongsToRole) {
      setTab(defaultTabForRole[role]);
    }
  }, [role, tab]);

  const currentTask = selectedTask
    ? (tasks.find((task) => task.id === selectedTask.id) ?? null)
    : null;

  return (
    <View style={styles.container}>
      {tab === "Home" ? (
        <HomeScreen
          onTab={setTab}
          onSheet={setSheet}
          onTask={setSelectedTask}
          tasks={tasks}
        />
      ) : null}
      {tab === "Tasks" ? (
        <TasksScreen onTask={setSelectedTask} tasks={tasks} />
      ) : null}
      {tab === "Site" ? <SiteScreen onSheet={setSheet} /> : null}
      {tab === "More" ? (
        <MoreScreen
          onSheet={setSheet}
          onTab={setTab}
          role={role}
          onRoleChange={(nextRole) => {
            setRole(nextRole);
            setTab(defaultTabForRole[nextRole]);
          }}
        />
      ) : null}
      {tab === "AdminDashboard" ? <RoleDashboardScreen role="Admin" /> : null}
      {tab === "VendorHome" ? <RoleDashboardScreen role="Vendor" /> : null}
      {tab === "Projects" ? <RoleModuleScreen module="Projects" /> : null}
      {tab === "Approvals" ? <RoleModuleScreen module="Approvals" /> : null}
      {tab === "Orders" ? <RoleModuleScreen module="Orders" /> : null}
      {tab === "Deliveries" ? <RoleModuleScreen module="Deliveries" /> : null}
      <BottomTabs active={tab} onChange={setTab} items={roleTabs[role]} />
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
