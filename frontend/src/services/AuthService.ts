import { AuthRepository }  from "../infrastructure/repositories/AuthRepository";
import { LoginUseCase }    from "../core/usecases/LoginUseCase";
import { RegisterUseCase } from "../core/usecases/RegisterUseCase";

// Wires use cases with the real adapter
// Swap AuthRepository for a MockAuthRepository in tests
const repo = new AuthRepository();

export const AuthService = {
  login:    new LoginUseCase(repo),
  register: new RegisterUseCase(repo),
};