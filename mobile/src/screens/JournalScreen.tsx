import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { colors } from "../theme/colors";
import { api } from "../api/client";
import Button from "../components/Button";
import Card from "../components/Card";

export default function JournalScreen() {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(6);
  const [anxiety, setAnxiety] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [gratitude, setGratitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/journal", { method: "POST", body: { mood, energy, anxiety, sleep, gratitude, highlight: "", challenge: "", freeWrite: "", tags: [] } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setGratitude("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
    setSaving(false);
  };

  const moodEmoji = mood >= 8 ? "😄" : mood >= 6 ? "🙂" : mood >= 4 ? "😐" : mood >= 2 ? "😔" : "😢";

  const SliderRow = ({ label, value, onValue, color }: { label: string; value: number; onValue: (v: number) => void; color: string }) => (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${value * 10}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.sliderButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
          <View key={v} style={[styles.sliderDot, value >= v && { backgroundColor: color }]} />
        ))}
      </View>
      <View style={styles.sliderControls}>
        <Button title="−" variant="ghost" onPress={() => onValue(Math.max(1, value - 1))} style={{ padding: 4 }} />
        <Button title="+" variant="ghost" onPress={() => onValue(Math.min(10, value + 1))} style={{ padding: 4 }} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today&apos;s Check-In</Text>
      <Text style={styles.subtitle}>How are you feeling? Takes under 2 minutes.</Text>

      <Card style={{ marginTop: 20 }}>
        <Text style={styles.moodEmoji}>{moodEmoji}</Text>
        <SliderRow label="Mood" value={mood} onValue={setMood} color={colors.primary} />
        <SliderRow label="Energy" value={energy} onValue={setEnergy} color="#f59e0b" />
        <SliderRow label="Anxiety (10 = high)" value={anxiety} onValue={setAnxiety} color="#ef4444" />
        <SliderRow label="Sleep Quality" value={sleep} onValue={setSleep} color="#6366f1" />
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Text style={styles.fieldLabel}>One thing you&apos;re grateful for</Text>
        <View style={styles.textInputWrap}>
          <Text style={styles.textInput} numberOfLines={2}>
            {gratitude || "Tap to write..."}
          </Text>
        </View>
      </Card>

      {saved && <Text style={styles.savedText}>✓ Journal entry saved!</Text>}

      <Button title="Save Entry" onPress={save} loading={saving} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  moodEmoji: { fontSize: 48, textAlign: "center", marginBottom: 16 },
  sliderRow: { marginBottom: 20 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  sliderLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  sliderValue: { fontSize: 16, fontWeight: "800" },
  sliderTrack: { height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  sliderFill: { height: 6, borderRadius: 3 },
  sliderButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  sliderDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e5e7eb" },
  sliderControls: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 8 },
  textInputWrap: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 14, minHeight: 60 },
  textInput: { fontSize: 14, color: colors.textMuted },
  savedText: { textAlign: "center", color: colors.success, fontWeight: "600", marginTop: 16 },
});
