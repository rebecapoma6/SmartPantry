import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/database/supabase/Client";
import { Trash2 } from "lucide-react";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminGeneralPage() {
    // Estado para controlar si el popup está abierto o cerrado
    const [modalAbierto, setModalAbierto] = useState(false);
    const [nombreFamilia, setNombreFamilia] = useState("");

    const [familias, setFamilias] = useState<any[]>([]);

    // Agrega estos estados arriba
    const [familiaAEliminar, setFamiliaAEliminar] = useState<{ id: string, nombre: string } | null>(null);
    const [confirmarEliminarAbierto, setConfirmarEliminarAbierto] = useState(false);

    const cargarFamilias = async () => {
        const { data, error } = await supabase
            .from('familias')
            .select('*')
            .order('created_at', { ascending: false }); // Las más nuevas arriba

        if (error) {
            console.error("Error al cargar familias:", error);
            toast.error("Hubo un error al cargar los datos.");
        } else {
            setFamilias(data || []);
        }
    };

    useEffect(() => {
        cargarFamilias();
    }, []);
    // Función de prueba (luego la conectaremos a Supabase)
    const handleCrearFamilia = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombreFamilia.trim()) return;

        try {
            const { error } = await supabase
                .from('familias')
                .insert([{ nombre: nombreFamilia }]);

            if (error) throw error;

            toast.success(`¡Familia "${nombreFamilia}" creada con éxito!`);

            setModalAbierto(false);
            setNombreFamilia("");

            // 🔥 El truco de magia: refrescamos la tabla al toque llamando a la función
            cargarFamilias();

        } catch (error: any) {
            console.error("Error al crear familia:", error);
            toast.error("No se pudo crear la familia. Revisa los permisos.");
        }
    };

    const prepararEliminacion = (id: string, nombre: string) => {
        setFamiliaAEliminar({ id, nombre });
        setConfirmarEliminarAbierto(true);
    };

    const handleEliminarFamilia = async (id: string, nombre: string) => {

        try {
            const { error } = await supabase
                .from('familias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success(`¡Familia "${nombre}" eliminada correctamente!`);
            cargarFamilias(); // Refrescamos la tabla
        } catch (error: any) {
            console.error("Error:", error);
            toast.error("No se pudo eliminar.");
        } finally {
            setConfirmarEliminarAbierto(false); // Cerramos el modal pase lo que pase
            setFamiliaAEliminar(null);
        }
    };

    const formatearFecha = (fechaString: string) => {
        if (!fechaString) return "";
        const fecha = new Date(fechaString);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}-${mes}-${anio}`;
    };
    return (

        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6">

            {/* CABECERA Y MODAL */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Familias</h1>



                <Dialog open={confirmarEliminarAbierto} onOpenChange={setConfirmarEliminarAbierto}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                            
                                ¿Confirmar eliminación?
                            </DialogTitle>
                            <DialogDescription className="py-4">
                                Estás a punto de eliminar a la <strong>{familiaAEliminar?.nombre}</strong>.
                                Esta acción borrará todos sus productos y miembros asociados. No hay marcha atrás.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmarEliminarAbierto(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                    if (familiaAEliminar) {
                                        handleEliminarFamilia(familiaAEliminar.id, familiaAEliminar.nombre);
                                    }
                                }}
                            >
                                Sí, eliminar familia
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


                <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                    <DialogTrigger className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        + Añadir Familia
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Registrar Nueva Familia</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCrearFamilia} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nombre de la Familia</label>
                                <Input
                                    placeholder="Ej. Familia Gómez"
                                    value={nombreFamilia}
                                    onChange={(e) => setNombreFamilia(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                Guardar
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABLA DINÁMICA CONECTADA A TU ESTADO */}
            <div className="bg-white rounded-md shadow border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID de Familia</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Si no hay datos, mostramos un mensaje bonito */}
                        {familias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                                    No hay familias registradas todavía. ¡Crea la primera!
                                </TableCell>
                            </TableRow>
                        ) : (
                            /* Si hay datos, los mapeamos (dibujamos) uno por uno */
                            familias.map((familia) => (
                                <TableRow key={familia.id}>
                                    <TableCell className="font-mono text-xs text-gray-500">
                                        {familia.id.split('-')[0]}... {/* Recortamos el UUID para que no ocupe toda la pantalla */}
                                    </TableCell>
                                    <TableCell className="font-medium">{familia.nombre}</TableCell>
                                    <TableCell>{formatearFecha(familia.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => prepararEliminacion(familia.id, familia.nombre)}
                                            title="Eliminar familia"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}


