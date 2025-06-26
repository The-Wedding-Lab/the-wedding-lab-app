import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Alert, SafeAreaView, StyleSheet, Vibration, View } from "react-native";

import WebView from "react-native-webview";

export default function HomeScreen() {
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
          source={{ uri: "http://192.168.0.4:3003/ui" }}
          onMessage={async (event) => {
            console.log(event.nativeEvent.data);
            const message = event.nativeEvent.data;
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
