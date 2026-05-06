import DashboardSAdmin from "@/components/superAdmin/DashboardSAdmin";

export default function AdminGeneralPage() {

    return (
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-8 bg-muted min-h-screen">
            
            {/* CABECERA */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">SmartPantry</h1>
                    <p className="text-muted-foreground mt-1">Panel de Control para Súper Administrador</p>
                </div>
            </div>

            <DashboardSAdmin />
            
        </div>
    );
}