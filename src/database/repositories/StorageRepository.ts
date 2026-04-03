export interface StorageRepository{
    subirImagen(bucketName: string, filePath: string, file: File): Promise<{ data?: { publicUrl: string }; error?: any; }>
    obtenerRutaImagen(bucketName: string, filePath: string): Promise<{ data: { publicUrl: string } }>
    eliminarImagen(bucketName: string, filePath: string): Promise<{ error?: any }>

}