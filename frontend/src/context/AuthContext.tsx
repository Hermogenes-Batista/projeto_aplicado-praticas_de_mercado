"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {useRouter} from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  picture?: string;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  clientId: string;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithGoogleCode: (code: string, redirectUri?: string) => Promise<boolean>;
  loginDemoUser: (email?: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  testAuthenticatedRequest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const INACTIVITY_WARNING_MS = 5 * 60 * 1000;
const INACTIVITY_LOGOUT_MS = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivityRemainingSeconds, setInactivityRemainingSeconds] =
    useState<number | null>(null);
  const [inactivityResetKey, setInactivityResetKey] = useState(0);
  const inactivityWarningRef = useRef(false);
  const router = useRouter();

  // Obter o Google Client ID configurado no backend
  useEffect(() => {
    fetch(`${API_URL}/api/auth/config/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        console.log("auth config", data);
        if (data?.client_id) {
          setClientId(data.client_id);
        }
      })
      .catch((err) => console.error("Erro ao carregar client_id:", err));
  }, []);

  // Recuperar token persistido no localStorage ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem("drf_token");
    const savedUser = localStorage.getItem("drf_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }

      // Validar token com o backend
      fetch(`${API_URL}/api/auth/me/`, {
        headers: {
          Authorization: `Token ${savedToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            // Token expirado ou inválido
            logout();
          } else {
            return res.json();
          }
        })
        .then((userData) => {
          if (userData) {
            setUser((prev) => ({ ...prev, ...userData }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      router.push("/sign-in")
    }
  }, []);

  const handleAuthSuccess = (tokenKey: string, userData: User) => {
    setToken(tokenKey);
    setUser(userData);
    setError(null);
    localStorage.setItem("drf_token", tokenKey);
    localStorage.setItem("drf_user", JSON.stringify(userData));
  };

  // Login via Google ID Token / Credential (Google Identity Services)
  const loginWithGoogleCredential = async (credential: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha na autenticação com o Google.");
      }

      handleAuthSuccess(data.token, data.user);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login via Authorization Code
  const loginWithGoogleCode = async (code: string, redirectUri?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          redirect_uri: redirectUri || `${window.location.origin}/auth/callback`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao validar código Google.");
      }

      handleAuthSuccess(data.token, data.user);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login de Demonstração / Dev (gera token real no MySQL)
  const loginDemoUser = async (email?: string, name?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo: true,
          email: email || "usuario.google@gmail.com",
          name: name || "Usuário Google Teste",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no login demo.");
      }

      handleAuthSuccess(data.token, data.user);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro no login demo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout e revogação do Token
  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      } catch (e) {
        // Ignora erro de rede no logout
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("drf_token");
    localStorage.removeItem("drf_user");
    router.push("/sign-in")
  }, [router, token]);

  // Encerrar a sessão após 120 segundos sem interação enquanto o usuário estiver logado.
  useEffect(() => {
    if (!user || !token) {
      inactivityWarningRef.current = false;
      setShowInactivityWarning(false);
      setInactivityRemainingSeconds(null);
      return;
    }

    let warningTimer: ReturnType<typeof setTimeout>;
    let logoutTimer: ReturnType<typeof setTimeout>;
    let countdownTimer: ReturnType<typeof setInterval>;

    const resetInactivityTimer = () => {
      if (inactivityWarningRef.current) {
        return;
      }

      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      setShowInactivityWarning(false);
      setInactivityRemainingSeconds(null);

      warningTimer = setTimeout(() => {
        inactivityWarningRef.current = true;
        setShowInactivityWarning(true);
        setInactivityRemainingSeconds(
          Math.ceil((INACTIVITY_LOGOUT_MS - INACTIVITY_WARNING_MS) / 1000),
        );
        countdownTimer = setInterval(() => {
          setInactivityRemainingSeconds((seconds) =>
            seconds === null ? null : Math.max(seconds - 1, 0),
          );
        }, 1000);
      }, INACTIVITY_WARNING_MS);
      logoutTimer = setTimeout(() => {
        void logout();
      }, INACTIVITY_LOGOUT_MS);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer);
    });
    resetInactivityTimer();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [inactivityResetKey, logout, token, user]);

  // Testar requisição protegida ao backend com o Token
  const testAuthenticatedRequest = async () => {
    if (!token) {
      throw new Error("Usuário não autenticado");
    }
    const res = await fetch(`${API_URL}/api/auth/me/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Erro ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        clientId,
        loginWithGoogleCredential,
        loginWithGoogleCode,
        loginDemoUser,
        logout,
        testAuthenticatedRequest,
      }}
    >
      {children}
      <Dialog
        open={showInactivityWarning}
        onClose={() => undefined}
        aria-labelledby="inactivity-dialog-title"
        aria-describedby="inactivity-dialog-description"
      >
        <DialogTitle id="inactivity-dialog-title">Ainda está aí?</DialogTitle>
        <DialogContent>
          <DialogContentText id="inactivity-dialog-description">
            Sua sessão será encerrada por inatividade.
            {inactivityRemainingSeconds !== null &&
              inactivityRemainingSeconds <= 30 && (
                <>
                  {" "}<br/>Logout automático em{" "}
                  <strong>{inactivityRemainingSeconds}s</strong>.
                </>
              )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => void logout()}>
            Deslogar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              inactivityWarningRef.current = false;
              setShowInactivityWarning(false);
              setInactivityResetKey((key) => key + 1);
            }}
            autoFocus
          >
            Ainda estou ativo
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
