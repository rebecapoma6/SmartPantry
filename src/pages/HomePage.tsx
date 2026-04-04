import Beneficios from "@/components/home/Beneficios";
import Caracteristicas from "@/components/home/Caracteristicas";
import ComenzarAhora from "@/components/home/ComenzarAhora";
import HeroSection from "@/components/home/HeroSection";

export default function HomePage(){

    return(
     <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <HeroSection/>
        <Caracteristicas/>
        <Beneficios/>
        <ComenzarAhora/>
     </div>
    )
}