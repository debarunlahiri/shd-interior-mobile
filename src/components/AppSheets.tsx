import { useState } from "react";
import { SiteProgressEntry, Task } from "../data";
import {
  DailyReport,
  DailyReportInput,
} from "../hooks/useDailyReports";
import {
  MaterialRequest,
  MaterialRequestInput,
} from "../hooks/useMaterialRequests";
import { SiteProgressInput } from "../hooks/useSiteProgress";
import { SheetName } from "../types/navigation";
import { DailyReportForm } from "./sheets/DailyReportSheet";
import { MaterialRequestSheet } from "./sheets/MaterialRequestSheet";
import { SiteProgress } from "./sheets/SiteProgressSheet";
import { SheetLayout } from "./sheets/SheetLayout";
import {
  Cash,
  Documents,
  getSheetConfig,
  Messages,
  Notifications,
  Profile,
  SimpleForm,
  Success,
} from "./sheets/SupportSheets";

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
        <Notifications />
      ) : kind === "profile" ? (
        <Profile />
      ) : kind === "cash" ? (
        <Cash />
      ) : kind === "messages" ? (
        <Messages />
      ) : kind === "documents" ? (
        <Documents />
      ) : kind === "progress" ? (
        <SiteProgress
          entries={progressEntries}
          onSubmit={(input) => {
            onAddProgress(input);
            setSubmitted(true);
          }}
        />
      ) : kind === "report" ? (
        <DailyReportForm
          tasks={tasks}
          reports={dailyReports}
          onSubmit={(input) => {
            onAddDailyReport(input);
            setSubmitted(true);
          }}
        />
      ) : kind === "material" ? (
        <MaterialRequestSheet
          requests={materialRequests}
          onSubmit={onAddMaterialRequest}
          onConfirmReceived={onConfirmMaterialReceived}
        />
      ) : (
        <SimpleForm kind={kind} onSubmit={() => setSubmitted(true)} />
      )}
    </SheetLayout>
  );
}
