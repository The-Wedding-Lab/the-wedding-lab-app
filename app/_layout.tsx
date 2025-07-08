import AsyncStorage from "@react-native-async-storage/async-storage";
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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import WebView from "react-native-webview";

import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

// 로그인 상태 관리를 위한 Context
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async () => {
    await AsyncStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const loginStatus = await AsyncStorage.getItem("isLoggedIn");
        setIsLoggedIn(loginStatus === "true");
      } catch (error) {
        console.error("로그인 상태 확인 오류:", error);
        setIsLoggedIn(false);
      }
    }
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

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
    <AuthProvider>
      <MainApp onLayoutRootView={onLayoutRootView} colorScheme={colorScheme} />
    </AuthProvider>
  );
}

function MainApp({
  onLayoutRootView,
  colorScheme,
}: {
  onLayoutRootView: () => void;
  colorScheme: string | null | undefined;
}) {
  const { isLoggedIn, login } = useAuth();

  // 로그인이 안 되어있으면 로그인 화면만 전체화면으로 표시
  if (!isLoggedIn) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SafeAreaView style={styles.safeArea}>
            <WebView
              source={{ uri: "http://1.234.44.179:3004/login" }}
              onMessage={async (event) => {
                console.log(event.nativeEvent.data);
                const message = event.nativeEvent.data;

                // 로그인 성공 메시지 처리
                if (message === "loginSuccess") {
                  await login();
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
