"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { login, LoginData } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import { User } from "@/types/user";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import css from "./login.module.css";

export default function SignInPage() {
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation<
    User,
    AxiosError<{ message: string }>,
    LoginData
  >({
    mutationFn: (data) => login(data),
    onSuccess: (user) => {
      setUser(user);
      router.push("/profile");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data: LoginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    mutation.mutate(data);
  };

  return (
    <main className={css.mainContent}>
      <motion.form
        className={css.form}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <span className={css.formKicker}>
          <Sparkles size={15} aria-hidden="true" />
          Welcome back
        </span>
        <h1 className={css.formTitle}>Sign in to NoteHub OS</h1>

        <div className={css.formGroup}>
          <Mail size={18} aria-hidden="true" />
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            placeholder=" "
            required
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className={css.formGroup}>
          <Lock size={18} aria-hidden="true" />
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            placeholder=" "
            required
          />
          <label htmlFor="password">Password</label>
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className={css.spinIcon} size={18} aria-hidden="true" />
            )}
            {mutation.isPending ? "Logging in..." : "Log in"}
          </button>
        </div>

        {mutation.isError && (
          <p className={css.error}>
            {mutation.error.response?.data?.message ||
              "Login failed. Check your credentials."}
          </p>
        )}
      </motion.form>
    </main>
  );
}
