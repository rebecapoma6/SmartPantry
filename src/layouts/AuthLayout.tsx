import { Outlet } from "react-router-dom";
import Footer from "@/components/footer/Footer";

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}