export const validacionesRegistro = (name: string, value: string, passwordOriginal?: string) => {
  switch (name) {
    case "full_name":
      if (!value.trim()) return "El nombre completo es obligatorio";
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return "Solo se permiten letras y espacios";
      return "";

    case "email":
      if (!value.trim()) return "El correo es obligatorio";
      if (!/\S+@\S+\.\S+/.test(value)) return "El formato del correo no es válido";
      return "";

    case "password":
      if (!value.trim()) return "La contraseña es obligatoria";
      //if (value.length < 6) return "La contraseña debe tener mínimo 6 caracteres";
      // Opcional: si tu profe te pide más seguridad, puedes descomentar la siguiente línea
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value)) return "Debe contener al menos una letra y un número";
      return "";

    case "confirmPassword":
      if (!value.trim()) return "Debes confirmar tu contraseña";
      if (value !== passwordOriginal) return "Las contraseñas no coinciden";
      return "";

    // Más adelante, cuando hagas el CRUD de productos, puedes agregar aquí:
    // case "nombre_producto":
    // case "cantidad":
    
    default:
      return "";
  }
};