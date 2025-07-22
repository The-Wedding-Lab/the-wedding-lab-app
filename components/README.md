# WebViewComponent 사용 가이드

React Native WebView를 위한 재사용 가능한 컴포넌트입니다.

## 특징

- ✅ 공통 설정 관리 (config/webview.config.ts)
- ✅ 인증 토큰 자동 동기화
- ✅ 카메라/갤러리 권한 처리
- ✅ 외부 링크 자동 처리
- ✅ 진동, 로그아웃 등 네이티브 기능 지원

## 사용법

### 기본 사용

```tsx
import WebViewComponent from "../../components/WebViewComponent";
import { WEBVIEW_CONFIG } from "../../config/webview.config";

export default function MyScreen() {
  return (
    <WebViewComponent
      uri={`${WEBVIEW_CONFIG.BASE_URL}${WEBVIEW_CONFIG.PAGES.HOME}`}
    />
  );
}
```

### 커스텀 외부 링크 처리

```tsx
import WebViewComponent from "../../components/WebViewComponent";

export default function MyScreen() {
  const handleExternalLinks = (request: any) => {
    // 커스텀 로직
    if (request.url.includes("특정도메인")) {
      // 외부 앱에서 열기
      Linking.openURL(request.url);
      return false;
    }
    return true;
  };

  return (
    <WebViewComponent
      uri="https://example.com"
      onShouldStartLoadWithRequest={handleExternalLinks}
    />
  );
}
```

### 스타일 커스터마이제이션

```tsx
import WebViewComponent from "../../components/WebViewComponent";

export default function MyScreen() {
  return (
    <WebViewComponent
      uri="https://example.com"
      style={{ backgroundColor: "red" }}
    />
  );
}
```

## 설정 관리

모든 설정은 `config/webview.config.ts`에서 관리됩니다:

```ts
export const WEBVIEW_CONFIG = {
  BASE_URL: "http://192.168.0.4:3003",
  PAGES: {
    HOME: "/onboarding",
    MYPAGE: "/mypage",
  },
  EXTERNAL_DOMAINS: [
    "map.naver.com",
    "maps.google.com",
    // ...
  ],
  // ...
};
```

## 웹과의 통신

### React Native → 웹

- 토큰과 사용자 정보가 자동으로 localStorage에 저장됩니다
- WebView 로드 완료 후 500ms 뒤에 자동 저장

### 웹 → React Native

웹에서 다음과 같이 메시지를 보낼 수 있습니다:

```js
// 토큰 설정
window.ReactNativeWebView?.postMessage(
  JSON.stringify({
    type: "SET_TOKEN",
    token: "your_token",
  })
);

// 사용자 정보 설정
window.ReactNativeWebView?.postMessage(
  JSON.stringify({
    type: "SET_USER",
    user: { id: 1, name: "홍길동" },
  })
);

// 로그인 성공
window.ReactNativeWebView?.postMessage(
  JSON.stringify({
    type: "LOGIN_SUCCESS",
    token: "token",
    user: { id: 1, name: "홍길동" },
  })
);

// 간단한 메시지
window.ReactNativeWebView?.postMessage("vibrate"); // 진동
window.ReactNativeWebView?.postMessage("openCamera"); // 카메라 열기
window.ReactNativeWebView?.postMessage("openGallery"); // 갤러리 열기
```

## Props

| Prop                         | Type     | Required | Description         |
| ---------------------------- | -------- | -------- | ------------------- |
| uri                          | string   | ✅       | 로드할 웹페이지 URL |
| onShouldStartLoadWithRequest | function | ❌       | 외부 링크 처리 함수 |
| style                        | object   | ❌       | WebView 스타일      |

## 지원하는 메시지 타입

- `SET_TOKEN` - 토큰 저장
- `SET_USER` - 사용자 정보 저장
- `LOGIN_SUCCESS` - 로그인 성공
- `GET_TOKEN` - 토큰 요청
- `GET_USER` - 사용자 정보 요청
- `CLEAR_AUTH` - 인증 정보 삭제
- `vibrate` - 진동
- `openCamera` - 카메라 열기
- `openGallery` - 갤러리 열기
- `logout` - 로그아웃
