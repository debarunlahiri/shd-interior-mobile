import { FontAwesome6 } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors } from "../theme";

export type DropdownOption = string | { label: string; value: string };

type DropdownFieldProps = {
  value?: string;
  placeholder: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

type MenuLayout = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

const SCREEN_MARGIN = 12;
const MENU_GAP = 6;
const MAX_MENU_HEIGHT = 280;
const OPTION_HEIGHT = 46;

export function DropdownField({
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}: DropdownFieldProps) {
  const fieldRef = useRef<View>(null);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState<MenuLayout | null>(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const selectedLabel = normalizedOptions.find(
    (option) => option.value === value,
  )?.label;

  const closeMenu = () => {
    setOpen(false);
    setMenuLayout(null);
  };

  const toggleMenu = () => {
    if (disabled) return;
    if (open) {
      closeMenu();
      return;
    }

    Keyboard.dismiss();
    fieldRef.current?.measureInWindow((x, y, width, height) => {
      const desiredHeight = Math.min(
        MAX_MENU_HEIGHT,
        normalizedOptions.length * OPTION_HEIGHT + 2,
      );
      const spaceBelow = windowHeight - y - height - MENU_GAP - SCREEN_MARGIN;
      const spaceAbove = y - MENU_GAP - SCREEN_MARGIN;
      const openBelow = spaceBelow >= desiredHeight || spaceBelow >= spaceAbove;
      const availableSpace = openBelow ? spaceBelow : spaceAbove;
      const maxHeight = Math.max(
        OPTION_HEIGHT,
        Math.min(desiredHeight, availableSpace),
      );
      const left = Math.max(
        SCREEN_MARGIN,
        Math.min(x, windowWidth - width - SCREEN_MARGIN),
      );
      const top = openBelow
        ? y + height + MENU_GAP
        : Math.max(SCREEN_MARGIN, y - MENU_GAP - maxHeight);

      setMenuLayout({ left, top, width, maxHeight });
      setOpen(true);
    });
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        ref={fieldRef}
        style={[
          styles.field,
          open && styles.fieldOpen,
          disabled && styles.disabled,
        ]}
        onPress={toggleMenu}
        accessibilityRole="button"
        accessibilityLabel={selectedLabel ?? placeholder}
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

      <Modal
        visible={open && Boolean(menuLayout)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeMenu}
            accessibilityLabel="Close dropdown"
          />
          {menuLayout ? (
            <View
              style={[
                styles.menu,
                {
                  left: menuLayout.left,
                  top: menuLayout.top,
                  width: menuLayout.width,
                  maxHeight: menuLayout.maxHeight,
                },
              ]}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={normalizedOptions.length > 5}
                bounces={false}
              >
                {normalizedOptions.map((option, index) => {
                  const selected = value === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected }}
                      style={[
                        styles.option,
                        index < normalizedOptions.length - 1 &&
                          styles.optionBorder,
                        selected && styles.optionSelected,
                      ]}
                      onPress={() => {
                        onChange(option.value);
                        closeMenu();
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                      {selected ? (
                        <FontAwesome6
                          name="check"
                          size={13}
                          color={colors.primary}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
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
  fieldOpen: { borderColor: colors.primary },
  disabled: { opacity: 0.55 },
  value: { flex: 1, color: colors.ink, fontSize: 13 },
  placeholder: { color: colors.placeholder },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  overlay: { flex: 1 },
  menu: {
    position: "absolute",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  option: {
    minHeight: OPTION_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 14,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  optionSelected: { backgroundColor: colors.primarySoft },
  optionText: { flex: 1, color: colors.ink, fontSize: 12 },
  optionTextSelected: { color: colors.primary, fontWeight: "700" },
});
