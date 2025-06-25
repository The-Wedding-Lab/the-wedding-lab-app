import { SafeAreaView, StyleSheet } from "react-native";

import WebView from "react-native-webview";

export default function TabTwoScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <WebView source={{ uri: "http://192.168.0.4:3003/onboarding" }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
