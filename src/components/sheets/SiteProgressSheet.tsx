import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ProgressStage, SiteProgressEntry } from "../../data";
import { SiteProgressInput } from "../../hooks/useSiteProgress";
import { colors } from "../../theme";
import { formatDate } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DataTable, DataTableColumn } from "../DataTable";
import { PercentageSlider } from "../PercentageSlider";
import { PrimaryButton } from "../ui";
import { sheetStyles } from "./styles";

export function SiteProgress({
  entries,
  onSubmit,
}: {
  entries: SiteProgressEntry[];
  onSubmit: (input: SiteProgressInput) => void;
}) {
  const dialog = useAppDialog();
  const [stage, setStage] = useState<ProgressStage>("During work");
  const [progress, setProgress] = useState(68);
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [mediaName, setMediaName] = useState<string | null>(null);
  const stages: ProgressStage[] = ["Before work", "During work", "After work"];

  const submit = () => {
    if (!description.trim() || !remarks.trim()) {
      dialog.show(
        "Details required",
        "Add the work description and daily remarks.",
      );
      return;
    }
    if (!mediaName) {
      dialog.show(
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
    <ScrollView contentContainerStyle={sheetStyles.progressForm}>
      <View style={sheetStyles.context}>
        <FontAwesome6 name="building" size={17} color={colors.primary} />
        <View>
          <Text style={sheetStyles.contextLabel}>PALM GROVE RESIDENCE</Text>
          <Text style={sheetStyles.contextValue}>Villa 18 · Arjun Kumar</Text>
        </View>
      </View>
      <Text style={sheetStyles.fieldLabel}>PROGRESS STAGE</Text>
      <View style={sheetStyles.stageGrid}>
        {stages.map((option) => (
          <Pressable
            key={option}
            onPress={() => setStage(option)}
            style={[
              sheetStyles.stageOption,
              stage === option && sheetStyles.stageOptionActive,
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
                sheetStyles.stageText,
                stage === option && sheetStyles.stageTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={sheetStyles.progressHeading}>
        <Text style={sheetStyles.fieldLabel}>SITE COMPLETION</Text>
        <Text style={sheetStyles.progressHeadingValue}>{progress}%</Text>
      </View>
      <PercentageSlider
        value={progress}
        onChange={setProgress}
        accessibilityLabel="Site completion percentage"
      />
      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>WORK DESCRIPTION</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[sheetStyles.field, sheetStyles.fieldLarge]}
          placeholder="Describe today's site work"
          placeholderTextColor={colors.placeholder}
          multiline
        />
      </View>
      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>DAILY REMARKS</Text>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          style={[sheetStyles.field, sheetStyles.fieldLarge]}
          placeholder="Add observations, delays, or next steps"
          placeholderTextColor={colors.placeholder}
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
  const columns: DataTableColumn<SiteProgressEntry>[] = [
    {
      key: "date",
      label: "Date",
      width: 95,
      render: (entry) => formatDate(entry.createdAt),
    },
    {
      key: "stage",
      label: "Stage",
      width: 115,
      render: (entry) => entry.stage,
    },
    {
      key: "work",
      label: "Work",
      width: 260,
      render: (entry) => entry.workDescription,
    },
    {
      key: "progress",
      label: "Progress",
      width: 90,
      render: (entry) => `${entry.progress}%`,
    },
  ];
  return (
    <View style={sheetStyles.progressHistory}>
      <DataTable
        title="Progress history"
        columns={columns}
        rows={entries}
        rowKey={(entry) => entry.id}
      />
    </View>
  );
}
