import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert("Error", "All fields are required"); return; }
    if (password.length < 6) { Alert.alert("Error", "Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message || "Please try again");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>Nishma</Text>
          <Text style={styles.subtitle}>Start your wellness journey</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Doe" placeholderTextColor={colors.textMuted} autoCapitalize="words" />

          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" placeholderTextColor={colors.textMuted} secureTextEntry />

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 24 }} />

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 48 },
  logo: { fontSize: 36, fontWeight: "800", color: colors.primary },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 8 },
  form: {},
  label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.text },
  link: { marginTop: 20, alignItems: "center" },
  linkText: { fontSize: 14, color: colors.textSecondary },
  linkBold: { fontWeight: "700", color: colors.primary },
});
