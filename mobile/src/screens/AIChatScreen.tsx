import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { api } from "../api/client";

interface Message { id: string; role: "user" | "assistant"; content: string; createdAt: string }

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load recent session
    api<any[]>("/api/ai-chat").then((sessions) => {
      if (sessions.length > 0) {
        const latestSessionId = sessions[0].sessionId;
        setSessionId(latestSessionId);
        api<Message[]>(`/api/ai-chat?sessionId=${latestSessionId}`).then(setMessages);
      }
    }).catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const tempMsg: Message = { id: `temp-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await api<{ sessionId: string; message: Message }>("/api/ai-chat", {
        method: "POST",
        body: { message: text, sessionId },
      });
      setSessionId(res.sessionId);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempMsg.id), { ...tempMsg, id: `user-${Date.now()}` }, res.message]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Sorry, something went wrong. Please try again.", createdAt: new Date().toISOString() }]);
    }
    setSending(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowRight]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
      {messages.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses" size={60} color={colors.primary + "40"} />
          <Text style={styles.emptyTitle}>Your AI wellness companion</Text>
          <Text style={styles.emptyDesc}>Talk about anything — stress, sleep, relationships. I remember our conversations across sessions.</Text>
          <View style={styles.prompts}>
            {["Hi, it's my first time here", "I've been feeling anxious", "Help me with a breathing exercise", "I had a rough day"].map((p) => (
              <TouchableOpacity key={p} style={styles.promptChip} onPress={() => setInput(p)}>
                <Text style={styles.promptText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || sending}>
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  msgList: { padding: 16, paddingBottom: 8 },
  msgRow: { marginBottom: 12, flexDirection: "row" },
  msgRowRight: { justifyContent: "flex-end" },
  bubble: { maxWidth: "80%", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: "#f3f4f6", borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22, color: colors.text },
  msgTextUser: { color: "#fff" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 20, maxWidth: 300 },
  prompts: { marginTop: 24, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  promptChip: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#f3f4f6", borderRadius: 12 },
  promptText: { fontSize: 13, color: colors.textSecondary },
  inputBar: { flexDirection: "row", alignItems: "flex-end", padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "#fff" },
  input: { flex: 1, backgroundColor: "#f9fafb", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 100, color: colors.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.4 },
});
