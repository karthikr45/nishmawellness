import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { api } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";

interface Child { id: string; name: string; dateOfBirth: string; moodLogs: { mood: string }[]; foodLogs: any[]; sleepLogs: { quality: number | null }[] }

const MOODS = ["😄", "😊", "😐", "😢", "😡", "😰"];

export default function FamilyKidsScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [moodPick, setMoodPick] = useState("😊");
  const [saving, setSaving] = useState(false);

  useEffect(() => { api<Child[]>("/api/family/kids").then((d) => { if (Array.isArray(d)) { setChildren(d); if (d.length > 0) setSelectedChild(d[0]); } }).catch(() => {}); }, []);

  const logMood = async () => {
    if (!selectedChild) return;
    setSaving(true);
    try {
      await api("/api/family/kids", { method: "POST", body: { action: "logMood", childId: selectedChild.id, mood: moodPick, energy: "3" } });
      Alert.alert("Logged!", `${selectedChild.name}'s mood saved as ${moodPick}`);
    } catch {}
    setSaving(false);
  };

  const getAge = (dob: string) => { const y = new Date().getFullYear() - new Date(dob).getFullYear(); return y < 1 ? "<1 year" : `${y} years`; };

  if (children.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="people" size={60} color={colors.pink + "40"} />
        <Text style={styles.emptyTitle}>Kids Health Tracker</Text>
        <Text style={styles.emptyDesc}>Add your children on the web app to start tracking their mood, food, sleep, and growth here.</Text>
      </View>
    );
  }

  const child = selectedChild || children[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kids Health</Text>

      {/* Child selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childRow}>
        {children.map((c) => (
          <TouchableOpacity key={c.id} onPress={() => setSelectedChild(c)} style={[styles.childChip, child.id === c.id && styles.childActive]}>
            <Text style={[styles.childName, child.id === c.id && styles.childNameActive]}>{c.name} ({getAge(c.dateOfBirth)})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick mood log */}
      <Card style={{ marginTop: 16 }}>
        <Text style={styles.cardTitle}>How is {child.name} feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity key={m} onPress={() => setMoodPick(m)} style={[styles.moodBtn, moodPick === m && styles.moodActive]}>
              <Text style={styles.moodEmoji}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Log Mood" onPress={logMood} loading={saving} style={{ marginTop: 12 }} />
      </Card>

      {/* Today's summary */}
      <Card style={{ marginTop: 16 }}>
        <Text style={styles.cardTitle}>Today at a glance</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{child.moodLogs?.[0]?.mood || "—"}</Text><Text style={styles.statLabel}>Mood</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{child.foodLogs?.length || 0}</Text><Text style={styles.statLabel}>Meals</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{child.sleepLogs?.[0]?.quality ? `${child.sleepLogs[0].quality}/5` : "—"}</Text><Text style={styles.statLabel}>Sleep</Text></View>
        </View>
      </Card>

      <Text style={styles.hint}>For full tracking (food, sleep, growth, milestones), use the web app&apos;s Kids Health section.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  childRow: { marginTop: 12 },
  childChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#f3f4f6", marginRight: 8 },
  childActive: { backgroundColor: colors.primary },
  childName: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  childNameActive: { color: "#fff" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: { padding: 10, borderRadius: 12 },
  moodActive: { backgroundColor: colors.primary + "20", transform: [{ scale: 1.2 }] },
  moodEmoji: { fontSize: 28 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginTop: 8, maxWidth: 280 },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 20, fontStyle: "italic" },
});
