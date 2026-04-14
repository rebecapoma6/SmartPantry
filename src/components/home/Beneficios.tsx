import { CheckCircle2 } from "lucide-react";
import aguacate from "../../image/aguacate.jpg";


export default function Beneficios() {
  const beneficios = [
    "Reduce el desperdicio de alimentos",
    "Ahorra dinero en compras innecesarias",
    "Planifica mejor tus comidas",
    "Mantén tu cocina organizada",
    "Controla tus inventarios fácilmente",
    "Accede desde cualquier dispositivo",
  ];

  return (
    <section className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Lado Izquierdo: Imagen */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img 
                src={aguacate}
                alt="Verduras frescas y pimientos verdes" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay"></div>
            </div>
          </div>

          {/* Lado Derecho: Textos y Lista */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Beneficios que transformarán tu cocina
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Con SmartPantry, no solo organizas tu despensa, sino que transformas completamente tu forma de gestionar la comida en casa.
              </p>
            </div>

            {/* Lista de checks */}
            <ul className="space-y-4">
              {beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-start gap-3">
                  {/* Ícono de Check de Lucide-React */}
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">
                    {beneficio}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}