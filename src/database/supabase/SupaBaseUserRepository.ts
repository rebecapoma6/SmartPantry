import type { RegisterData } from "@/interfaces/Profile";
import type { SessionUser } from "@/interfaces/SessionUser";
import type { UserRepository } from "../repositories/UserRepository";
import { toast } from 'react-hot-toast';
import { supabase } from "./Client";



export class SupaBaseUserRepository implements UserRepository {
    async createUser(data: RegisterData): Promise<{ data?: SessionUser; error?: any; }> {
        try {
            const toastId = toast.loading('Creando tu cuenta...');

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                toast.error(`Error: ${authError.message}`, { id: toastId });
                return { error: authError };
            }

            if (!authData.user) {
                toast.error('No se pudo crear el usuario', { id: toastId });
                return { error: { message: 'No se pudo crear el usuario en Auth' } };
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    full_name: data.full_name,
                    avatar_url: data.avatar_url ?? null,
                })
                .select()
                .single();

            if (profileError) {
                toast.error('El usuario se creó, pero falló el perfil.', { id: toastId });
                return { error: profileError };
            }

            toast.success('¡Registro completado con éxito!', { id: toastId });

            return { data: { user: authData.user, profile: profileData } };

        } catch (error: any) {
            console.error('Error en createUser:', error);
            toast.error('Ocurrió un error inesperado al registrar.');
            return { error };
        }
    }

}