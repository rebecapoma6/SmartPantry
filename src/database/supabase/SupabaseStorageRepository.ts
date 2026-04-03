import type { StorageRepository } from "../repositories/StorageRepository";
import { supabase } from "./Client";

export class SupabaseStorageRepository implements StorageRepository {
    
    async subirImagen(bucketName: string, filePath: string, file: File): Promise<{ data?: { publicUrl: string; }; error?: any; }> {
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (error) return { error };

        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return { data: { publicUrl } };
    }


    async obtenerRutaImagen(bucketName: string, filePath: string): Promise<{ data: { publicUrl: string; }; }> {
        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
        return { data: { publicUrl: data.publicUrl } };
    }


    async eliminarImagen(bucketName: string, filePath: string): Promise<{ error?: any; }> {
        throw new Error("Method not implemented.");
    }

}