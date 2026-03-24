import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface DealerInfo {
  id: number;
  businessName: string;
  contactName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  dealer: DealerInfo | null;
  loading: boolean;
  isApproved: boolean;
  isPending: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = "/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      const data = await res.json();
      setDealer(data.dealer || null);
    } catch {
      setDealer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Login failed" };
      }
      setDealer(data.dealer);
      return {};
    } catch {
      return { error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setDealer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        dealer,
        loading,
        isApproved: dealer?.status === "approved",
        isPending: dealer?.status === "pending",
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
