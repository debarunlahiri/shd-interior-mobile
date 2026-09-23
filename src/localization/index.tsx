import { createContext, ReactNode, useContext, useMemo } from "react";

const en = {
  "app.name": "SHD Interior",
  "auth.brandSubtitle": "Sign in to access your workspace",
  "auth.welcome": "Welcome back",
  "auth.verifyNumber": "Verify your number",
  "auth.enterRegisteredPhone": "Enter your registered phone number",
  "auth.enterOtpSent": "Enter the OTP sent to {phone}",
  "auth.phoneNumber": "PHONE NUMBER",
  "auth.phonePlaceholder": "Enter phone number",
  "auth.change": "Change",
  "auth.otp": "ONE-TIME PASSWORD",
  "auth.otpAccessibility": "{length}-digit one-time password",
  "auth.otpMissing": "Didn’t receive the OTP?",
  "auth.resendOtp": "Resend OTP",
  "auth.sendOtp": "Send OTP",
  "auth.verifyAndSignIn": "Verify and sign in",
  "auth.invalidPhone": "Enter a valid 10-digit phone number.",
  "auth.unregisteredPhone": "This phone number is not registered.",
  "auth.invalidOtpLength": "Enter the 6-digit OTP.",
  "auth.incorrectOtp": "The OTP is incorrect. Please try again.",
  "auth.verifyFailed": "Unable to verify the OTP. Please try again.",
  "common.ok": "OK",
  "common.cancel": "Cancel",
  "common.done": "Done",
  "common.selectDate": "Select date",
  "common.selectedDate": "Selected date {date}",
  "common.home": "Home",
  "common.tasks": "Tasks",
  "common.site": "Site",
  "common.more": "More",
  "common.dashboard": "Dashboard",
  "common.projects": "Projects",
  "common.approvals": "Approvals",
  "common.orders": "Orders",
  "common.deliveries": "Deliveries",
  "common.signOut": "Sign out",
  "common.signOutQuestion": "Sign out?",
  "common.signOutMessage": "You will return to the login screen.",
  "attachment.add": "Add photo or document",
  "attachment.permissionTitle": "Photo permission needed",
  "attachment.permissionMessage": "Allow photo access to attach site evidence.",
  "attachment.siteMedia": "Site media attached",
  "attachment.dialogTitle": "Add attachment",
  "attachment.dialogMessage": "Choose an attachment source",
  "attachment.photoVideo": "Photo or video",
  "attachment.document": "Document",
  "attachment.replace": "Tap to replace attachment",
  "attachment.images": "JPG or PNG",
  "attachment.videos": "MP4 or compatible video",
  "attachment.media": "JPG, PNG or MP4",
  "attachment.all": "JPG, PNG, MP4 or PDF",
  "progress.snapHint": "Snaps in 5% steps",
  "progress.setAccessibility": "Set progress to {value}%",
  "workspace.title": "Workspace",
  "workspace.toolsAccount": "{role} tools and account",
  "workspace.siteOperations": "Site operations",
  "workspace.management": "Management",
  "workspace.vendorOperations": "Vendor operations",
  "workspace.dailyReports": "Daily reports",
  "workspace.dailyReportsCopy": "Submit and view site reports",
  "workspace.expenses": "Expenses",
  "workspace.expensesCopy": "Site expenses and approvals",
  "workspace.cash": "Cash in hand",
  "workspace.cashCopy": "Calculated site cash balance",
  "workspace.attendance": "Attendance",
  "workspace.attendanceCopy": "Workers and site visits",
  "workspace.issues": "Issues & support",
  "workspace.issuesCopy": "Report and track site issues",
  "workspace.messages": "Messages",
  "workspace.supervisorMessagesCopy": "2 unread instructions",
  "workspace.documents": "Documents",
  "workspace.supervisorDocumentsCopy": "Drawings, bills and files",
  "workspace.masterData": "Users & master data",
  "workspace.masterDataCopy": "Supervisors, vendors, materials and units",
  "workspace.adminMessagesCopy": "Supervisor and vendor communication",
  "workspace.adminDocumentsCopy": "Project and company documents",
  "workspace.vendorMessagesCopy": "Communication with company Admin",
  "workspace.vendorDocumentsCopy": "Invoices, challans and files",
  "workspace.version": "SHD Interior · {role} app v1.0.0",
} as const;

const translations = { en } as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof en;
export type TranslationParams = Record<string, string | number>;
export type Translate = (
  key: TranslationKey,
  params?: TranslationParams,
) => string;

function createTranslate(locale: Locale): Translate {
  return (key, params) => {
    const template: string = translations[locale][key] ?? translations.en[key];
    if (!params) return template;

    return Object.entries(params).reduce<string>(
      (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
      template,
    );
  };
}

const LocalizationContext = createContext<{ locale: Locale; t: Translate }>({
  locale: "en",
  t: createTranslate("en"),
});

export function LocalizationProvider({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  const value = useMemo(
    () => ({ locale, t: createTranslate(locale) }),
    [locale],
  );
  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LocalizationContext);
}
