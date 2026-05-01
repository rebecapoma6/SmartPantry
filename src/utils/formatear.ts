export const formatearIniciales = (nombre: string) => {
  if (!nombre) return "??";
  return nombre.split(" ")
               .map(n => n[0])
               .join("")
               .toUpperCase()
               .substring(0, 2);
};



export const formatearFecha = (fechaOriginal: string) => {
    if (!fechaOriginal) return '';
    const [year, month, day] = fechaOriginal.split('-');
    return `${day}-${month}-${year}`;
  };
