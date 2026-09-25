import { databaseStorage } from "../database";
import { useCallback, useEffect, useState } from "react";
import { UserRole } from "../types/roles";

const STORAGE_KEY = "@shd-interior/communications-v1";

export type MessageCategory =
  | "Instruction"
  | "Material Request"
  | "Issue"
  | "Technical Support"
  | "General"
  | "Urgent";

export type ConversationMessage = {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  attachmentName?: string;
  createdAt: string;
  readBy: UserRole[];
};

export type Conversation = {
  id: string;
  project: string;
  site: string;
  category: MessageCategory;
  subject: string;
  participants: UserRole[];
  messages: ConversationMessage[];
};

export type AppNotification = {
  id: string;
  eventKey: string;
  category: string;
  title: string;
  detail: string;
  audience: UserRole[];
  readBy: UserRole[];
  createdAt: string;
};

export type AlertInput = Pick<
  AppNotification,
  "eventKey" | "category" | "title" | "detail" | "audience"
>;

type CommunicationsState = {
  conversations: Conversation[];
  notifications: AppNotification[];
};

const initialState: CommunicationsState = {
  conversations: [
    {
      id: "CONV-1001",
      project: "Palm Grove Residence",
      site: "Villa 18",
      category: "Instruction",
      subject: "Revised lighting plan",
      participants: ["Admin", "Supervisor"],
      messages: [
        {
          id: "MSG-1001",
          senderRole: "Admin",
          senderName: "Debarun Lahiri",
          text: "Please review the revised lighting plan before ceiling work starts.",
          attachmentName: "lighting-plan-rev-3.pdf",
          createdAt: "2026-09-20T09:10:00.000Z",
          readBy: ["Admin"],
        },
      ],
    },
    {
      id: "CONV-1002",
      project: "Palm Grove Residence",
      site: "Villa 18",
      category: "Material Request",
      subject: "White cement dispatch",
      participants: ["Admin", "Supervisor", "Vendor"],
      messages: [
        {
          id: "MSG-1002",
          senderRole: "Vendor",
          senderName: "BuildMart Supplies",
          text: "The material has left the warehouse under challan CH-184.",
          createdAt: "2026-09-21T11:15:00.000Z",
          readBy: ["Vendor", "Admin"],
        },
      ],
    },
  ],
  notifications: [
    {
      id: "NOT-PO-2048",
      eventKey: "purchase-order:PO-2048:approved",
      category: "Purchase Order",
      title: "Purchase order approved",
      detail: "PO-2048 · Palm Grove Residence · ₹84,600",
      audience: ["Admin", "Vendor"],
      readBy: [],
      createdAt: "2026-09-22T09:15:00.000Z",
    },
    {
      id: "NOT-PAY-2039",
      eventKey: "payment:PO-2039:pending",
      category: "Payment",
      title: "Vendor payment pending",
      detail: "PO-2039 has an outstanding payment awaiting Admin action.",
      audience: ["Admin", "Vendor"],
      readBy: [],
      createdAt: "2026-09-22T10:30:00.000Z",
    },
  ],
};

export function useCommunications() {
  const [state, setState] = useState<CommunicationsState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    databaseStorage
      .getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setState(JSON.parse(saved) as CommunicationsState);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    databaseStorage
      .setItem(STORAGE_KEY, JSON.stringify(state))
      .catch(() => undefined);
  }, [hydrated, state]);

  const sendMessage = useCallback(
    (
      conversationId: string,
      role: UserRole,
      senderName: string,
      text: string,
      attachmentName?: string,
    ) => {
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  {
                    id: `MSG-${Date.now()}`,
                    senderRole: role,
                    senderName,
                    text,
                    attachmentName,
                    createdAt: new Date().toISOString(),
                    readBy: [role],
                  },
                ],
              }
            : conversation,
        ),
      }));
    },
    [],
  );

  const markConversationRead = useCallback(
    (conversationId: string, role: UserRole) => {
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.readBy.includes(role)
                    ? message
                    : { ...message, readBy: [...message.readBy, role] },
                ),
              }
            : conversation,
        ),
      }));
    },
    [],
  );

  const markNotificationRead = useCallback((id: string, role: UserRole) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === id && !notification.readBy.includes(role)
          ? { ...notification, readBy: [...notification.readBy, role] }
          : notification,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((role: UserRole) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.audience.includes(role) &&
        !notification.readBy.includes(role)
          ? { ...notification, readBy: [...notification.readBy, role] }
          : notification,
      ),
    }));
  }, []);

  const syncAlerts = useCallback((alerts: AlertInput[]) => {
    setState((current) => {
      const known = new Set(current.notifications.map((item) => item.eventKey));
      const additions = alerts.filter((alert) => !known.has(alert.eventKey));
      if (!additions.length) return current;
      const createdAt = new Date().toISOString();
      return {
        ...current,
        notifications: [
          ...additions.map((alert, index) => ({
            ...alert,
            id: `NOT-${Date.now()}-${index}`,
            readBy: [],
            createdAt,
          })),
          ...current.notifications,
        ],
      };
    });
  }, []);

  return {
    ...state,
    sendMessage,
    markConversationRead,
    markNotificationRead,
    markAllNotificationsRead,
    syncAlerts,
  };
}
