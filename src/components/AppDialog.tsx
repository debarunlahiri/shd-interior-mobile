import { FontAwesome6 } from "@expo/vector-icons";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import { useTranslation } from "../localization";

export type AppDialogButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void | Promise<void>;
};

type DialogState = {
  title: string;
  message: string;
  buttons: AppDialogButton[];
};

type DialogTone = "info" | "success" | "warning" | "destructive";

type AppDialogContextValue = {
  show: (title: string, message: string, buttons?: AppDialogButton[]) => void;
  close: () => void;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const close = useCallback(() => setDialog(null), []);
  const show = useCallback(
    (title: string, message: string, buttons?: AppDialogButton[]) => {
      setDialog({
        title,
        message,
        buttons: buttons?.length ? buttons : [{ text: t("common.ok") }],
      });
    },
    [t],
  );
  const value = useMemo(() => ({ show, close }), [close, show]);
  const tone = dialog ? getDialogTone(dialog) : "info";
  const requiresExplicitChoice = tone === "destructive";
  const toneColor =
    tone === "destructive" || tone === "warning"
      ? colors.danger
      : tone === "success"
        ? colors.success
        : colors.primary;

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      <Modal
        visible={Boolean(dialog)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={requiresExplicitChoice ? () => undefined : close}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={requiresExplicitChoice ? undefined : close}
          />
          {dialog ? (
            <View
              style={styles.dialog}
              accessibilityRole="alert"
              accessibilityViewIsModal
            >
              <View style={styles.header}>
                <View
                  style={[styles.icon, { backgroundColor: `${toneColor}16` }]}
                >
                  <FontAwesome6
                    name={
                      tone === "success"
                        ? "circle-check"
                        : tone === "warning" || tone === "destructive"
                          ? "triangle-exclamation"
                          : "circle-info"
                    }
                    size={18}
                    color={toneColor}
                  />
                </View>
                <Text style={styles.title}>{dialog.title}</Text>
              </View>
              <Text style={styles.message}>{dialog.message}</Text>
              <View
                style={[
                  styles.actions,
                  dialog.buttons.length > 2 && styles.actionsStacked,
                ]}
              >
                {dialog.buttons.map((button) => (
                  <Pressable
                    key={button.text}
                    accessibilityRole="button"
                    onPress={() => {
                      close();
                      void button.onPress?.();
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      dialog.buttons.length <= 2 && styles.buttonInline,
                      dialog.buttons.length > 2 && styles.buttonStacked,
                      button.style === "cancel" && styles.cancelButton,
                      button.style === "destructive" &&
                        styles.destructiveButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === "cancel" && styles.cancelButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </AppDialogContext.Provider>
  );
}

function getDialogTone(dialog: DialogState): DialogTone {
  if (dialog.buttons.some((button) => button.style === "destructive")) {
    return "destructive";
  }
  const title = dialog.title.toLowerCase();
  if (
    ["added", "saved", "submitted", "confirmed", "updated", "verified"].some(
      (word) => title.includes(word),
    )
  ) {
    return "success";
  }
  if (
    [
      "required",
      "needed",
      "incorrect",
      "unavailable",
      "insufficient",
      "already exists",
      "unable",
    ].some((word) => title.includes(word))
  ) {
    return "warning";
  }
  return "info";
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error("useAppDialog must be used inside AppDialogProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 24, 20, 0.46)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  message: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 9,
    marginTop: 20,
  },
  actionsStacked: { flexDirection: "column" },
  button: {
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInline: { flex: 1 },
  buttonStacked: { width: "100%" },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructiveButton: { backgroundColor: colors.danger },
  buttonPressed: { opacity: 0.72 },
  buttonText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  cancelButtonText: { color: colors.ink },
});
