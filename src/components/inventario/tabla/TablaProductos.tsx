import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Pencil, Trash2 } from "lucide-react";

interface ProductoConCategoria {
  id: string;
  nombre: string;
  cantidad: number;
  fecha_caducidad: string;
  categorias: {nombre: string;} | null;
}

export default function TablaProductos() {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const sessionUser = useAuthStore((state) => state.sessionUser);

  useEffect(() => {
    const cargarProductos = async () => {
      const idUsuario = sessionUser?.profile?.id;
      if (!idUsuario) return;

      const { data, error } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          cantidad,
          fecha_caducidad,
          categorias (nombre)
        `)
        .eq('agregado_por', idUsuario)
        .order('fecha_caducidad', { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
      } else {
        setProductos(data as any);
      }
      setCargando(false);
    };

    cargarProductos();
  }, [sessionUser]);

  if (cargando) return <div className="text-center p-10">Cargando tu despensa...</div>;

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-900">Producto</TableHead>
            <TableHead className="font-semibold text-gray-900">Categoría</TableHead>
            <TableHead className="font-semibold text-gray-900 text-center">Cant.</TableHead>
            <TableHead className="font-semibold text-gray-900">Vencimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                No hay productos en tu despensa. ¡Agrega el primero!
              </TableCell>
            </TableRow>
          ) : (
            productos.map((prod) => (
              <TableRow key={prod.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-800">{prod.nombre}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                    {prod.categorias?.nombre || 'Sin categoría'}
                  </span>
                </TableCell>
                <TableCell className="text-center font-semibold">{prod.cantidad}</TableCell>
                <TableCell>
                  <span className="text-gray-700 font-medium">
                    {prod.fecha_caducidad}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}