import { FontAwesome6 } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { FontAwesomeIcon } from "../types/icons";

const content = {
  Projects: {
    icon: "building" as FontAwesomeIcon,
    subtitle: "Company projects and site progress",
    headers: ["Project", "Location", "Progress", "Status"],
    rows: [
      ["Palm Grove Residence", "Gurugram", "68%", "Active"],
      ["Orchid Corporate Suite", "Noida", "42%", "Active"],
      ["Lakeview Apartment", "Delhi", "91%", "On hold"],
    ],
  },
  Approvals: {
    icon: "clipboard-check" as FontAwesomeIcon,
    subtitle: "Items waiting for management action",
    headers: ["Reference", "Request", "Value", "Priority"],
    rows: [
      ["MR-204", "Material request", "₹28,400", "High"],
      ["EXP-882", "Site expense", "₹4,050", "Normal"],
      ["TSK-1039", "Task verification", "100%", "Normal"],
    ],
  },
  Orders: {
    icon: "file-invoice" as FontAwesomeIcon,
    subtitle: "Purchase orders assigned to your company",
    headers: ["Order", "Project", "Amount", "Status"],
    rows: [
      ["PO-2048", "Palm Grove", "₹84,600", "Approved"],
      ["PO-2039", "Orchid Suite", "₹46,250", "Part received"],
      ["PO-2027", "Lakeview", "₹22,900", "Closed"],
    ],
  },
  Deliveries: {
    icon: "truck" as FontAwesomeIcon,
    subtitle: "Upcoming and completed material deliveries",
    headers: ["Delivery", "Project", "Date", "Status"],
    rows: [
      ["DEL-776", "Palm Grove", "22 Sep", "Scheduled"],
      ["DEL-768", "Orchid Suite", "20 Sep", "In transit"],
      ["DEL-751", "Lakeview", "18 Sep", "Delivered"],
    ],
  },
};

export function RoleModuleScreen({ module }: { module: keyof typeof content }) {
  const config = content[module];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <FontAwesome6 name={config.icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{module}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              {config.headers.map((header, index) => (
                <Text
                  key={header}
                  style={[
                    styles.cell,
                    index === 0 && styles.firstCell,
                    styles.headerText,
                  ]}
                >
                  {header}
                </Text>
              ))}
            </View>

            {config.rows.map((row, rowIndex) => (
              <View
                key={row[0]}
                style={[styles.row, rowIndex % 2 === 1 && styles.altRow]}
              >
                {row.map((value, index) => (
                  <Text
                    key={`${row[0]}-${index}`}
                    style={[styles.cell, index === 0 && styles.firstCell]}
                  >
                    {value}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  content: { paddingHorizontal: 20, paddingBottom: 112 },
  table: {
    minWidth: 650,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  headerRow: { minHeight: 40, backgroundColor: colors.primarySoft },
  altRow: { backgroundColor: "#FAFBFA" },
  cell: {
    width: 130,
    paddingHorizontal: 12,
    color: colors.ink,
    fontSize: 10,
  },
  firstCell: { width: 220, fontWeight: "700" },
  headerText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
