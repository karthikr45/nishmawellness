import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { api } from "../api/client";
import Card from "../components/Card";

interface Habit { id: string; name: string; icon: string; streak: number; todayDone: boolean }

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [familyGroupId, setFamilyGroupId] = useState<string | null>(null);

  useEffect(() => {
    api<any>("/api/family").then((data) => {
      if (data?.id) {
        setFamilyGroupId(data.id);
        api<Habit[]>(`/api/family/wellness?section=habits&familyGroupId=${data.id}`).then((h) => { if (Array.isArray(h)) setHabits(h); });
      }
    }).catch(() => {});
  }, []);

  const logHabit = async (habitId: string) => {
    await api("/api/family/wellness", { method: "POST", body: { action: "logHabit", habitId, familyGroupId } });
    setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, todayDone: true, streak: h.streak + 1 } : h));
  };

  if (!familyGroupId) {
    return (
      <View style={styles.empty}>
        <Ionicons name="flame" size={60} color={colors.warning + "60"} />
        <Text style={styles.emptyTitle}>Family Habits</Text>
        <Text style={styles.emptyDesc}>Set up your family group on the web app to use shared daily habits here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today&apos;s Habits</Text>
      <Text style={styles.subtitle}>{habits.filter((h) => h.todayDone).length}/{habits.length} done today</Text>

      {habits.map((h) => (
        <TouchableOpacity key={h.id} onPress={() => !h.todayDone && logHabit(h.id)} activeOpacity={0.7}>
          <Card style={[styles.habitCard, h.todayDone && styles.habitDone]}>
            <View style={styles.habitRow}>
              <Ionicons name={h.todayDone ? "checkmark-circle" : "ellipse-outline"} size={28} color={h.todayDone ? colors.success : colors.textMuted} />
              <Text style={styles.habitIcon}>{h.icon}</Text>
              <Text style={[styles.habitName, h.todayDone && styles.habitNameDone]}>{h.name}</Text>
            </View>
            {h.streak > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color="#f97316" />
                <Text style={styles.streakText}>{h.streak}</Text>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}

      {habits.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyCardTitle}>No habits yet</Text>
          <Text style={styles.emptyCardDesc}>Create family habits on the web app. Then check them off here daily.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 20 },
  habitCard: { marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  habitDone: { opacity: 0.6 },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  habitIcon: { fontSize: 20 },
  habitName: { fontSize: 15, fontWeight: "600", color: colors.text },
  habitNameDone: { textDecorationLine: "line-through", color: colors.textMuted },
  streakBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff7ed", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  streakText: { fontSize: 13, fontWeight: "700", color: "#f97316", marginLeft: 4 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginTop: 8, maxWidth: 280 },
  emptyCard: { alignItems: "center", paddingVertical: 32 },
  emptyCardTitle: { fontWeight: "700", color: colors.text },
  emptyCardDesc: { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: "center" },
});
