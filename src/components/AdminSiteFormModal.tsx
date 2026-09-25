import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ManagedUser } from "../hooks/useAdminMasters";
import {
  AdminSite,
  AdminSiteInput,
  SiteStatus,
} from "../hooks/useAdminProjects";
import { colors } from "../theme";
import { useAppDialog } from "./AppDialog";
import { DatePickerField } from "./DatePickerField";
import { DropdownField } from "./DropdownField";
import { PrimaryButton } from "./ui";

const statuses: SiteStatus[] = ["Planning", "Active", "On Hold", "Completed"];

type SiteForm = {
  name: string;
  location: string;
  status: SiteStatus;
  startDate: string;
  targetDate: string;
  completion: string;
  supervisorId: string;
};

const emptyForm: SiteForm = {
  name: "",
  location: "",
  status: "Planning",
  startDate: "",
  targetDate: "",
  completion: "0",
  supervisorId: "",
};

export function AdminSiteFormModal({
  visible,
  site,
  supervisors,
  onClose,
  onSave,
}: {
  visible: boolean;
  site: AdminSite | null;
  supervisors: ManagedUser[];
  onClose: () => void;
  onSave: (input: AdminSiteInput, siteId?: string) => void;
}) {
  const dialog = useAppDialog();
  const [form, setForm] = useState<SiteForm>(emptyForm);

  useEffect(() => {
    if (!visible) return;
    setForm(
      site
        ? {
            name: site.name,
            location: site.location,
            status: site.status,
            startDate: site.startDate,
            targetDate: site.targetDate,
            completion: String(site.completion),
            supervisorId: site.supervisorId,
          }
        : emptyForm,
    );
  }, [site, visible]);

  const update = (key: keyof SiteForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const supervisor = supervisors.find(
      (user) => user.id === form.supervisorId,
    );
    const completion = Number(form.completion);
    if (!form.name.trim() || !form.location.trim()) {
      dialog.show("Site details required", "Enter the site name and location.");
      return;
    }
    if (
      !form.startDate ||
      !form.targetDate ||
      form.targetDate < form.startDate
    ) {
      dialog.show(
        "Valid dates required",
        "Choose a target date that is on or after the site start date.",
      );
      return;
    }
    if (!supervisor) {
      dialog.show(
        "Supervisor required",
        "Assign an active Supervisor to the site.",
      );
      return;
    }
    if (!Number.isFinite(completion) || completion < 0 || completion > 100) {
      dialog.show(
        "Valid completion required",
        "Enter completion from 0 to 100.",
      );
      return;
    }

    onSave(
      {
        name: form.name.trim(),
        location: form.location.trim(),
        status: form.status,
        startDate: form.startDate,
        targetDate: form.targetDate,
        completion,
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
      },
      site?.id,
    );
    onClose();
    dialog.show(
      site ? "Site updated" : "Site added",
      site && site.supervisorId !== supervisor.id
        ? `${form.name.trim()} was transferred to ${supervisor.name}.`
        : `${form.name.trim()} has been saved locally.`,
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{site ? "Edit site" : "New site"}</Text>
            <Text style={styles.subtitle}>Assignment and delivery details</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <FontAwesome6 name="xmark" size={17} color={colors.ink} />
          </Pressable>
        </View>
        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Site name">
              <Input
                value={form.name}
                onChangeText={(value) => update("name", value)}
                placeholder="Site name"
              />
            </Field>
            <Field label="Location">
              <Input
                value={form.location}
                onChangeText={(value) => update("location", value)}
                placeholder="Site address or area"
              />
            </Field>
            <Field label="Status">
              <DropdownField
                value={form.status}
                placeholder="Select status"
                options={statuses}
                onChange={(value) => update("status", value)}
              />
            </Field>
            <Field
              label={
                site ? "Assigned Supervisor / transfer to" : "Assign Supervisor"
              }
            >
              <DropdownField
                value={form.supervisorId}
                placeholder="Select Supervisor"
                options={supervisors.map((user) => ({
                  label: user.name,
                  value: user.id,
                }))}
                onChange={(value) => update("supervisorId", value)}
              />
            </Field>
            <View style={styles.splitRow}>
              <Field label="Start date" style={styles.splitField}>
                <DatePickerField
                  value={form.startDate}
                  onChange={(value) => update("startDate", value)}
                />
              </Field>
              <Field label="Target date" style={styles.splitField}>
                <DatePickerField
                  value={form.targetDate}
                  minimumDate={form.startDate || undefined}
                  onChange={(value) => update("targetDate", value)}
                />
              </Field>
            </View>
            <Field label="Completion %">
              <Input
                value={form.completion}
                onChangeText={(value) => update("completion", value)}
                keyboardType="number-pad"
                placeholder="0"
              />
            </Field>
            {site?.assignmentHistory.length ? (
              <View style={styles.history}>
                <Text style={styles.historyTitle}>Assignment history</Text>
                {site.assignmentHistory.map((assignment) => (
                  <View key={assignment.id} style={styles.historyItem}>
                    <FontAwesome6
                      name="user-clock"
                      size={13}
                      color={colors.primary}
                    />
                    <View style={styles.historyCopy}>
                      <Text style={styles.historyNote}>{assignment.note}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(assignment.assignedAt).toLocaleString(
                          "en-IN",
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            <PrimaryButton
              label={site ? "Save site changes" : "Create site"}
              icon="floppy-disk"
              onPress={submit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.placeholder}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  form: { padding: 20, paddingBottom: 36, gap: 15 },
  field: { gap: 7 },
  label: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 13,
    paddingHorizontal: 14,
  },
  splitRow: { flexDirection: "row", gap: 10 },
  splitField: { flex: 1 },
  history: {
    gap: 9,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 13,
  },
  historyTitle: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  historyItem: { flexDirection: "row", gap: 9, alignItems: "flex-start" },
  historyCopy: { flex: 1 },
  historyNote: { color: colors.ink, fontSize: 10, lineHeight: 15 },
  historyDate: { color: colors.inkMuted, fontSize: 8, marginTop: 2 },
});
