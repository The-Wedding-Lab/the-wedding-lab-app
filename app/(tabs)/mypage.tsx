import { SafeAreaView, StyleSheet, View } from "react-native";
import WebViewComponent from "../../components/WebViewComponent";

export default function MyPageScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* <WebViewComponent uri={`http://192.168.0.4:3003/mypage`} /> */}
        <WebViewComponent uri={`http://1.234.44.179:3004/mypage`} />
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
