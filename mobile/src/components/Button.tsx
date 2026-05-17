import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({ title, onPress, loading, variant = "primary", disabled, style }: Props) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        variant === "ghost" && styles.ghost,
        (loading || disabled) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} size="small" />
      ) : (
        <Text style={[styles.text, isPrimary && styles.textPrimary, isOutline && styles.textOutline, variant === "ghost" && styles.textGhost]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1.5, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  text: { fontSize: 15, fontWeight: "700" },
  textPrimary: { color: "#fff" },
  textOutline: { color: colors.primary },
  textGhost: { color: colors.primary },
});
