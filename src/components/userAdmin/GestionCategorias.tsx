import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { Trash2, Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Categoria {
    id: string;
    nombre: string;
}

export default function GestionCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [nuevaCategoria, setNuevaCategoria] = useState("");
    const [cargando, setCargando] = useState(false);
    
    const sessionUser = useAuthStore((state) => state.sessionUser);

    useEffect(() => {
        cargarCategorias();
    }, [sessionUser?.profile?.familia_id]);

    const cargarCategorias = async () => {
        if (!sessionUser?.profile?.familia_id) return;
        
        setCargando(true);
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nombre')
            .eq('familia_id', sessionUser.profile.familia_id)
            .order('nombre', { ascending: true });

        if (error) {
            console.error("Error al cargar categorías:", error);
            toast.error("Error al cargar las categorías.");
        } else if (data) {
            setCategorias(data);
        }
        setCargando(false);
    };

    const handleCrearCategoria = async (e: FormEvent) => {
        e.preventDefault();
        
        const nombreTrimmed = nuevaCategoria.trim();
        if (!nombreTrimmed) return;

        const idFamilia = sessionUser?.profile?.familia_id;
        if (!idFamilia) {
            toast.error("Error: No se encontró la familia del usuario.");
            return;
        }

        setCargando(true);
        const { data, error } = await supabase
            .from('categorias')
            .insert([{ nombre: nombreTrimmed, familia_id: idFamilia }])
            .select();

        if (error) {
            console.error("Error al crear categoría:", error);
            toast.error("No se pudo crear la categoría.");
        } else if (data && data.length > 0) {
            toast.success(`Categoría "${nombreTrimmed}" agregada.`);
            setNuevaCategoria(""); 
            setCategorias(prev => [...prev, data[0]].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        }
        setCargando(false);
    };

    const handleEliminarCategoria = (id: string, nombre: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-900">¿Eliminar "{nombre}"?</p>
                    <p className="text-xs text-gray-500 mt-1">Los productos asociados podrían quedar sin categoría.</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>
                        Cancelar
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            setCargando(true);
                            const idCarga = toast.loading("Eliminando...");

                            const { error } = await supabase
                                .from('categorias')
                                .delete()
                                .eq('id', id);

                            if (error) {
                                console.error("Error al eliminar categoría:", error);
                                if (error.code === '23503') {
                                    toast.error(`No puedes eliminar "${nombre}" porque hay productos usándola.`, { id: idCarga });
                                } else {
                                    toast.error("Hubo un error al eliminar.", { id: idCarga });
                                }
                            } else {
                                toast.success(`Categoría "${nombre}" eliminada.`, { id: idCarga });
                                setCategorias(prev => prev.filter(cat => cat.id !== id));
                            }
                            setCargando(false);
                        }}
                    >
                        Sí, eliminar
                    </Button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <Card className="border-none shadow-sm max-w-2xl">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Tags className="w-5 h-5 text-success" /> Personalizar Categorías
                </CardTitle>
                <CardDescription>
                    Agrega nuevas categorías para clasificar los productos de tu despensa familiar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Formulario rápido para crear */}
                <form onSubmit={handleCrearCategoria} className="flex gap-2">
                    <Input 
                        placeholder="Ej. Frutas, Limpieza, Mascotas..." 
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        disabled={cargando}
                        required
                        className="focus-visible:ring-success"
                    />
                    <Button type="submit" disabled={cargando || !nuevaCategoria.trim()} className="bg-success hover:bg-success-hover text-white shrink-0">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </form>

                {/* Lista de categorías con Scroll (Justo lo que querías) */}
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    {categorias.length === 0 ? (
                        <p className="text-center p-8 text-slate-500">No hay categorías personalizadas. ¡Crea la primera arriba!</p>
                    ) : (
                        <ul className="divide-y">
                            {categorias.map((cat) => (
                                <li key={cat.id} className="flex justify-between items-center p-3 px-4 hover:bg-white transition-colors bg-transparent">
                                    <span className="text-sm font-medium text-slate-700">{cat.nombre}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                                        disabled={cargando}
                                        title="Eliminar categoría"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}