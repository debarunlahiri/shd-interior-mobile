import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "../theme";

export type DataTableColumn<Row> = {
  key: string;
  label: string;
  width: number;
  render: (row: Row) => string | number;
};

type DataTableProps<Row> = {
  title: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  emptyMessage?: string;
};

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.2;

export function DataTable<Row>({
  title,
  columns,
  rows,
  rowKey,
  emptyMessage = "No records available.",
}: DataTableProps<Row>) {
  const [fullScreen, setFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const { height: windowHeight } = useWindowDimensions();
  const tableWidth = useMemo(
    () => columns.reduce((total, column) => total + column.width, 0),
    [columns],
  );

  const renderHeader = (scale: number) => (
    <View style={[styles.row, styles.headerRow]}>
      {columns.map((column) => (
        <Text
          key={column.key}
          style={[
            styles.cell,
            styles.headerText,
            {
              width: column.width * scale,
              fontSize: 8 * scale,
              paddingHorizontal: 10 * scale,
            },
          ]}
          numberOfLines={2}
        >
          {column.label}
        </Text>
      ))}
    </View>
  );

  const renderRows = (scale: number) =>
    rows.length ? (
      rows.map((row, index) => (
        <View
          key={rowKey(row)}
          style={[
            styles.row,
            { minHeight: 54 * scale },
            index % 2 === 1 && styles.alternateRow,
          ]}
        >
          {columns.map((column) => (
            <View
              key={column.key}
              style={[
                styles.cell,
                {
                  width: column.width * scale,
                  paddingHorizontal: 10 * scale,
                },
              ]}
            >
              <Text
                style={[styles.cellText, { fontSize: 9 * scale }]}
                numberOfLines={3}
              >
                {column.render(row)}
              </Text>
            </View>
          ))}
        </View>
      ))
    ) : (
      <View style={[styles.empty, { width: tableWidth * scale }]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );

  return (
    <>
      <View style={styles.inlineWrap}>
        <View style={styles.inlineHeader}>
          <Text style={styles.inlineTitle}>{title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${title} full screen`}
            hitSlop={8}
            onPress={() => {
              setZoom(1);
              setFullScreen(true);
            }}
            style={({ pressed }) => [
              styles.expandButton,
              pressed && styles.pressed,
            ]}
          >
            <FontAwesome6 name="expand" size={12} color={colors.primary} />
            <Text style={styles.expandText}>Full screen</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, { width: tableWidth }]}>
            {renderHeader(1)}
            {renderRows(1)}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={fullScreen}
        animationType="slide"
        onRequestClose={() => setFullScreen(false)}
      >
        <SafeAreaView style={styles.fullScreen} edges={["top", "bottom"]}>
          <View style={styles.fullHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close full-screen table"
              onPress={() => setFullScreen(false)}
              style={styles.headerButton}
            >
              <FontAwesome6 name="arrow-left" size={16} color={colors.ink} />
            </Pressable>
            <View style={styles.fullTitleWrap}>
              <Text style={styles.fullTitle}>{title}</Text>
              <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
            </View>
            <View style={styles.zoomControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zoom out"
                disabled={zoom <= MIN_ZOOM}
                onPress={() =>
                  setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))
                }
                style={styles.headerButton}
              >
                <FontAwesome6 name="minus" size={13} color={colors.ink} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset zoom"
                onPress={() => setZoom(1)}
                style={styles.resetButton}
              >
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zoom in"
                disabled={zoom >= MAX_ZOOM}
                onPress={() =>
                  setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))
                }
                style={styles.headerButton}
              >
                <FontAwesome6 name="plus" size={13} color={colors.ink} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.dragHint}>
            Drag horizontally or vertically to inspect the table
          </Text>
          <View style={styles.fullTableFrame}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator
              contentContainerStyle={{ minWidth: tableWidth * zoom }}
            >
              <View style={{ width: tableWidth * zoom }}>
                {renderHeader(zoom)}
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  style={{ maxHeight: windowHeight - 190 }}
                >
                  {renderRows(zoom)}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inlineWrap: { gap: 9 },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inlineTitle: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  expandButton: {
    minHeight: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  expandText: { color: colors.primary, fontSize: 9, fontWeight: "800" },
  pressed: { opacity: 0.65 },
  table: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  headerRow: { minHeight: 42, backgroundColor: colors.primarySoft },
  alternateRow: { backgroundColor: "#FAFBFA" },
  cell: { justifyContent: "center" },
  headerText: {
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cellText: { color: colors.ink },
  empty: { minHeight: 80, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.inkMuted, fontSize: 11 },
  fullScreen: { flex: 1, backgroundColor: colors.background },
  fullHeader: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  fullTitleWrap: { flex: 1 },
  fullTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  zoomLabel: { color: colors.inkMuted, fontSize: 9, marginTop: 2 },
  zoomControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  resetButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  resetText: { color: colors.primary, fontSize: 9, fontWeight: "800" },
  dragHint: {
    color: colors.inkMuted,
    fontSize: 9,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullTableFrame: { flex: 1, borderTopWidth: 1, borderTopColor: colors.border },
});
