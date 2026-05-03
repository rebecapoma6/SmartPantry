import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GestionCategorias from "@/components/userAdmin/GestionCategorias";
import GestionMiembros from "@/components/userAdmin/GestionMiembros";
import MiPerfil from "@/components/userAdmin/MiPerfil";

export default function AdminUserPage() {
    return (
        <div className="p-6 pt-24 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Ajustes de Familia</h1>

            <Tabs defaultValue="perfil" className="w-full">
                {/* Las Pestañitas */}
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
                    <TabsTrigger value="miembros">Mi Familia</TabsTrigger>
                    <TabsTrigger value="categorias">Categorías</TabsTrigger>
                </TabsList>

                {/* El contenido de cada pestaña */}
                <TabsContent value="perfil">
                    <MiPerfil />
                </TabsContent>

                <TabsContent value="miembros">
                    <GestionMiembros />
                </TabsContent>

                <TabsContent value="categorias">
                    <div className="max-w-2xl mx-auto mt-6">
                        <GestionCategorias />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}