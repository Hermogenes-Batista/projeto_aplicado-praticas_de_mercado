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
import { print, type DocumentNode } from "graphql";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  CurrentUserDocument,
  AuthenticateUserDocument,
  AuthenticateGoogleDocument,
  EndSessionDocument,
  GoogleConfigDocument,
  RefreshSessionDocument,
  type CurrentUserQuery,
  type AuthenticateUserMutation,
  type AuthenticateUserMutationVariables,
  type AuthenticateGoogleMutation,
  type GoogleConfigQuery,
  type RefreshSessionMutation,
} from "@/graphql/generated";

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
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithGoogleCode: (code: string, redirectUri?: string) => Promise<boolean>;
  loginDemoUser: (email?: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestAuthenticatedGraphQL: <T>(
    query: DocumentNode,
    variables?: Record<string, unknown>,
  ) => Promise<T>;
  testAuthenticatedRequest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GRAPHQL_URL = `${API_URL}/graphql/`;
const INACTIVITY_WARNING_MS = 5 * 60 * 1000;
const INACTIVITY_LOGOUT_MS = 10 * 60 * 1000;
const LAST_ACTIVITY_STORAGE_KEY = "auth_last_activity";
const LOGOUT_STORAGE_KEY = "auth_logout_event";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivityRemainingSeconds, setInactivityRemainingSeconds] =
    useState<number | null>(null);
  const [inactivityResetKey, setInactivityResetKey] = useState(0);
  const inactivityWarningRef = useRef(false);
  const lastActivityBroadcastRef = useRef(0);
  const router = useRouter();

  const requestGraphQL = useCallback(
    async <T,>(
      query: string | DocumentNode,
      variables?: Record<string, unknown>,
      accessToken?: string,
    ): Promise<T> => {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          query: typeof query === "string" ? query : print(query),
          variables,
        }),
      });

      const result: GraphQLResponse<T> = await response.json();
      if (!response.ok || result.errors?.length || !result.data) {
        throw new Error(
          result.errors?.map((error) => error.message).join(", ") ||
            "Falha na requisição GraphQL.",
        );
      }
      return result.data;
    },
    [],
  );

  const normalizeUser = (userData: Record<string, unknown>): User => ({
    id: String(userData.id),
    username: String(userData.username || ""),
    email: String(userData.email || ""),
    first_name: String(userData.firstName || userData.first_name || ""),
    last_name: String(userData.lastName || userData.last_name || ""),
    is_staff: Boolean(userData.isStaff ?? userData.is_staff),
    picture: typeof userData.picture === "string" ? userData.picture : undefined,
  });

  const getCurrentUser = useCallback(
    async (accessToken: string): Promise<User> => {
      const data = await requestGraphQL<CurrentUserQuery>(
        CurrentUserDocument,
        undefined,
        accessToken,
      );

      if (!data.me) {
        throw new Error("Usuário autenticado não encontrado.");
      }
      return normalizeUser(data.me as Record<string, unknown>);
    },
    [requestGraphQL],
  );

  const refreshAccessToken = useCallback(async (_storedRefreshToken?: string) => {
    try {
      const data = await requestGraphQL<RefreshSessionMutation>(
        RefreshSessionDocument,
      );
      if (!data.refreshToken?.success || !data.refreshToken.access) {
        return null;
      }
      setToken(data.refreshToken.access);
      setRefreshToken(null);
      return data.refreshToken.access;
    } catch {
      return null;
    }
  }, [requestGraphQL]);

  // Get the Google Client ID configured in the backend
  useEffect(() => {
    requestGraphQL<GoogleConfigQuery>(GoogleConfigDocument)
      .then((data) => {
        if (data.googleClientId) {
          setClientId(data.googleClientId);
        }
      })
      .catch((err) => console.error("Erro ao carregar client_id:", err));
  }, [requestGraphQL]);

  // Restore persisted tokens from localStorage on startup
  useEffect(() => {
    // Restore the session from the HttpOnly refresh cookie.
    (async () => {
      try {
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          throw new Error("Falha ao renovar a sessão.");
        }
        const currentUser = await getCurrentUser(newAccessToken);
        setToken(newAccessToken);
        setRefreshToken(null);
        setUser(currentUser);
        localStorage.setItem("drf_user", JSON.stringify(currentUser));
      } catch {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem("drf_user");
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    })();
  }, [getCurrentUser, refreshAccessToken, router]);

  const handleAuthSuccess = (
    accessToken: string,
    _newRefreshToken: string,
    userData: User,
  ) => {
    setToken(accessToken);
    setRefreshToken(null);
    setUser(userData);
    setError(null);
    localStorage.setItem("drf_user", JSON.stringify(userData));
  };

  const loginWithCredentials = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const variables: AuthenticateUserMutationVariables = { username, password };
      const data = await requestGraphQL<AuthenticateUserMutation>(
        AuthenticateUserDocument,
        variables,
      );

      const login = data.login;
      if (!login || !login.success || !login.access || !login.refresh || !login.user) {
        throw new Error(login?.errors.join(", ") || "Falha na autenticação.");
      }

      handleAuthSuccess(
        login.access,
        login.refresh,
        normalizeUser(login.user as Record<string, unknown>),
      );
      return true;
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login through a Google ID Token / Credential (Google Identity Services)
  const loginWithGoogleCredential = async (credential: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestGraphQL<AuthenticateGoogleMutation>(
        AuthenticateGoogleDocument,
        { credential },
      );
      if (!data.loginWithGoogle?.success || !data.loginWithGoogle.access || !data.loginWithGoogle.user) {
        throw new Error(data.loginWithGoogle?.errors.join(", ") || "Falha na autenticação com o Google.");
      }

      handleAuthSuccess(data.loginWithGoogle.access, data.loginWithGoogle.refresh || "", normalizeUser(data.loginWithGoogle.user as Record<string, unknown>));
      return true;
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login through an Authorization Code
  const loginWithGoogleCode = async (code: string, redirectUri?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestGraphQL<AuthenticateGoogleMutation>(
        AuthenticateGoogleDocument,
        {
          code,
          redirectUri: redirectUri || `${window.location.origin}/auth/callback`,
        },
      );
      if (!data.loginWithGoogle?.success || !data.loginWithGoogle.access || !data.loginWithGoogle.user) {
        throw new Error(data.loginWithGoogle?.errors.join(", ") || "Falha ao validar código Google.");
      }

      handleAuthSuccess(data.loginWithGoogle.access, data.loginWithGoogle.refresh || "", normalizeUser(data.loginWithGoogle.user as Record<string, unknown>));
      return true;
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Demo / development login (generates a real token in MySQL)
  const loginDemoUser = async (email?: string, name?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestGraphQL<AuthenticateGoogleMutation>(
        AuthenticateGoogleDocument,
        {
          credential: undefined,
          code: undefined,
          redirectUri: undefined,
          demo: true,
          email: email || "usuario.google@gmail.com",
          name: name || "Usuário Google Teste",
        },
      );
      if (!data.loginWithGoogle?.success) {
        throw new Error(data.loginWithGoogle?.errors.join(", ") || "Falha no login demo.");
      }
      if (!data.loginWithGoogle.access || !data.loginWithGoogle.user) {
        throw new Error("Resposta inválida do login demo.");
      }
      handleAuthSuccess(
        data.loginWithGoogle.access,
        data.loginWithGoogle.refresh || "",
        normalizeUser(data.loginWithGoogle.user as Record<string, unknown>),
      );
      return true;
      return true;
    } catch (err: any) {
      setError(err.message || "Erro no login demo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Log out and revoke the refresh token
  const logout = useCallback(async () => {
    localStorage.setItem(LOGOUT_STORAGE_KEY, String(Date.now()));
    await requestGraphQL(EndSessionDocument).catch(() => undefined);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("drf_user");
    router.push("/sign-in")
  }, [router]);

  const requestAuthenticatedGraphQL = useCallback(
    async <T,>(
      query: DocumentNode,
      variables?: Record<string, unknown>,
    ): Promise<T> => {
      if (!token) {
        throw new Error("O usuário não está autenticado.");
      }

      try {
        const data = await requestGraphQL<T>(query, variables, token);
        return data;
      } catch (firstError) {
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          await logout();
          throw new Error("Falha na autenticação.");
        }

        try {
          return await requestGraphQL<T>(query, variables, newAccessToken);
        } catch (secondError) {
          await logout();
          throw secondError;
        }
      }
    },
    [logout, refreshAccessToken, requestGraphQL, token],
  );

  // Share activity and logout events between tabs so inactivity is session-wide.
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

    const resetInactivityTimer = (fromOtherTab = false) => {
      if (inactivityWarningRef.current && !fromOtherTab) {
        return;
      }

      inactivityWarningRef.current = false;
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

    const handleLocalActivity = () => {
      const now = Date.now();
      if (now - lastActivityBroadcastRef.current >= 1000) {
        localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
        lastActivityBroadcastRef.current = now;
      }
      resetInactivityTimer();
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_STORAGE_KEY && event.newValue) {
        resetInactivityTimer(true);
      }
      if (event.key === LOGOUT_STORAGE_KEY && event.newValue) {
        void requestGraphQL(EndSessionDocument).catch(() => undefined);
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem("drf_user");
        router.push("/sign-in");
      }
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
      window.addEventListener(eventName, handleLocalActivity);
    });
    window.addEventListener("storage", handleStorageEvent);
    localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(Date.now()));
    resetInactivityTimer();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleLocalActivity);
      });
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [inactivityResetKey, logout, requestGraphQL, router, token, user]);

  // Test a protected backend request with the access token
  const testAuthenticatedRequest = async () => {
    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    try {
      return await getCurrentUser(token);
    } catch {
      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        await logout();
        throw new Error("Falha na autenticação.");
      }

      try {
        return await getCurrentUser(newAccessToken);
      } catch {
        await logout();
        throw new Error("Falha na autenticação.");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        clientId,
        loginWithCredentials,
        loginWithGoogleCredential,
        loginWithGoogleCode,
        loginDemoUser,
        logout,
        requestAuthenticatedGraphQL,
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
                  {" "}<br/>Saída automática em{" "}
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
