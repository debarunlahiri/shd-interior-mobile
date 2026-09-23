import { UserRole } from "../types/roles";

export type DemoAccount = {
  id: string;
  phoneNumber: string;
  role: UserRole;
  name: string;
  permissions: string[];
  assignedProjects: {
    id: string;
    name: string;
    sites: { id: string; name: string; location: string }[];
  }[];
};

export const DEMO_OTP = "123456";

export const demoAccounts: readonly DemoAccount[] = [
  {
    id: "USR-ADMIN-001",
    phoneNumber: "9000000001",
    role: "Admin",
    name: "Company Admin",
    permissions: ["manage_company", "review_work", "manage_finance"],
    assignedProjects: [],
  },
  {
    id: "USR-SUP-001",
    phoneNumber: "9000000002",
    role: "Supervisor",
    name: "Arjun Kumar",
    permissions: ["manage_site", "submit_records", "view_assigned_work"],
    assignedProjects: [
      {
        id: "PRJ-001",
        name: "Palm Grove Residence",
        sites: [
          {
            id: "SITE-018",
            name: "Villa 18",
            location: "Gurugram, Haryana",
          },
        ],
      },
    ],
  },
  {
    id: "USR-VEN-001",
    phoneNumber: "9000000003",
    role: "Vendor",
    name: "Approved Vendor",
    permissions: ["view_purchase_orders", "manage_deliveries"],
    assignedProjects: [],
  },
];

export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function getDemoAccount(value: string) {
  const phoneNumber = normalizePhoneNumber(value);
  return demoAccounts.find((account) => account.phoneNumber === phoneNumber);
}
