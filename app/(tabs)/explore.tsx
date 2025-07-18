import { SafeAreaView, StyleSheet, View } from "react-native";

import WebView from "react-native-webview";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WebView source={{ uri: "http://1.234.44.179:3004/onboarding" }} />
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
