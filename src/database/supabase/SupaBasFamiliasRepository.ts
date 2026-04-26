import { supabase } from "./Client";

export const SupaBasFamiliasRepository = {
  
  obtenerFamiliasConJefes: async () => {
    // 1. Jalamos familias
    const { data: dataFamilias, error: errorFamilias } = await supabase
      .from('familias')
      .select(`id, nombre, created_at, profiles ( id, nombre, movil )`)
      .order('created_at', { ascending: false });

    if (errorFamilias) throw errorFamilias;

    // 2. Jalamos roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) throw rolesError;

    // 3. Cruzamos la data
    const familiasConRoles = (dataFamilias || []).map(familia => {
      const perfilesLimpios = (familia.profiles || []).map((perfil: any) => {
        const rolDelUsuario = rolesData?.find(r => r.user_id === perfil.id)?.role;
        const esJefe = rolDelUsuario === 'AdminUser';

        return {
          ...perfil,
          rol_asignado: esJefe ? 'AdminUser' : 'Usuario'
        };
      });
      return { ...familia, profiles: perfilesLimpios };
    });

    return familiasConRoles;
  },

  eliminarFamilia: async (id: string) => {
    const { error } = await supabase.from('familias').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};