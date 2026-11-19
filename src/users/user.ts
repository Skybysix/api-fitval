// Representa un usuario tal y como está guardado en la tabla users.
export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: string; // 'member' o 'staff'
}
