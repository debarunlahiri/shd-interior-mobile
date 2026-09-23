import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { FinanceRecord, FinanceRecordInput } from "../../hooks/useFinance";
import { ManagedMaterial, ManagedUnit } from "../../hooks/useAdminMasters";
import { colors } from "../../theme";
import { formatDate, toIsoDate } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DatePickerField } from "../DatePickerField";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { sheetStyles } from "./styles";

type ViewName = "Expense" | "Purchase" | "History";

export function ExpenseSheet({
  records,
  materials,
  units,
  onSubmit,
}: {
  records: FinanceRecord[];
  materials: ManagedMaterial[];
  units: ManagedUnit[];
  onSubmit: (input: FinanceRecordInput) => void;
}) {
  const dialog = useAppDialog();
  const today = toIsoDate(new Date());
  const [view, setView] = useState<ViewName>("Expense");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const clear = () => {
    setCategory("");
    setAmount("");
    setPaymentMethod("");
    setPaidTo("");
    setRemarks("");
    setReceiptName(null);
    setMaterial("");
    setQuantity("");
    setUnit("");
  };

  const submit = () => {
    const numericAmount = Number(amount);
    const numericQuantity = Number(quantity);
    const purchase = view === "Purchase";
    const missing = purchase
      ? !material || !unit || !paidTo.trim() || !paymentMethod || !receiptName
      : !category || !paidTo.trim() || !paymentMethod;
    if (
      missing ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      (purchase && (!Number.isFinite(numericQuantity) || numericQuantity <= 0))
    ) {
      dialog.show(
        "Details required",
        purchase
          ? "Complete the shop, material, quantity, amount, payment method, and receipt fields."
          : "Complete the category, amount, payment method, and paid-to fields.",
      );
      return;
    }

    onSubmit({
      kind: purchase ? "Local Purchase" : "Expense",
      date,
      amount: numericAmount,
      reference: `${purchase ? "PUR" : "EXP"}-${Date.now()}`,
      purpose: purchase ? `Local purchase · ${material}` : category,
      paymentMethod,
      category: purchase ? "Material" : category,
      paidTo: paidTo.trim(),
      material: purchase ? material : undefined,
      quantity: purchase ? numericQuantity : undefined,
      unit: purchase ? unit : undefined,
      remarks: remarks.trim() || undefined,
      receiptName: receiptName ?? undefined,
    });
    clear();
    setView("History");
    dialog.show(
      purchase ? "Purchase submitted" : "Expense submitted",
      "The record is pending Admin review and does not reduce cash until approved.",
    );
  };

  const submittedRecords = records.filter(
    (record) => record.kind === "Expense" || record.kind === "Local Purchase",
  );

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sheetStyles.sheetTabs}>
        {(["Expense", "Purchase", "History"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setView(item)}
            style={[
              sheetStyles.sheetTab,
              view === item && sheetStyles.sheetTabActive,
            ]}
          >
            <Text
              style={[
                sheetStyles.sheetTabText,
                view === item && sheetStyles.sheetTabTextActive,
              ]}
            >
              {item === "Purchase" ? "Local purchase" : item}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === "History" ? (
        <View style={sheetStyles.requestList}>
          {submittedRecords.map((record) => (
            <Surface key={record.id} style={sheetStyles.financeCard}>
              <View style={sheetStyles.requestCardTop}>
                <View style={sheetStyles.flexNoMargin}>
                  <Text style={sheetStyles.itemTitle}>{record.purpose}</Text>
                  <Text style={sheetStyles.itemMeta}>
                    {record.reference} · {formatDate(record.date)}
                  </Text>
                </View>
                <StatusPill label={record.status} />
              </View>
              <View style={sheetStyles.financeAmountRow}>
                <Text style={sheetStyles.financeAmount}>
                  ₹{record.amount.toLocaleString("en-IN")}
                </Text>
                <Text style={sheetStyles.itemMeta}>{record.paymentMethod}</Text>
              </View>
              <Text style={sheetStyles.itemMeta}>
                {record.kind} · {record.paidTo}
              </Text>
              {record.receiptName ? (
                <View style={sheetStyles.receiptPreview}>
                  <FontAwesome6
                    name="file-invoice"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={sheetStyles.receiptName} numberOfLines={1}>
                    {record.receiptName}
                  </Text>
                </View>
              ) : null}
            </Surface>
          ))}
          {submittedRecords.length === 0 ? (
            <Text style={sheetStyles.note}>No expenses submitted yet.</Text>
          ) : null}
        </View>
      ) : (
        <>
          <View style={sheetStyles.context}>
            <FontAwesome6
              name="location-dot"
              size={17}
              color={colors.primary}
            />
            <View>
              <Text style={sheetStyles.contextLabel}>PALM GROVE RESIDENCE</Text>
              <Text style={sheetStyles.contextValue}>
                Villa 18 · Active site
              </Text>
            </View>
          </View>
          <Field label="DATE">
            <DatePickerField
              value={date}
              onChange={setDate}
              maximumDate={today}
            />
          </Field>
          {view === "Expense" ? (
            <Field label="CATEGORY">
              <DropdownField
                value={category}
                placeholder="Select expense category"
                options={[
                  "Transport",
                  "Equipment",
                  "Labour",
                  "Food",
                  "Utility",
                  "Other",
                ]}
                onChange={setCategory}
              />
            </Field>
          ) : (
            <>
              <Field label="MATERIAL">
                <DropdownField
                  value={material}
                  placeholder="Select material"
                  options={materials.map((item) => item.name)}
                  onChange={setMaterial}
                />
              </Field>
              <View style={sheetStyles.splitFields}>
                <Field label="QUANTITY" split>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    style={sheetStyles.field}
                    placeholder="0"
                    placeholderTextColor="#969E9B"
                    keyboardType="decimal-pad"
                  />
                </Field>
                <Field label="UNIT" split>
                  <DropdownField
                    value={unit}
                    placeholder="Select unit"
                    options={units.map((item) => item.name)}
                    onChange={setUnit}
                  />
                </Field>
              </View>
            </>
          )}
          <View style={sheetStyles.splitFields}>
            <Field label="AMOUNT" split>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                style={sheetStyles.field}
                placeholder="₹ 0"
                placeholderTextColor="#969E9B"
                keyboardType="decimal-pad"
              />
            </Field>
            <Field label="PAYMENT METHOD" split>
              <DropdownField
                value={paymentMethod}
                placeholder="Select method"
                options={["Cash", "UPI", "Bank Transfer", "Card"]}
                onChange={setPaymentMethod}
              />
            </Field>
          </View>
          <Field label={view === "Purchase" ? "SHOP / VENDOR" : "PAID TO"}>
            <TextInput
              value={paidTo}
              onChangeText={setPaidTo}
              style={sheetStyles.field}
              placeholder={
                view === "Purchase"
                  ? "Shop or vendor name"
                  : "Vendor or person name"
              }
              placeholderTextColor="#969E9B"
            />
          </Field>
          <Field label="REMARKS">
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              style={[sheetStyles.field, sheetStyles.fieldLarge]}
              placeholder="Add purpose or notes"
              placeholderTextColor="#969E9B"
              multiline
            />
          </Field>
          <AttachmentPicker
            value={receiptName}
            onChange={setReceiptName}
            label={
              view === "Purchase"
                ? "Add purchase receipt"
                : "Add bill or receipt"
            }
          />
          <PrimaryButton
            label={
              view === "Purchase" ? "Submit local purchase" : "Submit expense"
            }
            icon="circle-check"
            onPress={submit}
          />
        </>
      )}
    </ScrollView>
  );
}

function Field({
  label,
  children,
  split = false,
}: {
  label: string;
  children: React.ReactNode;
  split?: boolean;
}) {
  return (
    <View style={split ? sheetStyles.splitField : sheetStyles.fieldWrap}>
      <Text style={sheetStyles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}
