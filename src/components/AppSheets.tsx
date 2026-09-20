import { FontAwesome6 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  expenses,
  notifications,
  ProgressStage,
  SiteProgressEntry,
  Task,
  TaskStatus,
} from "../data";
import { SiteProgressInput } from "../hooks/useSiteProgress";
import { TaskUpdateInput } from "../hooks/useTasks";
import { colors, radius } from "../theme";
import { FontAwesomeIcon } from "../types/icons";
import { SheetName } from "../types/navigation";
import { AttachmentPicker } from "./AttachmentPicker";
import { DropdownField } from "./DropdownField";
import { IconButton, PrimaryButton, StatusPill, Surface } from "./ui";

export function ActionSheet({
  kind,
  onClose,
  progressEntries,
  onAddProgress,
}: {
  kind: SheetName;
  onClose: () => void;
  progressEntries: SiteProgressEntry[];
  onAddProgress: (input: SiteProgressInput) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const config = getConfig(kind);
  const close = () => {
    setSubmitted(false);
    onClose();
  };
  return (
    <Modal
      visible={kind !== null}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={styles.modal}>
        <Pressable style={styles.backdrop} onPress={close} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
            </View>
            <IconButton icon="xmark" onPress={close} />
          </View>
          {submitted ? (
            <Success onClose={close} />
          ) : kind === "notifications" ? (
            <Notifications />
          ) : kind === "profile" ? (
            <Profile />
          ) : kind === "cash" ? (
            <Cash />
          ) : kind === "messages" ? (
            <Messages />
          ) : kind === "documents" ? (
            <Documents />
          ) : kind === "progress" ? (
            <SiteProgress
              entries={progressEntries}
              onSubmit={(input) => {
                onAddProgress(input);
                setSubmitted(true);
              }}
            />
          ) : (
            <Form kind={kind} onSubmit={() => setSubmitted(true)} />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SiteProgress({
  entries,
  onSubmit,
}: {
  entries: SiteProgressEntry[];
  onSubmit: (input: SiteProgressInput) => void;
}) {
  const [stage, setStage] = useState<ProgressStage>("During work");
  const [progress, setProgress] = useState(68);
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [mediaName, setMediaName] = useState<string | null>(null);
  const stages: ProgressStage[] = ["Before work", "During work", "After work"];

  const submit = () => {
    if (!description.trim() || !remarks.trim()) {
      Alert.alert(
        "Details required",
        "Add the work description and daily remarks.",
      );
      return;
    }
    if (!mediaName) {
      Alert.alert(
        "Media required",
        "Attach a site photo or video for this progress stage.",
      );
      return;
    }
    onSubmit({
      stage,
      progress,
      workDescription: description.trim(),
      remarks: remarks.trim(),
      mediaName,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.progressForm}>
      <View style={styles.context}>
        <FontAwesome6 name="building" size={17} color={colors.primary} />
        <View>
          <Text style={styles.contextLabel}>PALM GROVE RESIDENCE</Text>
          <Text style={styles.contextValue}>Villa 18 · Arjun Kumar</Text>
        </View>
      </View>
      <Text style={styles.fieldLabel}>PROGRESS STAGE</Text>
      <View style={styles.stageGrid}>
        {stages.map((option) => (
          <Pressable
            key={option}
            onPress={() => setStage(option)}
            style={[
              styles.stageOption,
              stage === option && styles.stageOptionActive,
            ]}
          >
            <FontAwesome6
              name={
                option === "Before work"
                  ? "camera"
                  : option === "During work"
                    ? "person-digging"
                    : "circle-check"
              }
              size={16}
              color={stage === option ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.stageText,
                stage === option && styles.stageTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.progressHeading}>
        <Text style={styles.fieldLabel}>SITE COMPLETION</Text>
        <Text style={styles.progressHeadingValue}>{progress}%</Text>
      </View>
      <View style={styles.sliderCard}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={progress}
          onValueChange={setProgress}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Site completion percentage"
          accessibilityValue={{ min: 0, max: 100, now: progress }}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>0%</Text>
          <Text style={styles.sliderHint}>Slide to select any percentage</Text>
          <Text style={styles.sliderLabel}>100%</Text>
        </View>
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>WORK DESCRIPTION</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.field, styles.fieldLarge]}
          placeholder="Describe today's site work"
          placeholderTextColor="#969E9B"
          multiline
        />
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>DAILY REMARKS</Text>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          style={[styles.field, styles.fieldLarge]}
          placeholder="Add observations, delays, or next steps"
          placeholderTextColor="#969E9B"
          multiline
        />
      </View>
      <AttachmentPicker value={mediaName} onChange={setMediaName} />
      <PrimaryButton
        label="Save progress update"
        icon="circle-check"
        onPress={submit}
      />
      <ProgressHistoryTable entries={entries} />
    </ScrollView>
  );
}

function ProgressHistoryTable({ entries }: { entries: SiteProgressEntry[] }) {
  return (
    <View style={styles.progressHistory}>
      <Text style={styles.fieldLabel}>PROGRESS HISTORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text
              style={[styles.tableCell, styles.dateCell, styles.tableHeadText]}
            >
              Date
            </Text>
            <Text
              style={[styles.tableCell, styles.stageCell, styles.tableHeadText]}
            >
              Stage
            </Text>
            <Text
              style={[styles.tableCell, styles.workCell, styles.tableHeadText]}
            >
              Work
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.percentCell,
                styles.tableHeadText,
              ]}
            >
              Progress
            </Text>
          </View>
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlternate,
              ]}
            >
              <Text style={[styles.tableCell, styles.dateCell]}>
                {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, styles.stageCell]}>
                {entry.stage}
              </Text>
              <Text
                style={[styles.tableCell, styles.workCell]}
                numberOfLines={2}
              >
                {entry.workDescription}
              </Text>
              <Text style={[styles.tableCell, styles.percentCell]}>
                {entry.progress}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
      Alert.alert(
        "Evidence required",
        `Upload a photo or video for ${activeEvidenceStage === "before" ? "Before Work" : activeEvidenceStage === "during" ? "During Work" : "After Work"} before saving this update.`,
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
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={["bottom"]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.taskId}>{task.id}</Text>
              <Text style={styles.title}>{task.title}</Text>
            </View>
            <IconButton icon="xmark" onPress={onClose} />
          </View>
          <ScrollView contentContainerStyle={styles.taskContent}>
            <View style={styles.pills}>
              <StatusPill label={task.priority} />
              <StatusPill label={task.status} />
            </View>
            <Text style={styles.description}>{task.description}</Text>
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
            <Text style={styles.fieldLabel}>TASK STATUS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusOptions}
            >
              {statuses.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setStatus(option);
                    if (option === "Completed") setProgress(100);
                  }}
                  style={[
                    styles.statusOption,
                    status === option && styles.statusOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === option && styles.statusOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.fieldLabel}>COMPLETION</Text>
            <Text style={styles.progressValue}>{current}%</Text>
            <View style={styles.sliderCard}>
              <Slider
                style={styles.slider}
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
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Text style={styles.sliderHint}>
                  Slide to select any percentage
                </Text>
                <Text style={styles.sliderLabel}>100%</Text>
              </View>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>WORK REMARK</Text>
              <TextInput
                value={remark}
                onChangeText={setRemark}
                style={[styles.field, styles.fieldLarge]}
                placeholder="Describe work completed, delays, or blockers"
                placeholderTextColor="#969E9B"
                multiline
              />
            </View>
            {task.evidenceRequired ? (
              <View style={styles.requirementNote}>
                <FontAwesome6
                  name="circle-info"
                  size={15}
                  color={colors.warning}
                />
                <Text style={styles.requirementText}>
                  {activeEvidenceStage === "before"
                    ? "Before Work evidence is required before starting."
                    : activeEvidenceStage === "during"
                      ? "During Work evidence is required with this progress update."
                      : "After Work evidence is required to complete this task."}
                </Text>
              </View>
            ) : null}
            <View style={styles.evidenceStages}>
              <View style={styles.evidenceStage}>
                <View style={styles.evidenceStageHeader}>
                  <View style={styles.evidenceStageNumber}>
                    <Text style={styles.evidenceStageNumberText}>
                      {activeEvidenceStage === "before"
                        ? "1"
                        : activeEvidenceStage === "during"
                          ? "2"
                          : "3"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.evidenceStageTitle}>
                      {activeEvidenceStage === "before"
                        ? "Before Work"
                        : activeEvidenceStage === "during"
                          ? "During Work"
                          : "After Work"}
                    </Text>
                    <Text style={styles.evidenceStageCopy}>
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
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function TaskHistory({ task }: { task: Task }) {
  return (
    <View style={styles.historySection}>
      <Text style={styles.fieldLabel}>UPDATE HISTORY</Text>
      {task.updates.length === 0 ? (
        <View style={styles.emptyHistory}>
          <FontAwesome6
            name="clock-rotate-left"
            size={18}
            color={colors.inkMuted}
          />
          <Text style={styles.emptyHistoryText}>No updates submitted yet.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, styles.taskHistoryTable]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.historyDateCell,
                  styles.tableHeadText,
                ]}
              >
                Date
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.historyStatusCell,
                  styles.tableHeadText,
                ]}
              >
                Status
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.historyProgressCell,
                  styles.tableHeadText,
                ]}
              >
                Progress
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.historyRemarkCell,
                  styles.tableHeadText,
                ]}
              >
                Remark
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.historyEvidenceCell,
                  styles.tableHeadText,
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
                    styles.tableRow,
                    index % 2 === 1 && styles.tableRowAlternate,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.historyDateCell]}>
                    {new Date(update.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.historyStatusCell]}>
                    {update.status}
                  </Text>
                  <Text style={[styles.tableCell, styles.historyProgressCell]}>
                    {update.progress}%
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.historyRemarkCell]}
                    numberOfLines={3}
                  >
                    {update.remark}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.historyEvidenceCell]}
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

