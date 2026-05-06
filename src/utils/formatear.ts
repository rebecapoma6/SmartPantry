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


  export const formatearUltimoAcceso = (fechaStr: string) => {
       if (!fechaStr) return "Desconocido";
    
    const fecha = new Date(fechaStr);
    
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    
    return `${dia}-${mes}-${anio}, ${horas}:${min}`;
    };
