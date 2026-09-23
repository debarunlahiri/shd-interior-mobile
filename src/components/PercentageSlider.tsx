import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { useTranslation } from "../localization";

const SNAP_STEP = 5;
const MAJOR_POINTS = [0, 25, 50, 75, 100];

export function PercentageSlider({
  value,
  onChange,
  disabled = false,
  accessibilityLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  const { t } = useTranslation();
  const lastFeedbackValue = useRef(value);

  const changeValue = (nextValue: number) => {
    const snappedValue = Math.round(nextValue / SNAP_STEP) * SNAP_STEP;

    if (lastFeedbackValue.current !== snappedValue) {
      lastFeedbackValue.current = snappedValue;
      void Haptics.selectionAsync().catch(() => undefined);
    }

    onChange(snappedValue);
  };

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={SNAP_STEP}
        value={value}
        onValueChange={changeValue}
        disabled={disabled}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: 0, max: 100, now: value }}
      />
      <View style={styles.points}>
        {MAJOR_POINTS.map((point) => {
          const selected = value === point;
          const passed = value >= point;

          return (
            <Pressable
              key={point}
              style={styles.pointButton}
              onPress={() => changeValue(point)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={t("progress.setAccessibility", {
                value: point,
              })}
              accessibilityState={{ selected, disabled }}
            >
              <View
                style={[
                  styles.point,
                  passed && styles.pointPassed,
                  selected && styles.pointSelected,
                ]}
              />
              <Text
                style={[
                  styles.pointLabel,
                  selected && styles.pointLabelSelected,
                ]}
              >
                {point}%
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>{t("progress.snapHint")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.65 },
  slider: { width: "100%", height: 36 },
  points: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 9,
  },
  pointButton: {
    minWidth: 34,
    minHeight: 34,
    alignItems: "center",
    gap: 4,
  },
  point: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pointPassed: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  pointSelected: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: colors.primarySoft,
    backgroundColor: colors.primary,
  },
  pointLabel: {
    color: colors.inkMuted,
    fontSize: 8,
    fontWeight: "700",
  },
  pointLabelSelected: { color: colors.primary, fontWeight: "800" },
  hint: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 1,
  },
});
