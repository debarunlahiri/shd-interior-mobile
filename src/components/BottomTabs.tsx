import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";
import { RoleTab } from "../config/roles";
import { TabName } from "../types/navigation";

export function BottomTabs({
  active,
  onChange,
  items,
}: {
  active: TabName;
  onChange: (tab: TabName) => void;
  items: RoleTab[];
}) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.tabs,
        {
          minHeight: 64 + bottomPadding,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {items.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={styles.item}
            onPress={() => onChange(tab.key)}
          >
            <View
              collapsable={false}
              style={[
                styles.icon,
                {
                  backgroundColor: selected
                    ? colors.primarySoft
                    : "transparent",
                },
              ]}
            >
              <FontAwesome6
                name={tab.icon}
                size={18}
                color={selected ? colors.primary : colors.inkMuted}
              />
            </View>
            <Text style={[styles.label, selected && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 7,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.inkMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
  },
  labelActive: { color: colors.primary, fontWeight: "800" },
});
