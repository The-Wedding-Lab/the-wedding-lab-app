import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isTokenExpired } from "../utils/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateNativeToken: (nativeToken: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      setToken: (token: string) => {
        set({ token, isLoggedIn: true });
      },

      setUser: (user: User) => {
        set({ user });
      },

      login: (token: string, user: User) => {
        set({ token, user, isLoggedIn: true });
      },

      logout: async () => {
        try {
          await AsyncStorage.multiRemove(["auth-storage"]);
          set({ token: null, user: null, isLoggedIn: false });
        } catch (error) {
          console.error("로그아웃 오류:", error);
        }
      },

      initializeAuth: async () => {
        try {
          const { token, user } = get();

          // 토큰이 있으면 유효성 검사
          if (token && user) {
            if (isTokenExpired(token)) {
              // 토큰이 만료되었으면 로그아웃
              console.log("토큰이 만료되어 로그아웃합니다.");
              await get().logout();
            } else {
              // 토큰이 유효하면 로그인 상태로 설정
              set({ isLoggedIn: true });
            }
          } else {
            // 토큰이나 사용자 정보가 없으면 로그아웃 상태
            set({ isLoggedIn: false });
          }
        } catch (error) {
          console.error("인증 초기화 오류:", error);
          set({ token: null, user: null, isLoggedIn: false });
        }
      },

      updateNativeToken: async (nativeToken: string) => {
        try {
          const { user } = get();

          if (!user) {
            console.error("사용자 정보가 없습니다.");
            return false;
          }

          // DB에 네이티브 토큰 업데이트 API 호출
          const response = await fetch(
            "http://192.168.0.4:3003/api/users/native-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${get().token}`,
              },
              body: JSON.stringify({
                userId: user.id,
                nativeToken: nativeToken,
              }),
            }
          );

          if (response.ok) {
            console.log("네이티브 토큰 DB 업데이트 성공");
            return true;
          } else {
            console.error("네이티브 토큰 DB 업데이트 실패:", response.status);
            return false;
          }
        } catch (error) {
          console.error("네이티브 토큰 업데이트 오류:", error);
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
