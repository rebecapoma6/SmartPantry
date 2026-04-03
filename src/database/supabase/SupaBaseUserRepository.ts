import type { RegisterData } from "@/interfaces/Profile";
import type { SessionUser } from "@/interfaces/SessionUser";
import type { UserRepository } from "../repositories/UserRepository";
import { supabase } from "./Client";
import { SupabaseStorageRepository } from "./SupabaseStorageRepository";

export class SupaBaseUserRepository implements UserRepository {

  storageRepository = new SupabaseStorageRepository();

  async createUser(data: RegisterData): Promise<{ data?: SessionUser; error?: any; }> {
    try {
      // Creamos un usuario en Auth de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) return { error: authError };
      if (!authData.user) return { error: { message: 'No se pudo crear el usuario en Auth' } };

      const user = authData.user;
      let avatarPublicUrl = null;

      // Aqui nos permite subir la imagen al Storage usando el repository
      if (data.avatar_file) {
        const fileExt = data.avatar_file.name.split('.').pop();
        // Usamos randomUUID para que no se chanquen imágenes con el mismo nombre
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await this.storageRepository.subirImagen(
          'avatars',
          fileName,
          data.avatar_file
        );

        if (uploadError) {
          console.error("Error subiendo el avatar:", uploadError);
        } else if (uploadData) {
          avatarPublicUrl = uploadData.publicUrl;
        }
      }

      // el perfil en la tabla en mi tabla profiles 
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: data.full_name,
          avatar_url: avatarPublicUrl
        })
        .select()
        .single();

      if (profileError) return { error: profileError };

      // se guardara el rol en la tabla intermedia 'user_roles'
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: data.role || 'Usuario'
        });

      if (roleError) console.error('Error guardando el rol en user_roles:', roleError);

      // Retornamos la sesión completa q guardara Zustand
      return {
        data: {
          user: authData.user,
          profile: profileData,
          role: data.role || 'Usuario'
        }
      };

    } catch (error) {
      console.error('Error inesperado en createUser:', error);
      return { error };
    }
  }


  async obtenerRolUsuario(userId: string): Promise<{ data?: string | null; error?: any; }> {
    const { data: dataRole, error: fetchRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (fetchRoleError) {
      return { data: null, error: fetchRoleError };
    }

    return { data: dataRole?.role || null, error: null };
  }


  async cerrarSesion(): Promise<{ error?: any; }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
}