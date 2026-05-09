# 🛒 SmartPantry
> **Gestión Inteligente de la Despensa Doméstica**

## 📋 1. Descripción General del Proyecto
**SmartPantry** es una aplicación web escalable diseñada para la gestión eficiente y el control económico de la despensa doméstica. Su objetivo principal es centralizar la gestión del inventario en un responsable del hogar para garantizar la integridad de los datos, evitar compras duplicadas, prevenir la rotura de stock y llevar un seguimiento detallado del gasto mensual.

A diferencia de un inventario manual, SmartPantry emplea una arquitectura escalable multi-hogar y un enfoque analítico que permite a las familias optimizar su economía basándose en sus hábitos de consumo reales.

## 🎯 2. Objetivos
* **Objetivo General:** Desarrollar una plataforma centralizada, automatizada y orientada al ahorro económico para la gestión de productos del hogar.
* **Objetivos Específicos:**
  * Controlar el stock en tiempo real mediante un sistema de alertas automáticas (Semáforo de Stock).
  * Proveer un módulo de Inteligencia Financiera para identificar patrones de consumo y el impacto económico.
  * Automatizar la generación de listas de la compra basadas en el déficit de stock, con presupuestos predictivos.

## ✨ 3. Funcionalidades Destacadas
* **Dashboard Financiero y Analítica:** Gráficas comparativas del gasto económico por periodos y ranking de productos más consumidos para facilitar la toma de decisiones.
* **Presupuesto Inteligente e Integración con WhatsApp:** Cálculo automático del presupuesto estimado de la próxima compra y exportación directa de la lista con un solo clic.
* **Registro Dinámico de Compras:** Interfaz avanzada para introducir tickets de supermercado completos (múltiples productos) en una sola acción, separando el "Formato" (ej. Kg, Pack) de la "Cantidad" matemática.
* **Gestión de Stock de Baja Fricción:** Acciones rápidas de consumo en un clic para minimizar el esfuerzo del registro diario (Auditoría Pre-Compra).
* **Seguridad RLS Multi-hogar:** Privacidad absoluta y aislamiento de datos entre diferentes familias mediante validaciones robustas a nivel de fila en PostgreSQL.

## 👥 4. Tipos de Usuarios y Roles
El sistema opera bajo tres perfiles jerárquicos bajo una arquitectura multi-tenant segura:
1. **Súper Administrador (AdminGeneral):** Rol global de auditoría. Monitoriza métricas generales y gestiona el ciclo de vida de las cuentas (Unidades Familiares).
2. **Gestor (AdminUser):** Administrador absoluto del hogar. Posee permisos CRUD sobre la despensa, crea categorías personalizadas, analiza el dashboard financiero e invita a nuevos miembros.
3. **Miembro (Usuario):** Perfil colaborativo. Visualiza el inventario y descuenta stock mediante consumo rápido, sin alterar la estructura o precios para evitar fricciones.

## 🛠️ 5. Arquitectura y Tecnologías
El proyecto ha sido desarrollado bajo un modelo *Serverless* con enfoque *Mobile First*, garantizando respuestas en menos de 2 segundos:
* **Frontend:** React 18, TypeScript, Vite.
* **Estilos y UI:** Tailwind CSS, shadcn/ui, Lucide React (Iconografía).
* **Gráficos e Informes:** Recharts.
* **Backend / Base de Datos:** Supabase (PostgreSQL, Autenticación, Row Level Security, API REST).
* **Despliegue e Integración Continua:** Vercel (CI/CD).

## 🚀 6. Instalación y Despliegue Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/rebecapoma6/SmartPantry.git](https://github.com/rebecapoma6/SmartPantry.git)
   cd SmartPantry