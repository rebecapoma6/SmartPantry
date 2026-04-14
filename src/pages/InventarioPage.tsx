import FormRegistroProducto from "@/components/inventario/form/FormRegistroProducto";
import TablaProductos from "../components/inventario/tabla/TablaProductos";

export default function InventarioPage() {
    return (
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6">

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Mi Despensa</h1>
                <FormRegistroProducto />
            </div>
            <TablaProductos />

        </div>
    );
}