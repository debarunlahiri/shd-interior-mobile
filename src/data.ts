export type TaskStatus =
  | "Assigned"
  | "In progress"
  | "Blocked"
  | "Completed"
  | "Verified";

export type TaskUpdate = {
  id: string;
  status: TaskStatus;
  progress: number;
  remark: string;
  evidenceName?: string;
  beforeMediaName?: string;
  duringMediaName?: string;
  afterMediaName?: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  area: string;
  due: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: TaskStatus;
  progress: number;
  description: string;
  evidenceRequired: boolean;
  updates: TaskUpdate[];
};

export type ProgressStage = "Before work" | "During work" | "After work";

export type SiteProgressEntry = {
  id: string;
  stage: ProgressStage;
  progress: number;
  workDescription: string;
  remarks: string;
  mediaName: string;
  createdAt: string;
};

export const initialSiteProgress: SiteProgressEntry[] = [
  {
    id: "PRG-1002",
    stage: "During work",
    progress: 68,
    workDescription: "Living room false-ceiling framework alignment",
    remarks: "Electrical cut-outs are being marked before board fixing.",
    mediaName: "ceiling-progress.jpg",
    createdAt: "2026-09-20T10:24:00.000Z",
  },
  {
    id: "PRG-1001",
    stage: "Before work",
    progress: 62,
    workDescription: "Kitchen cabinet measurement preparation",
    remarks: "Area cleared and approved drawing placed at the site.",
    mediaName: "kitchen-before.jpg",
    createdAt: "2026-09-19T15:10:00.000Z",
  },
];

export const tasks: Task[] = [
  {
    id: "TSK-1048",
    title: "Living room false ceiling",
    area: "Villa 18 · Ground floor",
    due: "Today, 5:00 PM",
    priority: "High",
    status: "In progress",
    progress: 65,
    description:
      "Complete the gypsum framework and verify electrical cut-outs before board fixing.",
    evidenceRequired: true,
    updates: [],
  },
  {
    id: "TSK-1051",
    title: "Kitchen cabinet measurements",
    area: "Villa 18 · Kitchen",
    due: "Today, 2:30 PM",
    priority: "Critical",
    status: "Assigned",
    progress: 0,
    description:
      "Confirm final dimensions against the approved drawing and upload measurement photos.",
    evidenceRequired: true,
    updates: [],
  },
  {
    id: "TSK-1042",
    title: "Bedroom wall primer",
    area: "Villa 18 · First floor",
    due: "Tomorrow, 11:00 AM",
    priority: "Medium",
    status: "Blocked",
    progress: 35,
    description:
      "Primer application is waiting for moisture inspection approval.",
    evidenceRequired: false,
    updates: [],
  },
  {
    id: "TSK-1039",
    title: "Electrical point marking",
    area: "Villa 18 · All floors",
    due: "19 Sep",
    priority: "Low",
    status: "Completed",
    progress: 100,
    description:
      "Mark and verify lighting, switch and appliance points as per revised plan.",
    evidenceRequired: true,
    updates: [],
  },
];

export const attendance = [
  { name: "Ravi Kumar", trade: "Carpenter", status: "Present" },
  { name: "Imran Ali", trade: "Electrician", status: "Present" },
  { name: "Sunil Das", trade: "Painter", status: "Half day" },
  { name: "Manoj Yadav", trade: "Helper", status: "Absent" },
];

export const notifications = [
  {
    title: "Material request approved",
    detail: "MR-204 · White cement and primer",
    time: "12 min ago",
    icon: "cube-outline",
  },
  {
    title: "Task deadline approaching",
    detail: "Kitchen cabinet measurements due at 2:30 PM",
    time: "36 min ago",
    icon: "time-outline",
  },
  {
    title: "New instruction from admin",
    detail: "Review the revised lighting plan before execution",
    time: "1 hr ago",
    icon: "chatbubble-outline",
  },
];

export const expenses = [
  {
    label: "Local hardware purchase",
    meta: "Material · UPI",
    amount: "₹2,850",
    status: "Approved",
  },
  {
    label: "Worker transport",
    meta: "Transport · Cash",
    amount: "₹1,200",
    status: "Pending",
  },
  {
    label: "Drill machine repair",
    meta: "Equipment · Cash",
    amount: "₹950",
    status: "Approved",
  },
];
