import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { MinusCircle, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatearFecha } from "@/utils/formatear";

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

interface TablaProductosProps {
  onEditarProducto: (producto: ProductoConCategoria) => void;
  onEliminarProducto: (producto: ProductoConCategoria) => void;
}

export default function TablaProductos({ onEditarProducto, onEliminarProducto }: TablaProductosProps) {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const sessionUser = useAuthStore((state) => state.sessionUser);

  useEffect(() => {
    if (!sessionUser?.profile?.familia_id) return;

    const cargarProductos = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id, nombre, marca, precio, cantidad, stock_minimo, fecha_caducidad, categorias (nombre)
        `)
        .eq('familia_id', sessionUser.profile?.familia_id)
        .order('fecha_caducidad', { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
      } else {
        setProductos(data as any);
      }
      setCargando(false);
    };

    cargarProductos();
  }, [sessionUser?.profile?.familia_id]);

  const handleDescontar = async (id: string, cantidadActual: number, nombre: string) => {
    if (cantidadActual <= 0) {
      toast.error(`¡Ya no queda ${nombre} en la despensa!`);
      return;
    }

    const nuevaCantidad = cantidadActual - 1;

    const { error } = await supabase
      .from('productos')
      .update({ cantidad: nuevaCantidad })
      .eq('id', id);

    if (error) {
      toast.error("Error al descontar el producto.");
    } else {
      setProductos((prev) =>
        prev.map((prod) =>
          prod.id === id ? { ...prod, cantidad: nuevaCantidad } : prod
        )
      );
      toast.success(`Se descontó 1 de ${nombre}`);
    }
  };

  const getSemaforoColor = (cantidad: number, stockMinimo: number) => {
    if (cantidad === 0) return "bg-red-100 hover:bg-red-200 transition-colors";
    if (cantidad <= stockMinimo) return "bg-amber-50 hover:bg-amber-100 transition-colors";
    return "hover:bg-muted transition-colors";
  };

  if (cargando) return <div className="text-center p-10">Cargando tu despensa...</div>;

  const esAdminUser = sessionUser?.role === 'AdminUser';

  return (
    <div className="w-full max-h-[60vh] overflow-auto bg-white rounded-md border shadow-sm relative">
      <Table className="min-w-[600px] md:min-w-full">

        <TableHeader className="bg-muted sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="font-semibold text-foreground">Producto</TableHead>
            <TableHead className="font-semibold text-foreground">Categoría</TableHead>
            <TableHead className="font-semibold text-foreground hidden md:table-cell">Marca</TableHead>
            <TableHead className="font-semibold text-foreground">Precio</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Cant.</TableHead>
            <TableHead className="font-semibold text-foreground text-center hidden md:table-cell">Stock Mín.</TableHead>
            <TableHead className="font-semibold text-foreground">Vencimiento</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {productos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No hay productos en tu despensa. ¡Agrega el primero!
              </TableCell>
            </TableRow>
          ) : (
            productos.map((prod) => (
              <TableRow
                key={prod.id}
                className={getSemaforoColor(prod.cantidad, prod.stock_minimo)}
              >
                <TableCell className="text-foreground font-medium">
                  {prod.nombre}
                </TableCell>

                <TableCell>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200">
                    {prod.categorias?.nombre || "Sin categoría"}
                  </span>
                </TableCell>

                {/* Ocultamos Marca en móviles */}
                <TableCell className="text-foreground hidden md:table-cell">{prod.marca || "-"}</TableCell>

                <TableCell className="text-foreground">{prod.precio} €</TableCell>

                <TableCell className={`text-center font-bold ${prod.cantidad === 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {prod.cantidad}
                </TableCell>

                {/* Ocultamos Stock Mín. en móviles */}
                <TableCell className="text-center text-muted-foreground hidden md:table-cell">
                  {prod.stock_minimo}
                </TableCell>

                <TableCell>
                  <span className="text-foreground font-medium">
                    {formatearFecha(prod.fecha_caducidad)}
                  </span>
                </TableCell>

                <TableCell className="text-right space-x-1 min-w-[120px]">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700 h-8 w-8 mr-2"
                    onClick={() => handleDescontar(prod.id, prod.cantidad, prod.nombre)}
                    disabled={prod.cantidad === 0}
                    title="Consumir 1 unidad"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </Button>

                  {esAdminUser && (
                    <>
                      <Button variant="ghost" size="icon" className="text-blue-600 h-8 w-8" title="Editar producto" onClick={() => onEditarProducto(prod)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 h-8 w-8" title="Eliminar producto" onClick={() => onEliminarProducto(prod)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}