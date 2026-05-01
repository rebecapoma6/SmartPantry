import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";


interface ProductoConCategoria {
  id: string;
  nombre: string;
  // Solo necesitamos estos dos para eliminar, pero puedes recibir el objeto completo
}

interface ModalEliminarProductoProps {
  abierto: boolean;
  onClose: () => void;
  producto: ProductoConCategoria | null;
  onEliminadoExitoso: (id: string) => void; // Para avisar que se borró
}



export default function ModalEliminarProducto({
  abierto,
  onClose,
  producto,
  onEliminadoExitoso,
}: ModalEliminarProductoProps) {
  
  const confirmarEliminar = async () => {
    if (!producto) return;

    const toastId = toast.loading(`Eliminando ${producto.nombre}...`);

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", producto.id);

    if (error) {
      console.error("Error al eliminar:", error);
      toast.error("Hubo un error al eliminar el producto.", { id: toastId });
    } else {
      toast.success(`${producto.nombre} eliminado correctamente.`, {
        id: toastId,
      });
      // Le avisamos a la página madre que ya se borró, pasándole el ID
      onEliminadoExitoso(producto.id);
      // Cerramos el modal
      onClose();
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-rose-600">
            ¿Eliminar producto?
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-slate-600">
          <p>
            Vas a eliminar <strong>{producto?.nombre}</strong> de tu despensa.
          </p>
          <p className="text-sm mt-2">Esta acción no se puede deshacer.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={confirmarEliminar}
          >
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}