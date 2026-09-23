import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Task, TaskStatus, TaskUpdate } from "../../data";
import { TaskUpdateInput } from "../../hooks/useTasks";
import { colors } from "../../theme";
import { formatDate } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DataTable, DataTableColumn } from "../DataTable";
import { PercentageSlider } from "../PercentageSlider";
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
  const dialog = useAppDialog();
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
  const isVerified = task.status === "Verified";
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
      dialog.show("Remark required", "Add a short work update before saving.");
      return;
    }
    if (status === "Completed" && current !== 100) {
      dialog.show(
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
      dialog.show(
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
    dialog.show(
      "Update saved",
      "Task progress and history were saved locally.",
    );
    onClose();
  };
  return (
    <SheetLayout visible title={task.title} eyebrow={task.id} onClose={onClose}>
      <ScrollView contentContainerStyle={sheetStyles.taskContent}>
        <View style={sheetStyles.pills}>
          <StatusPill label={task.priority} />
          <StatusPill label={task.status} />
        </View>
        <Text style={sheetStyles.description}>{task.description}</Text>
        <Info icon="location-dot" label="Location" value={task.area} />
        <Info icon="clock" label="Deadline" value={task.due} />
        {isVerified ? (
          <View style={sheetStyles.requirementNote}>
            <FontAwesome6
              name="circle-check"
              size={15}
              color={colors.success}
            />
            <Text style={sheetStyles.requirementText}>
              This task was reviewed and verified by Admin. Its completion
              record is now read-only.
            </Text>
          </View>
        ) : null}
        {task.status === "Assigned" ? (
          <PrimaryButton
            label="Start task"
            icon="play"
            onPress={() => {
              if (task.evidenceRequired && !beforeMedia) {
                dialog.show(
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
        {!isVerified ? (
          <>
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
          </>
        ) : null}
        <Text style={sheetStyles.fieldLabel}>COMPLETION</Text>
        <Text style={sheetStyles.progressValue}>{current}%</Text>
        <PercentageSlider
          value={current}
          onChange={setProgress}
          disabled={isVerified}
          accessibilityLabel="Task completion percentage"
        />
        <View style={sheetStyles.fieldWrap}>
          <Text style={sheetStyles.fieldLabel}>WORK REMARK</Text>
          <TextInput
            value={remark}
            onChangeText={setRemark}
            style={[sheetStyles.field, sheetStyles.fieldLarge]}
            placeholder="Describe work completed, delays, or blockers"
            placeholderTextColor="#969E9B"
            multiline
            editable={!isVerified}
          />
        </View>
        {task.evidenceRequired && !isVerified ? (
          <View style={sheetStyles.requirementNote}>
            <FontAwesome6 name="circle-info" size={15} color={colors.warning} />
            <Text style={sheetStyles.requirementText}>
              {activeEvidenceStage === "before"
                ? "Before Work evidence is required before starting."
                : activeEvidenceStage === "during"
                  ? "During Work evidence is required with this progress update."
                  : "After Work evidence is required to complete this task."}
            </Text>
          </View>
        ) : null}
        {!isVerified ? (
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
        ) : null}
        {!isVerified ? (
          <PrimaryButton
            label="Save task update"
            icon="circle-check"
            onPress={saveUpdate}
          />
        ) : null}
        <TaskHistory task={task} />
      </ScrollView>
    </SheetLayout>
  );
}

function TaskHistory({ task }: { task: Task }) {
  const columns: DataTableColumn<TaskUpdate>[] = [
    {
      key: "date",
      label: "Date",
      width: 95,
      render: (update) => formatDate(update.createdAt),
    },
    {
      key: "status",
      label: "Status",
      width: 105,
      render: (update) => update.status,
    },
    {
      key: "progress",
      label: "Progress",
      width: 85,
      render: (update) => `${update.progress}%`,
    },
    {
      key: "remark",
      label: "Remark",
      width: 220,
      render: (update) => update.remark,
    },
    {
      key: "evidence",
      label: "Evidence",
      width: 235,
      render: (update) =>
        [
          update.beforeMediaName && `Before: ${update.beforeMediaName}`,
          update.duringMediaName && `During: ${update.duringMediaName}`,
          update.afterMediaName && `After: ${update.afterMediaName}`,
          update.evidenceName,
        ]
          .filter(Boolean)
          .join(" · ") || "—",
    },
  ];
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
          <Text style={sheetStyles.emptyHistoryText}>
            No updates submitted yet.
          </Text>
        </View>
      ) : (
        <DataTable
          title="Task update history"
          columns={columns}
          rows={task.updates}
          rowKey={(update) => update.id}
        />
      )}
    </View>
  );
}
