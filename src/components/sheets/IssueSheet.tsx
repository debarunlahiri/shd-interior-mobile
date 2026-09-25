import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SiteIssue, SiteIssueInput } from "../../hooks/useIssues";
import { colors } from "../../theme";
import { formatDate, formatDateTime, toIsoDate } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DatePickerField } from "../DatePickerField";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { Info } from "./SupportSheets";
import { sheetStyles } from "./styles";

type IssueView = "Issue" | "Support" | "Records";

export function IssueSheet({
  issues,
  onSubmit,
}: {
  issues: SiteIssue[];
  onSubmit: (input: SiteIssueInput) => void;
}) {
  const dialog = useAppDialog();
  const today = toIsoDate(new Date());
  const [view, setView] = useState<IssueView>("Issue");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [reportedDate, setReportedDate] = useState(today);
  const [title, setTitle] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [videoNames, setVideoNames] = useState<string[]>([]);
  const selected = issues.find((issue) => issue.id === selectedId);

  const submit = () => {
    if (!category || !priority || !title.trim() || !remarks.trim()) {
      dialog.show(
        "Issue details required",
        "Complete the category, priority, title, and remarks fields.",
      );
      return;
    }
    onSubmit({
      kind: view === "Support" ? "Technical Support" : "Site Issue",
      category,
      priority,
      reportedDate,
      title: title.trim(),
      remarks: remarks.trim(),
      photoNames,
      videoNames,
    });
    setCategory("");
    setPriority("");
    setTitle("");
    setRemarks("");
    setPhotoNames([]);
    setVideoNames([]);
    setView("Records");
    dialog.show(
      view === "Support" ? "Support requested" : "Issue reported",
      "The record and its evidence were saved locally.",
    );
  };

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sheetStyles.sheetTabs}>
        {(["Issue", "Support", "Records"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setView(item);
              setSelectedId(null);
            }}
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
              {item === "Support" ? "Tech support" : item}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === "Records" ? (
        selected ? (
          <IssueDetail issue={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <View style={sheetStyles.requestList}>
            {issues.map((issue) => (
              <Pressable key={issue.id} onPress={() => setSelectedId(issue.id)}>
                <Surface style={sheetStyles.requestCard}>
                  <View style={sheetStyles.requestCardTop}>
                    <View style={sheetStyles.flexNoMargin}>
                      <Text style={sheetStyles.itemTitle}>{issue.title}</Text>
                      <Text style={sheetStyles.itemMeta}>
                        {issue.id} · {formatDate(issue.reportedDate)} ·{" "}
                        {issue.kind}
                      </Text>
                    </View>
                    <StatusPill label={issue.status} />
                  </View>
                  <View style={sheetStyles.issueCardFooter}>
                    <Text style={sheetStyles.itemMeta}>
                      {issue.category} · {issue.priority} priority
                    </Text>
                    <Text style={sheetStyles.itemMeta}>
                      {issue.photoNames.length + issue.videoNames.length}{" "}
                      attachments
                    </Text>
                  </View>
                </Surface>
              </Pressable>
            ))}
          </View>
        )
      ) : (
        <>
          <View style={sheetStyles.context}>
            <FontAwesome6
              name={view === "Support" ? "headset" : "triangle-exclamation"}
              size={17}
              color={colors.primary}
            />
            <View>
              <Text style={sheetStyles.contextLabel}>PALM GROVE RESIDENCE</Text>
              <Text style={sheetStyles.contextValue}>
                Villa 18 ·{" "}
                {view === "Support" ? "Technical support" : "Site issue"}
              </Text>
            </View>
          </View>
          <View style={sheetStyles.splitFields}>
            <View style={sheetStyles.splitField}>
              <Text style={sheetStyles.fieldLabel}>CATEGORY</Text>
              <DropdownField
                value={category}
                placeholder="Select category"
                options={
                  view === "Support"
                    ? [
                        "Drawing Clarification",
                        "Engineering",
                        "Application",
                        "Equipment",
                      ]
                    : ["Technical", "Safety", "Material", "Quality", "Schedule"]
                }
                onChange={setCategory}
              />
            </View>
            <View style={sheetStyles.splitField}>
              <Text style={sheetStyles.fieldLabel}>PRIORITY</Text>
              <DropdownField
                value={priority}
                placeholder="Select priority"
                options={["Low", "Medium", "High", "Critical"]}
                onChange={setPriority}
              />
            </View>
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>REPORTED DATE</Text>
            <DatePickerField
              value={reportedDate}
              onChange={setReportedDate}
              maximumDate={today}
            />
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>TITLE</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={sheetStyles.field}
              placeholder={
                view === "Support"
                  ? "What support is needed?"
                  : "Short issue title"
              }
              placeholderTextColor={colors.placeholder}
            />
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>REMARKS</Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              style={[sheetStyles.field, sheetStyles.fieldLarge]}
              placeholder="Describe the issue, location, and required action"
              placeholderTextColor={colors.placeholder}
              multiline
            />
          </View>
          <MultiMediaPicker
            label="Add issue photos"
            mediaType="images"
            values={photoNames}
            onChange={setPhotoNames}
          />
          <MultiMediaPicker
            label="Add issue videos"
            mediaType="videos"
            values={videoNames}
            onChange={setVideoNames}
          />
          <PrimaryButton
            label={
              view === "Support" ? "Request technical support" : "Report issue"
            }
            icon="paper-plane"
            onPress={submit}
          />
        </>
      )}
    </ScrollView>
  );
}

