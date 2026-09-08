export type UserRole = 'ADMIN' | 'MEDICO' | 'RECEPCAO' | 'PACIENTE';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
