import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";

import WebView from "react-native-webview";
import { useAuthStore } from "../../store/authStore";

export default function HomeScreen() {
  const { logout, token, user, setToken, setUser, login } = useAuthStore();
  const webViewRef = useRef<WebView>(null);

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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WebView
          ref={webViewRef}
          // source={{ uri: "http://1.234.44.179:3004/" }}
          source={{ uri: "http://192.168.0.4:3003/onboarding" }}
          onShouldStartLoadWithRequest={(request) => {
            const externalDomains = [
              "map.naver.com",
              "maps.google.com",
              "www.google.com/maps",
              "tmap://",
              "kakaotalk://",
              "kakaomap://",
              "http://192.168.0.4:3003/card",
              "http://1.234.44.179:3004/card",
              "http://1.234.44.179:3003/card",
            ];

            const isExternalLink = externalDomains.some((domain) =>
              request.url.includes(domain)
            );

            if (isExternalLink) {
              Linking.openURL(request.url);
              return false;
            }

            return true;
          }}
          onMessage={async (event) => {
            console.log(event.nativeEvent.data);

            try {
              // JSON 파싱 시도
              const data = JSON.parse(event.nativeEvent.data);

              switch (data.type) {
                case "SET_TOKEN":
                  if (data.token) {
                    setToken(data.token);
                  }
                  break;

                case "SET_USER":
                  if (data.user) {
                    setUser(data.user);
                  }
                  break;

                case "LOGIN_SUCCESS":
                  if (data.token && data.user) {
                    login(data.token, data.user);
                  }
                  break;

                case "GET_TOKEN":
                  webViewRef.current?.postMessage(
                    JSON.stringify({
                      type: "TOKEN_RESPONSE",
                      token: token,
                    })
                  );
                  break;

                case "GET_USER":
                  webViewRef.current?.postMessage(
                    JSON.stringify({
                      type: "USER_RESPONSE",
                      user: user,
                    })
                  );
                  break;

                case "CLEAR_AUTH":
                  await logout();
                  break;

                default:
                  console.log("알 수 없는 메시지 타입:", data.type);
              }
            } catch (error) {
              // JSON 파싱 실패 시 기존 문자열 메시지 처리-
              const message = event.nativeEvent.data;

              // 로그아웃 메시지 처리
              if (message === "logout") {
                await logout();
              }

              if (message === "vibrate") {
                Vibration.vibrate();
              }
              if (message === "openCamera") {
                const { status } = await Camera.requestCameraPermissionsAsync();
                if (status !== "granted") {
                  Alert.alert("권한 필요", "카메라 사용 권한이 필요합니다.");
                  return;
                } else {
                  openCamera();
                }
              }
              if (message === "openGallery") {
                openGallery();
              }
            }
          }}
        />
      </SafeAreaView>
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
    paddingBottom: 80, // 탭바 높이만큼 패딩 추가
  },
});
