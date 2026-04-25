import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "@/components/footer/Footer"; 

export default function AppLayout() {
    return (

        <div className="min-h-screen flex flex-col bg-gray-50">

            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />

        </div>
    );
}