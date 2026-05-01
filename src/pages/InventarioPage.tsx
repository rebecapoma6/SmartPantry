import { useState } from "react";
import FormRegistroProducto from "@/components/inventario/form/FormRegistroProducto";
import TablaProductos from "../components/inventario/tabla/TablaProductos";
import ModalEliminarProducto from "@/components/inventario/form/ModalEliminarProducto";
import ModalCategorias from "@/components/inventario/tabla/ModalCategorias";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function InventarioPage() {
    // 1. El estado de la "campanada" para refrescar la tabla
    const [ticketRefresco, setTicketRefresco] = useState(0);

    // 🔥 2. ESTADOS FALTANTES: Para controlar los modales y el producto seleccionado
    const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
    const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);

    const sessionUser = useAuthStore((state) => state.sessionUser);
    // 3. Función que avisa que hubo un cambio (crear, editar o eliminar)
    const avisarCambio = () => {
        setTicketRefresco(prev => prev + 1);
    };

    // Función para abrir el modal en modo "Crear Nuevo" (vacío)
    const handleAbrirNuevo = () => {
        setProductoSeleccionado(null);
        setModalEditarAbierto(true);
    };

    return (
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6">

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Mi Despensa</h1>

                
               <div className="flex gap-2"> {/* Contenedor para alinear los botones */}
                {/* BOTÓN NUEVO: Gestionar Categorías (Solo lo vería el AdminUser si quieres) */}
                {sessionUser?.role === 'AdminUser' && (
                    <button 
                        onClick={() => setModalCategoriasAbierto(true)}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium flex items-center gap-2"
                    >
                        <Settings className="w-4 h-4" /> Categorías
                    </button>
                )}

                {/* Tu botón existente de Agregar Producto */}
                <button 
                    onClick={handleAbrirNuevo}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                    + Agregar Producto
                </button>
            </div>

                {/* MODAL DE CREAR / EDITAR */}
                {/* Aquí faltaba cerrar la llave del onClose */}
                <FormRegistroProducto 
                    abierto={modalEditarAbierto} 
                    producto={productoSeleccionado}
                    onClose={() => {
                        setModalEditarAbierto(false);
                        setProductoSeleccionado(null); // Limpiamos al cerrar
                    }}
                    onRegistroExitoso={avisarCambio} // Le pasamos la campanada
                />
            </div>
            
            {/* LA TABLA */}
            {/* Le pasamos el 'ticketRefresco' en la key para que se recargue sola */}
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

            {/* MODAL DE ELIMINAR */}
            <ModalEliminarProducto 
                abierto={modalEliminarAbierto} 
                producto={productoSeleccionado}
                onClose={() => {
                    setModalEliminarAbierto(false);
                    setProductoSeleccionado(null); // Limpiamos al cerrar
                }} 
                onEliminadoExitoso={avisarCambio} // Le pasamos la campanada
            />

            <ModalCategorias 
            abierto={modalCategoriasAbierto}
            onClose={() => setModalCategoriasAbierto(false)}
            // Usamos la misma campanada para que la tabla recargue si borraste una categoría
            onCategoriasActualizadas={avisarCambio} 
        />

        </div>
    );
}