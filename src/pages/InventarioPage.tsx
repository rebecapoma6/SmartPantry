import { useState } from "react";
import FormRegistroProducto from "@/components/inventario/form/FormRegistroProducto";
import TablaProductos from "../components/inventario/tabla/TablaProductos";
import ModalEliminarProducto from "@/components/inventario/form/ModalEliminarProducto";
import ModalCategorias from "@/components/inventario/tabla/ModalCategorias";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

// 🔥 1. Importamos los componentes de Shadcn para las Pestañas
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// 🔥 2. Importamos tu nueva lista inteligente
import ListaCompras from "@/components/userAdmin/ListaCompras";

export default function InventarioPage() {
    // 1. El estado de la "campanada" para refrescar la tabla
    const [ticketRefresco, setTicketRefresco] = useState(0);

    // 2. ESTADOS: Para controlar los modales y el producto seleccionado
    const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
    const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);

    const sessionUser = useAuthStore((state) => state.sessionUser);
    const refrescarAlertas = useAuthStore((state) => state.refrescarAlertas);
    
    // 3. Función que avisa que hubo un cambio (crear, editar o eliminar)
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

            {/* Título Principal */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Despensa</h1>
                <p className="text-gray-500 text-sm mt-1">Gestiona tu inventario y revisa qué te falta comprar.</p>
            </div>

            {/* 🔥 3. ENVOLVEMOS TODO EN EL COMPONENTE TABS */}
            <Tabs defaultValue="inventario" className="w-full">
                
                {/* Los botones de arriba para cambiar de pestaña */}
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-slate-100">
                    <TabsTrigger value="inventario" className="font-medium">📦 Inventario Actual</TabsTrigger>
                    <TabsTrigger value="lista" className="font-medium">🛒 Lista Inteligente</TabsTrigger>
                </TabsList>

                {/* ========================================= */}
                {/* PESTAÑA 1: INVENTARIO (Tu código original) */}
                {/* ========================================= */}
                <TabsContent value="inventario" className="mt-0 space-y-4">
                    
                    {/* Botones de acción específicos del inventario */}
                    <div className="flex justify-end items-center">
                        <div className="flex gap-2">
                            {sessionUser?.role === 'AdminUser' && (
                                <button 
                                    onClick={() => setModalCategoriasAbierto(true)}
                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium flex items-center gap-2 shadow-sm transition-all"
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

                    {/* LA TABLA */}
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

                {/* ========================================= */}
                {/* PESTAÑA 2: LISTA DE COMPRAS INTELIGENTE   */}
                {/* ========================================= */}
                <TabsContent value="lista" className="mt-0">
                    <ListaCompras />
                </TabsContent>

            </Tabs>

            {/* 🔥 LOS MODALES INVISIBLES VAN AQUÍ ABAJO (Buena práctica de Arquitectura) */}
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