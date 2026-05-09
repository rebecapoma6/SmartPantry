import { CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion"; // 🔥 Agregamos Variants aquí
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

  // 🔥 Le decimos a TypeScript que esto es un objeto de tipo Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // 🔥 Lo mismo aquí para que deje de chillar con el "spring"
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };

  return (
    <section className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Lado Izquierdo: Imagen */}
          <div className="w-full lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]"
            >
              <img 
                src={aguacate}
                alt="Verduras frescas y pimientos verdes" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay"></div>
            </motion.div>
          </div>

          {/* Lado Derecho: Textos y Lista */}
          <div className="w-full lg:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                Beneficios que transformarán tu cocina
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Con SmartPantry, no solo organizas tu despensa, sino que transformas completamente tu forma de gestionar la comida en casa.
              </p>
            </motion.div>

            {/* Lista animada */}
            <motion.ul 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {beneficios.map((beneficio, index) => (
                <motion.li 
                  key={index} 
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">
                    {beneficio}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

        </div>
      </div>
    </section>
  );
}