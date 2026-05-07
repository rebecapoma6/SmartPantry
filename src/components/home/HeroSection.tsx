import { Link } from "react-router-dom";
import { ArrowRight,  Star, ShieldCheck} from "lucide-react";
import despensa from "../../image/despensa.jpg";
export default function HeroSection() {
  return (
    <section className="relative bg-primary from-green-50/50 to-white pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Lado Izquierdo: Textos y Botones */}
          <div className="space-y-8">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100/80 text-green-700 text-sm font-medium border border-green-200">
              <ShieldCheck className="w-4 h-4" />
              Gestión Inteligente de Despensa
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1]">
              Tu Despensa, <br />
              <span className="text-green-600">Siempre Organizada</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Controla tus productos, fechas de caducidad y optimiza tus compras con SmartPantry. La solución inteligente para una cocina sin desperdicios.
            </p>

            {/* Botones */}
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                to="/registro" 
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                Empezar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              {/* <button 
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Play className="w-4 h-4" />
                Ver Demo
              </button> */}
            </div>

            {/* Social Proof (Usuarios y Estrellitas) */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex -space-x-3">
                {/* Círculos simulando fotos de usuarios */}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-green-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-200"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">+</div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  <span className="text-muted-foreground font-bold">1,000+</span> usuarios confían en nosotros
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 md:mt-0 lg:ml-10">
            {/* Imagen principal (hero) */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 aspect-[4/3] md:aspect-auto md:h-[500px] bg-muted">
              <img 
                src={despensa}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}