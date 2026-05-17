import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Error", "Please enter email and password"); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>Nishma</Text>
          <Text style={styles.subtitle}>Wellness that remembers you</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <Button title="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: 24 }} />

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.link}>
            <Text style={styles.linkText}>Don&apos;t have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
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