function MultiMediaPicker({
  label,
  mediaType,
  values,
  onChange,
}: {
  label: string;
  mediaType: "images" | "videos";
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <View style={sheetStyles.fieldWrap}>
      <AttachmentPicker
        value={null}
        onChange={(value) => onChange([...new Set([...values, value])])}
        label={label}
        mediaOnly
        mediaType={mediaType}
      />
      {values.map((value) => (
        <View key={value} style={sheetStyles.issueAttachment}>
          <FontAwesome6
            name={mediaType === "images" ? "image" : "video"}
            size={13}
            color={colors.primary}
          />
          <Text style={sheetStyles.issueAttachmentName} numberOfLines={1}>
            {value}
          </Text>
          <Pressable
            onPress={() => onChange(values.filter((item) => item !== value))}
          >
            <FontAwesome6 name="xmark" size={14} color={colors.danger} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function IssueDetail({
  issue,
  onBack,
}: {
  issue: SiteIssue;
  onBack: () => void;
}) {
  return (
    <View style={sheetStyles.requestDetail}>
      <Pressable onPress={onBack} style={sheetStyles.backAction}>
        <FontAwesome6 name="arrow-left" size={13} color={colors.primary} />
        <Text style={sheetStyles.backActionText}>Back to records</Text>
      </Pressable>
      <Surface style={sheetStyles.requestCard}>
        <View style={sheetStyles.requestCardTop}>
          <View style={sheetStyles.flexNoMargin}>
            <Text style={sheetStyles.requestDetailTitle}>{issue.title}</Text>
            <Text style={sheetStyles.itemMeta}>{issue.id}</Text>
          </View>
          <StatusPill label={issue.status} />
        </View>
        <Info
          icon="building"
          label="PROJECT / SITE"
          value={`${issue.project} · ${issue.site}`}
        />
        <Info
          icon="layer-group"
          label="CATEGORY"
          value={`${issue.category} · ${issue.priority} priority`}
        />
        <Info
          icon="calendar-days"
          label="REPORTED"
          value={formatDate(issue.reportedDate)}
        />
        <Info icon="message" label="REMARKS" value={issue.remarks} />
        {issue.resolution ? (
          <Info
            icon="circle-check"
            label="RESOLUTION"
            value={issue.resolution}
          />
        ) : null}
      </Surface>
      {issue.photoNames.length || issue.videoNames.length ? (
        <Surface style={sheetStyles.requestCard}>
          <Text style={sheetStyles.listHeading}>ATTACHMENTS</Text>
          {[...issue.photoNames, ...issue.videoNames].map((name) => (
            <View key={name} style={sheetStyles.issueAttachment}>
              <FontAwesome6 name="paperclip" size={12} color={colors.primary} />
              <Text style={sheetStyles.issueAttachmentName}>{name}</Text>
            </View>
          ))}
        </Surface>
      ) : null}
      <Text style={sheetStyles.listHeading}>STATUS HISTORY</Text>
      {issue.history.map((entry) => (
        <Surface key={entry.id} style={sheetStyles.issueHistoryCard}>
          <View style={sheetStyles.requestCardTop}>
            <StatusPill label={entry.status} />
            <Text style={sheetStyles.time}>
              {formatDateTime(entry.createdAt)}
            </Text>
          </View>
          <Text style={sheetStyles.itemMeta}>{entry.note}</Text>
        </Surface>
      ))}
    </View>
  );
}
