import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Delivery,
  DeliveryStatus,
  PurchaseOrder,
  PurchaseOrderStatus,
} from "../hooks/useProcurement";
import { colors, radius } from "../theme";
import { UserRole } from "../types/roles";
import { formatDate } from "../utils/date";
import { StatusPill } from "../components/ui";

export function ProcurementScreen({
  view,
  role,
  purchaseOrders,
  deliveries,
  onBack,
  onUpdateOrder,
  onUpdateDelivery,
}: {
  view: "Orders" | "Deliveries";
  role: Extract<UserRole, "Admin" | "Vendor">;
  purchaseOrders: PurchaseOrder[];
  deliveries: Delivery[];
  onBack: () => void;
  onUpdateOrder: (id: string, status: PurchaseOrderStatus) => void;
  onUpdateDelivery: (
    id: string,
    status: DeliveryStatus,
    challanReference?: string,
  ) => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <FontAwesome6 name="arrow-left" size={17} color={colors.primary} />
        </Pressable>
        <View style={styles.headerIcon}>
          <FontAwesome6
            name={view === "Orders" ? "file-invoice" : "truck"}
            size={19}
            color={colors.primary}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>
            {role === "Admin" ? `Procurement ${view.toLowerCase()}` : view}
          </Text>
          <Text style={styles.subtitle}>
            Shared local records for Admin, Supervisor, and Vendor
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {view === "Orders"
          ? purchaseOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                role={role}
                onUpdate={onUpdateOrder}
              />
            ))
          : deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                role={role}
                onUpdate={onUpdateDelivery}
              />
            ))}
        {(view === "Orders" ? purchaseOrders : deliveries).length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome6
              name={view === "Orders" ? "file-circle-xmark" : "truck"}
              size={24}
              color={colors.inkMuted}
            />
            <Text style={styles.emptyTitle}>No {view.toLowerCase()}</Text>
            <Text style={styles.emptyCopy}>
              Shared SQLite records will appear here when Admin creates them.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function OrderCard({
  order,
  role,
  onUpdate,
}: {
  order: PurchaseOrder;
  role: "Admin" | "Vendor";
  onUpdate: (id: string, status: PurchaseOrderStatus) => void;
}) {
  const next = nextOrderAction(order.status, role);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.reference}>{order.id}</Text>
          <Text style={styles.cardTitle}>{order.projectName}</Text>
          <Text style={styles.meta}>
            {order.siteName ?? "Central warehouse"} · {order.vendorName}
          </Text>
        </View>
        <StatusPill label={order.status} />
      </View>
      <View style={styles.detailRow}>
        <Detail label="Expected" value={formatDate(order.expectedDate)} />
        <Detail
          label="Amount"
          value={
            order.amount
              ? `₹${order.amount.toLocaleString("en-IN")}`
              : "To be priced"
          }
        />
        <Detail label="Request" value={order.materialRequestId ?? "Direct"} />
      </View>
      {next ? (
        <Pressable
          onPress={() => onUpdate(order.id, next.status)}
          style={styles.actionButton}
        >
          <FontAwesome6 name={next.icon} size={13} color={colors.white} />
          <Text style={styles.actionText}>{next.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function DeliveryCard({
  delivery,
  role,
  onUpdate,
}: {
  delivery: Delivery;
  role: "Admin" | "Vendor";
  onUpdate: (
    id: string,
    status: DeliveryStatus,
    challanReference?: string,
  ) => void;
}) {
  const next = nextDeliveryAction(delivery.status, role);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.reference}>{delivery.id}</Text>
          <Text style={styles.cardTitle}>{delivery.projectName}</Text>
          <Text style={styles.meta}>
            {delivery.siteName} · Order {delivery.purchaseOrderId}
          </Text>
        </View>
        <StatusPill label={delivery.status} />
      </View>
      <View style={styles.detailRow}>
        <Detail label="Scheduled" value={formatDate(delivery.scheduledDate)} />
        <Detail
          label="Challan"
          value={delivery.challanReference ?? "Not issued"}
        />
      </View>
      {next ? (
        <Pressable
          onPress={() =>
            onUpdate(
              delivery.id,
              next.status,
              next.status === "In Transit"
                ? `CH-${Date.now().toString().slice(-5)}`
                : undefined,
            )
          }
          style={styles.actionButton}
        >
          <FontAwesome6 name={next.icon} size={13} color={colors.white} />
          <Text style={styles.actionText}>{next.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function nextOrderAction(
  status: PurchaseOrderStatus,
  role: "Admin" | "Vendor",
) {
  if (role === "Admin" && status === "Draft") {
    return {
      status: "Approved" as const,
      label: "Approve order",
      icon: "check" as const,
    };
  }
  if (role === "Admin" && status === "Approved") {
    return {
      status: "Sent" as const,
      label: "Send to vendor",
      icon: "paper-plane" as const,
    };
  }
  return null;
}

function nextDeliveryAction(status: DeliveryStatus, role: "Admin" | "Vendor") {
  if (role === "Vendor" && status === "Scheduled") {
    return {
      status: "In Transit" as const,
      label: "Dispatch delivery",
      icon: "truck-fast" as const,
    };
  }
  if (role === "Vendor" && status === "In Transit") {
    return {
      status: "Delivered" as const,
      label: "Mark delivered",
      icon: "circle-check" as const,
    };
  }
  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: { backgroundColor: colors.surfaceMuted },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 23, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  content: { paddingHorizontal: 20, paddingBottom: 112, gap: 11 },
  card: {
    padding: 15,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardCopy: { flex: 1 },
  reference: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  meta: { color: colors.inkMuted, fontSize: 10, marginTop: 4 },
  detailRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  detail: {
    flex: 1,
    padding: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  detailLabel: {
    color: colors.inkMuted,
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  detailValue: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  actionButton: {
    minHeight: 42,
    marginTop: 13,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  actionText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  empty: {
    alignItems: "center",
    padding: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyCopy: {
    color: colors.inkMuted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 15,
    marginTop: 4,
  },
});
