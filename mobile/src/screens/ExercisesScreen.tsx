import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { api } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";

interface Exercise { id: string; title: string; description: string; category: string; duration: number; difficulty: string }

const CATEGORY_ICONS: Record<string, string> = { BREATHING: "leaf", MEDITATION: "flower", GROUNDING: "eye", BODY_SCAN: "body", PMR: "heart", VISUALIZATION: "sparkles" };

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { api<Exercise[]>("/api/exercises").then(setExercises).catch(() => {}); }, []);

  const categories = ["ALL", "BREATHING", "MEDITATION", "GROUNDING", "BODY_SCAN", "PMR"];
  const filtered = filter === "ALL" ? exercises : exercises.filter((e) => e.category === filter);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Guided Exercises</Text>
      <Text style={styles.subtitle}>Pick a technique. Each takes under 10 minutes.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setFilter(cat)} style={[styles.filterChip, filter === cat && styles.filterActive]}>
            <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat === "ALL" ? "All" : cat.replace("_", " ")}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No exercises in this category yet.</Text></View>
      ) : (
        filtered.map((ex) => (
          <Card key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exerciseRow}>
              <View style={styles.exerciseIcon}>
                <Ionicons name={(CATEGORY_ICONS[ex.category] || "sparkles") as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.title}</Text>
                <Text style={styles.exerciseDesc} numberOfLines={2}>{ex.description}</Text>
                <View style={styles.exerciseMeta}>
                  <Text style={styles.metaText}>{Math.floor(ex.duration / 60)} min</Text>
                  <Text style={styles.metaText}>{ex.difficulty}</Text>
                </View>
              </View>
            </View>
            <Button title="Start" variant="outline" onPress={() => Alert.alert("Exercise", `Starting ${ex.title}. Follow the guided steps on the web app for full experience.`)} style={{ marginTop: 12 }} />
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  filterRow: { marginTop: 16, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f3f4f6", marginRight: 8 },
  filterActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  filterTextActive: { color: "#fff" },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: colors.textMuted },
  exerciseCard: { marginBottom: 12 },
  exerciseRow: { flexDirection: "row", alignItems: "flex-start" },
  exerciseIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center", marginRight: 12 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: "700", color: colors.text },
  exerciseDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  exerciseMeta: { flexDirection: "row", gap: 12, marginTop: 6 },
  metaText: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
});
