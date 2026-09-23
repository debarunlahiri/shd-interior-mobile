import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  AttendanceEntry,
  AttendanceEntryInput,
  AttendanceStatus,
  attendanceRoster,
} from "../../hooks/useAttendance";
import { colors } from "../../theme";
import { formatDate, toIsoDate } from "../../utils/date";
import { DatePickerField } from "../DatePickerField";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { useAppDialog } from "../AppDialog";
import { sheetStyles } from "./styles";

type DraftEntry = Omit<AttendanceEntryInput, "date">;

const statuses: AttendanceStatus[] = ["Present", "Absent", "Half Day", "Leave"];

const emptyDrafts = (): DraftEntry[] =>
  attendanceRoster.map((worker) => ({
    ...worker,
    status: "Present",
    inTime: "09:00",
    outTime: "18:00",
    overtimeHours: 0,
    remarks: "",
  }));

export function AttendanceSheet({
  entries,
  onSave,
}: {
  entries: AttendanceEntry[];
  onSave: (input: AttendanceEntryInput[]) => void;
}) {
  const dialog = useAppDialog();
  const today = toIsoDate(new Date());
  const [view, setView] = useState<"Mark" | "History">("Mark");
  const [date, setDate] = useState(today);
  const [historyDate, setHistoryDate] = useState(today);
  const [drafts, setDrafts] = useState<DraftEntry[]>(emptyDrafts);
  const [expandedWorker, setExpandedWorker] = useState<string | null>(
    attendanceRoster[0].workerName,
  );

  const history = useMemo(
    () => entries.filter((entry) => entry.date === historyDate),
    [entries, historyDate],
  );

  useEffect(() => {
    const savedForDate = entries.filter((entry) => entry.date === date);
    setDrafts(
      attendanceRoster.map((worker) => {
        const saved = savedForDate.find(
          (entry) => entry.workerName === worker.workerName,
        );
        return saved
          ? {
              workerName: saved.workerName,
              trade: saved.trade,
              status: saved.status,
              inTime: saved.inTime,
              outTime: saved.outTime,
              overtimeHours: saved.overtimeHours,
              remarks: saved.remarks ?? "",
            }
          : {
              ...worker,
              status: "Present",
              inTime: "09:00",
              outTime: "18:00",
              overtimeHours: 0,
              remarks: "",
            };
      }),
    );
  }, [date, entries]);

  const updateDraft = (workerName: string, patch: Partial<DraftEntry>) => {
    setDrafts((current) =>
      current.map((entry) =>
        entry.workerName === workerName ? { ...entry, ...patch } : entry,
      ),
    );
  };

  const save = () => {
    const invalidTime = drafts.some(
      (entry) =>
        (entry.status === "Present" || entry.status === "Half Day") &&
        (!isTime(entry.inTime) || !isTime(entry.outTime)),
    );
    if (invalidTime) {
      dialog.show(
        "Check attendance times",
        "Use 24-hour HH:MM format for the in and out times of present and half-day workers.",
      );
      return;
    }
    if (drafts.some((entry) => entry.overtimeHours < 0)) {
      dialog.show("Check overtime", "Overtime hours cannot be negative.");
      return;
    }

    onSave(
      drafts.map((entry) => ({
        ...entry,
        date,
        inTime:
          entry.status === "Absent" || entry.status === "Leave"
            ? undefined
            : entry.inTime,
        outTime:
          entry.status === "Absent" || entry.status === "Leave"
            ? undefined
            : entry.outTime,
        overtimeHours:
          entry.status === "Absent" || entry.status === "Leave"
            ? 0
            : entry.overtimeHours,
        remarks: entry.remarks?.trim() || undefined,
      })),
    );
    setHistoryDate(date);
    setView("History");
    dialog.show(
      "Attendance saved",
      `${drafts.length} worker records were saved for ${formatDate(date)}.`,
    );
  };

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sheetStyles.context}>
        <FontAwesome6 name="location-dot" size={17} color={colors.primary} />
        <View>
          <Text style={sheetStyles.contextLabel}>PALM GROVE RESIDENCE</Text>
          <Text style={sheetStyles.contextValue}>Villa 18 · Active site</Text>
        </View>
      </View>

      <View style={sheetStyles.sheetTabs}>
        {(["Mark", "History"] as const).map((item) => (
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
              {item === "Mark" ? "Mark attendance" : "Daily history"}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === "Mark" ? (
        <>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>ATTENDANCE DATE</Text>
            <DatePickerField
              value={date}
              onChange={setDate}
              maximumDate={today}
            />
          </View>
          <View style={sheetStyles.attendanceHint}>
            <FontAwesome6 name="users" size={14} color={colors.primary} />
            <Text style={sheetStyles.attendanceHintText}>
              Update the status for every worker, then save the full roster.
            </Text>
          </View>
          {drafts.map((entry) => {
            const expanded = expandedWorker === entry.workerName;
            const hasTimes =
              entry.status === "Present" || entry.status === "Half Day";
            return (
              <Surface
                key={entry.workerName}
                style={sheetStyles.attendanceCard}
              >
                <Pressable
                  onPress={() =>
                    setExpandedWorker(expanded ? null : entry.workerName)
                  }
                  style={sheetStyles.attendanceCardHeader}
                >
                  <View style={sheetStyles.flexNoMargin}>
                    <Text style={sheetStyles.itemTitle}>
                      {entry.workerName}
                    </Text>
                    <Text style={sheetStyles.itemMeta}>{entry.trade}</Text>
                  </View>
                  <StatusPill label={entry.status} />
                  <FontAwesome6
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={11}
                    color={colors.inkMuted}
                  />
                </Pressable>
                {expanded ? (
                  <View style={sheetStyles.attendanceFields}>
                    <View style={sheetStyles.fieldWrap}>
                      <Text style={sheetStyles.fieldLabel}>STATUS</Text>
                      <DropdownField
                        value={entry.status}
                        placeholder="Select attendance status"
                        options={statuses}
                        onChange={(status) =>
                          updateDraft(entry.workerName, {
                            status: status as AttendanceStatus,
                          })
                        }
                      />
                    </View>
                    {hasTimes ? (
                      <View style={sheetStyles.splitFields}>
                        <TimeField
                          label="IN TIME"
                          value={entry.inTime ?? ""}
                          onChange={(inTime) =>
                            updateDraft(entry.workerName, { inTime })
                          }
                        />
                        <TimeField
                          label="OUT TIME"
                          value={entry.outTime ?? ""}
                          onChange={(outTime) =>
                            updateDraft(entry.workerName, { outTime })
                          }
                        />
                        <TimeField
                          label="OVERTIME"
                          value={`${entry.overtimeHours || ""}`}
                          placeholder="Hours"
                          decimal
                          onChange={(value) =>
                            updateDraft(entry.workerName, {
                              overtimeHours: Number(value) || 0,
                            })
                          }
                        />
                      </View>
                    ) : null}
                    <View style={sheetStyles.fieldWrap}>
                      <Text style={sheetStyles.fieldLabel}>REMARKS</Text>
                      <TextInput
                        value={entry.remarks}
                        onChangeText={(remarks) =>
                          updateDraft(entry.workerName, { remarks })
                        }
                        style={sheetStyles.field}
                        placeholder="Optional note"
                        placeholderTextColor="#969E9B"
                      />
                    </View>
                  </View>
                ) : null}
              </Surface>
            );
          })}
          <PrimaryButton
            label={`Save ${drafts.length} attendance records`}
            icon="floppy-disk"
            onPress={save}
          />
        </>
      ) : (
        <>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>VIEW DATE</Text>
            <DatePickerField
              value={historyDate}
              onChange={setHistoryDate}
              maximumDate={today}
            />
          </View>
          <View style={sheetStyles.attendanceSummaryRow}>
            <AttendanceCount
              label="Present"
              value={
                history.filter((entry) => entry.status === "Present").length
              }
            />
            <AttendanceCount
              label="Half day"
              value={
                history.filter((entry) => entry.status === "Half Day").length
              }
            />
            <AttendanceCount
              label="Away"
              value={
                history.filter((entry) =>
                  ["Absent", "Leave"].includes(entry.status),
                ).length
              }
            />
          </View>
          <View style={sheetStyles.requestList}>
            {history.map((entry) => (
              <Surface key={entry.id} style={sheetStyles.attendanceHistoryCard}>
                <View style={sheetStyles.attendanceCardHeader}>
                  <View style={sheetStyles.flexNoMargin}>
                    <Text style={sheetStyles.itemTitle}>
                      {entry.workerName}
                    </Text>
                    <Text style={sheetStyles.itemMeta}>{entry.trade}</Text>
                  </View>
                  <StatusPill label={entry.status} />
                </View>
                <Text style={sheetStyles.attendanceHistoryMeta}>
                  {entry.inTime && entry.outTime
                    ? `${entry.inTime}–${entry.outTime} · ${entry.overtimeHours}h overtime`
                    : "No working hours recorded"}
                </Text>
                {entry.remarks ? (
                  <Text style={sheetStyles.attendanceHistoryMeta}>
                    {entry.remarks}
                  </Text>
                ) : null}
              </Surface>
            ))}
            {history.length === 0 ? (
              <Text style={sheetStyles.note}>
                No attendance was saved for this date.
              </Text>
            ) : null}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function TimeField({
  label,
  value,
  onChange,
  placeholder = "HH:MM",
  decimal = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  decimal?: boolean;
}) {
  return (
    <View style={sheetStyles.splitField}>
      <Text style={sheetStyles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={sheetStyles.field}
        placeholder={placeholder}
        placeholderTextColor="#969E9B"
        keyboardType={decimal ? "decimal-pad" : "numbers-and-punctuation"}
      />
    </View>
  );
}

function AttendanceCount({ label, value }: { label: string; value: number }) {
  return (
    <View style={sheetStyles.attendanceCountCard}>
      <Text style={sheetStyles.attendanceCountValue}>{value}</Text>
      <Text style={sheetStyles.attendanceCountLabel}>{label}</Text>
    </View>
  );
}

function isTime(value?: string) {
  return Boolean(value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}
