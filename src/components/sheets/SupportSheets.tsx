import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  OperationalRecord,
  OperationalRecordInput,
  OperationalRecordKind,
} from "../../hooks/useOperationalRecords";
import { colors } from "../../theme";
import { FontAwesomeIcon } from "../../types/icons";
import { SheetName } from "../../types/navigation";
import { formatDateTime } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { sheetStyles } from "./styles";

export function SimpleForm({
  kind,
  records,
  onSubmit,
}: {
  kind: OperationalRecordKind;
  records: OperationalRecord[];
  onSubmit: (input: OperationalRecordInput) => void;
}) {
  const dialog = useAppDialog();
  const config = getSheetConfig(kind);
  const [view, setView] = useState<"New" | "Records">("New");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const matchingRecords = records.filter((record) => record.kind === kind);

  const submit = () => {
    const requiredFields = config.fields.filter(
      (field) => !(kind === "attendance" && field === "REMARKS"),
    );
    if (requiredFields.some((field) => !values[field]?.trim())) {
      dialog.show(
        "Details required",
        "Complete all required fields before saving this record.",
      );
      return;
    }
    onSubmit({
      kind,
      values: Object.fromEntries(
        Object.entries(values).map(([field, value]) => [field, value.trim()]),
      ),
      attachment: attachment ?? undefined,
    });
    setValues({});
    setAttachment(null);
    setView("Records");
    dialog.show("Record saved", "The new record is available in the list.");
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
        {(["New", "Records"] as const).map((item) => (
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
              {item === "New"
                ? config.newLabel
                : `${config.listLabel} (${matchingRecords.length})`}
            </Text>
          </Pressable>
        ))}
      </View>
      {view === "New" ? (
        <>
          {config.fields.map((field, index) => {
            const dropdown = getDropdownConfig(kind, field);
            return (
              <View key={field} style={sheetStyles.fieldWrap}>
                <Text style={sheetStyles.fieldLabel}>{field}</Text>
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
                      sheetStyles.field,
                      index === config.fields.length - 1 &&
                        sheetStyles.fieldLarge,
                    ]}
                    placeholder={config.placeholders[index]}
                    placeholderTextColor={colors.placeholder}
                    keyboardType={
                      kind === "expense" && field === "AMOUNT"
                        ? "decimal-pad"
                        : "default"
                    }
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
            onPress={submit}
          />
        </>
      ) : (
        <View style={sheetStyles.requestList}>
          {matchingRecords.map((record) => {
            const expanded = expandedId === record.id;
            return (
              <Surface key={record.id} style={sheetStyles.requestCard}>
                <Pressable
                  onPress={() => setExpandedId(expanded ? null : record.id)}
                  style={sheetStyles.requestCardTop}
                >
                  <View style={sheetStyles.flexNoMargin}>
                    <Text style={sheetStyles.itemTitle}>
                      {recordTitle(record)}
                    </Text>
                    <Text style={sheetStyles.itemMeta}>
                      {record.id} · {formatDateTime(record.createdAt)}
                    </Text>
                  </View>
                  <StatusPill label={record.status} />
                  <FontAwesome6
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={11}
                    color={colors.inkMuted}
                  />
                </Pressable>
                {expanded ? (
                  <View style={sheetStyles.requestDetail}>
                    {Object.entries(record.values).map(([field, value]) => (
                      <Info
                        key={field}
                        icon="circle-info"
                        label={field}
                        value={value || "—"}
                      />
                    ))}
                    {record.attachment ? (
                      <Info
                        icon="paperclip"
                        label="Attachment"
                        value={record.attachment}
                      />
                    ) : null}
                  </View>
                ) : null}
              </Surface>
            );
          })}
          {matchingRecords.length === 0 ? (
            <Text style={sheetStyles.note}>No records submitted yet.</Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

function recordTitle(record: OperationalRecord) {
  if (record.kind === "expense")
    return record.values.CATEGORY || "Site expense";
  if (record.kind === "attendance") {
    return record.values["WORKER NAME"] || "Attendance record";
  }
  return record.values.TITLE || "Reported issue";
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

export function Success({ onClose }: { onClose: () => void }) {
  return (
    <View style={sheetStyles.success}>
      <View style={sheetStyles.successIcon}>
        <FontAwesome6 name="check" size={28} color={colors.white} />
      </View>
      <Text style={sheetStyles.successTitle}>Submitted successfully</Text>
      <Text style={sheetStyles.successCopy}>
        Your update is saved locally and ready to sync when a backend is
        connected.
      </Text>
      <PrimaryButton label="Done" onPress={onClose} />
    </View>
  );
}
export function Profile({
  name,
  role,
  phone,
  projectName,
  siteName,
  permissions,
  onSave,
}: {
  name: string;
  role: string;
  phone: string;
  projectName?: string;
  siteName?: string;
  permissions: string[];
  onSave: (name: string) => Promise<void>;
}) {
  const dialog = useAppDialog();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={sheetStyles.profile}>
      <View style={sheetStyles.profileAvatar}>
        <Text style={sheetStyles.profileAvatarText}>{initials}</Text>
      </View>
      {editing ? (
        <View style={sheetStyles.fieldWrap}>
          <Text style={sheetStyles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Enter your name"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
            style={sheetStyles.field}
          />
        </View>
      ) : (
        <Text style={sheetStyles.profileName}>{name}</Text>
      )}
      <Text style={sheetStyles.itemMeta}>{role}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (!editing) {
            setDraftName(name);
            setEditing(true);
            return;
          }
          if (!draftName.trim()) {
            dialog.show("Name required", "Enter a display name to continue.");
            return;
          }
          void onSave(draftName)
            .then(() => {
              setEditing(false);
              dialog.show(
                "Profile updated",
                "Your display name was saved securely.",
              );
            })
            .catch(() => {
              dialog.show(
                "Profile not saved",
                "The account update could not be stored. Please try again.",
              );
            });
        }}
        style={sheetStyles.profileEditButton}
      >
        <FontAwesome6
          name={editing ? "check" : "pen"}
          size={12}
          color={colors.primary}
        />
        <Text style={sheetStyles.profileEditButtonText}>
          {editing ? "Save profile" : "Edit profile"}
        </Text>
      </Pressable>
      <Info
        icon="building"
        label="Assigned site"
        value={
          projectName && siteName
            ? `${projectName} · ${siteName}`
            : "No site assigned"
        }
      />
      <Info icon="phone" label="Phone" value={`+91 ${phone}`} />
      <Info
        icon="shield-halved"
        label="Role permissions"
        value={`${permissions.length} permissions assigned`}
      />
    </View>
  );
}
export function Info({
  icon,
  label,
  value,
}: {
  icon: FontAwesomeIcon;
  label: string;
  value: string;
}) {
  return (
    <View style={sheetStyles.info}>
      <View style={sheetStyles.itemIcon}>
        <FontAwesome6 name={icon} size={16} color={colors.primary} />
      </View>
      <View style={sheetStyles.flex}>
        <Text style={sheetStyles.infoLabel}>{label}</Text>
        <Text style={sheetStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}
export function getSheetConfig(kind: SheetName) {
  const common = {
    title: "",
    subtitle: "",
    fields: [] as string[],
    placeholders: [] as string[],
    button: "Submit",
    newLabel: "New",
    listLabel: "Records",
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
      newLabel: "New report",
      listLabel: "Reports",
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
      newLabel: "New request",
      listLabel: "Requests",
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
      newLabel: "Add expense",
      listLabel: "Expenses",
    },
    attendance: {
      title: "Workforce attendance",
      subtitle: "Mark the daily roster and review history",
      fields: [],
      placeholders: [],
      button: "Save attendance",
      newLabel: "Mark attendance",
      listLabel: "Attendance",
    },
    issue: {
      title: "Issues and support",
      subtitle: "Report, track, and resolve site concerns",
      fields: [],
      placeholders: [],
      button: "Report issue",
      newLabel: "Report issue",
      listLabel: "Issues",
    },
  };
  if (kind && kind in forms) return forms[kind as keyof typeof forms];
  const labels: Record<string, [string, string]> = {
    notifications: ["Notifications", "Workflow alerts and reminders"],
    profile: ["My profile", "Account details and assigned access"],
    settings: ["Settings", "Appearance and workflow alerts"],
    cash: ["Cash in hand", "Calculated supervisor balance"],
    messages: ["Messages", "Project and site conversations"],
    documents: ["Site documents", "Drawings, bills and supporting files"],
    activity: ["Activity and site visits", "Chronological site operations"],
    progress: ["Site progress update", "Record work and progress evidence"],
  };
  return kind && labels[kind]
    ? { ...common, title: labels[kind][0], subtitle: labels[kind][1] }
    : common;
}
