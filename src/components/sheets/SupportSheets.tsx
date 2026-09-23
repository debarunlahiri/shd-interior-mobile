import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { expenses, notifications } from "../../data";
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
                    placeholderTextColor="#969E9B"
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
export function Notifications() {
  return (
    <ScrollView contentContainerStyle={sheetStyles.list}>
      {notifications.map((item) => (
        <View key={item.title} style={sheetStyles.notification}>
          <View style={sheetStyles.itemIcon}>
            <FontAwesome6
              name={notificationIcon(item.icon)}
              size={17}
              color={colors.primary}
            />
          </View>
          <View style={sheetStyles.flex}>
            <Text style={sheetStyles.itemTitle}>{item.title}</Text>
            <Text style={sheetStyles.itemMeta}>{item.detail}</Text>
            <Text style={sheetStyles.time}>{item.time}</Text>
          </View>
          <View style={sheetStyles.unread} />
        </View>
      ))}
    </ScrollView>
  );
}
export function Profile() {
  return (
    <View style={sheetStyles.profile}>
      <View style={sheetStyles.profileAvatar}>
        <Text style={sheetStyles.profileAvatarText}>AK</Text>
      </View>
      <Text style={sheetStyles.profileName}>Arjun Kumar</Text>
      <Text style={sheetStyles.itemMeta}>Site Supervisor</Text>
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
export function Cash() {
  return (
    <ScrollView contentContainerStyle={sheetStyles.list}>
      <LinearGradient colors={["#173F35", "#255E4D"]} style={sheetStyles.cash}>
        <Text style={sheetStyles.cashLabel}>AVAILABLE CASH</Text>
        <Text style={sheetStyles.cashValue}>₹37,000</Text>
        <Text style={sheetStyles.cashMeta}>₹50,000 issued · ₹13,000 used</Text>
      </LinearGradient>
      <Text style={sheetStyles.listHeading}>RECENT TRANSACTIONS</Text>
      <Surface style={sheetStyles.card}>
        {expenses.map((item, index) => (
          <View key={item.label}>
            {index ? <View style={sheetStyles.divider} /> : null}
            <View style={sheetStyles.expense}>
              <View style={sheetStyles.itemIcon}>
                <FontAwesome6 name="arrow-up" size={15} color={colors.danger} />
              </View>
              <View style={sheetStyles.flex}>
                <Text style={sheetStyles.itemTitle}>{item.label}</Text>
                <Text style={sheetStyles.itemMeta}>{item.meta}</Text>
              </View>
              <View style={sheetStyles.alignEnd}>
                <Text style={sheetStyles.amount}>−{item.amount}</Text>
                <StatusPill label={item.status} />
              </View>
            </View>
          </View>
        ))}
      </Surface>
      <Text style={sheetStyles.note}>
        Balance is calculated automatically from issued cash and approved
        expenses.
      </Text>
    </ScrollView>
  );
}
export function Messages() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const send = () => {
    if (!message.trim()) return;
    setSent([...sent, message.trim()]);
    setMessage("");
  };
  return (
    <View style={sheetStyles.messageScreen}>
      <ScrollView contentContainerStyle={sheetStyles.messages}>
        <Bubble
          incoming
          text="Please review the revised lighting plan before ceiling work starts."
        />
        <Bubble text="Received. I will verify the points and share site photos." />
        {sent.map((text, index) => (
          <Bubble key={`${text}-${index}`} text={text} />
        ))}
      </ScrollView>
      <View style={sheetStyles.composer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Reply to admin..."
          style={sheetStyles.messageInput}
        />
        <Pressable style={sheetStyles.send} onPress={send}>
          <FontAwesome6 name="paper-plane" size={16} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}
function Bubble({ text, incoming }: { text: string; incoming?: boolean }) {
  return (
    <View
      style={[
        sheetStyles.bubble,
        incoming ? sheetStyles.incoming : sheetStyles.outgoing,
      ]}
    >
      <Text
        style={[
          sheetStyles.bubbleText,
          !incoming && sheetStyles.bubbleTextOutgoing,
        ]}
      >
        {text}
      </Text>
      <Text style={[sheetStyles.time, !incoming && sheetStyles.bubbleTime]}>
        Today
      </Text>
    </View>
  );
}
export function Documents() {
  const [attachment, setAttachment] = useState<string | null>(null);
  const docs = [
    "Approved lighting plan.pdf",
    "Kitchen elevation.pdf",
    "Material challan 184.pdf",
  ];
  return (
    <ScrollView contentContainerStyle={sheetStyles.list}>
      <AttachmentPicker value={attachment} onChange={setAttachment} />
      <Text style={sheetStyles.listHeading}>RECENT SITE DOCUMENTS</Text>
      <Surface style={sheetStyles.card}>
        {docs.map((name, index) => (
          <View key={name}>
            {index ? <View style={sheetStyles.divider} /> : null}
            <View style={sheetStyles.document}>
              <View style={sheetStyles.itemIcon}>
                <FontAwesome6
                  name="file-pdf"
                  size={17}
                  color={colors.primary}
                />
              </View>
              <View style={sheetStyles.flex}>
                <Text style={sheetStyles.itemTitle}>{name}</Text>
                <Text style={sheetStyles.itemMeta}>Site document · PDF</Text>
              </View>
              <FontAwesome6 name="download" size={15} color={colors.inkMuted} />
            </View>
          </View>
        ))}
      </Surface>
    </ScrollView>
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
function notificationIcon(icon: string): FontAwesomeIcon {
  if (icon.includes("cube")) return "cubes";
  if (icon.includes("time")) return "clock";
  return "comment";
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
      newLabel: "Mark attendance",
      listLabel: "Attendance",
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
      newLabel: "Report issue",
      listLabel: "Issues",
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
