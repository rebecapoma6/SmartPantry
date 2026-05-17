import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { KeyRound, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActualizarPassword() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsRecoveryMode(true);
            }
        });

        return () => {
            listener?.subscription?.unsubscribe?.();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            // Actualizamos la clave directamente con Supabase
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                toast.error("Error al actualizar: " + error.message);
            } else {
                toast.success("¡Contraseña actualizada con éxito! 🚀");
                // Lo mandamos a iniciar sesión con su nueva clave
                setTimeout(() => navigate("/iniciarSesion"), 2000);
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center bg-muted/30 min-h-screen">
            <Card className="w-full max-w-md shadow-lg border-green-100">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <KeyRound className="w-6 h-6 text-green-700" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        Crear nueva contraseña
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        {isRecoveryMode
                            ? "Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta."
                            : "Verificando acceso seguro desde tu correo..."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    className="pl-9"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={!isRecoveryMode}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    className="pl-9"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={!isRecoveryMode}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !isRecoveryMode}
                            className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                'Guardar nueva contraseña'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}