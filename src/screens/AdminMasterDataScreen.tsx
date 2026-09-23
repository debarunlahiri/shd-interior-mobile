import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DropdownField } from "../components/DropdownField";
import { useAppDialog } from "../components/AppDialog";
import { PrimaryButton } from "../components/ui";
import {
  AdminMasters,
  ManagedMaterial,
  ManagedUnit,
  ManagedUser,
  ManagedUserRole,
  ManagedVendor,
} from "../hooks/useAdminMasters";
import { colors, radius } from "../theme";
import { FontAwesomeIcon } from "../types/icons";

type SectionName = "Users" | "Vendors" | "Materials" | "Units";

const sections: { name: SectionName; icon: FontAwesomeIcon }[] = [
  { name: "Users", icon: "users" },
  { name: "Vendors", icon: "truck-field" },
  { name: "Materials", icon: "cubes" },
  { name: "Units", icon: "ruler" },
];

type Props = {
  masters: AdminMasters;
  onBack: () => void;
  onAddUser: (input: Omit<ManagedUser, "id" | "createdAt">) => void;
  onAddVendor: (input: Omit<ManagedVendor, "id" | "createdAt">) => void;
  onAddMaterial: (input: Omit<ManagedMaterial, "id" | "createdAt">) => void;
  onAddUnit: (input: Omit<ManagedUnit, "id" | "createdAt">) => void;
};