function Form({ kind, onSubmit }: { kind: SheetName; onSubmit: () => void }) {
  const config = getConfig(kind);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <ScrollView
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.context}>
        <FontAwesome6 name="location-dot" size={17} color={colors.primary} />
        <View>
          <Text style={styles.contextLabel}>PALM GROVE RESIDENCE</Text>
          <Text style={styles.contextValue}>Villa 18 · Active site</Text>
        </View>
      </View>
      {config.fields.map((field, index) => {
        const dropdown = getDropdownConfig(kind, field);
        return (
          <View key={field} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{field}</Text>
            {dropdown ? (
              <DropdownField
                value={values[field]}
                placeholder={dropdown.placeholder}
                options={dropdown.options}
                onChange={(value) =>
                  setValues((current) => ({ ...current, [field]: value }))
                }
              />
            ) : (
              <TextInput
                value={values[field] ?? ""}
                onChangeText={(value) =>
                  setValues((current) => ({ ...current, [field]: value }))
                }
                style={[
                  styles.field,
                  index === config.fields.length - 1 && styles.fieldLarge,
                ]}
                placeholder={config.placeholders[index]}
                placeholderTextColor="#969E9B"
                multiline={index === config.fields.length - 1}
              />
            )}
          </View>
        );
      })}
      <AttachmentPicker value={attachment} onChange={setAttachment} />
      <PrimaryButton
        label={config.button}
        icon="circle-check"
        onPress={onSubmit}
      />
    </ScrollView>
  );
}

