import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export type DropdownOption = string | { label: string; value: string };

type DropdownFieldProps = {
  value?: string;
  placeholder: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function DropdownField({
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}: DropdownFieldProps) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const selectedLabel = normalizedOptions.find(
    (option) => option.value === value,
  )?.label;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[
          styles.field,
          open && styles.fieldOpen,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
      >
        <Text
          style={[styles.value, !selectedLabel && styles.placeholder]}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <View style={styles.icon} pointerEvents="none">
          <FontAwesome6
            name={open ? "chevron-up" : "chevron-down"}
            size={13}
            color={colors.primary}
          />
        </View>
      </Pressable>
      {open && !disabled ? (
        <View style={styles.menu}>
          {normalizedOptions.map((option, index) => {
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.option,
                  index < normalizedOptions.length - 1 && styles.optionBorder,
                  selected && styles.optionSelected,
                ]}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <FontAwesome6 name="check" size={13} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
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
  fieldOpen: {
    borderColor: colors.primary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  disabled: { opacity: 0.55 },
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
  menu: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  option: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  optionSelected: { backgroundColor: colors.primarySoft },
  optionText: { color: colors.ink, fontSize: 12 },
  optionTextSelected: { color: colors.primary, fontWeight: "700" },
});
