"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { getMe } from "@/lib/api/clientApi";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getMe();
        setUser(user);
      } catch {
        clearIsAuthenticated();
      } finally {
        setReady(true);
      }
    };

    load();
  }, [setUser, clearIsAuthenticated]);

  if (!ready) return null;

  return <>{children}</>;
}
