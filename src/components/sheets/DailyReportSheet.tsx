import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Task } from "../../data";
import {
  DailyReport,
  DailyReportInput,
} from "../../hooks/useDailyReports";
import { colors } from "../../theme";
import { AttachmentPicker } from "../AttachmentPicker";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { sheetStyles } from "./styles";

export function DailyReportForm({
  tasks,
  reports,
  onSubmit,
}: {
  tasks: Task[];
  reports: DailyReport[];
  onSubmit: (input: DailyReportInput) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [workCompleted, setWorkCompleted] = useState("");
  const [workforce, setWorkforce] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [pendingTaskIds, setPendingTaskIds] = useState<string[]>([]);
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [materialsRequired, setMaterialsRequired] = useState("");
  const [expenseSummary, setExpenseSummary] = useState("");
  const [issues, setIssues] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState("All sites");
  const [dateFilter, setDateFilter] = useState("All dates");

  const toggleTask = (
    taskId: string,
    selected: string[],
    update: (value: string[]) => void,
  ) => {
    update(
      selected.includes(taskId)
        ? selected.filter((id) => id !== taskId)
        : [...selected, taskId],
    );
  };

  const submit = () => {
    const workforceCount = Number(workforce);
    if (
      !workCompleted.trim() ||
      !Number.isInteger(workforceCount) ||
      workforceCount < 0
    ) {
      Alert.alert(
        "Report details required",
        "Add today's completed work and a valid workforce count.",
      );
      return;
    }
    if (!remarks.trim()) {
      Alert.alert("Remarks required", "Add the daily supervisor remarks.");
      return;
    }
    if (!photoName && !videoName) {
      Alert.alert(
        "Evidence required",
        "Attach at least one progress photo or video.",
      );
      return;
    }
    onSubmit({
      date: today,
      project: "Palm Grove Residence",
      site: "Villa 18",
      supervisor: "Arjun Kumar",
      workCompleted: workCompleted.trim(),
      completedTaskIds,
      pendingTaskIds,
      workforce: workforceCount,
      materialsUsed: materialsUsed.trim(),
      materialsRequired: materialsRequired.trim(),
      expenseSummary: expenseSummary.trim(),
      issues: issues.trim(),
      remarks: remarks.trim(),
      photoName: photoName ?? undefined,
      videoName: videoName ?? undefined,
    });
  };

  const dateOptions = [
    "All dates",
    ...Array.from(new Set(reports.map((report) => report.date))),
  ];
  const filteredReports = reports.filter(
    (report) =>
      (siteFilter === "All sites" || report.site === siteFilter) &&
      (dateFilter === "All dates" || report.date === dateFilter),
  );

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sheetStyles.context}>
        <FontAwesome6 name="calendar-day" size={17} color={colors.primary} />
        <View>
          <Text style={sheetStyles.contextLabel}>DAILY REPORT · {today}</Text>
          <Text style={sheetStyles.contextValue}>
            Palm Grove Residence · Villa 18 · Arjun Kumar
          </Text>
        </View>
      </View>
      <ReportField
        label="WORK COMPLETED TODAY"
        value={workCompleted}
        onChangeText={setWorkCompleted}
        placeholder="Describe the work completed today"
        multiline
      />
      <ReportField
        label="WORKFORCE AVAILABLE"
        value={workforce}
        onChangeText={setWorkforce}
        placeholder="Enter total workers"
        keyboardType="number-pad"
      />
      <TaskSelection
        label="TASKS COMPLETED"
        tasks={tasks.filter((task) => task.status === "Completed")}
        selected={completedTaskIds}
        onToggle={(id) =>
          toggleTask(id, completedTaskIds, setCompletedTaskIds)
        }
      />
      <TaskSelection
        label="TASKS PENDING"
        tasks={tasks.filter((task) => task.status !== "Completed")}
        selected={pendingTaskIds}
        onToggle={(id) => toggleTask(id, pendingTaskIds, setPendingTaskIds)}
      />
      <ReportField
        label="MATERIALS USED"
        value={materialsUsed}
        onChangeText={setMaterialsUsed}
        placeholder="Material, quantity and unit"
        multiline
      />
      <ReportField
        label="MATERIALS REQUIRED"
        value={materialsRequired}
        onChangeText={setMaterialsRequired}
        placeholder="Upcoming material requirement"
        multiline
      />
      <ReportField
        label="SITE EXPENSE SUMMARY"
        value={expenseSummary}
        onChangeText={setExpenseSummary}
        placeholder="Expense category and amount"
        multiline
      />
      <ReportField
        label="ISSUES FACED"
        value={issues}
        onChangeText={setIssues}
        placeholder="Delay, safety, material or technical issue"
        multiline
      />
      <ReportField
        label="DAILY REMARKS"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="Observations and next steps"
        multiline
      />
      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>PHOTO EVIDENCE</Text>
        <AttachmentPicker
          value={photoName}
          onChange={setPhotoName}
          label="Add progress photo"
          mediaOnly
          mediaType="images"
        />
      </View>
      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>VIDEO EVIDENCE</Text>
        <AttachmentPicker
          value={videoName}
          onChange={setVideoName}
          label="Add progress video"
          mediaOnly
          mediaType="videos"
        />
      </View>
      <PrimaryButton
        label="Submit daily report"
        icon="circle-check"
        onPress={submit}
      />
      <View style={sheetStyles.reportHistory}>
        <Text style={sheetStyles.fieldLabel}>REPORT HISTORY</Text>
        <View style={sheetStyles.reportFilters}>
          <View style={sheetStyles.reportFilter}>
            <DropdownField
              value={siteFilter}
              placeholder="Filter by site"
              options={["All sites", "Villa 18"]}
              onChange={setSiteFilter}
            />
          </View>
          <View style={sheetStyles.reportFilter}>
            <DropdownField
              value={dateFilter}
              placeholder="Filter by date"
              options={dateOptions}
              onChange={setDateFilter}
            />
          </View>
        </View>
        {filteredReports.length ? (
          filteredReports.map((report) => (
            <Surface key={report.id} style={sheetStyles.reportCard}>
              <View style={sheetStyles.reportCardHeader}>
                <View>
                  <Text style={sheetStyles.itemTitle}>{report.date}</Text>
                  <Text style={sheetStyles.itemMeta}>
                    {report.project} · {report.site}
                  </Text>
                </View>
                <StatusPill label={`${report.workforce} workers`} />
              </View>
              <Text style={sheetStyles.reportWork}>{report.workCompleted}</Text>
              <Text style={sheetStyles.reportMeta}>
                {report.completedTaskIds.length} completed ·{" "}
                {report.pendingTaskIds.length} pending
              </Text>
              <Text style={sheetStyles.reportMeta}>
                Evidence:{" "}
                {[report.photoName, report.videoName]
                  .filter(Boolean)
                  .join(", ") || "None"}
              </Text>
            </Surface>
          ))
        ) : (
          <View style={sheetStyles.emptyHistory}>
            <FontAwesome6
              name="file-circle-xmark"
              size={18}
              color={colors.inkMuted}
            />
            <Text style={sheetStyles.emptyHistoryText}>
              No reports match these filters.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function ReportField({
  label,
  multiline = false,
  ...inputProps
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "number-pad";
}) {
  return (
    <View style={sheetStyles.fieldWrap}>
      <Text style={sheetStyles.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor="#969E9B"
        style={[sheetStyles.field, multiline && sheetStyles.fieldLarge]}
      />
    </View>
  );
}

function TaskSelection({
  label,
  tasks,
  selected,
  onToggle,
}: {
  label: string;
  tasks: Task[];
  selected: string[];
  onToggle: (taskId: string) => void;
}) {
  return (
    <View style={sheetStyles.fieldWrap}>
      <Text style={sheetStyles.fieldLabel}>{label}</Text>
      <View style={sheetStyles.taskSelection}>
        {tasks.map((task) => {
          const active = selected.includes(task.id);
          return (
            <Pressable
              key={task.id}
              onPress={() => onToggle(task.id)}
              style={[sheetStyles.taskChoice, active && sheetStyles.taskChoiceActive]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
            >
              <FontAwesome6
                name={active ? "square-check" : "square"}
                size={16}
                color={active ? colors.primary : colors.inkMuted}
              />
              <View style={sheetStyles.taskChoiceCopy}>
                <Text style={sheetStyles.taskChoiceTitle}>{task.title}</Text>
                <Text style={sheetStyles.taskChoiceMeta}>
                  {task.id} · {task.status}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}


