import { defineStore }  from "pinia";
import { ref, computed } from "vue";
import { AuthService }  from "../services/AuthService";
import type { User }    from "../core/domain/entities/User";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const user  = ref<User | null>(
    JSON.parse(localStorage.getItem("user") ?? "null")
  );

  const isAuthenticated = computed(() => !!token.value);

  function _persist(t: string, u: User) {
    token.value = t;
    user.value  = u;
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  }

  function _clear() {
    token.value = null;
    user.value  = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await AuthService.login.execute(email, password);
    _persist(result.token, result.user);
  }

  async function register(email: string, password: string, name: string): Promise<void> {
    const result = await AuthService.register.execute(email, password, name);
    _persist(result.token, result.user);
  }

  function logout(): void {
    _clear();
  }

  return { token, user, isAuthenticated, login, register, logout };
});