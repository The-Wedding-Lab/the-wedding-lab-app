import WebViewComponent from "@/components/WebViewComponent";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WebViewComponent uri={`http://1.234.44.179/community`} />
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
