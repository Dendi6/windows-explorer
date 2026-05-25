import type { IAuthRepository } from "../domain/ports/IAuthRepository";
import type { AuthTokens }      from "../domain/entities/User";

export class LoginUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthTokens> {
    // Domain validation — happens before any API call
    if (!email.trim())         throw new Error("Email is required");
    if (!this.isValidEmail(email)) throw new Error("Enter a valid email address");
    if (!password)             throw new Error("Password is required");

    return this.repo.login(email.trim().toLowerCase(), password);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}