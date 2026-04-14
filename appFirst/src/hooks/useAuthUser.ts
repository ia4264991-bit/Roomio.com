import { useEffect, useState } from "react";

type AuthError = { message: string };
type AuthResponse<T = null> = { data: T | null; error: AuthError | null };
type ResetPayload = { email: string; otp: string; newPassword: string };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  verification: boolean;
  role?: "user" | "admin";
}

const API_URL = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(/\/+$/, "") || "http://localhost:5000";
const AUTH_EVENT = "roomio-auth-changed";
const USER_KEY = "roomio_user";

const toError = async (res: Response): Promise<AuthError> => {
  try {
    const body = await res.json();
    return { message: body?.message || "Authentication request failed" };
  } catch {
    return { message: "Authentication request failed" };
  }
};

const emitAuthChanged = () => window.dispatchEvent(new Event(AUTH_EVENT));

const saveUser = (user: AuthUser | null) => {
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  emitAuthChanged();
};

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const fetchCurrentUser = async (): Promise<AuthResponse<AuthUser>> => {
  try {
    const res = await fetch(`${API_URL}/api/data/userData`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return { data: null, error: await toError(res) };
    const body = await res.json();
    return { data: body?.data ?? null, error: null };
  } catch {
    return { data: null, error: { message: "Unable to reach auth server." } };
  }
};

export const useAuthUser = () => {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      const { data } = await fetchCurrentUser();
      setUser(data);
      saveUser(data);
      setIsAuthLoading(false);
    };
    syncUser();

    const refreshFromStorage = () => setUser(readStoredUser());
    window.addEventListener("storage", refreshFromStorage);
    window.addEventListener(AUTH_EVENT, refreshFromStorage);
    return () => {
      window.removeEventListener("storage", refreshFromStorage);
      window.removeEventListener(AUTH_EVENT, refreshFromStorage);
    };
  }, []);

  const signInWithPassword = async (email: string, password: string): Promise<AuthResponse<AuthUser>> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) return { data: null, error: await toError(res) };
      const me = await fetchCurrentUser();
      saveUser(me.data);
      setUser(me.data);
      return { data: me.data, error: me.error };
    } catch {
      return { data: null, error: { message: "Unable to reach auth server." } };
    }
  };

  const signUpWithPassword = async (email: string, password: string, displayName?: string): Promise<AuthResponse<AuthUser>> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: displayName?.trim() || email.split("@")[0],
          email: email.trim(),
          password,
        }),
      });
      if (!res.ok) return { data: null, error: await toError(res) };
      const me = await fetchCurrentUser();
      saveUser(me.data);
      setUser(me.data);
      return { data: me.data, error: me.error };
    } catch {
      return { data: null, error: { message: "Unable to reach auth server." } };
    }
  };

  const sendPasswordReset = async (email: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/resetpasswordotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) return { data: null, error: await toError(res) };
      return { data: null, error: null };
    } catch {
      return { data: null, error: { message: "Unable to reach auth server." } };
    }
  };

  const completePasswordReset = async ({ email, otp, newPassword }: ResetPayload): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/resetpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      });
      if (!res.ok) return { data: null, error: await toError(res) };
      return { data: null, error: null };
    } catch {
      return { data: null, error: { message: "Unable to reach auth server." } };
    }
  };

  const signOut = async (): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return { data: null, error: await toError(res) };
      setUser(null);
      saveUser(null);
      return { data: null, error: null };
    } catch {
      return { data: null, error: { message: "Unable to reach auth server." } };
    }
  };

  return {
    user,
    isAuthLoading,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
    completePasswordReset,
    signOut,
  };
};
