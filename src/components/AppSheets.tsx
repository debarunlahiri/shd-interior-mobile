import { useState } from "react";
import { SiteProgressEntry, Task } from "../data";
import { AttendanceEntry, AttendanceEntryInput } from "../hooks/useAttendance";
import { ManagedMaterial, ManagedUnit } from "../hooks/useAdminMasters";
import { DailyReport, DailyReportInput } from "../hooks/useDailyReports";
import { FinanceRecord, FinanceRecordInput } from "../hooks/useFinance";
import { SiteIssue, SiteIssueInput } from "../hooks/useIssues";
import { AppNotification, Conversation } from "../hooks/useCommunications";
import { DocumentUploadInput, SiteDocument } from "../hooks/useDocuments";
import { SiteVisit, SiteVisitInput } from "../hooks/useSiteVisits";
import {
  MaterialRequest,
  MaterialRequestInput,
} from "../hooks/useMaterialRequests";
import { SiteProgressInput } from "../hooks/useSiteProgress";
import { SheetName } from "../types/navigation";
import { UserRole } from "../types/roles";
import { DailyReportSheet } from "./sheets/DailyReportSheet";
import { AttendanceSheet } from "./sheets/AttendanceSheet";
import { CashSheet } from "./sheets/CashSheet";
import { MaterialRequestSheet } from "./sheets/MaterialRequestSheet";
import { ExpenseSheet } from "./sheets/ExpenseSheet";
import { IssueSheet } from "./sheets/IssueSheet";
import { MessagesSheet, NotificationSheet } from "./sheets/CommunicationSheets";
import { DocumentsSheet } from "./sheets/DocumentsSheet";
import { ActivitySheet } from "./sheets/ActivitySheet";
import { SiteProgress } from "./sheets/SiteProgressSheet";
import { SheetLayout } from "./sheets/SheetLayout";
import { getSheetConfig, Profile, Success } from "./sheets/SupportSheets";
import { SettingsSheet } from "./sheets/SettingsSheet";
import { AppSettings } from "../hooks/useAppSettings";

export { TaskSheet } from "./sheets/TaskSheet";

export function ActionSheet({
  kind,
  onClose,
  progressEntries,
  onAddProgress,
  tasks,
  dailyReports,
  onAddDailyReport,
  materialRequests,
  onAddMaterialRequest,
  onConfirmMaterialReceived,
  managedMaterials,
  managedUnits,
  attendanceEntries,
  onSaveAttendance,
  financeRecords,
  cashBalance,
  onAddFinanceRecord,
  issues,
  onAddIssue,
  role,
  conversations,
  notifications,
  onSendMessage,
  onReadConversation,
  onReadNotification,
  onReadAllNotifications,
  documents,
  onUploadDocument,
  accountName,
  accountPhone,
  assignedProjectName,
  assignedSiteName,
  siteVisits,
  onAddSiteVisit,
  permissions,
  onUpdateProfile,
  appSettings,
  onChangeAppSetting,
}: {
  kind: SheetName;
  onClose: () => void;
  progressEntries: SiteProgressEntry[];
  onAddProgress: (input: SiteProgressInput) => void;
  tasks: Task[];
  dailyReports: DailyReport[];
  onAddDailyReport: (input: DailyReportInput) => void;
  materialRequests: MaterialRequest[];
  onAddMaterialRequest: (input: MaterialRequestInput) => void;
  onConfirmMaterialReceived: (requestId: string) => void;
  managedMaterials: ManagedMaterial[];
  managedUnits: ManagedUnit[];
  attendanceEntries: AttendanceEntry[];
  onSaveAttendance: (input: AttendanceEntryInput[]) => void;
  financeRecords: FinanceRecord[];
  cashBalance: number;
  onAddFinanceRecord: (input: FinanceRecordInput) => void;
  issues: SiteIssue[];
  onAddIssue: (input: SiteIssueInput) => void;
  role: UserRole;
  conversations: Conversation[];
  notifications: AppNotification[];
  onSendMessage: (
    conversationId: string,
    role: UserRole,
    senderName: string,
    text: string,
    attachmentName?: string,
  ) => void;
  onReadConversation: (conversationId: string, role: UserRole) => void;
  onReadNotification: (id: string, role: UserRole) => void;
  onReadAllNotifications: (role: UserRole) => void;
  documents: SiteDocument[];
  onUploadDocument: (input: DocumentUploadInput) => void;
  accountName: string;
  accountPhone: string;
  assignedProjectName?: string;
  assignedSiteName?: string;
  siteVisits: SiteVisit[];
  onAddSiteVisit: (input: SiteVisitInput) => void;
  permissions: string[];
  onUpdateProfile: (name: string) => Promise<void>;
  appSettings: AppSettings;
  onChangeAppSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const config = getSheetConfig(kind);
  const close = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <SheetLayout
      visible={kind !== null}
      title={config.title}
      subtitle={config.subtitle}
      onClose={close}
    >
      {submitted ? (
        <Success onClose={close} />
      ) : kind === "notifications" ? (
        <NotificationSheet
          notifications={notifications}
          role={role}
          onRead={onReadNotification}
          onReadAll={onReadAllNotifications}
        />
      ) : kind === "profile" ? (
        <Profile
          name={accountName}
          role={role}
          phone={accountPhone}
          projectName={assignedProjectName}
          siteName={assignedSiteName}
          permissions={permissions}
          onSave={onUpdateProfile}
        />
      ) : kind === "settings" ? (
        <SettingsSheet settings={appSettings} onChange={onChangeAppSetting} />
      ) : kind === "cash" ? (
        <CashSheet
          records={financeRecords}
          balance={cashBalance}
          onSubmit={onAddFinanceRecord}
        />
      ) : kind === "messages" ? (
        <MessagesSheet
          conversations={conversations}
          role={role}
          onSend={onSendMessage}
          onRead={onReadConversation}
        />
      ) : kind === "documents" ? (
        <DocumentsSheet documents={documents} onUpload={onUploadDocument} />
      ) : kind === "activity" ? (
        <ActivitySheet
          tasks={tasks}
          reports={dailyReports}
          requests={materialRequests}
          financeRecords={financeRecords}
          attendanceEntries={attendanceEntries}
          issues={issues}
          conversations={conversations}
          visits={siteVisits}
          onAddVisit={onAddSiteVisit}
        />
      ) : kind === "progress" ? (
        <SiteProgress
          entries={progressEntries}
          onSubmit={(input) => {
            onAddProgress(input);
            setSubmitted(true);
          }}
        />
      ) : kind === "report" ? (
        <DailyReportSheet
          tasks={tasks}
          reports={dailyReports}
          onSubmit={onAddDailyReport}
        />
      ) : kind === "material" ? (
        <MaterialRequestSheet
          requests={materialRequests}
          onSubmit={onAddMaterialRequest}
          onConfirmReceived={onConfirmMaterialReceived}
          materials={managedMaterials}
          units={managedUnits}
        />
      ) : kind === "attendance" ? (
        <AttendanceSheet
          entries={attendanceEntries}
          onSave={onSaveAttendance}
        />
      ) : kind === "expense" ? (
        <ExpenseSheet
          records={financeRecords}
          materials={managedMaterials}
          units={managedUnits}
          onSubmit={onAddFinanceRecord}
        />
      ) : kind === "issue" ? (
        <IssueSheet issues={issues} onSubmit={onAddIssue} />
      ) : null}
    </SheetLayout>
  );
}
