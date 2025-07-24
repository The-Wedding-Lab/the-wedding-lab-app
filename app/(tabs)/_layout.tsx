import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // 안드로이드에서 하단 네비게이션 바 고려
  const getTabBarStyle = () => {
    const baseStyle = {
      position: "relative" as const,
      borderTopWidth: 0,
      backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      paddingTop: 10,
    };

    if (Platform.OS === "android") {
      return {
        ...baseStyle,
        paddingBottom: Math.max(insets.bottom, 10), // 안드로이드 하단 네비게이션 바 고려
        height: 70 + Math.max(insets.bottom, 10), // 동적 높이 조정
      };
    } else {
      return {
        ...baseStyle,
        paddingBottom: 10,
        height: 80,
      };
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: getTabBarStyle(),
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "커뮤니티",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="cloud" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
