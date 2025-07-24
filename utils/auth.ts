// JWT 토큰 유효성 검사 함수
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    return true; // 오류 발생 시 만료된 것으로 처리
  }
}

// JWT 토큰에서 사용자 정보 추출
export function getUserFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error("토큰에서 사용자 정보 추출 오류:", error);
    return null;
  }
}
