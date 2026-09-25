import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { FinanceRecord, FinanceRecordInput } from "../../hooks/useFinance";
import { colors } from "../../theme";
import { formatDate, toIsoDate } from "../../utils/date";
import { DatePickerField } from "../DatePickerField";
import { useAppDialog } from "../AppDialog";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { sheetStyles } from "./styles";

export function CashSheet({
  records,
  balance,
  onSubmit,
}: {
  records: FinanceRecord[];
  balance: number;
  onSubmit: (input: FinanceRecordInput) => void;
}) {
  const dialog = useAppDialog();
  const today = toIsoDate(new Date());
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const issued = records
    .filter((record) => record.kind === "Cash Issued")
    .reduce((total, record) => total + record.amount, 0);
  const used = records
    .filter(
      (record) =>
        (record.kind === "Expense" || record.kind === "Local Purchase") &&
        record.status === "Approved",
    )
    .reduce((total, record) => total + record.amount, 0);

  const returnCash = () => {
    const numericAmount = Number(amount);
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > balance ||
      !purpose.trim()
    ) {
      dialog.show(
        "Check return details",
        "Enter a purpose and an amount greater than zero that does not exceed the available balance.",
      );
      return;
    }
    onSubmit({
      kind: "Cash Returned",
      date,
      amount: numericAmount,
      reference: `RET-${Date.now()}`,
      purpose: purpose.trim(),
    });
    setAmount("");
    setPurpose("");
    dialog.show(
      "Cash return recorded",
      "The calculated balance has been updated.",
    );
  };

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.list}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient colors={["#173F35", "#255E4D"]} style={sheetStyles.cash}>
        <Text style={sheetStyles.cashLabel}>AVAILABLE CASH</Text>
        <Text style={sheetStyles.cashValue}>
          ₹{balance.toLocaleString("en-IN")}
        </Text>
        <Text style={sheetStyles.cashMeta}>
          ₹{issued.toLocaleString("en-IN")} issued · ₹
          {used.toLocaleString("en-IN")} approved usage
        </Text>
      </LinearGradient>

      <Surface style={sheetStyles.cashReturnCard}>
        <Text style={sheetStyles.listHeading}>RETURN CASH</Text>
        <View style={sheetStyles.fieldWrap}>
          <Text style={sheetStyles.fieldLabel}>DATE</Text>
          <DatePickerField
            value={date}
            onChange={setDate}
            maximumDate={today}
          />
        </View>
        <View style={sheetStyles.fieldWrap}>
          <Text style={sheetStyles.fieldLabel}>AMOUNT</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            style={sheetStyles.field}
            placeholder="₹ 0"
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={sheetStyles.fieldWrap}>
          <Text style={sheetStyles.fieldLabel}>PURPOSE</Text>
          <TextInput
            value={purpose}
            onChangeText={setPurpose}
            style={sheetStyles.field}
            placeholder="Reason for returning cash"
            placeholderTextColor={colors.placeholder}
          />
        </View>
        <PrimaryButton
          label="Record cash return"
          icon="rotate-left"
          onPress={returnCash}
        />
      </Surface>

      <Text style={sheetStyles.listHeading}>TRANSACTION LEDGER</Text>
      <View style={sheetStyles.requestList}>
        {records.map((record) => (
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
            <Text style={sheetStyles.financeAmount}>
              {record.kind === "Cash Issued" ? "+" : "−"}₹
              {record.amount.toLocaleString("en-IN")}
            </Text>
            <Text style={sheetStyles.itemMeta}>{record.kind}</Text>
          </Surface>
        ))}
      </View>
      <Text style={sheetStyles.note}>
        Balance is calculated from issued cash, approved expenses and purchases,
        and recorded returns.
      </Text>
    </ScrollView>
  );
}
