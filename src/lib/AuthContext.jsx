import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { dataStore } from "./dataStore";
import { seedContentIfEmpty } from "./dataStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Seed content on first run
      try {
        seedContentIfEmpty();
      } catch (e) {
        console.error("Seed failed:", e);
      }

      // Load user
      try {
        let u = await dataStore.auth.me();

        // Sync identity from Route Blitzer when launched via the Coach button.
        // The URL always carries the logged-in rep's name, so overwrite any
        // stale cached identity to keep the Coach UI in sync.
        const params = new URLSearchParams(window.location.search);
        const rbRepName = params.get("repName");
        const rbSource = params.get("source");
        if (rbSource === "route-blitzer" && rbRepName && u?.full_name !== rbRepName) {
          u = await dataStore.auth.updateUser({ full_name: rbRepName });
        }

        setUser(u);
        setIsOnboarded(!!u.full_name);
      } catch (e) {
        console.error("Auth init failed:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (userData) => {
    const u = await dataStore.auth.login(userData);
    setUser(u);
    setIsOnboarded(true);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await dataStore.auth.logout();
    setUser(null);
    setIsOnboarded(false);
  }, []);

  const updateUser = useCallback((patch) => {
    dataStore.auth.updateUser(patch).then(setUser);
  }, []);

  const awardXP = useCallback(async (amount, reason) => {
    const result = await dataStore.auth.awardXP(amount, reason);
    setUser(result.user);
    return result;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isOnboarded,
    login,
    logout,
    updateUser,
    awardXP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
