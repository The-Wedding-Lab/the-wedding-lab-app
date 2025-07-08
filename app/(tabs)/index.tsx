import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Alert, SafeAreaView, StyleSheet, Vibration, View } from "react-native";

import WebView from "react-native-webview";
import { useAuth } from "../_layout";

export default function HomeScreen() {
  const { logout } = useAuth();

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
          source={{ uri: "http://1.234.44.179:3004/ui" }}
          onMessage={async (event) => {
            console.log(event.nativeEvent.data);
            const message = event.nativeEvent.data;

            // 로그아웃 메시지 처리 - Context를 통해 바로 로그인 화면으로 전환
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
  },
});
