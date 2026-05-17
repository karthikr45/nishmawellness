import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import Card from "../components/Card";

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "chatbubble-ellipses", label: "AI Chat", screen: "AIChat", color: colors.primary },
  { icon: "journal", label: "Journal", screen: "Journal", color: "#f59e0b" },
  { icon: "fitness", label: "Exercises", screen: "Exercises", color: "#22c55e" },
  { icon: "people", label: "Family", screen: "FamilyKids", color: "#ec4899" },
  { icon: "heart", label: "Partner", screen: "Partner", color: "#ef4444" },
  { icon: "flame", label: "Habits", screen: "Habits", color: "#f97316" },
];

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ mood: "--", streak: 0, sessions: 0 });

  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const fetchData = async () => {
    try {
      const data = await api<any>("/api/users/getting-started");
      setStats({ mood: "--", streak: data.completedCount || 0, sessions: 0 });
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      {/* Welcome */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{firstName}!</Text>
        <Text style={styles.subtitle}>Here&apos;s your wellness overview</Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity key={action.label} style={styles.actionCard} onPress={() => navigation.navigate(action.screen)} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Your progress</Text>
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.streak}/5</Text>
          <Text style={styles.statLabel}>Getting started</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.mood}</Text>
          <Text style={styles.statLabel}>Mood today</Text>
        </Card>
      </View>

      {/* Motivational card */}
      <Card style={styles.motivationCard}>
        <Text style={styles.motivationText}>
          &quot;The secret of getting ahead is getting started.&quot;
        </Text>
        <Text style={styles.motivationAuthor}>— Mark Twain</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  hero: { marginBottom: 28 },
  greeting: { fontSize: 16, color: colors.textSecondary },
  name: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: 2 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  actionCard: { width: "30%", alignItems: "center", paddingVertical: 16, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: "600", color: colors.text },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statValue: { fontSize: 24, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  motivationCard: { backgroundColor: colors.primary, borderColor: colors.primary },
  motivationText: { fontSize: 15, color: "#fff", fontStyle: "italic", lineHeight: 22 },
  motivationAuthor: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 },
});
