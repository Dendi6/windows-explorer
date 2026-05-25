// Pure entity — no framework, no imports
export interface User {
  id:    number;
  email: string;
  name:  string;
}

export interface AuthTokens {
  token: string;
  user:  User;
}