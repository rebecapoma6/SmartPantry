import DashboardSAdmin from "@/components/superAdmin/DashboardSAdmin";

export default function AdminGeneralPage() {

    return (
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
            
            {/* CABECERA */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">SmartPantry</h1>
                    <p className="text-slate-500 mt-1">Panel de Control para Súper Administrador</p>
                </div>
            </div>

            {/* 🔥 AQUÍ LLAMAMOS AL NUEVO COMPONENTE */}
            <DashboardSAdmin />
            
        </div>
    );
}