import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ManagedMaterial, ManagedUnit } from "../hooks/useAdminMasters";
import {
  InventoryBalance,
  InventoryTransaction,
  InventoryTransactionInput,
  InventoryTransactionType,
} from "../hooks/useSiteInventory";
import { colors } from "../theme";
import { formatDate, toIsoDate } from "../utils/date";
import { DatePickerField } from "./DatePickerField";
import { DataTable, DataTableColumn } from "./DataTable";
import { useAppDialog } from "./AppDialog";
import { DropdownField } from "./DropdownField";
import { PrimaryButton, StatusPill, Surface } from "./ui";

const transactionTypes: InventoryTransactionType[] = [
  "Received",
  "Used",
  "Returned",
  "Transferred",
  "Damaged",
];

type Props = {
  materials: ManagedMaterial[];
  units: ManagedUnit[];
  balances: InventoryBalance[];
  transactions: InventoryTransaction[];
  taskOptions: { label: string; value: string }[];
  onAddTransaction: (input: InventoryTransactionInput) => void;
  onRequestMaterial: () => void;
};

export function SiteInventoryPanel({
  materials,
  units,
  balances,
  transactions,
  taskOptions,
  onAddTransaction,
  onRequestMaterial,
}: Props) {
  const dialog = useAppDialog();
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null,
  );
  const [type, setType] = useState<InventoryTransactionType>("Received");
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [reference, setReference] = useState("");
  const [activity, setActivity] = useState("");
  const [remarks, setRemarks] = useState("");

  const selectedBalance = balances.find(
    (balance) => balance.materialId === materialId,
  );
  const selectedMaterial = materials.find(
    (material) => material.id === materialId,
  );
  const selectedUnit = units.find(
    (unit) => unit.id === selectedMaterial?.unitId,
  );
  const visibleTransactions = useMemo(
    () =>
      selectedMaterialId
        ? transactions.filter(
            (transaction) => transaction.materialId === selectedMaterialId,
          )
        : transactions,
    [selectedMaterialId, transactions],
  );
  const historyColumns = useMemo<DataTableColumn<InventoryTransaction>[]>(
    () => [
      {
        key: "date",
        label: "Date",
        width: 95,
        render: (transaction) => formatDate(transaction.date),
      },
      {
        key: "type",
        label: "Movement",
        width: 100,
        render: (transaction) => transaction.type,
      },
      {
        key: "quantity",
        label: "Quantity",
        width: 110,
        render: (transaction) =>
          `${transaction.type === "Received" ? "+" : "−"}${transaction.quantity} ${transaction.unit}`,
      },
      {
        key: "reference",
        label: "Reference",
        width: 120,
        render: (transaction) => transaction.reference,
      },
      {
        key: "activity",
        label: "Activity / destination",
        width: 190,
        render: (transaction) => transaction.activity,
      },
      {
        key: "remarks",
        label: "Remarks",
        width: 235,
        render: (transaction) => transaction.remarks,
      },
    ],
    [],
  );

  const resetForm = () => {
    setType("Received");
    setMaterialId("");
    setQuantity("");
    setDate(toIsoDate(new Date()));
    setReference("");
    setActivity("");
    setRemarks("");
    setShowForm(false);
  };

  const submit = () => {
    const quantityValue = Number(quantity);
    if (!materialId || !Number.isFinite(quantityValue) || quantityValue <= 0) {
      dialog.show(
        "Material and quantity required",
        "Select a material and enter a quantity greater than zero.",
      );
      return;
    }
    if (!reference.trim() || !activity.trim() || !remarks.trim()) {
      dialog.show(
        "Movement details required",
        "Add the reference, activity or destination, and remarks.",
      );
      return;
    }
    if (
      type !== "Received" &&
      quantityValue > (selectedBalance?.available ?? 0)
    ) {
      dialog.show(
        "Insufficient stock",
        `Only ${selectedBalance?.available ?? 0} ${selectedBalance?.unit ?? "units"} are available.`,
      );
      return;
    }
    if (!selectedMaterial || !selectedUnit) {
      dialog.show(
        "Material unavailable",
        "Select a configured material and unit.",
      );
      return;
    }

    onAddTransaction({
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      unit: selectedUnit.symbol,
      type,
      quantity: quantityValue,
      date,
      reference: reference.trim(),
      activity: activity.trim(),
      remarks: remarks.trim(),
    });
    dialog.show(
      "Movement saved",
      "Site stock and transaction history were updated.",
    );
    setSelectedMaterialId(selectedMaterial.id);
    resetForm();
  };

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.count}>{balances.length}</Text>
          <Text style={styles.muted}>Tracked materials</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={onRequestMaterial}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <FontAwesome6 name="paper-plane" size={12} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Request</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowForm((current) => !current)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <FontAwesome6
              name={showForm ? "xmark" : "plus"}
              size={13}
              color={colors.white}
            />
            <Text style={styles.addButtonText}>
              {showForm ? "Cancel" : "Movement"}
            </Text>
          </Pressable>
        </View>
      </View>

      {showForm ? (
        <Surface style={styles.formCard}>
          <View style={styles.formHeading}>
            <FontAwesome6
              name="boxes-stacked"
              size={15}
              color={colors.primary}
            />
            <Text style={styles.formTitle}>Record stock movement</Text>
          </View>
          <LabeledDropdown
            label="MOVEMENT TYPE"
            value={type}
            options={transactionTypes}
            onChange={(value) => {
              setType(value as InventoryTransactionType);
              setActivity("");
            }}
          />
          <LabeledDropdown
            label="MATERIAL"
            value={materialId}
            placeholder="Select material"
            options={materials.map((material) => ({
              label: material.name,
              value: material.id,
            }))}
            onChange={setMaterialId}
          />
          {selectedBalance ? (
            <Text style={styles.availableText}>
              Available: {selectedBalance.available} {selectedBalance.unit}
            </Text>
          ) : null}
          <View style={styles.splitRow}>
            <View style={styles.splitField}>
              <Field
                label="QUANTITY"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.splitField}>
              <Text style={styles.label}>DATE</Text>
              <DatePickerField value={date} onChange={setDate} />
            </View>
          </View>
          <Field
            label="REFERENCE"
            value={reference}
            onChangeText={setReference}
            placeholder={referencePlaceholder(type)}
          />
          {type === "Used" && taskOptions.length > 0 ? (
            <LabeledDropdown
              label="TASK / ACTIVITY"
              value={activity}
              placeholder="Select task"
              options={taskOptions}
              onChange={setActivity}
            />
          ) : (
            <Field
              label={activityLabel(type)}
              value={activity}
              onChangeText={setActivity}
              placeholder={activityPlaceholder(type)}
            />
          )}
          <Field
            label="REMARKS"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Add movement details"
            multiline
            style={[styles.field, styles.remarksField]}
          />
          <PrimaryButton
            label="Save movement"
            icon="circle-check"
            onPress={submit}
          />
        </Surface>
      ) : null}

      <View style={styles.stockList}>
        {balances.map((balance) => {
          const selected = selectedMaterialId === balance.materialId;
          const status =
            balance.available <= 0
              ? "Out of stock"
              : balance.available < 10
                ? "Low stock"
                : "Available";
          return (
            <Surface key={balance.materialId} style={styles.stockCard}>
              <Pressable
                onPress={() =>
                  setSelectedMaterialId(selected ? null : balance.materialId)
                }
                style={({ pressed }) => [
                  styles.stockRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.stockIcon}>
                  <FontAwesome6 name="cubes" size={16} color={colors.primary} />
                </View>
                <View style={styles.stockCopy}>
                  <Text style={styles.stockName}>{balance.materialName}</Text>
                  <Text style={styles.stockQuantity}>
                    {balance.available} {balance.unit} available ·{" "}
                    {balance.transactionCount} movements
                  </Text>
                </View>
                <View style={styles.stockStatus}>
                  <StatusPill label={status} />
                  <FontAwesome6
                    name={selected ? "chevron-up" : "chevron-down"}
                    size={11}
                    color={colors.inkMuted}
                  />
                </View>
              </Pressable>
              {selected ? (
                <View style={styles.cardHistory}>
                  <DataTable
                    title={`${balance.materialName} history`}
                    columns={historyColumns}
                    rows={visibleTransactions}
                    rowKey={(transaction) => transaction.id}
                  />
                </View>
              ) : null}
            </Surface>
          );
        })}
      </View>
    </>
  );
}

