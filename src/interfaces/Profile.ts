export type UUID = string;
export type AppRole = 'AdminGeneral' | 'AdminUser' | 'Usuario' ;

export interface Profile{
  id?: UUID; // Referencia a auth.users.id
  nombre: string; // Usamos nombre en lugar de username para coincidir con el SQL
  familia_id?: UUID | null;
  avatar_url?: string | null; // El link de la imagen que guardamos en BD
  avatar_file?: File |null; // Útil en el frontend cuando el usuario sube la foto
  role?: AppRole; 
  created_at?: string; // Recuerda que al mostrarlo en pantalla usaremos el formato dd-mm-yyyy
}


export interface RegisterData extends Profile {
  email: string;
  password: string;
  confirmPassword: string;
}