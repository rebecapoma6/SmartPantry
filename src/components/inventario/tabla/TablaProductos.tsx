import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Pencil, Trash2 } from "lucide-react";

interface ProductoConCategoria {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  cantidad: number;
  stock_minimo: number;
  fecha_caducidad: string;
  categorias: { nombre: string; } | null;
}

export default function TablaProductos() {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const sessionUser = useAuthStore((state) => state.sessionUser);

  useEffect(() => {
    const cargarProductos = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          marca,
          precio,
          cantidad,
          stock_minimo,
          fecha_caducidad,
          categorias (nombre)
        `)
        .order('fecha_caducidad', { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
      } else {
        setProductos(data as any);
      }
      setCargando(false);
    };

    cargarProductos();
  }, []);

  // Función utilitaria para dar formato a la fecha
  const formatearFecha = (fechaOriginal: string) => {
    if (!fechaOriginal) return '';
    const [year, month, day] = fechaOriginal.split('-');
    return `${day}-${month}-${year}`;
  };

  if (cargando) return <div className="text-center p-10">Cargando tu despensa...</div>;

  const esAdminUser = sessionUser?.role === 'AdminUser';

  return (
    <div className="text-left">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="font-semibold text-foreground">Producto</TableHead>
            <TableHead className="font-semibold text-foreground ">Categoría</TableHead>
            <TableHead className="font-semibold text-foreground">Marca</TableHead>
            <TableHead className="font-semibold text-foreground ">Precio</TableHead>
            <TableHead className="font-semibold text-foreground ">Cant.</TableHead>
            <TableHead className="font-semibold text-foreground ">Stock Mín.</TableHead>
            <TableHead className="font-semibold text-foreground ">Vencimiento</TableHead>
            {esAdminUser && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {productos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10 text-muted-foreground"
              >
                No hay productos en tu despensa. ¡Agrega el primero!
              </TableCell>
            </TableRow>
          ) : (
            productos.map((prod) => (
              <TableRow
                key={prod.id}
                className="hover:bg-muted transition-colors"
              >
                <TableCell className="text-foreground">
                  {prod.nombre}
                </TableCell>

                <TableCell className="">
                  <span className="px-2 py-1 rounded-full bg-success text-accent-foreground text-xs font-medium border border-border">
                    {prod.categorias?.nombre || "Sin categoría"}
                  </span>
                </TableCell>

                <TableCell className="text-foreground">
                  {prod.marca}
                </TableCell>

                <TableCell className="tetext-foreground">
                  {prod.precio} €
                </TableCell>

                <TableCell className="font-semibold text-foreground">
                  {prod.cantidad}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {prod.stock_minimo}
                </TableCell>

                <TableCell className="">
                  <span className="text-foreground font-medium">
                    {formatearFecha(prod.fecha_caducidad)}
                  </span>
                </TableCell>

                {esAdminUser && (
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

  );
}