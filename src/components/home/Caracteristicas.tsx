import { PackageSearch, CalendarClock, BellRing, LineChart, ShieldCheck, Smartphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Caracteristicas() {
  const caracteristicas = [
    { titulo: "Inventario Inteligente", descripcion: "Mantén un registro detallado de todos los productos en tu despensa con cantidades y categorías.", icono: PackageSearch },
    { titulo: "Control de Caducidad", descripcion: "Visualiza las fechas de vencimiento de tus productos y evita desperdicios.", icono: CalendarClock },
    { titulo: "Alertas Automáticas", descripcion: "Recibe notificaciones cuando tus productos estén próximos a caducar.", icono: BellRing },
    { titulo: "Estadísticas en Tiempo Real", descripcion: "Analiza tus patrones de consumo y optimiza tus compras.", icono: LineChart },
    { titulo: "Seguro y Confiable", descripcion: "Tus datos están protegidos con los más altos estándares de seguridad.", icono: ShieldCheck },
    { titulo: "Acceso Desde Cualquier Lugar", descripcion: "Gestiona tu despensa desde tu computadora, tablet o smartphone.", icono: Smartphone },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título animado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} // 'once: true' hace que la animación solo ocurra una vez
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-lg text-gray-500">
            SmartPantry te ofrece todas las herramientas para mantener tu despensa perfectamente organizada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caracteristicas.map((item, index) => {
            const Icono = item.icono;
            return (
              // tarjeta con animacion
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-50px" }} // margen para activar antes del scroll
                transition={{ duration: 0.5, delay: index * 0.1 }} 
              >
                {/* se mueve el card y sombra en hover */}
                <Card className="h-full border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                      <Icono className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">
                      {item.titulo}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-gray-500 leading-relaxed text-sm">
                      {item.descripcion}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}