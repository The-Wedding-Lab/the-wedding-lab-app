import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef } from "react";
import { Alert, Linking, Vibration } from "react-native";
import WebView from "react-native-webview";
import { WEBVIEW_CONFIG } from "../config/webview.config";
import { useAuthStore } from "../store/authStore";

interface WebViewComponentProps {
  uri: string;
  onShouldStartLoadWithRequest?: (request: any) => boolean;
  style?: any;
}

export default function WebViewComponent({
  uri,
  onShouldStartLoadWithRequest,
  style,
}: WebViewComponentProps) {
  const { logout, token, user, setToken, setUser, login, isLoggedIn } = useAuthStore();
  const webViewRef = useRef<WebView>(null);

  // 컴포넌트 로드 시 현재 인증 상태 로그
  console.log("WebViewComponent 로드됨");
  console.log("현재 로그인 상태:", isLoggedIn);
  console.log("현재 토큰:", token ? "있음" : "없음");
  console.log("현재 사용자:", user);

  async function openCamera() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 사용 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      console.log("📷 사진 URI:", result.assets[0].uri);
    }
  }

  async function openGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "앨범 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled) {
      console.log("📸 선택된 사진 URI:", result.assets[0].uri);
    }
  }

  // 기본 외부 링크 처리 함수
  const defaultShouldStartLoadWithRequest = (request: any) => {
    const isExternalLink = WEBVIEW_CONFIG.EXTERNAL_DOMAINS.some((domain) =>
      request.url.includes(domain)
    );

    if (isExternalLink) {
      Linking.openURL(request.url);
      return false;
    }
    return true;
  };

  const handleLoadEnd = () => {
    console.log("WebView loaded");

    // 웹뷰 로드 완료 후 바로 현재 토큰과 사용자 정보를 저장
    setTimeout(() => {
      if (token) {
        console.log("WebView 로드 후 토큰 자동 저장:", token);
        webViewRef.current?.injectJavaScript(`
          localStorage.setItem('${WEBVIEW_CONFIG.STORAGE_KEYS.TOKEN}', '${token}');
          console.log('자동 토큰 저장 완료:', '${token}');
          true;
        `);
      }

      if (user) {
        console.log("WebView 로드 후 사용자 정보 자동 저장:", user);
        const userString = JSON.stringify(user);
        webViewRef.current?.injectJavaScript(`
          localStorage.setItem('${
            WEBVIEW_CONFIG.STORAGE_KEYS.USER
          }', '${userString.replace(/'/g, "\\'")}');
          console.log('자동 사용자 정보 저장 완료');
          true;
        `);
      } else {
        console.log("WebView 로드 시 사용자 정보가 없음:", user);
      }
    }, WEBVIEW_CONFIG.TIMEOUTS.AUTO_SAVE_DELAY);
  };

  const handleMessage = async (event: any) => {
    console.log(event.nativeEvent.data);

    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case WEBVIEW_CONFIG.MESSAGE_TYPES.SET_TOKEN:
          if (data.token) {
            setToken(data.token);
            // 웹의 localStorage에도 저장
            webViewRef.current?.injectJavaScript(`
              localStorage.setItem('${
                WEBVIEW_CONFIG.STORAGE_KEYS.TOKEN
              }', ${JSON.stringify(data.token)});
              console.log('토큰이 localStorage에 저장됨:', ${JSON.stringify(
                data.token
              )});
              true;
            `);
          }
          break;

        case WEBVIEW_CONFIG.MESSAGE_TYPES.SET_USER:
          if (data.user) {
            setUser(data.user);
            // 웹의 localStorage에도 저장
            webViewRef.current?.injectJavaScript(`
              localStorage.setItem('${
                WEBVIEW_CONFIG.STORAGE_KEYS.USER
              }', ${JSON.stringify(JSON.stringify(data.user))});
              console.log('사용자 정보가 localStorage에 저장됨:', ${JSON.stringify(
                JSON.stringify(data.user)
              )});
              true;
            `);
          }
          break;

        case WEBVIEW_CONFIG.MESSAGE_TYPES.LOGIN_SUCCESS:
          if (data.token && data.user) {
            login(data.token, data.user);
            // 웹의 localStorage에도 저장
            webViewRef.current?.injectJavaScript(`
              localStorage.setItem('${
                WEBVIEW_CONFIG.STORAGE_KEYS.TOKEN
              }', ${JSON.stringify(data.token)});
              localStorage.setItem('${
                WEBVIEW_CONFIG.STORAGE_KEYS.USER
              }', ${JSON.stringify(JSON.stringify(data.user))});
              console.log('로그인 정보가 localStorage에 저장됨');
              true;
            `);
          }
          break;

        case WEBVIEW_CONFIG.MESSAGE_TYPES.GET_TOKEN:
          console.log("토큰 전송:", token);
          // localStorage에 직접 저장 (더 안전한 방식)
          const tokenValue = token || null;
          webViewRef.current?.injectJavaScript(`
            try {
              localStorage.setItem('${WEBVIEW_CONFIG.STORAGE_KEYS.TOKEN}', '${tokenValue}');
              console.log('토큰이 localStorage에 저장됨:', '${tokenValue}');
            } catch (e) {
              console.error('토큰 저장 실패:', e);
            }
            true;
          `);
          break;

        case WEBVIEW_CONFIG.MESSAGE_TYPES.GET_USER:
          console.log("GET_USER 요청 받음");
          console.log("현재 user 상태:", user);
          console.log("user가 null인가?", user === null);
          console.log("user가 undefined인가?", user === undefined);
          console.log("user 타입:", typeof user);
          
          if (user) {
            console.log("사용자 정보 전송:", user);
            // localStorage에 직접 저장 (더 안전한 방식)
            const userString = JSON.stringify(user);
            webViewRef.current?.injectJavaScript(`
              try {
                localStorage.setItem('${
                  WEBVIEW_CONFIG.STORAGE_KEYS.USER
                }', '${userString.replace(/'/g, "\\'")}');
                console.log('사용자 정보가 localStorage에 저장됨:', '${userString.replace(
                  /'/g,
                  "\\'"
                )}');
              } catch (e) {
                console.error('사용자 정보 저장 실패:', e);
              }
              true;
            `);
          } else {
            console.log("사용자 정보가 없음 - null 또는 undefined");
            // 빈 객체라도 저장해서 웹에서 처리할 수 있도록 함
            webViewRef.current?.injectJavaScript(`
              try {
                localStorage.setItem('${WEBVIEW_CONFIG.STORAGE_KEYS.USER}', '{}');
                console.log('빈 사용자 정보가 localStorage에 저장됨');
              } catch (e) {
                console.error('빈 사용자 정보 저장 실패:', e);
              }
              true;
            `);
          }
          break;

        case WEBVIEW_CONFIG.MESSAGE_TYPES.CLEAR_AUTH:
          await logout();
          // 웹의 localStorage도 클리어
          webViewRef.current?.injectJavaScript(`
            localStorage.removeItem('${WEBVIEW_CONFIG.STORAGE_KEYS.TOKEN}');
            localStorage.removeItem('${WEBVIEW_CONFIG.STORAGE_KEYS.USER}');
            console.log('localStorage 클리어됨');
            true;
          `);
          break;

        default:
          console.log("알 수 없는 메시지 타입:", data.type);
      }
    } catch (error) {
      const message = event.nativeEvent.data;

      if (message === WEBVIEW_CONFIG.SIMPLE_MESSAGES.LOGOUT) {
        await logout();
      }
      if (message === WEBVIEW_CONFIG.SIMPLE_MESSAGES.VIBRATE) {
        Vibration.vibrate();
      }
      if (message === WEBVIEW_CONFIG.SIMPLE_MESSAGES.OPEN_CAMERA) {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "카메라 사용 권한이 필요합니다.");
          return;
        } else {
          openCamera();
        }
      }
      if (message === WEBVIEW_CONFIG.SIMPLE_MESSAGES.OPEN_GALLERY) {
        openGallery();
      }
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri }}
      {...WEBVIEW_CONFIG.WEBVIEW_PROPS}
      onShouldStartLoadWithRequest={
        onShouldStartLoadWithRequest || defaultShouldStartLoadWithRequest
      }
      onLoadEnd={handleLoadEnd}
      onMessage={handleMessage}
      style={style}
    />
  );
}
