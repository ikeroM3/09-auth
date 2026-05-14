"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession, logout } from "@/lib/api/clientApi";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearIsAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const isPrivateRoute =
        pathname.startsWith("/profile") || pathname.startsWith("/notes");

      try {
        const user = await checkSession();

        if (user) {
          setUser(user);
        } else {
          clearIsAuthenticated();
          if (isPrivateRoute) {
            await logout();
            router.push("/sign-in");
          }
        }
      } catch {
        clearIsAuthenticated();
        if (isPrivateRoute) {
          router.push("/sign-in");
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [pathname, setUser, clearIsAuthenticated, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
