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
import { AppState, SafeAreaView, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import WebView from "react-native-webview";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthStore } from "../store/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAuthenticated, setAuthenticated] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

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

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    if (loaded && isAuthenticated) {
      initializeAuth();
    }
  }, [loaded, isAuthenticated, initializeAuth]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && isAuthenticated) {
      await SplashScreen.hideAsync();
    }
  }, [loaded, isAuthenticated]);

  if (!loaded || !isAuthenticated) {
    return null;
  }

  return (
    <MainApp onLayoutRootView={onLayoutRootView} colorScheme={colorScheme} />
  );
}

function MainApp({
  onLayoutRootView,
  colorScheme,
}: {
  onLayoutRootView: () => void;
  colorScheme: string | null | undefined;
}) {
  const { isLoggedIn, login, setToken, setUser, initializeAuth } =
    useAuthStore();

  // 앱이 포그라운드로 돌아올 때 토큰 유효성 재확인
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        initializeAuth();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [initializeAuth]);

  // 로그인이 안 되어있으면 로그인 화면만 전체화면으로 표시
  if (!isLoggedIn) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SafeAreaView style={styles.safeArea}>
            <WebView
              // source={{ uri: "http://1.234.44.179:3004/login" }}
              source={{ uri: "http://192.168.0.4:3003/login" }}
              // scrollEnabled={false}
              // showsVerticalScrollIndicator={false}
              // showsHorizontalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              // iOS 키보드 설정
              keyboardDisplayRequiresUserAction={false} // 프로그래매틱 키보드 열기 허용
              hideKeyboardAccessoryView={false}
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
              // Android 키보드 설정
              androidLayerType="hardware"
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={true}
              onMessage={async (event) => {
                console.log(event.nativeEvent.data);
                try {
                  const data = JSON.parse(event.nativeEvent.data);

                  // 토큰 설정
                  if (data.type === "SET_TOKEN" && data.token) {
                    setToken(data.token);
                  }

                  // 사용자 정보 설정
                  if (data.type === "SET_USER" && data.user) {
                    setUser(data.user);
                  }

                  // 로그인 성공 처리
                  if (
                    data.type === "LOGIN_SUCCESS" &&
                    data.token &&
                    data.user
                  ) {
                    login(data.token, data.user);
                  }
                } catch (error) {
                  // JSON 파싱 실패 시 기존 문자열 처리
                  const message = event.nativeEvent.data;
                  if (message === "loginSuccess") {
                    // 기본 로그인 처리 (토큰과 사용자 정보가 없는 경우)
                    console.log("기본 로그인 성공");
                  }
                }
              }}
            />
          </SafeAreaView>
          <StatusBar style="auto" />
        </ThemeProvider>
      </View>
    );
  }

  // 로그인이 되어있으면 기존 탭바 레이아웃 표시
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
  },
});
