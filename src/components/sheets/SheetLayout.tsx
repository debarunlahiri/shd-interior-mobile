import { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton } from "../ui";
import { sheetStyles } from "./styles";

export function SheetLayout({
  visible,
  title,
  subtitle,
  eyebrow,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={sheetStyles.modal}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />
        <SafeAreaView style={sheetStyles.sheet} edges={["bottom"]}>
          <View style={sheetStyles.handle} />
          <View style={sheetStyles.header}>
            <View>
              {eyebrow ? (
                <Text style={sheetStyles.taskId}>{eyebrow}</Text>
              ) : null}
              <Text style={sheetStyles.title}>{title}</Text>
              {subtitle ? (
                <Text style={sheetStyles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
            <IconButton icon="xmark" onPress={onClose} />
          </View>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
