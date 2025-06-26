import { SafeAreaView, StyleSheet, View } from "react-native";

import WebView from "react-native-webview";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WebView source={{ uri: "http://192.168.0.4:3003/onboarding" }} />
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
