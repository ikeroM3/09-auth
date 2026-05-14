import { create } from "zustand";
import { User } from "@/types/user";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearIsAuthenticated: () => void;
}

// Використовуємо подвійні дужки ()((set) => ...), як вимагає ТЗ
export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,

  // Метод для запису даних після успішного логіну або реєстрації
  setUser: (user: User) =>
    set({
      user,
      isAuthenticated: true,
    }),

  // Метод для очищення стану під час виходу із системи
  clearIsAuthenticated: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