export function AdminMasterDataScreen(props: Props) {
  const [section, setSection] = useState<SectionName>("Users");

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Workspace"
          hitSlop={8}
          onPress={props.onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <FontAwesome6 name="arrow-left" size={17} color={colors.primary} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Users & master data</Text>
          <Text style={styles.subtitle}>
            Manage people, vendors, materials, and units
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {sections.map((item) => (
          <Pressable
            key={item.name}
            onPress={() => setSection(item.name)}
            style={[styles.tab, section === item.name && styles.tabActive]}
          >
            <FontAwesome6
              name={item.icon}
              size={13}
              color={section === item.name ? colors.white : colors.inkMuted}
            />
            <Text
              style={[
                styles.tabText,
                section === item.name && styles.tabTextActive,
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {section === "Users" ? <UsersSection {...props} /> : null}
        {section === "Vendors" ? <VendorsSection {...props} /> : null}
        {section === "Materials" ? <MaterialsSection {...props} /> : null}
        {section === "Units" ? <UnitsSection {...props} /> : null}
      </ScrollView>
    </View>
  );
}

function UsersSection({ masters, onAddUser }: Props) {
  const dialog = useAppDialog();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<ManagedUserRole>("Supervisor");

  const submit = () => {
    if (!name.trim() || !identifier.trim()) {
      dialog.show(
        "Details required",
        "Enter the user's name and username or email.",
      );
      return;
    }
    if (
      masters.users.some(
        (user) =>
          user.identifier.toLowerCase() === identifier.trim().toLowerCase(),
      )
    ) {
      dialog.show("User already exists", "Use a different username or email.");
      return;
    }
    onAddUser({ name: name.trim(), identifier: identifier.trim(), role });
    setName("");
    setIdentifier("");
    setRole("Supervisor");
    dialog.show("User added", "The user was saved locally.");
  };

  return (
    <>
      <FormCard title="Add user" icon="user-plus">
        <Field
          label="FULL NAME"
          value={name}
          onChangeText={setName}
          placeholder="Full name"
        />
        <Field
          label="USERNAME OR EMAIL"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Username or email"
          autoCapitalize="none"
        />
        <LabeledDropdown
          label="ROLE"
          value={role}
          options={["Supervisor", "Admin", "Other"]}
          onChange={(value) => setRole(value as ManagedUserRole)}
        />
        <PrimaryButton label="Add user" icon="user-plus" onPress={submit} />
      </FormCard>
      <RecordList
        title="Users"
        records={masters.users.map((user) => ({
          id: user.id,
          title: user.name,
          meta: `${user.role} · ${user.identifier}`,
          icon: "user",
        }))}
      />
    </>
  );
}

function VendorsSection({ masters, onAddVendor }: Props) {
  const dialog = useAppDialog();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = () => {
    if (!companyName.trim() || !contactName.trim() || !phone.trim()) {
      dialog.show(
        "Details required",
        "Enter the company, contact person, and phone number.",
      );
      return;
    }
    onAddVendor({
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
    });
    setCompanyName("");
    setContactName("");
    setPhone("");
    dialog.show("Vendor added", "The vendor was saved locally.");
  };

  return (
    <>
      <FormCard title="Add vendor" icon="truck-field">
        <Field
          label="COMPANY NAME"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Vendor company"
        />
        <Field
          label="CONTACT PERSON"
          value={contactName}
          onChangeText={setContactName}
          placeholder="Contact name"
        />
        <Field
          label="PHONE"
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />
        <PrimaryButton label="Add vendor" icon="plus" onPress={submit} />
      </FormCard>
      <RecordList
        title="Vendors"
        records={masters.vendors.map((vendor) => ({
          id: vendor.id,
          title: vendor.companyName,
          meta: `${vendor.contactName} · ${vendor.phone}`,
          icon: "truck-field",
        }))}
      />
    </>
  );
}

function MaterialsSection({ masters, onAddMaterial }: Props) {
  const dialog = useAppDialog();
  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState("");
  const unitOptions = masters.units.map((unit) => ({
    label: `${unit.name} (${unit.symbol})`,
    value: unit.id,
  }));

  const submit = () => {
    if (!name.trim() || !unitId) {
      dialog.show(
        "Details required",
        "Enter a material name and select its default unit.",
      );
      return;
    }
    onAddMaterial({ name: name.trim(), unitId });
    setName("");
    setUnitId("");
    dialog.show("Material added", "The material was saved locally.");
  };

  return (
    <>
      <FormCard title="Add material" icon="cubes">
        <Field
          label="MATERIAL NAME"
          value={name}
          onChangeText={setName}
          placeholder="Material name"
        />
        <LabeledDropdown
          label="DEFAULT UNIT"
          value={unitId}
          placeholder="Select unit"
          options={unitOptions}
          onChange={setUnitId}
        />
        {masters.units.length === 0 ? (
          <Text style={styles.helper}>
            Add a unit before creating materials.
          </Text>
        ) : null}
        <PrimaryButton label="Add material" icon="plus" onPress={submit} />
      </FormCard>
      <RecordList
        title="Materials"
        records={masters.materials.map((material) => {
          const unit = masters.units.find(
            (item) => item.id === material.unitId,
          );
          return {
            id: material.id,
            title: material.name,
            meta: unit ? `${unit.name} · ${unit.symbol}` : "Unit unavailable",
            icon: "cube",
          };
        })}
      />
    </>
  );
}

function UnitsSection({ masters, onAddUnit }: Props) {
  const dialog = useAppDialog();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  const submit = () => {
    if (!name.trim() || !symbol.trim()) {
      dialog.show("Details required", "Enter the unit name and symbol.");
      return;
    }
    if (
      masters.units.some(
        (unit) =>
          unit.name.toLowerCase() === name.trim().toLowerCase() ||
          unit.symbol.toLowerCase() === symbol.trim().toLowerCase(),
      )
    ) {
      dialog.show(
        "Unit already exists",
        "Use a different unit name and symbol.",
      );
      return;
    }
    onAddUnit({ name: name.trim(), symbol: symbol.trim() });
    setName("");
    setSymbol("");
    dialog.show(
      "Unit added",
      "The unit is now available when adding materials.",
    );
  };

  return (
    <>
      <FormCard title="Add unit" icon="ruler">
        <Field
          label="UNIT NAME"
          value={name}
          onChangeText={setName}
          placeholder="For example, Kilogram"
        />
        <Field
          label="SYMBOL"
          value={symbol}
          onChangeText={setSymbol}
          placeholder="For example, kg"
          autoCapitalize="none"
        />
        <PrimaryButton label="Add unit" icon="plus" onPress={submit} />
      </FormCard>
      <RecordList
        title="Units"
        records={masters.units.map((unit) => ({
          id: unit.id,
          title: unit.name,
          meta: unit.symbol,
          icon: "ruler",
        }))}
      />
    </>
  );
}

function FormCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: FontAwesomeIcon;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.formCard}>
      <View style={styles.formTitleRow}>
        <FontAwesome6 name={icon} size={15} color={colors.primary} />
        <Text style={styles.formTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.field}
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

function RecordList({
  title,
  records,
}: {
  title: string;
  records: { id: string; title: string; meta: string; icon: FontAwesomeIcon }[];
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>
        {title.toUpperCase()} · {records.length}
      </Text>
      <View style={styles.listCard}>
        {records.map((record, index) => (
          <View
            key={record.id}
            style={[styles.record, index > 0 && styles.recordBorder]}
          >
            <View style={styles.recordIcon}>
              <FontAwesome6
                name={record.icon}
                size={14}
                color={colors.primary}
              />
            </View>
            <View style={styles.recordCopy}>
              <Text style={styles.recordTitle}>{record.title}</Text>
              <Text style={styles.recordMeta}>{record.meta}</Text>
            </View>
            <Text style={styles.recordId}>{record.id}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: { opacity: 0.65 },
  headerCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 23, fontWeight: "800" },
  subtitle: { color: colors.inkMuted, fontSize: 10, marginTop: 3 },
  tabsScroll: { flexGrow: 0 },
  tabs: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  tab: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.inkMuted, fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 112, gap: 18 },
  formCard: {
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 14,
  },
  formTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  formTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  fieldWrap: { gap: 7 },
  label: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  field: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 13,
    paddingHorizontal: 14,
  },
  helper: { color: colors.warning, fontSize: 10 },
  listSection: { gap: 9 },
  listTitle: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  listCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  record: {
    minHeight: 66,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recordBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  recordIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  recordCopy: { flex: 1 },
  recordTitle: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  recordMeta: { color: colors.inkMuted, fontSize: 9, marginTop: 4 },
  recordId: { color: colors.inkMuted, fontSize: 8, fontWeight: "700" },
});
