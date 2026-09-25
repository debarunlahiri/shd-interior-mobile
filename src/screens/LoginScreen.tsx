import { FontAwesome6 } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { OtpInput } from "../components/OtpInput";
import { DEMO_OTP, getDemoAccount, normalizePhoneNumber } from "../config/auth";
import { useTranslation } from "../localization";

type LoginStep = "phone" | "otp";

export function LoginScreen({
  onSignIn,
}: {
  onSignIn: (phoneNumber: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<LoginStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInputKey, setOtpInputKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  const requestOtp = () => {
    if (normalizedPhone.length !== 10) {
      setError(t("auth.invalidPhone"));
      return;
    }
    if (!getDemoAccount(normalizedPhone)) {
      setError(t("auth.unregisteredPhone"));
      return;
    }
    setError(null);
    setOtp("");
    setStep("otp");
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError(t("auth.invalidOtpLength"));
      return;
    }
    if (otp !== DEMO_OTP) {
      setError(t("auth.incorrectOtp"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSignIn(normalizedPhone);
    } catch {
      setError(t("auth.verifyFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const changePhoneNumber = () => {
    setStep("phone");
    setOtp("");
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/shd-interior-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>{t("app.name")}</Text>
          <Text style={styles.brandCopy}>{t("auth.brandSubtitle")}</Text>
        </View>

        <View style={styles.card}>
          <View>
            <Text style={styles.title}>
              {step === "phone" ? t("auth.welcome") : t("auth.verifyNumber")}
            </Text>
            <Text style={styles.subtitle}>
              {step === "phone"
                ? t("auth.enterRegisteredPhone")
                : t("auth.enterOtpSent", { phone: phoneNumber.trim() })}
            </Text>
          </View>

          {step === "phone" ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t("auth.phoneNumber")}</Text>
              <View style={[styles.field, error && styles.fieldError]}>
                <FontAwesome6 name="phone" size={14} color={colors.inkMuted} />
                <TextInput
                  value={phoneNumber}
                  onChangeText={(value) => {
                    setPhoneNumber(value);
                    setError(null);
                  }}
                  style={styles.input}
                  placeholder={t("auth.phonePlaceholder")}
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={requestOtp}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.phoneSummary}>
                <View style={styles.phoneSummaryIcon}>
                  <FontAwesome6 name="phone" size={13} color={colors.primary} />
                </View>
                <Text style={styles.phoneSummaryText}>
                  {phoneNumber.trim()}
                </Text>
                <Pressable onPress={changePhoneNumber} hitSlop={10}>
                  <Text style={styles.changeText}>{t("auth.change")}</Text>
                </Pressable>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t("auth.otp")}</Text>
                <OtpInput
                  key={otpInputKey}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError(null);
                  }}
                  autoFocus
                  hasError={Boolean(error)}
                  onFocus={() =>
                    requestAnimationFrame(() =>
                      scrollRef.current?.scrollToEnd({ animated: true }),
                    )
                  }
                  onSubmitEditing={verifyOtp}
                />
              </View>
              <View style={styles.otpHelp}>
                <Text style={styles.otpHelpText}>{t("auth.otpMissing")}</Text>
                <Pressable
                  hitSlop={10}
                  onPress={() => {
                    setOtp("");
                    setError(null);
                    setOtpInputKey((current) => current + 1);
                  }}
                >
                  <Text style={styles.resendText}>{t("auth.resendOtp")}</Text>
                </Pressable>
              </View>
            </>
          )}

          {error ? (
            <View style={styles.errorRow}>
              <FontAwesome6
                name="circle-exclamation"
                size={13}
                color={colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={step === "phone" ? requestOtp : verifyOtp}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {step === "phone"
                    ? t("auth.sendOtp")
                    : t("auth.verifyAndSignIn")}
                </Text>
                <FontAwesome6
                  name={step === "phone" ? "arrow-right" : "circle-check"}
                  size={14}
                  color={colors.white}
                />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 36,
  },
  brand: { alignItems: "center", marginBottom: 28 },
  logoWrap: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: { width: 78, height: 78 },
  brandName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 14,
  },
  brandCopy: { color: colors.inkMuted, fontSize: 12, marginTop: 5 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 19,
  },
  title: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, fontSize: 11, marginTop: 4 },
  fieldGroup: { gap: 7 },
  label: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  field: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.ink, fontSize: 13, paddingVertical: 0 },
  phoneSummary: {
    minHeight: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  phoneSummaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneSummaryText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  changeText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  otpHelp: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  otpHelpText: { color: colors.inkMuted, fontSize: 10 },
  resendText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  errorText: { flex: 1, color: colors.danger, fontSize: 10, lineHeight: 15 },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "800" },
});
