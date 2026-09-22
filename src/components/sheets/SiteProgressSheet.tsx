import { FontAwesome6 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ProgressStage,
  SiteProgressEntry,
} from "../../data";
import { SiteProgressInput } from "../../hooks/useSiteProgress";
import { colors } from "../../theme";
import { AttachmentPicker } from "../AttachmentPicker";
import { PrimaryButton } from "../ui";
import { sheetStyles } from "./styles";

export function SiteProgress({
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
      <View style={sheetStyles.sliderCard}>
        <Slider
          style={sheetStyles.slider}
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
        <View style={sheetStyles.sliderLabels}>
          <Text style={sheetStyles.sliderLabel}>0%</Text>
          <Text style={sheetStyles.sliderHint}>Slide to select any percentage</Text>
          <Text style={sheetStyles.sliderLabel}>100%</Text>
        </View>
      </View>
      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>WORK DESCRIPTION</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[sheetStyles.field, sheetStyles.fieldLarge]}
          placeholder="Describe today's site work"
          placeholderTextColor="#969E9B"
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
    <View style={sheetStyles.progressHistory}>
      <Text style={sheetStyles.fieldLabel}>PROGRESS HISTORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={sheetStyles.table}>
          <View style={[sheetStyles.tableRow, sheetStyles.tableHeader]}>
            <Text
              style={[sheetStyles.tableCell, sheetStyles.dateCell, sheetStyles.tableHeadText]}
            >
              Date
            </Text>
            <Text
              style={[sheetStyles.tableCell, sheetStyles.stageCell, sheetStyles.tableHeadText]}
            >
              Stage
            </Text>
            <Text
              style={[sheetStyles.tableCell, sheetStyles.workCell, sheetStyles.tableHeadText]}
            >
              Work
            </Text>
            <Text
              style={[
                sheetStyles.tableCell,
                sheetStyles.percentCell,
                sheetStyles.tableHeadText,
              ]}
            >
              Progress
            </Text>
          </View>
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                sheetStyles.tableRow,
                index % 2 === 1 && sheetStyles.tableRowAlternate,
              ]}
            >
              <Text style={[sheetStyles.tableCell, sheetStyles.dateCell]}>
                {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
              <Text style={[sheetStyles.tableCell, sheetStyles.stageCell]}>
                {entry.stage}
              </Text>
              <Text
                style={[sheetStyles.tableCell, sheetStyles.workCell]}
                numberOfLines={2}
              >
                {entry.workDescription}
              </Text>
              <Text style={[sheetStyles.tableCell, sheetStyles.percentCell]}>
                {entry.progress}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


