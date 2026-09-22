import { FontAwesome6 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Task, TaskStatus } from "../../data";
import { TaskUpdateInput } from "../../hooks/useTasks";
import { colors } from "../../theme";
import { AttachmentPicker } from "../AttachmentPicker";
import { PrimaryButton, StatusPill } from "../ui";
import { SheetLayout } from "./SheetLayout";
import { sheetStyles } from "./styles";
import { Info } from "./SupportSheets";

export function TaskSheet({
  task,
  onClose,
  onUpdate,
}: {
  task: Task | null;
  onClose: () => void;
  onUpdate: (input: TaskUpdateInput) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [beforeMedia, setBeforeMedia] = useState<string | null>(null);
  const [duringMedia, setDuringMedia] = useState<string | null>(null);
  const [afterMedia, setAfterMedia] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Assigned");

  useEffect(() => {
    if (!task) return;
    setProgress(task.progress);
    setStatus(task.status);
    setRemark("");
    setBeforeMedia(
      task.updates.find((update) => update.beforeMediaName)?.beforeMediaName ??
        null,
    );
    setDuringMedia(
      task.updates.find((update) => update.duringMediaName)?.duringMediaName ??
        null,
    );
    setAfterMedia(
      task.updates.find((update) => update.afterMediaName)?.afterMediaName ??
        null,
    );
  }, [task?.id]);

  if (!task) return null;
  const current = progress;
  const activeEvidenceStage =
    status === "Assigned"
      ? "before"
      : status === "Completed" || current === 100
        ? "after"
        : "during";
  const activeEvidence =
    activeEvidenceStage === "before"
      ? beforeMedia
      : activeEvidenceStage === "during"
        ? duringMedia
        : afterMedia;
  const statuses: TaskStatus[] = [
    "Assigned",
    "In progress",
    "Blocked",
    "Completed",
  ];

  const saveUpdate = () => {
    if (!remark.trim()) {
      Alert.alert("Remark required", "Add a short work update before saving.");
      return;
    }
    if (status === "Completed" && current !== 100) {
      Alert.alert(
        "Completion must be 100%",
        "Set task progress to 100% before marking it completed.",
      );
      return;
    }
    if (task.evidenceRequired && !activeEvidence) {
      const evidenceLabel =
        activeEvidenceStage === "before"
          ? "Before Work"
          : activeEvidenceStage === "during"
            ? "During Work"
            : "After Work";
      Alert.alert(
        "Evidence required",
        `Upload a photo or video for ${evidenceLabel} before saving this update.`,
      );
      return;
    }
    onUpdate({
      taskId: task.id,
      status,
      progress: current,
      remark: remark.trim(),
      beforeMediaName:
        activeEvidenceStage === "before"
          ? (beforeMedia ?? undefined)
          : undefined,
      duringMediaName:
        activeEvidenceStage === "during"
          ? (duringMedia ?? undefined)
          : undefined,
      afterMediaName:
        activeEvidenceStage === "after" ? (afterMedia ?? undefined) : undefined,
    });
    Alert.alert(
      "Update saved",
      "Task progress and history were saved locally.",
    );
    onClose();
  };
  return (
    <SheetLayout
      visible
      title={task.title}
      eyebrow={task.id}
      onClose={onClose}
    >
      <ScrollView contentContainerStyle={sheetStyles.taskContent}>
            <View style={sheetStyles.pills}>
              <StatusPill label={task.priority} />
              <StatusPill label={task.status} />
            </View>
            <Text style={sheetStyles.description}>{task.description}</Text>
            <Info icon="location-dot" label="Location" value={task.area} />
            <Info icon="clock" label="Deadline" value={task.due} />
            {task.status === "Assigned" ? (
              <PrimaryButton
                label="Start task"
                icon="play"
                onPress={() => {
                  if (task.evidenceRequired && !beforeMedia) {
                    Alert.alert(
                      "Before Work evidence required",
                      "Upload a before-work photo or video before starting this task.",
                    );
                    return;
                  }
                  onUpdate({
                    taskId: task.id,
                    status: "In progress",
                    progress: current,
                    remark: remark.trim() || "Task started",
                    beforeMediaName: beforeMedia ?? undefined,
                  });
                  setStatus("In progress");
                }}
              />
            ) : null}
            <Text style={sheetStyles.fieldLabel}>TASK STATUS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sheetStyles.statusOptions}
            >
              {statuses.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setStatus(option);
                    if (option === "Completed") setProgress(100);
                  }}
                  style={[
                    sheetStyles.statusOption,
                    status === option && sheetStyles.statusOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      sheetStyles.statusOptionText,
                      status === option && sheetStyles.statusOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={sheetStyles.fieldLabel}>COMPLETION</Text>
            <Text style={sheetStyles.progressValue}>{current}%</Text>
            <View style={sheetStyles.sliderCard}>
              <Slider
                style={sheetStyles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={current}
                onValueChange={setProgress}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                accessibilityLabel="Task completion percentage"
                accessibilityValue={{ min: 0, max: 100, now: current }}
              />
              <View style={sheetStyles.sliderLabels}>
                <Text style={sheetStyles.sliderLabel}>0%</Text>
                <Text style={sheetStyles.sliderHint}>
                  Slide to select any percentage
                </Text>
                <Text style={sheetStyles.sliderLabel}>100%</Text>
              </View>
            </View>
            <View style={sheetStyles.fieldWrap}>
              <Text style={sheetStyles.fieldLabel}>WORK REMARK</Text>
              <TextInput
                value={remark}
                onChangeText={setRemark}
                style={[sheetStyles.field, sheetStyles.fieldLarge]}
                placeholder="Describe work completed, delays, or blockers"
                placeholderTextColor="#969E9B"
                multiline
              />
            </View>
            {task.evidenceRequired ? (
              <View style={sheetStyles.requirementNote}>
                <FontAwesome6
                  name="circle-info"
                  size={15}
                  color={colors.warning}
                />
                <Text style={sheetStyles.requirementText}>
                  {activeEvidenceStage === "before"
                    ? "Before Work evidence is required before starting."
                    : activeEvidenceStage === "during"
                      ? "During Work evidence is required with this progress update."
                      : "After Work evidence is required to complete this task."}
                </Text>
              </View>
            ) : null}
            <View style={sheetStyles.evidenceStages}>
              <View style={sheetStyles.evidenceStage}>
                <View style={sheetStyles.evidenceStageHeader}>
                  <View style={sheetStyles.evidenceStageNumber}>
                    <Text style={sheetStyles.evidenceStageNumberText}>
                      {activeEvidenceStage === "before"
                        ? "1"
                        : activeEvidenceStage === "during"
                          ? "2"
                          : "3"}
                    </Text>
                  </View>
                  <View>
                    <Text style={sheetStyles.evidenceStageTitle}>
                      {activeEvidenceStage === "before"
                        ? "Before Work"
                        : activeEvidenceStage === "during"
                          ? "During Work"
                          : "After Work"}
                    </Text>
                    <Text style={sheetStyles.evidenceStageCopy}>
                      {activeEvidenceStage === "before"
                        ? "Initial condition before starting"
                        : activeEvidenceStage === "during"
                          ? "Current execution and progress"
                          : "Completed work evidence"}
                    </Text>
                  </View>
                </View>
                {activeEvidenceStage === "before" ? (
                  <AttachmentPicker
                    value={beforeMedia}
                    onChange={setBeforeMedia}
                    label="Upload before photo or video"
                    mediaOnly
                  />
                ) : activeEvidenceStage === "during" ? (
                  <AttachmentPicker
                    value={duringMedia}
                    onChange={setDuringMedia}
                    label="Upload during photo or video"
                    mediaOnly
                  />
                ) : (
                  <AttachmentPicker
                    value={afterMedia}
                    onChange={setAfterMedia}
                    label="Upload after photo or video"
                    mediaOnly
                  />
                )}
              </View>
            </View>
            <PrimaryButton
              label="Save task update"
              icon="circle-check"
              onPress={saveUpdate}
            />
            <TaskHistory task={task} />
      </ScrollView>
    </SheetLayout>
  );
}

function TaskHistory({ task }: { task: Task }) {
  return (
    <View style={sheetStyles.historySection}>
      <Text style={sheetStyles.fieldLabel}>UPDATE HISTORY</Text>
      {task.updates.length === 0 ? (
        <View style={sheetStyles.emptyHistory}>
          <FontAwesome6
            name="clock-rotate-left"
            size={18}
            color={colors.inkMuted}
          />
          <Text style={sheetStyles.emptyHistoryText}>No updates submitted yet.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[sheetStyles.table, sheetStyles.taskHistoryTable]}>
            <View style={[sheetStyles.tableRow, sheetStyles.tableHeader]}>
              <Text
                style={[
                  sheetStyles.tableCell,
                  sheetStyles.historyDateCell,
                  sheetStyles.tableHeadText,
                ]}
              >
                Date
              </Text>
              <Text
                style={[
                  sheetStyles.tableCell,
                  sheetStyles.historyStatusCell,
                  sheetStyles.tableHeadText,
                ]}
              >
                Status
              </Text>
              <Text
                style={[
                  sheetStyles.tableCell,
                  sheetStyles.historyProgressCell,
                  sheetStyles.tableHeadText,
                ]}
              >
                Progress
              </Text>
              <Text
                style={[
                  sheetStyles.tableCell,
                  sheetStyles.historyRemarkCell,
                  sheetStyles.tableHeadText,
                ]}
              >
                Remark
              </Text>
              <Text
                style={[
                  sheetStyles.tableCell,
                  sheetStyles.historyEvidenceCell,
                  sheetStyles.tableHeadText,
                ]}
              >
                Evidence
              </Text>
            </View>
            {task.updates.map((update, index) => {
              const evidence = [
                update.beforeMediaName && `Before: ${update.beforeMediaName}`,
                update.duringMediaName && `During: ${update.duringMediaName}`,
                update.afterMediaName && `After: ${update.afterMediaName}`,
                update.evidenceName,
              ]
                .filter(Boolean)
                .join("\n");
              return (
                <View
                  key={update.id}
                  style={[
                    sheetStyles.tableRow,
                    index % 2 === 1 && sheetStyles.tableRowAlternate,
                  ]}
                >
                  <Text style={[sheetStyles.tableCell, sheetStyles.historyDateCell]}>
                    {new Date(update.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={[sheetStyles.tableCell, sheetStyles.historyStatusCell]}>
                    {update.status}
                  </Text>
                  <Text style={[sheetStyles.tableCell, sheetStyles.historyProgressCell]}>
                    {update.progress}%
                  </Text>
                  <Text
                    style={[sheetStyles.tableCell, sheetStyles.historyRemarkCell]}
                    numberOfLines={3}
                  >
                    {update.remark}
                  </Text>
                  <Text
                    style={[sheetStyles.tableCell, sheetStyles.historyEvidenceCell]}
                    numberOfLines={4}
                  >
                    {evidence || "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
