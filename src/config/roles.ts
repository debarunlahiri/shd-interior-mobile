import { FontAwesomeIcon } from "../types/icons";
import { TabName } from "../types/navigation";
import { UserRole } from "../types/roles";
import { TranslationKey } from "../localization";

export type RoleTab = {
  key: TabName;
  labelKey: TranslationKey;
  icon: FontAwesomeIcon;
};

export const roleTabs: Record<UserRole, RoleTab[]> = {
  Supervisor: [
    { key: "Home", labelKey: "common.home", icon: "house" },
    { key: "Tasks", labelKey: "common.tasks", icon: "list-check" },
    { key: "Site", labelKey: "common.site", icon: "building" },
    { key: "More", labelKey: "common.more", icon: "grip" },
  ],
  Admin: [
    {
      key: "AdminDashboard",
      labelKey: "common.dashboard",
      icon: "chart-line",
    },
    { key: "Projects", labelKey: "common.projects", icon: "building" },
    {
      key: "Approvals",
      labelKey: "common.approvals",
      icon: "clipboard-check",
    },
    { key: "More", labelKey: "common.more", icon: "grip" },
  ],
  Vendor: [
    { key: "VendorHome", labelKey: "common.home", icon: "house" },
    { key: "Orders", labelKey: "common.orders", icon: "file-invoice" },
    {
      key: "Deliveries",
      labelKey: "common.deliveries",
      icon: "truck",
    },
    { key: "More", labelKey: "common.more", icon: "grip" },
  ],
};

export const defaultTabForRole: Record<UserRole, TabName> = {
  Supervisor: "Home",
  Admin: "AdminDashboard",
  Vendor: "VendorHome",
};
