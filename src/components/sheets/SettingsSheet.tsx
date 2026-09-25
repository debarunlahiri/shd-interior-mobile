import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { AppSettings } from "../../hooks/useAppSettings";
import { colors } from "../../theme";
import { ThemePreference, useThemeSettings } from "../../theme/ThemeProvider";
import { FontAwesomeIcon } from "../../types/icons";
import { Surface } from "../ui";
import { sheetStyles } from "./styles";

export function SettingsSheet({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
}) {
  const theme = useThemeSettings();
  const appearanceOptions: {
    value: ThemePreference;
    label: string;
    icon: FontAwesomeIcon;
  }[] = [
    { value: "system", label: "System", icon: "circle-half-stroke" },
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" },
  ];

  return (
    <ScrollView contentContainerStyle={sheetStyles.form}>
      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>APPEARANCE</Text>
        <View style={sheetStyles.settingsSegments}>
          {appearanceOptions.map((option) => {
            const selected = theme.preference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => theme.setPreference(option.value)}
                style={[
                  sheetStyles.settingsSegment,
                  selected && sheetStyles.settingsSegmentActive,
                ]}
              >
                <FontAwesome6
                  name={option.icon}
                  size={14}
                  color={selected ? colors.white : colors.inkMuted}
                />
                <Text
                  style={[
                    sheetStyles.settingsSegmentText,
                    selected && sheetStyles.settingsSegmentTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={sheetStyles.settingsHint}>
          System follows the device appearance automatically.
        </Text>
      </View>

      <View style={sheetStyles.fieldWrap}>
        <Text style={sheetStyles.fieldLabel}>WORKFLOW ALERTS</Text>
        <Surface style={sheetStyles.settingsCard}>
          <SettingToggle
            icon="bell"
            label="In-app notifications"
            copy="Allow workflow alerts in the notification centre"
            value={settings.notificationsEnabled}
            onChange={(value) => onChange("notificationsEnabled", value)}
          />
          <SettingToggle
            icon="list-check"
            label="Task alerts"
            copy="Deadlines and overdue work"
            value={settings.taskAlerts}
            disabled={!settings.notificationsEnabled}
            onChange={(value) => onChange("taskAlerts", value)}
          />
          <SettingToggle
            icon="boxes-stacked"
            label="Material alerts"
            copy="Rejected requests and low stock"
            value={settings.materialAlerts}
            disabled={!settings.notificationsEnabled}
            onChange={(value) => onChange("materialAlerts", value)}
          />
          <SettingToggle
            icon="wallet"
            label="Finance alerts"
            copy="Rejected expenses and purchases"
            value={settings.financeAlerts}
            disabled={!settings.notificationsEnabled}
            onChange={(value) => onChange("financeAlerts", value)}
          />
          <SettingToggle
            icon="file-lines"
            label="Daily report reminders"
            copy="Remind the Supervisor when today’s report is missing"
            value={settings.reportReminders}
            disabled={!settings.notificationsEnabled}
            last
            onChange={(value) => onChange("reportReminders", value)}
          />
        </Surface>
      </View>

      <View style={sheetStyles.settingsInfo}>
        <FontAwesome6 name="shield-halved" size={15} color={colors.primary} />
        <Text style={sheetStyles.settingsInfoText}>
          Account access and role permissions are controlled by the signed-in
          profile. Notification preferences are stored on this device.
        </Text>
      </View>
    </ScrollView>
  );
}

function SettingToggle({
  icon,
  label,
  copy,
  value,
  disabled = false,
  last = false,
  onChange,
}: {
  icon: FontAwesomeIcon;
  label: string;
  copy: string;
  value: boolean;
  disabled?: boolean;
  last?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View
      style={[
        sheetStyles.settingsRow,
        !last && sheetStyles.settingsRowBorder,
        disabled && sheetStyles.settingsRowDisabled,
      ]}
    >
      <View style={sheetStyles.itemIcon}>
        <FontAwesome6 name={icon} size={15} color={colors.primary} />
      </View>
      <View style={sheetStyles.flex}>
        <Text style={sheetStyles.infoValue}>{label}</Text>
        <Text style={sheetStyles.itemMeta}>{copy}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : colors.placeholder}
      />
    </View>
  );
}
