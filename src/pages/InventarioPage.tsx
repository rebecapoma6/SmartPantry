import { useState } from "react";
import FormRegistroProducto from "@/components/inventario/form/FormRegistroProducto";
import TablaProductos from "../components/inventario/tabla/TablaProductos";

export default function InventarioPage() {
    // 1. Creamos el estado que servirá como "campanada"
    const [ticketRefresco, setTicketRefresco] = useState(0);

    // 2. Función que avisa que hubo un registro nuevo
    const avisarCambio = () => {
        setTicketRefresco(prev => prev + 1);
    };

    return (
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6">

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Mi Despensa</h1>
                {/* 3. Le pasamos la función al formulario para que sepa cómo avisar */}
                <FormRegistroProducto onProductoAgregado={avisarCambio} />
            </div>
            
            {/* 4. Al ponerle la 'key', React vuelve a cargar la tabla solita cuando el ticket cambia */}
            <TablaProductos key={ticketRefresco} />

        </div>
    );
}