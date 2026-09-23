import { UserRole } from "../types/roles";

export type DemoAccount = {
  phoneNumber: string;
  role: UserRole;
  name: string;
};

export const DEMO_OTP = "123456";

export const demoAccounts: readonly DemoAccount[] = [
  {
    phoneNumber: "9000000001",
    role: "Admin",
    name: "Company Admin",
  },
  {
    phoneNumber: "9000000002",
    role: "Supervisor",
    name: "Site Supervisor",
  },
  {
    phoneNumber: "9000000003",
    role: "Vendor",
    name: "Approved Vendor",
  },
];

export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function getDemoAccount(value: string) {
  const phoneNumber = normalizePhoneNumber(value);
  return demoAccounts.find((account) => account.phoneNumber === phoneNumber);
}
