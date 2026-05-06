import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GestionCategorias from "@/components/userAdmin/GestionCategorias";
import GestionMiembros from "@/components/userAdmin/GestionMiembros";
import MiPerfil from "@/components/userAdmin/MiPerfil";
import { useAuthStore } from "@/stores/useAuthStore"; 

export default function AdminUserPage() {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const esGestor = sessionUser?.role === 'AdminUser';

    return (
        <div className="p-6 pt-24 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-foreground">
                {esGestor ? "Ajustes de Familia" : "Mi Perfil"}
            </h1>

            <Tabs defaultValue="perfil" className="w-full">
                <TabsList className={`grid w-full ${esGestor ? 'grid-cols-3' : 'grid-cols-1 max-w-xs'}`}>
                    <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
                    {esGestor && <TabsTrigger value="miembros">Mi Familia</TabsTrigger>}
                    {esGestor && <TabsTrigger value="categorias">Categorías</TabsTrigger>}
                </TabsList>

                <TabsContent value="perfil">
                    <MiPerfil />
                </TabsContent>

                {esGestor && (
                    <TabsContent value="miembros">
                        <GestionMiembros />
                    </TabsContent>
                )}

                {esGestor && (
                    <TabsContent value="categorias">
                        <div className="max-w-2xl mx-auto mt-6">
                            <GestionCategorias />
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}