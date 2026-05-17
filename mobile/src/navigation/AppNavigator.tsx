import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme/colors";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AIChatScreen from "../screens/AIChatScreen";
import JournalScreen from "../screens/JournalScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import FamilyKidsScreen from "../screens/FamilyKidsScreen";
import HabitsScreen from "../screens/HabitsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "AIChat") iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
          else if (route.name === "Journal") iconName = focused ? "journal" : "journal-outline";
          else if (route.name === "Exercises") iconName = focused ? "fitness" : "fitness-outline";
          else if (route.name === "FamilyKids") iconName = focused ? "people" : "people-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { paddingBottom: 6, paddingTop: 6, height: 60, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: "Home", headerShown: false }} />
      <Tab.Screen name="AIChat" component={AIChatScreen} options={{ title: "AI Chat" }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: "Journal" }} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} options={{ title: "Exercises" }} />
      <Tab.Screen name="FamilyKids" component={FamilyKidsScreen} options={{ title: "Family" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={HomeTabs} />
            <Stack.Screen name="Habits" component={HabitsScreen} options={{ headerShown: true, title: "Family Habits" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
