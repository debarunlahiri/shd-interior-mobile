import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { formatDate, parseIsoDate, toIsoDate } from "../utils/date";
import { useTranslation } from "../localization";

type DatePickerFieldProps = {
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  minimumDate?: string;
  maximumDate?: string;
  disabled?: boolean;
};

export function DatePickerField({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  minimumDate,
  maximumDate,
  disabled = false,
}: DatePickerFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseIsoDate(value));

  const showPicker = () => {
    if (disabled) return;
    setDraftDate(parseIsoDate(value));
    setOpen(true);
  };

  const handleAndroidValueChange = (_event: unknown, selectedDate: Date) => {
    setOpen(false);
    onChange(toIsoDate(selectedDate));
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          value
            ? t("common.selectedDate", { date: formatDate(value) })
            : placeholder
        }
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={showPicker}
        style={({ pressed }) => [
          styles.field,
          open && styles.fieldOpen,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <View style={styles.icon} pointerEvents="none">
          <FontAwesome6 name="calendar-days" size={15} color={colors.primary} />
        </View>
      </Pressable>

      {open && Platform.OS === "android" ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="calendar"
          minimumDate={minimumDate ? parseIsoDate(minimumDate) : undefined}
          maximumDate={maximumDate ? parseIsoDate(maximumDate) : undefined}
          onValueChange={handleAndroidValueChange}
          onDismiss={() => setOpen(false)}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <View style={styles.overlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setOpen(false)}
            />
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                  <Text style={styles.cancelText}>{t("common.cancel")}</Text>
                </Pressable>
                <Text style={styles.pickerTitle}>{t("common.selectDate")}</Text>
                <Pressable
                  hitSlop={10}
                  onPress={() => {
                    onChange(toIsoDate(draftDate));
                    setOpen(false);
                  }}
                >
                  <Text style={styles.doneText}>{t("common.done")}</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                minimumDate={
                  minimumDate ? parseIsoDate(minimumDate) : undefined
                }
                maximumDate={
                  maximumDate ? parseIsoDate(maximumDate) : undefined
                }
                onValueChange={(_, selectedDate) => setDraftDate(selectedDate)}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },
  fieldOpen: { borderColor: colors.primary },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.78 },
  value: { flex: 1, color: colors.ink, fontSize: 13 },
  placeholder: { color: "#969E9B" },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(9, 24, 20, 0.34)",
  },
  pickerSheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingBottom: 24,
    overflow: "hidden",
  },
  pickerHeader: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerTitle: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  cancelText: { color: colors.inkMuted, fontSize: 13, fontWeight: "600" },
  doneText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  picker: { alignSelf: "stretch" },
});
