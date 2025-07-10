import Constants from "expo-constants";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { Alert, Button, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "../../store/authStore";

export default function TabTestNotification() {
  const { logout } = useAuthStore();
  // 로컬 알림
  async function scheduleLocalNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "테스트",
        body: "로컬 알림이 도착했습니다!",
        data: { data: "goes here" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    Alert.alert("로컬 알림 예약 완료", "5초 뒤에 알림이 울립니다.");
  }

  // 토큰으로 푸시 알림 보내기
  async function sendPushNotification() {
    // 1. ProjectId 가져오기 (토큰 발급에 필수)
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      Alert.alert(
        "오류",
        "푸시 알림을 보내려면 app.json에 projectId가 필요합니다."
      );
      return;
    }

    // 2. 현재 기기의 푸시 토큰 가져오기
    let token;
    try {
      //   token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      token = "ExponentPushToken[uMO07XIe1FN6rZUvwC-aGF]";
    } catch (error) {
      Alert.alert("토큰 가져오기 실패", `${error}`);
      return;
    }

    // 3. 푸시 메시지 생성
    const message = {
      to: token,
      sound: "default",
      title: "토큰으로 보낸 알림",
      body: "백엔드 없이 앱에서 직접 보냈습니다!",
    };

    // 4. Expo 푸시 서버로 요청 보내기
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      Alert.alert("알림 요청 성공", "곧 푸시 알림이 도착할 것입니다.");
    } catch (error) {
      Alert.alert("알림 요청 실패", `${error}`);
    }
  }

  // 생체 인증 테스트
  async function handleAuthentication() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert("오류", "이 기기에서는 생체 인식을 지원하지 않습니다.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "생체 정보를 사용하여 인증해주세요.",
    });

    if (result.success) {
      Alert.alert("성공", "생체 인증에 성공했습니다.");
    } else {
      Alert.alert(
        "실패",
        result.error === "user_cancel"
          ? "사용자가 인증을 취소했습니다."
          : "생체 인증에 실패했습니다."
      );
    }
  }

  // 앱 재시작 (스플래시 테스트용)
  async function reloadApp() {
    await Updates.reloadAsync();
  }

  // 로그아웃 테스트 함수
  async function handleLogout() {
    await logout();
    Alert.alert("로그아웃", "로그아웃되었습니다.");
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">알림 테스트</ThemedText>

      <Button
        title="5초 뒤에 로컬 알림 보내기"
        onPress={scheduleLocalNotification}
      />

      <View style={styles.separator} />

      <Button
        title="토큰으로 푸시 알림 보내기"
        onPress={sendPushNotification}
      />
      <ThemedText style={styles.subtitle}>
        (현재 기기로 푸시 알림을 보냅니다)
      </ThemedText>
      <View style={styles.separator} />
      <Button title="생체 인증 테스트" onPress={handleAuthentication} />
      <View style={styles.separator} />
      <Button title="앱 재시작 (스플래시 테스트)" onPress={reloadApp} />
      <View style={styles.separator} />
      <Button title="로그아웃 테스트" onPress={handleLogout} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  separator: {
    marginVertical: 15,
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
});