function getDropdownConfig(kind: SheetName, field: string) {
  if (kind === "attendance" && field === "STATUS") {
    return {
      placeholder: "Select attendance status",
      options: ["Present", "Absent", "Half Day", "Leave"],
    };
  }
  if (kind === "issue" && field === "ISSUE TYPE") {
    return {
      placeholder: "Select issue type",
      options: ["Technical", "Safety", "Material"],
    };
  }
  if (kind === "issue" && field === "PRIORITY") {
    return {
      placeholder: "Select priority",
      options: ["Low", "Medium", "High", "Critical"],
    };
  }
  return null;
}

function Success({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.success}>
      <View style={styles.successIcon}>
        <FontAwesome6 name="check" size={28} color={colors.white} />
      </View>
      <Text style={styles.successTitle}>Submitted successfully</Text>
      <Text style={styles.successCopy}>
        Your update is saved locally and ready to sync when a backend is
        connected.
      </Text>
      <PrimaryButton label="Done" onPress={onClose} />
    </View>
  );
}
function Notifications() {
  return (
    <ScrollView contentContainerStyle={styles.list}>
      {notifications.map((item) => (
        <View key={item.title} style={styles.notification}>
          <View style={styles.itemIcon}>
            <FontAwesome6
              name={notificationIcon(item.icon)}
              size={17}
              color={colors.primary}
            />
          </View>
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>{item.detail}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={styles.unread} />
        </View>
      ))}
    </ScrollView>
  );
}
function Profile() {
  return (
    <View style={styles.profile}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>AK</Text>
      </View>
      <Text style={styles.profileName}>Arjun Kumar</Text>
      <Text style={styles.itemMeta}>Site Supervisor</Text>
      <Info
        icon="building"
        label="Assigned site"
        value="Palm Grove Residence · Villa 18"
      />
      <Info icon="phone" label="Phone" value="+91 98765 43210" />
      <Info icon="envelope" label="Email" value="arjun@shdinterior.com" />
    </View>
  );
}
function Cash() {
  return (
    <ScrollView contentContainerStyle={styles.list}>
      <LinearGradient colors={["#173F35", "#255E4D"]} style={styles.cash}>
        <Text style={styles.cashLabel}>AVAILABLE CASH</Text>
        <Text style={styles.cashValue}>₹37,000</Text>
        <Text style={styles.cashMeta}>₹50,000 issued · ₹13,000 used</Text>
      </LinearGradient>
      <Text style={styles.listHeading}>RECENT TRANSACTIONS</Text>
      <Surface style={styles.card}>
        {expenses.map((item, index) => (
          <View key={item.label}>
            {index ? <View style={styles.divider} /> : null}
            <View style={styles.expense}>
              <View style={styles.itemIcon}>
                <FontAwesome6 name="arrow-up" size={15} color={colors.danger} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{item.label}</Text>
                <Text style={styles.itemMeta}>{item.meta}</Text>
              </View>
              <View style={styles.alignEnd}>
                <Text style={styles.amount}>−{item.amount}</Text>
                <StatusPill label={item.status} />
              </View>
            </View>
          </View>
        ))}
      </Surface>
      <Text style={styles.note}>
        Balance is calculated automatically from issued cash and approved
        expenses.
      </Text>
    </ScrollView>
  );
}
function Messages() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const send = () => {
    if (!message.trim()) return;
    setSent([...sent, message.trim()]);
    setMessage("");
  };
  return (
    <View style={styles.messageScreen}>
      <ScrollView contentContainerStyle={styles.messages}>
        <Bubble
          incoming
          text="Please review the revised lighting plan before ceiling work starts."
        />
        <Bubble text="Received. I will verify the points and share site photos." />
        {sent.map((text, index) => (
          <Bubble key={`${text}-${index}`} text={text} />
        ))}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Reply to admin..."
          style={styles.messageInput}
        />
        <Pressable style={styles.send} onPress={send}>
          <FontAwesome6 name="paper-plane" size={16} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}
