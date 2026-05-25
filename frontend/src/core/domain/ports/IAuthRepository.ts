import type { AuthTokens } from "../entities/User";

// Port = contract. The core doesn't care HOW it's implemented.
export interface IAuthRepository {
  login(email: string, password: string):                    Promise<AuthTokens>;
  register(email: string, password: string, name: string):   Promise<AuthTokens>;
}