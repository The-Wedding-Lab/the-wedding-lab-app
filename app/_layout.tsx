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
import { AppState, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import WebView from "react-native-webview";

import { useColorScheme } from "@/hooks/useColorScheme";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../store/authStore";

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

async function requestNotificationPermission() {
  try {
    // 안드로이드 알림 채널 설정
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('알림 권한이 거부되었습니다.');
      return false;
    }
    
    console.log('알림 권한이 허용되었습니다.');
    return true;
  } catch (error) {
    console.error('알림 권한 요청 중 오류:', error);
    return false;
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAuthenticated, setAuthenticated] = useState(true);
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false);
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
      // authenticate();
    }
  }, [loaded]);

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    if (loaded && isAuthenticated) {
      initializeAuth();
    }
  }, [loaded, isAuthenticated, initializeAuth]);

  // 앱 시작 시 알림 권한 요청
  useEffect(() => {
    if (loaded && isAuthenticated && !notificationPermissionRequested) {
      const requestPermission = async () => {
        await requestNotificationPermission();
        setNotificationPermissionRequested(true);
      };
      
      // 약간의 지연 후 권한 요청 (사용자 경험 개선)
      setTimeout(requestPermission, 1000);
    }
  }, [loaded, isAuthenticated, notificationPermissionRequested]);

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
  const {
    isLoggedIn,
    login,
    setToken,
    setUser,
    initializeAuth,
    updateNativeToken,
  } = useAuthStore();

  // 앱이 포그라운드로 돌아올 때 토큰 유효성 재확인
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "active") {
        console.log("토큰 유효성 확인");
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
              source={{ uri: "http://1.234.44.179/login" }}
              // source={{ uri: "http://192.168.0.4:3003/login" }}
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
              // Android WebView 메시지 통신을 위한 추가 설정
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              allowFileAccessFromFileURLs={true}
              mixedContentMode="compatibility"
              // Android에서 메시지 통신을 위한 추가 설정
              originWhitelist={['*']}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              // 디버깅을 위한 추가 설정
              onLoadStart={() => console.log('WebView 로딩 시작')}
              onLoadEnd={() => console.log('WebView 로딩 완료')}
              onLoadProgress={({ nativeEvent }) => {
                console.log('WebView 로딩 진행률:', nativeEvent.progress);
              }}
              onMessage={async (event) => {
                console.log("=== WebView 메시지 수신 ===");
                console.log("원본 데이터:", event.nativeEvent.data);
                console.log("메시지 타입:", typeof event.nativeEvent.data);
                console.log("플랫폼:", Platform.OS);
                console.log("현재 시간:", new Date().toISOString());
                
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  console.log("파싱된 데이터:", data);
                  console.log("메시지 타입:", data.type);

                  // 토큰 설정
                  if (data.type === "SET_TOKEN" && data.token) {
                    console.log("✅ SET_TOKEN 처리:", data.token);
                    setToken(data.token);
                  }

                  // 사용자 정보 설정
                  if (data.type === "SET_USER" && data.user) {
                    console.log("✅ SET_USER 처리:", data.user);
                    setUser(data.user);
                  }

                  // 로그인 성공 처리
                  if (data.type === "LOGIN_SUCCESS") {
                    console.log("✅ LOGIN_SUCCESS 수신");
                    console.log("토큰:", data.token ? "있음" : "없음");
                    console.log("사용자:", data.user ? "있음" : "없음");
                    
                    if (data.token && data.user) {
                      console.log("로그인 성공 처리 시작");
                      login(data.token, data.user);
                      const projectId =
                        Constants.expoConfig?.extra?.eas?.projectId;
                      const pushToken = (
                        await Notifications.getExpoPushTokenAsync({ projectId })
                      ).data;
                      console.log("푸시 토큰", pushToken);
                      updateNativeToken(pushToken);
                    } else {
                      console.log("❌ LOGIN_SUCCESS에 토큰 또는 사용자 정보 누락");
                    }
                  }
                } catch (error) {
                  // JSON 파싱 실패 시 기존 문자열 처리
                  const message = event.nativeEvent.data;
                  console.log("JSON 파싱 실패, 원본 메시지:", message);
                  console.log("에러:", error);
                }
                console.log("=== 메시지 처리 완료 ===\n");
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView HTTP error: ', nativeEvent);
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
