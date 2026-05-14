"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { register, LoginData } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import { User } from "@/types/user";
import css from "./Register.module.css";

export default function SignUpPage() {
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation<
    User,
    AxiosError<{ message: string }>,
    LoginData
  >({
    mutationFn: (data) => register(data),
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
      <h1 className={css.formTitle}>Sign up</h1>
      <form className={css.form} onSubmit={handleSubmit}>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            required
          />
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Registering..." : "Register"}
          </button>
        </div>

        {mutation.isError && (
          <p className={css.error}>
            {mutation.error.response?.data?.message ||
              "Registration failed. Please try again."}
          </p>
        )}
      </form>
    </main>
  );
}
