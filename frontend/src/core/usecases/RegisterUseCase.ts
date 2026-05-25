import type { IAuthRepository } from "../domain/ports/IAuthRepository";
import type { AuthTokens }      from "../domain/entities/User";

export class RegisterUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(email: string, password: string, name: string): Promise<AuthTokens> {
    // Domain validation
    if (!name.trim())               throw new Error("Name is required");
    if (name.trim().length < 2)     throw new Error("Name must be at least 2 characters");
    if (!email.trim())              throw new Error("Email is required");
    if (!this.isValidEmail(email))  throw new Error("Enter a valid email address");
    if (!password)                  throw new Error("Password is required");
    if (password.length < 8)        throw new Error("Password must be at least 8 characters");
    if (!this.hasUppercase(password)) throw new Error("Password must contain an uppercase letter");

    return this.repo.register(email.trim().toLowerCase(), password, name.trim());
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }
}