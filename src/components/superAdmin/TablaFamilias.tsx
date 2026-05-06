import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Search, Trash2, Users } from "lucide-react";
import { formatearIniciales } from "@/utils/formatear";
import { useState } from "react";
import { Input } from "../ui/input";

interface TablaProps {
  familias: any[];
  onPrepararEliminacion: (id: string, nombre: string) => void;
  onVerUsuarios: (familia: any) => void;
}

export default function TablaFamilias({ familias, onPrepararEliminacion,onVerUsuarios }: TablaProps) {
  
  const obtenerJefe = (perfiles: any[]) => perfiles?.find(p => p.rol_asignado === 'AdminUser');
  const [busqueda, setBusqueda] = useState("");



  const familiasFiltradas = familias.filter((f) => {
    const jefe = obtenerJefe(f.profiles);
    const termino = busqueda.toLowerCase();
    
    const nombreFamilia = f.nombre?.toLowerCase() || "";
    const nombreJefe = jefe?.nombre?.toLowerCase() || "";

    // Busca coincidencia en el nombre de la familia o en el nombre del gestor
    return nombreFamilia.includes(termino) || nombreJefe.includes(termino);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 text-slate-400" />
        <Input 
          type="text"
          placeholder="Buscar por familia o gestor..."
          className="pl-10 border-slate-200 shadow-sm focus-visible:ring-blue-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="py-4 px-6">Nombre Familia</TableHead>
              <TableHead>Gestor de Cuenta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right px-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {familiasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No se encontraron familias que coincidan con "{busqueda}".
                </TableCell>
              </TableRow>
            ) : (
              familiasFiltradas.map((f) => {
                const jefe = obtenerJefe(f.profiles);
                return (
                  <TableRow key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 font-bold text-slate-800">{f.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                          {formatearIniciales(jefe?.nombre || "N/A")}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{jefe?.nombre || "Pendiente"}</span>
                          <span className="text-[10px] text-slate-400">AdminUser</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 border-none px-3">Activa</Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600" onClick={() => onVerUsuarios(f)}>
                                <Users className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => onPrepararEliminacion(f.id, f.nombre)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}