import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as LocalAuthentication from "expo-local-authentication";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function authenticate() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (hasHardware) {
          const supportedTypes =
            await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (
            supportedTypes.includes(
              LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
            ) ||
            supportedTypes.includes(
              LocalAuthentication.AuthenticationType.FINGERPRINT
            )
          ) {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: "생체 정보를 사용하여 인증해주세요.",
            });
            if (result.success) {
              setAuthenticated(true);
            } else {
              setAuthenticated(true); // 인증 실패 시에도 진행 (테스트용)
            }
          } else {
            setAuthenticated(true); // 생체 인증 미지원 시 진행
          }
        } else {
          setAuthenticated(true); // 하드웨어 미지원 시 진행
        }
      } catch (e) {
        console.error(e);
        setAuthenticated(true); // 오류 발생 시에도 진행
      }
    }

    if (loaded) {
      authenticate();
    }
  }, [loaded]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && isAuthenticated) {
      await SplashScreen.hideAsync();
    }
  }, [loaded, isAuthenticated]);

  if (!loaded || !isAuthenticated) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </View>
  );
}
