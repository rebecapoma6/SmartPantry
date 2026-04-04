import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "@/components/footer/Footer";

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Aquí va tu Navbar para que se vea arriba */}
      <Navbar />
      
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer/>
    </div>
  );
}