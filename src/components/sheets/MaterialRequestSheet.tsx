import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  MaterialRequest,
  MaterialRequestInput,
  MaterialRequestStatus,
} from "../../hooks/useMaterialRequests";
import { colors } from "../../theme";
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
}: {
  requests: MaterialRequest[];
  onSubmit: (input: MaterialRequestInput) => void;
  onConfirmReceived: (requestId: string) => void;
}) {
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
      Alert.alert(
        "Material details required",
        "Select a material and unit, then enter a valid quantity.",
      );
      return;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(requiredDate) ||
      Number.isNaN(Date.parse(`${requiredDate}T00:00:00`))
    ) {
      Alert.alert(
        "Required date needed",
        "Enter the required date in YYYY-MM-DD format.",
      );
      return;
    }
    if (!purpose.trim() || !remarks.trim()) {
      Alert.alert(
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
    Alert.alert("Request submitted", "The material request was saved locally.");
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
              options={[
                "Gypsum board",
                "White cement",
                "Electrical wire",
                "Wall primer",
                "Other",
              ]}
              onChange={setMaterial}
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
                placeholderTextColor="#969E9B"
                style={sheetStyles.field}
              />
            </View>
            <View style={sheetStyles.splitField}>
              <Text style={sheetStyles.fieldLabel}>UNIT</Text>
              <DropdownField
                value={unit}
                placeholder="Select unit"
                options={["Bags", "Sheets", "Kilograms", "Litres", "Metres", "Pieces"]}
                onChange={setUnit}
              />
            </View>
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>REQUIRED DATE</Text>
            <TextInput
              value={requiredDate}
              onChangeText={setRequiredDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#969E9B"
              style={sheetStyles.field}
            />
          </View>
          <View style={sheetStyles.fieldWrap}>
            <Text style={sheetStyles.fieldLabel}>PURPOSE</Text>
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Work activity where the material is needed"
              placeholderTextColor="#969E9B"
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
              placeholderTextColor="#969E9B"
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
            Alert.alert(
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
                        {request.id} · Required {request.requiredDate}
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
            <Text style={sheetStyles.requestDetailTitle}>{request.material}</Text>
            <Text style={sheetStyles.itemMeta}>{request.id}</Text>
          </View>
          <StatusPill label={request.status} />
        </View>
        <View style={sheetStyles.detailGrid}>
          <Detail label="Quantity" value={`${request.quantity} ${request.unit}`} />
          <Detail label="Required by" value={request.requiredDate} />
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
                  {new Date(entry.createdAt).toLocaleString()}
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
