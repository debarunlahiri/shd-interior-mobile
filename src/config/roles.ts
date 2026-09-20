import { FontAwesomeIcon } from "../types/icons";
import { TabName } from "../types/navigation";
import { UserRole } from "../types/roles";

export type RoleTab = { key: TabName; label: string; icon: FontAwesomeIcon };

export const roleTabs: Record<UserRole, RoleTab[]> = {
  Supervisor: [
    { key: "Home", label: "Home", icon: "house" },
    { key: "Tasks", label: "Tasks", icon: "list-check" },
    { key: "Site", label: "Site", icon: "building" },
    { key: "More", label: "More", icon: "grip" },
  ],
  Admin: [
    { key: "AdminDashboard", label: "Dashboard", icon: "chart-line" },
    { key: "Projects", label: "Projects", icon: "building" },
    { key: "Approvals", label: "Approvals", icon: "clipboard-check" },
    { key: "More", label: "More", icon: "grip" },
  ],
  Vendor: [
    { key: "VendorHome", label: "Home", icon: "house" },
    { key: "Orders", label: "Orders", icon: "file-invoice" },
    { key: "Deliveries", label: "Deliveries", icon: "truck" },
    { key: "More", label: "More", icon: "grip" },
  ],
};

export const defaultTabForRole: Record<UserRole, TabName> = {
  Supervisor: "Home",
  Admin: "AdminDashboard",
  Vendor: "VendorHome",
};
