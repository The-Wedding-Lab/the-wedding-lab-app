import { Linking, SafeAreaView, StyleSheet, View } from "react-native";
import WebViewComponent from "../../components/WebViewComponent";
import { WEBVIEW_CONFIG } from "../../config/webview.config";

export default function HomeScreen() {
  // 홈 화면 전용 외부 링크 처리
  const handleShouldStartLoadWithRequest = (request: any) => {
    const isExternalLink = WEBVIEW_CONFIG.EXTERNAL_DOMAINS.some((domain) =>
      request.url.includes(domain)
    );

    if (isExternalLink) {
      Linking.openURL(request.url);
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WebViewComponent
          // uri={`http://192.168.0.4:3003/onboarding`}
          uri={`http://1.234.44.179:3004/onboarding`}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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
