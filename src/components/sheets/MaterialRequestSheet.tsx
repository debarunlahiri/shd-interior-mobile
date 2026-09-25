import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  MaterialRequest,
  MaterialRequestInput,
  MaterialRequestStatus,
} from "../../hooks/useMaterialRequests";
import { ManagedMaterial, ManagedUnit } from "../../hooks/useAdminMasters";
import { colors } from "../../theme";
import { formatDate, formatDateTime, toIsoDate } from "../../utils/date";
import { DatePickerField } from "../DatePickerField";
import { useAppDialog } from "../AppDialog";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, StatusPill, Surface } from "../ui";
import { sheetStyles } from "./styles";

type MaterialView = "New request" | "Requests";

const requestStatuses: MaterialRequestStatus[] = [
  "Submitted",
  "Approved",
  "Rejected",
  "Partially Approved",
  "Allocated",
  "Purchased",
  "Dispatched",
  "Received",
];

export function MaterialRequestSheet({
  requests,
  onSubmit,
  onConfirmReceived,
  materials,
  units,
}: {
  requests: MaterialRequest[];
  onSubmit: (input: MaterialRequestInput) => void;
  onConfirmReceived: (requestId: string) => void;
  materials: ManagedMaterial[];
  units: ManagedUnit[];
}) {
  const dialog = useAppDialog();
  const [view, setView] = useState<MaterialView>("New request");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const selectedRequest = requests.find(
    (request) => request.id === selectedRequestId,
  );
  const filteredRequests = requests.filter(
    (request) =>
      statusFilter === "All statuses" || request.status === statusFilter,
  );

  const submit = () => {
    const quantityValue = Number(quantity);
    if (
      !material ||
      !unit ||
      !Number.isFinite(quantityValue) ||
      quantityValue <= 0
    ) {
      dialog.show(
        "Material details required",
        "Select a material and unit, then enter a valid quantity.",
      );
      return;
    }
    if (!requiredDate) {
      dialog.show(
        "Required date needed",
        "Select the date when this material is required.",
      );
      return;
    }
    if (!purpose.trim() || !remarks.trim()) {
      dialog.show(
        "Request details required",
        "Add the purpose and Supervisor remarks.",
      );
      return;
    }
    onSubmit({
      material,
      quantity: quantityValue,
      unit,
      requiredDate,
      purpose: purpose.trim(),
      remarks: remarks.trim(),
    });
    setMaterial("");
    setQuantity("");
    setUnit("");
    setRequiredDate("");
    setPurpose("");
    setRemarks("");
    setView("Requests");
    dialog.show("Request submitted", "The material request was saved locally.");
  };

  return (
    <ScrollView
      contentContainerStyle={sheetStyles.form}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sheetStyles.context}>
        <FontAwesome6 name="boxes-stacked" size={17} color={colors.primary} />
        <View>
          <Text style={sheetStyles.contextLabel}>PALM GROVE RESIDENCE</Text>
          <Text style={sheetStyles.contextValue}>
            Villa 18 · Supervisor requests
          </Text>
        </View>
      </View>
      <View style={sheetStyles.sheetTabs}>
        {(["New request", "Requests"] as MaterialView[]).map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setView(item);
              setSelectedRequestId(null);
            }}
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
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {view === "New request" ? (
        <>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>MATERIAL</Text>
            <DropdownField
              value={material}
              placeholder="Select material"
              options={materials.map((item) => item.name)}
              onChange={(value) => {
                setMaterial(value);
                const selectedMaterial = materials.find(
                  (item) => item.name === value,
                );
                const defaultUnit = units.find(
                  (item) => item.id === selectedMaterial?.unitId,
                );
                setUnit(defaultUnit?.symbol ?? "");
              }}
            />
          </View>
          <View style={sheetStyles.splitFields}>
            <View style={sheetStyles.splitField}>
              <Text style={sheetStyles.fieldLabel}>QUANTITY</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.placeholder}
                style={sheetStyles.field}
              />
            </View>
            <View style={sheetStyles.splitField}>
              <Text style={sheetStyles.fieldLabel}>UNIT</Text>
              <DropdownField
                value={unit}
                placeholder="Select unit"
                options={units.map((item) => ({
                  label: `${item.name} (${item.symbol})`,
                  value: item.symbol,
                }))}
                onChange={setUnit}
              />
            </View>
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>REQUIRED DATE</Text>
            <DatePickerField
              value={requiredDate}
              onChange={setRequiredDate}
              minimumDate={toIsoDate(new Date())}
            />
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>PURPOSE</Text>
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Work activity where the material is needed"
              placeholderTextColor={colors.placeholder}
              style={[sheetStyles.field, sheetStyles.fieldLarge]}
              multiline
            />
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>SUPERVISOR REMARKS</Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Stock position, urgency, or delivery note"
              placeholderTextColor={colors.placeholder}
              style={[sheetStyles.field, sheetStyles.fieldLarge]}
              multiline
            />
          </View>
          <PrimaryButton
            label="Submit material request"
            icon="paper-plane"
            onPress={submit}
          />
        </>
      ) : selectedRequest ? (
        <RequestDetail
          request={selectedRequest}
          onBack={() => setSelectedRequestId(null)}
          onConfirmReceived={() => {
            onConfirmReceived(selectedRequest.id);
            dialog.show(
              "Receipt confirmed",
              "The request status and history were updated locally.",
            );
          }}
        />
      ) : (
        <>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>FILTER REQUESTS</Text>
            <DropdownField
              value={statusFilter}
              placeholder="Filter by status"
              options={["All statuses", ...requestStatuses]}
              onChange={setStatusFilter}
            />
          </View>
          <View style={sheetStyles.requestList}>
            {filteredRequests.map((request) => (
              <Pressable
                key={request.id}
                onPress={() => setSelectedRequestId(request.id)}
              >
                <Surface style={sheetStyles.requestCard}>
                  <View style={sheetStyles.requestCardTop}>
                    <View style={sheetStyles.flexNoMargin}>
                      <Text style={sheetStyles.itemTitle}>
                        {request.material}
                      </Text>
                      <Text style={sheetStyles.itemMeta}>
                        {request.id} · Required{" "}
                        {formatDate(request.requiredDate)}
                      </Text>
                    </View>
                    <StatusPill label={request.status} />
                  </View>
                  <Text style={sheetStyles.requestQuantity}>
                    {request.quantity} {request.unit}
                  </Text>
                  <View style={sheetStyles.requestCardFooter}>
                    <Text style={sheetStyles.reportMeta} numberOfLines={1}>
                      {request.purpose}
                    </Text>
                    <FontAwesome6
                      name="chevron-right"
                      size={12}
                      color={colors.inkMuted}
                    />
                  </View>
                </Surface>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function RequestDetail({
  request,
  onBack,
  onConfirmReceived,
}: {
  request: MaterialRequest;
  onBack: () => void;
  onConfirmReceived: () => void;
}) {
  return (
    <View style={sheetStyles.requestDetail}>
      <Pressable style={sheetStyles.backAction} onPress={onBack}>
        <FontAwesome6 name="arrow-left" size={13} color={colors.primary} />
        <Text style={sheetStyles.backActionText}>All requests</Text>
      </Pressable>
      <Surface style={sheetStyles.requestCard}>
        <View style={sheetStyles.requestCardTop}>
          <View style={sheetStyles.flexNoMargin}>
            <Text style={sheetStyles.requestDetailTitle}>
              {request.material}
            </Text>
            <Text style={sheetStyles.itemMeta}>{request.id}</Text>
          </View>
          <StatusPill label={request.status} />
        </View>
        <View style={sheetStyles.detailGrid}>
          <Detail
            label="Quantity"
            value={`${request.quantity} ${request.unit}`}
          />
          <Detail
            label="Required by"
            value={formatDate(request.requiredDate)}
          />
          <Detail label="Project" value={request.project} />
          <Detail label="Site" value={request.site} />
        </View>
        <Detail label="Purpose" value={request.purpose} />
        <Detail label="Remarks" value={request.remarks} />
      </Surface>
      {request.status === "Dispatched" ? (
        <PrimaryButton
          label="Confirm material received"
          icon="circle-check"
          onPress={onConfirmReceived}
        />
      ) : null}
      <Text style={sheetStyles.fieldLabel}>STATUS HISTORY</Text>
      <View style={sheetStyles.historySection}>
        {request.history.map((entry, index) => (
          <View key={entry.id} style={sheetStyles.historyRow}>
            <View style={sheetStyles.timelineColumn}>
              <View style={sheetStyles.timelineDot} />
              {index < request.history.length - 1 ? (
                <View style={sheetStyles.timelineLine} />
              ) : null}
            </View>
            <View style={sheetStyles.historyBody}>
              <View style={sheetStyles.historyTop}>
                <StatusPill label={entry.status} />
                <Text style={sheetStyles.historyDate}>
                  {formatDateTime(entry.createdAt)}
                </Text>
              </View>
              <Text style={sheetStyles.historyRemark}>{entry.note}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={sheetStyles.detailItem}>
      <Text style={sheetStyles.infoLabel}>{label}</Text>
      <Text style={sheetStyles.infoValue}>{value}</Text>
    </View>
  );
}
