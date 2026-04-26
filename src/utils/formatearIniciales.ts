

export const formatearIniciales = (nombre: string) => {
  if (!nombre) return "??";
  return nombre.split(" ")
               .map(n => n[0])
               .join("")
               .toUpperCase()
               .substring(0, 2);
};