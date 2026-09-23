import { useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputSubmitEditingEventData,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { useTranslation } from "../localization";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
  onFocus?: () => void;
  onSubmitEditing?: (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => void;
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  hasError = false,
  onFocus,
  onSubmitEditing,
}: OtpInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("auth.otpAccessibility", { length })}
      onPress={() => inputRef.current?.focus()}
      style={styles.wrap}
    >
      <View style={styles.boxRow} pointerEvents="none">
        {digits.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.box,
              focused && index === activeIndex && styles.boxFocused,
              hasError && styles.boxError,
            ]}
          >
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) =>
          onChange(text.replace(/\D/g, "").slice(0, length))
        }
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        contextMenuHidden={false}
        returnKeyType="done"
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmitEditing}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  boxRow: { flexDirection: "row", gap: 8 },
  box: {
    flex: 1,
    aspectRatio: 0.9,
    maxHeight: 58,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  boxFocused: { borderColor: colors.primary, borderWidth: 1.5 },
  boxError: { borderColor: colors.danger },
  digit: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: "transparent",
    backgroundColor: "transparent",
    opacity: 0.02,
  },
});
