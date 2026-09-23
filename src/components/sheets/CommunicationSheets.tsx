import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  AppNotification,
  Conversation,
  MessageCategory,
} from "../../hooks/useCommunications";
import { colors } from "../../theme";
import { FontAwesomeIcon } from "../../types/icons";
import { UserRole } from "../../types/roles";
import { formatDateTime } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, Surface } from "../ui";
import { sheetStyles } from "./styles";

const categories: (MessageCategory | "All categories")[] = [
  "All categories",
  "Instruction",
  "Material Request",
  "Issue",
  "Technical Support",
  "General",
  "Urgent",
];

export function NotificationSheet({
  notifications,
  role,
  onRead,
  onReadAll,
}: {
  notifications: AppNotification[];
  role: UserRole;
  onRead: (id: string, role: UserRole) => void;
  onReadAll: (role: UserRole) => void;
}) {
  const visible = notifications.filter((item) => item.audience.includes(role));
  const unread = visible.filter((item) => !item.readBy.includes(role)).length;
  return (
    <ScrollView contentContainerStyle={sheetStyles.list}>
      <View style={sheetStyles.communicationHeader}>
        <View>
          <Text style={sheetStyles.itemTitle}>{unread} unread updates</Text>
          <Text style={sheetStyles.itemMeta}>
            Generated from local workflow events
          </Text>
        </View>
        {unread ? (
          <Pressable onPress={() => onReadAll(role)}>
            <Text style={sheetStyles.backActionText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>
      {visible.map((item) => {
        const isUnread = !item.readBy.includes(role);
        return (
          <Pressable key={item.id} onPress={() => onRead(item.id, role)}>
            <Surface
              style={[
                sheetStyles.notificationCard,
                ...(isUnread ? [sheetStyles.notificationCardUnread] : []),
              ]}
            >
              <View style={sheetStyles.itemIcon}>
                <FontAwesome6
                  name={notificationIcon(item.category)}
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={sheetStyles.flexNoMargin}>
                <View style={sheetStyles.notificationTitleRow}>
                  <Text style={sheetStyles.itemTitle}>{item.title}</Text>
                  {isUnread ? <View style={sheetStyles.unread} /> : null}
                </View>
                <Text style={sheetStyles.itemMeta}>{item.detail}</Text>
                <Text style={sheetStyles.time}>
                  {item.category} · {formatDateTime(item.createdAt)}
                </Text>
              </View>
            </Surface>
          </Pressable>
        );
      })}
      {visible.length === 0 ? (
        <Text style={sheetStyles.note}>No notifications for this account.</Text>
      ) : null}
    </ScrollView>
  );
}

export function MessagesSheet({
  conversations,
  role,
  onSend,
  onRead,
}: {
  conversations: Conversation[];
  role: UserRole;
  onSend: (
    conversationId: string,
    role: UserRole,
    senderName: string,
    text: string,
    attachmentName?: string,
  ) => void;
  onRead: (conversationId: string, role: UserRole) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<MessageCategory | "All categories">(
    "All categories",
  );
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const visible = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          conversation.participants.includes(role) &&
          (category === "All categories" || conversation.category === category),
      ),
    [category, conversations, role],
  );
  const selected = conversations.find((item) => item.id === selectedId);

  if (selected) {
    return (
      <View style={sheetStyles.messageScreen}>
        <View style={sheetStyles.conversationTopbar}>
          <Pressable
            onPress={() => setSelectedId(null)}
            style={sheetStyles.backAction}
          >
            <FontAwesome6 name="arrow-left" size={13} color={colors.primary} />
            <Text style={sheetStyles.backActionText}>Conversations</Text>
          </Pressable>
          <View style={sheetStyles.conversationIdentity}>
            <Text style={sheetStyles.itemTitle}>{selected.subject}</Text>
            <Text style={sheetStyles.itemMeta}>
              {selected.project} · {selected.site} · {selected.category}
            </Text>
          </View>
        </View>
        <ScrollView
          style={sheetStyles.messageList}
          contentContainerStyle={sheetStyles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {selected.messages.map((item) => {
            const incoming = item.senderRole !== role;
            return (
              <View
                key={item.id}
                style={[
                  sheetStyles.bubble,
                  incoming ? sheetStyles.incoming : sheetStyles.outgoing,
                ]}
              >
                <Text
                  style={[
                    sheetStyles.messageSender,
                    !incoming && sheetStyles.bubbleTextOutgoing,
                  ]}
                >
                  {item.senderName}
                </Text>
                {item.text ? (
                  <Text
                    style={[
                      sheetStyles.bubbleText,
                      !incoming && sheetStyles.bubbleTextOutgoing,
                    ]}
                  >
                    {item.text}
                  </Text>
                ) : null}
                {item.attachmentName ? (
                  <View style={sheetStyles.messageAttachment}>
                    <FontAwesome6
                      name="paperclip"
                      size={12}
                      color={incoming ? colors.primary : colors.white}
                    />
                    <Text
                      style={[
                        sheetStyles.messageAttachmentText,
                        !incoming && sheetStyles.bubbleTextOutgoing,
                      ]}
                    >
                      {item.attachmentName}
                    </Text>
                  </View>
                ) : null}
                <Text
                  style={[
                    sheetStyles.time,
                    !incoming && sheetStyles.bubbleTime,
                  ]}
                >
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        {attachment ? (
          <View style={sheetStyles.pendingAttachment}>
            <FontAwesome6 name="paperclip" size={12} color={colors.primary} />
            <Text style={sheetStyles.issueAttachmentName}>{attachment}</Text>
            <Pressable onPress={() => setAttachment(null)}>
              <FontAwesome6 name="xmark" size={13} color={colors.danger} />
            </Pressable>
          </View>
        ) : null}
        <View style={sheetStyles.composer}>
          <AttachmentPicker
            compact
            value={null}
            onChange={setAttachment}
            label="Attach"
          />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write a message..."
            style={sheetStyles.messageInput}
          />
          <Pressable
            style={sheetStyles.send}
            onPress={() => {
              if (!message.trim() && !attachment) return;
              onSend(
                selected.id,
                role,
                roleName(role),
                message.trim(),
                attachment ?? undefined,
              );
              setMessage("");
              setAttachment(null);
            }}
          >
            <FontAwesome6 name="paper-plane" size={16} color={colors.white} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={sheetStyles.list}>
      <DropdownField
        value={category}
        placeholder="Filter by category"
        options={categories}
        onChange={(value) => setCategory(value as typeof category)}
      />
      {visible.map((conversation) => {
        const last = conversation.messages.at(-1);
        const unread = conversation.messages.filter(
          (item) => item.senderRole !== role && !item.readBy.includes(role),
        ).length;
        return (
          <Pressable
            key={conversation.id}
            onPress={() => {
              setSelectedId(conversation.id);
              onRead(conversation.id, role);
            }}
          >
            <Surface style={sheetStyles.conversationCard}>
              <View style={sheetStyles.itemIcon}>
                <FontAwesome6
                  name="comments"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={sheetStyles.flexNoMargin}>
                <View style={sheetStyles.notificationTitleRow}>
                  <Text style={sheetStyles.itemTitle}>
                    {conversation.subject}
                  </Text>
                  {unread ? (
                    <View style={sheetStyles.messageBadge}>
                      <Text style={sheetStyles.messageBadgeText}>{unread}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={sheetStyles.itemMeta}>
                  {conversation.project} · {conversation.site} ·{" "}
                  {conversation.category}
                </Text>
                <Text style={sheetStyles.conversationPreview} numberOfLines={1}>
                  {last?.text || last?.attachmentName || "No messages"}
                </Text>
              </View>
            </Surface>
          </Pressable>
        );
      })}
      {visible.length === 0 ? (
        <Text style={sheetStyles.note}>No conversations in this category.</Text>
      ) : null}
    </ScrollView>
  );
}

function notificationIcon(category: string): FontAwesomeIcon {
  if (category === "Material") return "boxes-stacked";
  if (category === "Task") return "clock";
  if (category === "Payment") return "indian-rupee-sign";
  if (category === "Purchase Order") return "file-invoice";
  if (category === "Report") return "file-lines";
  return "bell";
}

function roleName(role: UserRole) {
  if (role === "Admin") return "Debarun Lahiri";
  if (role === "Vendor") return "BuildMart Supplies";
  return "Arjun Kumar";
}
