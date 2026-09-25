import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Task } from "../../data";
import { AttendanceEntry } from "../../hooks/useAttendance";
import { Conversation } from "../../hooks/useCommunications";
import { DailyReport } from "../../hooks/useDailyReports";
import { FinanceRecord } from "../../hooks/useFinance";
import { SiteIssue } from "../../hooks/useIssues";
import { MaterialRequest } from "../../hooks/useMaterialRequests";
import { SiteVisit, SiteVisitInput } from "../../hooks/useSiteVisits";
import { colors } from "../../theme";
import { FontAwesomeIcon } from "../../types/icons";
import { formatDate, formatDateTime, toIsoDate } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DatePickerField } from "../DatePickerField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { sheetStyles } from "./styles";

type ViewName = "Timeline" | "New visit" | "Visits";
type ActivityItem = {
  id: string;
  icon: FontAwesomeIcon;
  title: string;
  detail: string;
  createdAt: string;
};

export function ActivitySheet({
  tasks,
  reports,
  requests,
  financeRecords,
  attendanceEntries,
  issues,
  conversations,
  visits,
  onAddVisit,
}: {
  tasks: Task[];
  reports: DailyReport[];
  requests: MaterialRequest[];
  financeRecords: FinanceRecord[];
  attendanceEntries: AttendanceEntry[];
  issues: SiteIssue[];
  conversations: Conversation[];
  visits: SiteVisit[];
  onAddVisit: (input: SiteVisitInput) => void;
}) {
  const dialog = useAppDialog();
  const today = toIsoDate(new Date());
  const [view, setView] = useState<ViewName>("Timeline");
  const [visitor, setVisitor] = useState("");
  const [date, setDate] = useState(today);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [imageNames, setImageNames] = useState<string[]>([]);
  const timeline = useMemo(
    () =>
      buildTimeline({
        tasks,
        reports,
        requests,
        financeRecords,
        attendanceEntries,
        issues,
        conversations,
        visits,
      }),
    [
      attendanceEntries,
      conversations,
      financeRecords,
      issues,
      reports,
      requests,
      tasks,
      visits,
    ],
  );

  const submit = () => {
    if (
      !visitor.trim() ||
      !isTime(inTime) ||
      !isTime(outTime) ||
      !purpose.trim() ||
      !remarks.trim()
    ) {
      dialog.show(
        "Visit details required",
        "Complete the visitor, date, 24-hour in/out times, purpose, and remarks.",
      );
      return;
    }
    onAddVisit({
      visitor: visitor.trim(),
      date,
      inTime,
      outTime,
      purpose: purpose.trim(),
      remarks: remarks.trim(),
      imageNames,
    });
    setVisitor("");
    setInTime("");
    setOutTime("");
    setPurpose("");
    setRemarks("");
    setImageNames([]);
    setView("Visits");
    dialog.show("Site visit saved", "The visit was added to activity history.");
  };

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sheetStyles.sheetTabs}>
        {(["Timeline", "New visit", "Visits"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setView(item)}
            style={[
              sheetStyles.sheetTab,
              view === item && sheetStyles.sheetTabActive,
            ]}
          >
            <Text
              style={[
                sheetStyles.sheetTabText,
                view === item && sheetStyles.sheetTabTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === "Timeline" ? (
        <View style={sheetStyles.activityTimelineList}>
          {timeline.map((item, index) => (
            <View key={item.id} style={sheetStyles.activityTimelineRow}>
              <View style={sheetStyles.activityTimelineRail}>
                <View style={sheetStyles.activityTimelineIcon}>
                  <FontAwesome6
                    name={item.icon}
                    size={12}
                    color={colors.primary}
                  />
                </View>
                {index < timeline.length - 1 ? (
                  <View style={sheetStyles.activityTimelineLine} />
                ) : null}
              </View>
              <View style={sheetStyles.activityTimelineBody}>
                <Text style={sheetStyles.itemTitle}>{item.title}</Text>
                <Text style={sheetStyles.itemMeta}>{item.detail}</Text>
                <Text style={sheetStyles.time}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
            </View>
          ))}
          {timeline.length === 0 ? (
            <Text style={sheetStyles.note}>No site activity recorded yet.</Text>
          ) : null}
        </View>
      ) : view === "Visits" ? (
        <View style={sheetStyles.requestList}>
          {visits.map((visit) => (
            <Surface key={visit.id} style={sheetStyles.requestCard}>
              <View style={sheetStyles.requestCardTop}>
                <View style={sheetStyles.flexNoMargin}>
                  <Text style={sheetStyles.itemTitle}>{visit.visitor}</Text>
                  <Text style={sheetStyles.itemMeta}>
                    {formatDate(visit.date)} · {visit.inTime}–{visit.outTime}
                  </Text>
                </View>
                <StatusPill label={`${visit.imageNames.length} images`} />
              </View>
              <Text style={sheetStyles.reportWork}>{visit.purpose}</Text>
              <Text style={sheetStyles.itemMeta}>{visit.remarks}</Text>
            </Surface>
          ))}
          {visits.length === 0 ? (
            <Text style={sheetStyles.note}>No site visits recorded yet.</Text>
          ) : null}
        </View>
      ) : (
        <>
          <LabeledField label="VISITOR">
            <TextInput
              value={visitor}
              onChangeText={setVisitor}
              style={sheetStyles.field}
              placeholder="Visitor name or company"
              placeholderTextColor={colors.placeholder}
            />
          </LabeledField>
          <LabeledField label="VISIT DATE">
            <DatePickerField
              value={date}
              onChange={setDate}
              maximumDate={today}
            />
          </LabeledField>
          <View style={sheetStyles.splitFields}>
            <LabeledField label="IN TIME" split>
              <TextInput
                value={inTime}
                onChangeText={setInTime}
                style={sheetStyles.field}
                placeholder="HH:MM"
                placeholderTextColor={colors.placeholder}
                keyboardType="numbers-and-punctuation"
              />
            </LabeledField>
            <LabeledField label="OUT TIME" split>
              <TextInput
                value={outTime}
                onChangeText={setOutTime}
                style={sheetStyles.field}
                placeholder="HH:MM"
                placeholderTextColor={colors.placeholder}
                keyboardType="numbers-and-punctuation"
              />
            </LabeledField>
          </View>
          <LabeledField label="PURPOSE">
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              style={sheetStyles.field}
              placeholder="Purpose of the visit"
              placeholderTextColor={colors.placeholder}
            />
          </LabeledField>
          <LabeledField label="REMARKS">
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              style={[sheetStyles.field, sheetStyles.fieldLarge]}
              placeholder="Observations and follow-up actions"
              placeholderTextColor={colors.placeholder}
              multiline
            />
          </LabeledField>
          <AttachmentPicker
            value={null}
            onChange={(name) =>
              setImageNames((current) => [...new Set([...current, name])])
            }
            label="Add visit image"
            mediaOnly
            mediaType="images"
          />
          {imageNames.map((name) => (
            <View key={name} style={sheetStyles.issueAttachment}>
              <FontAwesome6 name="image" size={13} color={colors.primary} />
              <Text style={sheetStyles.issueAttachmentName}>{name}</Text>
              <Pressable
                onPress={() =>
                  setImageNames((current) =>
                    current.filter((item) => item !== name),
                  )
                }
              >
                <FontAwesome6 name="xmark" size={14} color={colors.danger} />
              </Pressable>
            </View>
          ))}
          <PrimaryButton
            label="Save site visit"
            icon="location-dot"
            onPress={submit}
          />
        </>
      )}
    </ScrollView>
  );
}

function LabeledField({
  label,
  children,
  split = false,
}: {
  label: string;
  children: React.ReactNode;
  split?: boolean;
}) {
  return (
    <View style={split ? sheetStyles.splitField : sheetStyles.fieldWrap}>
      <Text style={sheetStyles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function buildTimeline(input: {
  tasks: Task[];
  reports: DailyReport[];
  requests: MaterialRequest[];
  financeRecords: FinanceRecord[];
  attendanceEntries: AttendanceEntry[];
  issues: SiteIssue[];
  conversations: Conversation[];
  visits: SiteVisit[];
}) {
  const items: ActivityItem[] = [];
  input.tasks.forEach((task) =>
    task.updates.forEach((update) =>
      items.push({
        id: update.id,
        icon: "list-check",
        title: `${task.id} · ${update.status}`,
        detail: `${task.title} · ${update.progress}%`,
        createdAt: update.createdAt,
      }),
    ),
  );
  input.reports.forEach((report) =>
    items.push({
      id: report.id,
      icon: "file-lines",
      title: "Daily report submitted",
      detail: report.workCompleted,
      createdAt: report.createdAt,
    }),
  );
  input.requests.forEach((request) =>
    items.push({
      id: request.id,
      icon: "boxes-stacked",
      title: `Material request · ${request.status}`,
      detail: `${request.material} · ${request.quantity} ${request.unit}`,
      createdAt: request.history[0]?.createdAt ?? request.createdAt,
    }),
  );
  input.financeRecords.forEach((record) =>
    items.push({
      id: record.id,
      icon: "wallet",
      title: `${record.kind} · ${record.status}`,
      detail: `${record.reference} · ₹${record.amount.toLocaleString("en-IN")}`,
      createdAt: record.createdAt,
    }),
  );
  groupAttendance(input.attendanceEntries).forEach((item) => items.push(item));
  input.issues.forEach((issue) =>
    items.push({
      id: issue.id,
      icon: "triangle-exclamation",
      title: `${issue.kind} · ${issue.status}`,
      detail: issue.title,
      createdAt: issue.history[0]?.createdAt ?? issue.createdAt,
    }),
  );
  input.conversations.forEach((conversation) =>
    conversation.messages.forEach((message) =>
      items.push({
        id: message.id,
        icon: "comments",
        title: `${conversation.category} message`,
        detail: `${message.senderName} · ${message.text || message.attachmentName}`,
        createdAt: message.createdAt,
      }),
    ),
  );
  input.visits.forEach((visit) =>
    items.push({
      id: visit.id,
      icon: "location-dot",
      title: `Site visit · ${visit.visitor}`,
      detail: visit.purpose,
      createdAt: visit.createdAt,
    }),
  );
  return items.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

function groupAttendance(entries: AttendanceEntry[]): ActivityItem[] {
  const dates = [...new Set(entries.map((entry) => entry.date))];
  return dates.map((date) => ({
    id: `attendance-${date}`,
    icon: "people-group",
    title: "Attendance submitted",
    detail: `${entries.filter((entry) => entry.date === date).length} worker records`,
    createdAt:
      entries.find((entry) => entry.date === date)?.recordedAt ??
      `${date}T00:00:00.000Z`,
  }));
}

function isTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
