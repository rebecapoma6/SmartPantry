export type UUID = string;

export interface Profile{
  id?: UUID; // Referencia a auth.users.id
  full_name: string; // Usamos full_name en lugar de username para coincidir con el SQL
  avatar_url?: string; // El link de la imagen que guardamos en BD
  avatar_file?: File; // Útil en el frontend cuando el usuario sube la foto
  created_at?: string; // Recuerda que al mostrarlo en pantalla usaremos el formato dd-mm-yyyy
}


export interface RegisterData extends Profile {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}