function Bubble({ text, incoming }: { text: string; incoming?: boolean }) {
  return (
    <View style={[styles.bubble, incoming ? styles.incoming : styles.outgoing]}>
      <Text style={[styles.bubbleText, !incoming && styles.bubbleTextOutgoing]}>
        {text}
      </Text>
      <Text style={[styles.time, !incoming && styles.bubbleTime]}>Today</Text>
    </View>
  );
}
function Documents() {
  const [attachment, setAttachment] = useState<string | null>(null);
  const docs = [
    "Approved lighting plan.pdf",
    "Kitchen elevation.pdf",
    "Material challan 184.pdf",
  ];
  return (
    <ScrollView contentContainerStyle={styles.list}>
      <AttachmentPicker value={attachment} onChange={setAttachment} />
      <Text style={styles.listHeading}>RECENT SITE DOCUMENTS</Text>
      <Surface style={styles.card}>
        {docs.map((name, index) => (
          <View key={name}>
            {index ? <View style={styles.divider} /> : null}
            <View style={styles.document}>
              <View style={styles.itemIcon}>
                <FontAwesome6
                  name="file-pdf"
                  size={17}
                  color={colors.primary}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{name}</Text>
                <Text style={styles.itemMeta}>Site document · PDF</Text>
              </View>
              <FontAwesome6 name="download" size={15} color={colors.inkMuted} />
            </View>
          </View>
        ))}
      </Surface>
    </ScrollView>
  );
}
function Info({
  icon,
  label,
  value,
}: {
  icon: FontAwesomeIcon;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.info}>
      <View style={styles.itemIcon}>
        <FontAwesome6 name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}
