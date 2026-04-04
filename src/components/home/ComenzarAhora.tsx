import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ComenzarAhora() {
  return (
    <section className="bg-green-800 py-20 relative overflow-hidden">
      {/* Elementos decorativos de fondo (opcional, le da un toque más pro) */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Comienza a organizar tu despensa hoy mismo
        </h2>
        
        <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
          Únete a miles de usuarios que ya están optimizando su cocina con SmartPantry.
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <Link 
            to="/registro" 
            className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Comenzar Gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-green-200 text-sm mt-4">
            No se requiere tarjeta de crédito • Configuración en menos de 2 minutos
          </p>
        </div>
      </div>
    </section>
  );
}