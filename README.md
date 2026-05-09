# <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shopping-basket.svg" width="32" height="32" /> SmartPantry: Gestión Inteligente de Despensa

> **Proyecto Final de Grado Superior en Desarrollo de Aplicaciones Web (DAW)** > **Centro:** IES Albarregas (Mérida)  
> **Autora:** Rebeca Poma

---

## 📸 Vista Previa del Proyecto
Para ver la aplicación en funcionamiento, haz clic abajo:
> [!TIP]
> **AQUÍ PUEDES INSERTAR TU CAPTURA DE PANTALLA O GIF DEL PROYECTO**
> ![Captura de Pantalla del Proyecto](https://via.placeholder.com/800x450/22c55e/ffffff?text=SmartPantry+Dashboard+Preview)

---

## 📋 1. Descripción del Proyecto
[cite_start]**SmartPantry** [cite: 3] [cite_start]es una solución web avanzada diseñada para optimizar la economía doméstica y erradicar el desperdicio de alimentos[cite: 5, 7]. [cite_start]Centraliza el inventario del hogar para evitar compras duplicadas y rupturas de stock, permitiendo a las familias tomar decisiones basadas en datos reales de consumo[cite: 6, 74].

## 🎯 2. Objetivos Principales
* [cite_start]**Gestión Centralizada:** Unificar el control de stock para garantizar la integridad de los datos familiares[cite: 6, 9].
* [cite_start]**Inteligencia Financiera:** Visualizar gastos históricos y detectar productos de alto impacto económico[cite: 14, 66].
* [cite_start]**Sostenibilidad:** Reducir el desperdicio alimentario mediante alertas de caducidad y stock mínimo[cite: 12, 42].
* [cite_start]**Presupuesto Predictivo:** Generar listas de compra automáticas con estimaciones de gasto exportables a WhatsApp[cite: 15, 68].

## 🛠️ 3. Stack Tecnológico
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## ✨ 4. Funcionalidades Estrella
| Funcionalidad | Descripción |
| :--- | :--- |
| **🟢 Semáforo de Stock** | [cite_start]Alertas visuales automáticas cuando un producto alcanza su punto crítico[cite: 12, 42]. |
| **📊 Dashboard Analítico** | [cite_start]Gráficas dinámicas de gastos semanales y mensuales exclusivas para el Gestor[cite: 14, 44, 66]. |
| **🛍️ Compra Múltiple** | Registro dinámico de tickets completos separando el nombre del formato descriptivo (Kg, L, Packs). |
| **🔒 Seguridad RLS** | [cite_start]Aislamiento total de datos entre familias mediante políticas de Row Level Security[cite: 49, 71]. |
| **📱 Mobile First** | [cite_start]Diseño optimizado para una experiencia fluida desde cualquier dispositivo móvil[cite: 47]. |

---

## 👥 5. Roles y Jerarquías
[cite_start]El sistema implementa una arquitectura multi-tenant con tres perfiles estrictos[cite: 16, 25]:
1.  [cite_start]**Súper Administrador:** Auditoría global y gestión de unidades familiares[cite: 26, 45].
2.  **Gestor (AdminUser):** Administrador del hogar. [cite_start]Único perfil con permisos CRUD sobre catálogo y finanzas[cite: 28, 37].
3.  [cite_start]**Miembro (Usuario):** Colaborador con permisos de consulta y notificación de consumo rápido[cite: 30, 32].

---

## 📅 6. Evolución y Seguimiento del Proyecto

### 👨‍🏫 Fase Intermodular (Tutor: Paco Mera)
| Fecha | Actividad |
| :--- | :--- |
| **12-Sep** | Presentación de Asignatura y Propuesta de Proyecto. |
| **19-Sep** | Identidad Corporativa y Diseño de Marca. |
| **26-Sep** | Recogida de Necesidades y Elaboración de Contrato. |
| **03-Oct** | [cite_start]Definición de Requisitos Funcionales y No Funcionales[cite: 33, 46]. |
| **10-Oct** | Prototipado e Interfaces Gráficas (UI/UX). |
| **17-Oct** | [cite_start]Estructuración y Diseño de la Base de Datos[cite: 58]. |
| **24-Oct** | Definición del Modelo Relacional. |
| **31-Oct** | Presentación de Mockups y Esquema de Datos. |
| **07-Nov** | [cite_start]Selección del Stack Tecnológico Final[cite: 51]. |
| **14-Nov** | Inicio de Documentación Técnica. |
| **21-Nov** | Estructuración de Manuales de Usuario. |
| **05-Dic** | Desarrollo de Documentación de Soporte. |
| **12-Dic** | Estrategia de Despliegue. |
| **19-Dic** | Pruebas en Entorno Local (TomCat). |
| **09-Ene** | Primeras pruebas de despliegue en Vercel. |
| **16-30 Ene** | Fase Intensiva de Desarrollo y Pruebas de Sistema. |

### 👨‍🏫 Fase TFG (Tutor: Jesús García)
*(Sesiones de tutoría todos los jueves a partir del 16/04)*
| Fecha | Actividad |
| :--- | :--- |
| **16-Abr** | Auditoría de código y nuevos requerimientos de tutoría. |
| **23-Abr** | Refactorización de BD: Separación de campo **Formato** (Kg, L, Packs). |
| **30-Abr** | Implementación del Formulario de Compra Múltiple dinámico. |
| **07-May** | Resolución de errores de TypeScript y Despliegue Final en Producción. |

---

## 🚀 7. Guía de Inicio Rápido

### Instalación Local
```bash
# 1. Clonar
git clone [https://github.com/rebecapoma6/SmartPantry.git](https://github.com/rebecapoma6/SmartPantry.git)

# 2. Instalar
npm install

# 3. Configurar .env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key

# 4. Despegar
npm run dev