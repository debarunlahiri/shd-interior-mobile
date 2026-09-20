import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Task } from "../data";
import { colors, radius } from "../theme";
import { TaskCard } from "../components/TaskCard";
import { IconButton } from "../components/ui";

export function TasksScreen({
  onTask,
  tasks,
}: {
  onTask: (task: Task) => void;
  tasks: Task[];
}) {
  const filters = ["All", "Pending", "Today", "In progress", "Completed"];
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (filter === "All" ||
            (filter === "Pending"
              ? task.status === "Assigned" || task.status === "Blocked"
              : filter === "Today"
                ? task.due.includes("Today")
                : task.status === filter)) &&
          task.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, query],
  );
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My tasks</Text>
          <Text style={styles.subtitle}>Track assigned site work</Text>
        </View>
        <IconButton icon="sliders" />
      </View>
      <View style={styles.search}>
        <FontAwesome6
          name="magnifying-glass"
          size={16}
          color={colors.inkMuted}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search tasks"
          placeholderTextColor="#8D9693"
          style={styles.input}
        />
      </View>
      <ScrollView
        style={styles.filterScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                filter === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.count}>{visible.length} TASKS</Text>
        <View style={styles.list}>
          {visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => onTask(task)}
              detailed
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: { color: colors.inkMuted, fontSize: 12, marginTop: 4 },
  search: {
    marginHorizontal: 20,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  input: { flex: 1, fontSize: 14, color: colors.ink },
  filterScroll: { flexGrow: 0, height: 58 },
  filters: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 58,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  chipTextActive: { color: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 112 },
  count: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 11,
  },
  list: { gap: 11 },
});