function notificationIcon(icon: string): FontAwesomeIcon {
  if (icon.includes("cube")) return "cubes";
  if (icon.includes("time")) return "clock";
  return "comment";
}

function getConfig(kind: SheetName) {
  const common = {
    title: "",
    subtitle: "",
    fields: [] as string[],
    placeholders: [] as string[],
    button: "Submit",
  };
  const forms = {
    report: {
      title: "Daily site report",
      subtitle: "Record today’s site activity",
      fields: ["WORK COMPLETED", "WORKFORCE", "MATERIAL USED", "REMARKS"],
      placeholders: [
        "Describe completed work",
        "Enter total workers",
        "List consumed materials",
        "Add supervisor remarks",
      ],
      button: "Submit daily report",
    },
    material: {
      title: "Material request",
      subtitle: "Raise a site requirement",
      fields: ["MATERIAL", "QUANTITY & UNIT", "REQUIRED BY", "REASON"],
      placeholders: [
        "e.g. White cement",
        "e.g. 20 bags",
        "e.g. 22 September",
        "Explain where it is needed",
      ],
      button: "Send request",
    },
    expense: {
      title: "Add site expense",
      subtitle: "Submit for admin approval",
      fields: ["CATEGORY", "AMOUNT", "PAID TO", "DESCRIPTION"],
      placeholders: [
        "e.g. Transport",
        "₹ 0",
        "Vendor or person name",
        "What was this expense for?",
      ],
      button: "Submit expense",
    },
    attendance: {
      title: "Mark attendance",
      subtitle: "Record today’s workforce",
      fields: ["WORKER NAME", "TRADE / ROLE", "STATUS", "REMARKS"],
      placeholders: [
        "Enter worker name",
        "e.g. Carpenter",
        "Present / Absent / Half day",
        "Optional note",
      ],
      button: "Save attendance",
    },
    issue: {
      title: "Report an issue",
      subtitle: "Get help from admin or engineer",
      fields: ["ISSUE TYPE", "PRIORITY", "TITLE", "DESCRIPTION"],
      placeholders: [
        "Technical / Safety / Material",
        "Low / Medium / High / Critical",
        "Short issue title",
        "Describe the issue clearly",
      ],
      button: "Report issue",
    },
  };
  if (kind && kind in forms) return forms[kind as keyof typeof forms];
  const labels: Record<string, [string, string]> = {
    notifications: ["Notifications", "3 new site updates"],
    profile: ["My profile", "Supervisor account"],
    cash: ["Cash in hand", "Calculated supervisor balance"],
    messages: ["Admin messages", "Palm Grove Residence"],
    documents: ["Site documents", "Drawings, bills and supporting files"],
    progress: ["Site progress update", "Record work and progress evidence"],
  };
  return kind && labels[kind]
    ? { ...common, title: labels[kind][0], subtitle: labels[kind][1] }
    : common;
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(12,24,20,.42)",
  },
  sheet: {
    maxHeight: "91%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CDD3D0",
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: colors.ink, fontSize: 21, fontWeight: "800", maxWidth: 270 },
  subtitle: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  form: { padding: 20, paddingTop: 2, gap: 15, paddingBottom: 12 },
  context: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contextLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  contextValue: { color: colors.ink, fontSize: 11, marginTop: 3 },
  fieldWrap: { gap: 7 },
  fieldLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  field: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    textAlignVertical: "top",
  },
  fieldLarge: { minHeight: 84 },
  success: { alignItems: "center", padding: 34, paddingBottom: 18 },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  successTitle: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  successCopy: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginVertical: 12,
  },
  list: { paddingHorizontal: 20, paddingBottom: 14, gap: 16 },
  notification: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1, marginLeft: 12 },
  itemTitle: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  itemMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  time: { color: colors.inkMuted, fontSize: 8, marginTop: 5 },
  unread: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  profile: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 14,
    alignItems: "center",
    gap: 10,
  },
  profileAvatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { color: colors.white, fontSize: 25, fontWeight: "800" },
  profileName: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  info: { width: "100%", flexDirection: "row", alignItems: "center" },
  infoLabel: { color: colors.inkMuted, fontSize: 9 },
  infoValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  cash: { borderRadius: 22, padding: 20 },
  cashLabel: { color: "rgba(255,255,255,.65)", fontSize: 9, fontWeight: "800" },
  cashValue: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 7,
  },
  cashMeta: { color: "rgba(255,255,255,.7)", fontSize: 11, marginTop: 15 },
  listHeading: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  card: { paddingHorizontal: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  expense: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  alignEnd: { alignItems: "flex-end", gap: 4 },
  amount: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  note: { color: colors.inkMuted, fontSize: 10, textAlign: "center" },
  messageScreen: { minHeight: 470 },
  messages: { paddingHorizontal: 20 },
  bubble: { maxWidth: "84%", borderRadius: 17, padding: 12, marginBottom: 10 },
  incoming: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outgoing: { alignSelf: "flex-end", backgroundColor: colors.primary },
  bubbleText: { color: colors.ink, fontSize: 12, lineHeight: 18 },
  bubbleTextOutgoing: { color: colors.white },
  bubbleTime: { color: "rgba(255,255,255,.6)" },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  messageInput: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 13,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  document: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  taskId: { color: colors.inkMuted, fontSize: 10, fontWeight: "800" },
  taskContent: { padding: 20, paddingTop: 4, paddingBottom: 12, gap: 16 },
  pills: { flexDirection: "row", gap: 8 },
  description: { color: colors.inkMuted, fontSize: 13, lineHeight: 20 },
  progressValue: { color: colors.ink, fontSize: 26, fontWeight: "800" },
  sliderCard: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slider: { width: "100%", height: 38 },
  sliderLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  sliderLabel: { color: colors.inkMuted, fontSize: 9, fontWeight: "700" },
  sliderHint: { color: colors.primary, fontSize: 9, fontWeight: "600" },
  progressForm: { padding: 20, paddingTop: 2, gap: 15, paddingBottom: 12 },
  stageGrid: { flexDirection: "row", gap: 8 },
  stageOption: {
    flex: 1,
    minHeight: 66,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 6,
  },
  stageOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stageText: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  stageTextActive: { color: colors.white },
  progressHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressHeadingValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  progressHistory: { gap: 10, marginTop: 8 },
  table: {
    minWidth: 610,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  tableRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  tableHeader: { minHeight: 38, backgroundColor: colors.primarySoft },
  tableRowAlternate: { backgroundColor: "#FAFBFA" },
  tableCell: {
    color: colors.ink,
    fontSize: 10,
    lineHeight: 14,
    paddingHorizontal: 10,
  },
  tableHeadText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dateCell: { width: 95 },
  stageCell: { width: 115 },
  workCell: { width: 300 },
  percentCell: { width: 100, fontWeight: "800" },
  statusOptions: { gap: 8 },
  statusOption: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusOptionText: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  statusOptionTextActive: { color: colors.white },
  requirementNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
  },
  requirementText: { flex: 1, color: colors.warning, fontSize: 10 },
  evidenceStages: { gap: 16 },
  evidenceStage: {
    gap: 9,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  evidenceStageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  evidenceStageNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  evidenceStageNumberText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  evidenceStageTitle: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  evidenceStageCopy: { color: colors.inkMuted, fontSize: 9, marginTop: 2 },
  historySection: { gap: 12, marginTop: 4 },
  emptyHistory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  emptyHistoryText: { color: colors.inkMuted, fontSize: 11 },
  historyRow: { flexDirection: "row", minHeight: 78 },
  timelineColumn: { width: 20, alignItems: "center" },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginTop: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  historyBody: { flex: 1, paddingLeft: 8, paddingBottom: 16 },
  historyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyProgress: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  historyRemark: {
    color: colors.ink,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  evidenceName: { flex: 1, color: colors.primary, fontSize: 9 },
  evidenceLabel: { color: colors.inkMuted, fontSize: 9, fontWeight: "700" },
  historyDate: { color: colors.inkMuted, fontSize: 8, marginTop: 6 },
  taskHistoryTable: { minWidth: 810 },
  historyDateCell: { width: 95 },
  historyStatusCell: { width: 105 },
  historyProgressCell: { width: 80, fontWeight: "800" },
  historyRemarkCell: { width: 230 },
  historyEvidenceCell: { width: 300, color: colors.primary },
});
