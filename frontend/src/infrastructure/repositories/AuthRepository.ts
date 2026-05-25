import { apiClient } from "../http/apiClient";
import type { IAuthRepository } from "../../core/domain/ports/IAuthRepository";
import type { AuthTokens }      from "../../core/domain/entities/User";

// Adapter — implements the port using HTTP
export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data.data as AuthTokens;
  }

  async register(email: string, password: string, name: string): Promise<AuthTokens> {
    const { data } = await apiClient.post("/auth/register", { email, password, name });
    return data.data as AuthTokens;
  }
}