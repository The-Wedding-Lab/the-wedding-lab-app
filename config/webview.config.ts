export const WEBVIEW_CONFIG = {
  // 기본 서버 주소
  BASE_URL: "http://192.168.0.4:3003",
  // 운영 서버 주소 (필요시 변경)
  PRODUCTION_URL: "http://1.234.44.179:3004",

  // 웹뷰 공통 설정
  WEBVIEW_PROPS: {
    javaScriptEnabled: true,
    domStorageEnabled: true,
    startInLoadingState: true,
    mixedContentMode: "compatibility" as const,
  },

  // 외부 링크 도메인 목록
  EXTERNAL_DOMAINS: [
    "map.naver.com",
    "maps.google.com",
    "www.google.com/maps",
    "tmap://",
    "kakaotalk://",
    "kakaomap://",
    "http://192.168.0.4:3003/card",
    "http://1.234.44.179:3004/card",
    "http://1.234.44.179:3003/card",
  ],

  // 페이지별 경로
  PAGES: {
    HOME: "/onboarding",
    MYPAGE: "/mypage",
    CARD: "/card",
  },

  // 토큰 및 사용자 정보 키
  STORAGE_KEYS: {
    TOKEN: "auth_token",
    USER: "auth_user",
  },

  // 메시지 타입
  MESSAGE_TYPES: {
    SET_TOKEN: "SET_TOKEN",
    SET_USER: "SET_USER",
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    GET_TOKEN: "GET_TOKEN",
    GET_USER: "GET_USER",
    CLEAR_AUTH: "CLEAR_AUTH",
  },

  // 간단한 메시지 타입
  SIMPLE_MESSAGES: {
    LOGOUT: "logout",
    VIBRATE: "vibrate",
    OPEN_CAMERA: "openCamera",
    OPEN_GALLERY: "openGallery",
  },

  // 타임아웃 설정
  TIMEOUTS: {
    AUTO_SAVE_DELAY: 500, // 자동 저장 지연 시간 (ms)
    MESSAGE_TIMEOUT: 3000, // 메시지 응답 타임아웃 (ms)
  },
};
