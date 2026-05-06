import { useState } from "react";
import FormRegistroProducto from "@/components/inventario/form/FormRegistroProducto";
import TablaProductos from "../components/inventario/tabla/TablaProductos";
import ModalEliminarProducto from "@/components/inventario/form/ModalEliminarProducto";
import ModalCategorias from "@/components/inventario/tabla/ModalCategorias";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaCompras from "@/components/userAdmin/ListaCompras";

export default function InventarioPage() {
    const [ticketRefresco, setTicketRefresco] = useState(0);
    const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
    const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);

    const sessionUser = useAuthStore((state) => state.sessionUser);
    const refrescarAlertas = useAuthStore((state) => state.refrescarAlertas);
    
    const avisarCambio = () => {
        setTicketRefresco(prev => prev + 1);
        refrescarAlertas();
    };

    // Función para abrir el modal en modo "Crear Nuevo" (vacío)
    const handleAbrirNuevo = () => {
        setProductoSeleccionado(null);
        setModalEditarAbierto(true);
    };

    return (
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Despensa</h1>
                <p className="text-muted-foreground text-sm mt-1">Gestiona tu inventario y revisa qué te falta comprar.</p>
            </div>

            <Tabs defaultValue="inventario" className="w-full">
                
                {/* Los botones de arriba para cambiar de pestaña */}
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-muted">
                    <TabsTrigger value="inventario" className="font-medium">📦 Inventario Actual</TabsTrigger>
                    <TabsTrigger value="lista" className="font-medium">🛒 Lista Inteligente</TabsTrigger>
                </TabsList>

                {/* PESTAÑA: INVENTARIO */}
                <TabsContent value="inventario" className="mt-0 space-y-4">
                    
                    <div className="flex justify-end items-center">
                        <div className="flex gap-2">
                            {sessionUser?.role === 'AdminUser' && (
                                <button 
                                    onClick={() => setModalCategoriasAbierto(true)}
                                    className="bg-background border border-gray-300 text-gray-700 hover:bg-muted px-4 py-2 rounded-md font-medium flex items-center gap-2 shadow-sm transition-all"
                                >
                                    <Settings className="w-4 h-4" /> Categorías
                                </button>
                            )}

                            <button 
                                onClick={handleAbrirNuevo}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-all"
                            >
                                + Agregar Producto
                            </button>
                        </div>
                    </div>

                    {/* TABLA PRODUCTOS */}
                    <TablaProductos 
                        key={ticketRefresco}
                        onEditarProducto={(prod) => {
                            setProductoSeleccionado(prod);
                            setModalEditarAbierto(true);
                        }}
                        onEliminarProducto={(prod) => {
                            setProductoSeleccionado(prod);
                            setModalEliminarAbierto(true);
                        }} 
                    />
                </TabsContent>

                {/* PESTAÑA:LISTA DE COMPRAS */}
                <TabsContent value="lista" className="mt-0">
                    <ListaCompras />
                </TabsContent>

            </Tabs>

            <FormRegistroProducto 
                abierto={modalEditarAbierto} 
                producto={productoSeleccionado}
                onClose={() => {
                    setModalEditarAbierto(false);
                    setProductoSeleccionado(null);
                }}
                onRegistroExitoso={avisarCambio}
            />

            <ModalEliminarProducto 
                abierto={modalEliminarAbierto} 
                producto={productoSeleccionado}
                onClose={() => {
                    setModalEliminarAbierto(false);
                    setProductoSeleccionado(null);
                }} 
                onEliminadoExitoso={avisarCambio}
            />

            <ModalCategorias 
                abierto={modalCategoriasAbierto}
                onClose={() => setModalCategoriasAbierto(false)}
                onCategoriasActualizadas={avisarCambio} 
            />

        </div>
    );
}