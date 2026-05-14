"use client";

import { useEffect, useState, ReactNode } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession, getMe } from "@/lib/api/clientApi";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const session = await checkSession();
        if (session) {
          const user = await getMe();
          setUser(user);
        } else {
          clearIsAuthenticated();
        }
      } catch {
        clearIsAuthenticated();
      } finally {
        setIsChecked(true);
      }
    };

    verifyAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isChecked) {
    return <p>Loading, please wait...</p>;
  }

  return <>{children}</>;
}