function referencePlaceholder(type: InventoryTransactionType) {
  if (type === "Received") return "Challan or receipt number";
  if (type === "Used") return "Task or issue reference";
  if (type === "Transferred") return "Transfer reference";
  if (type === "Returned") return "Return reference";
  return "Damage or wastage reference";
}

function activityLabel(type: InventoryTransactionType) {
  if (type === "Transferred") return "DESTINATION SITE / WAREHOUSE";
  if (type === "Returned") return "RETURNED TO";
  if (type === "Received") return "SOURCE / VENDOR";
  if (type === "Damaged") return "DAMAGE REASON";
  return "TASK / ACTIVITY";
}

function activityPlaceholder(type: InventoryTransactionType) {
  if (type === "Transferred") return "Enter destination";
  if (type === "Returned") return "Warehouse or vendor";
  if (type === "Received") return "Warehouse or vendor name";
  if (type === "Damaged") return "Breakage, leakage, or wastage";
  return "Work activity";
}

function Field({
  label,
  style,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={style ?? styles.field}
        placeholderTextColor="#969E9B"
      />
    </View>
  );
}

function LabeledDropdown({
  label,
  placeholder = "Select option",
  ...props
}: Omit<React.ComponentProps<typeof DropdownField>, "placeholder"> & {
  label: string;
  placeholder?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <DropdownField placeholder={placeholder} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  count: { color: colors.ink, fontSize: 25, fontWeight: "800" },
  muted: { color: colors.inkMuted, fontSize: 11, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 7 },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  addButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addButtonText: { color: colors.white, fontSize: 10, fontWeight: "700" },
  pressed: { opacity: 0.7 },
  formCard: { padding: 15, gap: 14, marginBottom: 16 },
  formHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  formTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  fieldWrap: { gap: 7 },
  label: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  field: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 12,
    paddingHorizontal: 14,
  },
  remarksField: { minHeight: 80, paddingTop: 13, textAlignVertical: "top" },
  availableText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "700",
    marginTop: -7,
  },
  splitRow: { flexDirection: "row", gap: 10 },
  splitField: { flex: 1 },
  stockList: { gap: 10, marginBottom: 20 },
  stockCard: { overflow: "hidden" },
  stockRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  stockIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  stockCopy: { flex: 1 },
  stockName: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  stockQuantity: { color: colors.inkMuted, fontSize: 9, marginTop: 5 },
  stockStatus: { alignItems: "flex-end", gap: 8 },
  cardHistory: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 9,
  },
});
