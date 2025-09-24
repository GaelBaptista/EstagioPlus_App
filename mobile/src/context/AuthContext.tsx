import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export type AppUser = {
  id: number;
  name: string;
  cpf?: string;
  email: string;
  points?: number;
  nextLevel?: number;
  level?: string;
  avatar_url?: string | null;
};

type AuthState = {
  user: AppUser | null;
  token: string | null;
};

type AuthContextType = {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const STORAGE_KEY = "@estagioplus/auth_token";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [{ user, token }, setAuth] = useState<AuthState>({
    user: null,
    token: null,
  });
  const [hydrated, setHydrated] = useState(false);

  // aplica/remover header Authorization
  const applyTokenHeader = useCallback((t?: string | null) => {
    if (t) {
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, []);

  // Restaura token do storage ao iniciar e tenta carregar /auth/me
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          applyTokenHeader(saved);
          // tenta obter o usuário atual
          try {
            const { data } = await api.get<{ user: AppUser }>("/auth/me");
            setAuth({ user: data.user, token: saved });
          } catch {
            // token inválido/expirado: limpa
            applyTokenHeader(null);
            await AsyncStorage.removeItem(STORAGE_KEY);
            setAuth({ user: null, token: null });
          }
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, [applyTokenHeader]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post("/auth/login", { email, password });
      const nextUser: AppUser = data.user;
      const nextToken: string = data.token;

      // persiste e aplica header
      await AsyncStorage.setItem(STORAGE_KEY, nextToken);
      applyTokenHeader(nextToken);
      setAuth({ user: nextUser, token: nextToken });
    },
    [applyTokenHeader]
  );

  const refresh = useCallback(async () => {
    // útil para revalidar o usuário depois do login, ou ao abrir a Home
    if (!token) return;
    try {
      const { data } = await api.get<{ user: AppUser }>("/auth/me");
      setAuth((prev) => ({ ...prev, user: data.user }));
    } catch {
      // se der ruim, desloga silenciosamente
      await AsyncStorage.removeItem(STORAGE_KEY);
      applyTokenHeader(null);
      setAuth({ user: null, token: null });
    }
  }, [token, applyTokenHeader]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    applyTokenHeader(null);
    setAuth({ user: null, token: null });
  }, [applyTokenHeader]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      hydrated,
      login,
      logout,
      refresh,
    }),
    [user, token, hydrated, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
