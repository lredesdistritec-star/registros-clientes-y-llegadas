# Sistema Netlink - Módulo de Control de Tiempos y Ventas Caídas (Versión 2.0)

## Descripción General
Este proyecto constituye el paquete modular del prototipo de control operativo y diagnóstico comercial para la plataforma **Netlink (Distritec)**. Está diseñado bajo una arquitectura web limpia, receptiva y desacoplada en tres archivos estándar: `index.html`, `styles.css` y `app.js`.

---

## Novedades y Ajustes Implementados (Versión 2.0)

### 1. Control de Asistencia y Tolerancia Extemporánea
* **Verificación por IP de Sede:** Indicador en vivo que confirma si la marcación se realiza desde la red autorizada (Sede Pereira Centro).
* **Evaluación de Horario Oficial:**
  * **Lunes a Viernes:** Entrada 9:30 AM (Almuerzo 1:00 PM - 2:00 PM) | Salida 6:00 PM.
  * **Sábados:** Entrada 9:00 AM | Salida 1:00 PM.
* **Margen de Tolerancia (±3 minutos):**
  * Marcaciones entre 9:27 AM y 9:33 AM (Lun-Vie) o 8:57 AM y 9:03 AM (Sáb) se procesan directamente como **Llegada a Tiempo** (Modal Verde).
  * Marcaciones posteriores a las 9:33 AM activan la **Alerta de Llegada Tardía** (Modal Rojo), exigiendo seleccionar un motivo justificado (*Trancón, Falla en vehículo, Cita médica, Permiso previo, etc.*).
* **Control de Salidas:**
  * **Salida Antes de Cierre (Antes de las 6:00 PM / 1:00 PM):** Modal Rojo obligatorio para seleccionar el motivo de salida anticipada (*Permiso concedido, Emergencia personal, Tiempo compensado, etc.*).
  * **Salida Regular o Extendida (6:00 PM o posterior):** Confirmación Verde con captura de actividades realizadas (*Cliente en sede, Cierre de ventas, Extensión por Jefatura, etc.*).
* **Gestión de Ausencias / Permisos Temporales:** Opción dedicada a salidas autorizadas durante el turno sin recurrir a conceptos de "breaks" de descanso no otorgados en la política interna.

### 2. Módulo de Diagnóstico de Ventas Caídas
* Mantenido al 100% con KPIs en tiempo real (Pérdidas totales, Monto recuperable, Etapa más crítica).
* Gráfico dinámico de Pareto en Chart.js para análisis gerencial ($80/20$).
* Formulario de captura de fallas operativas (Cartera, Sedes, Plataforma, Logística).
* Historial con búsqueda, filtros dinámicos y exportador a CSV.

---

## Estructura de Archivos del Proyecto

* `index.html` -> Estructura principal con sidebar Netlink, reloj en vivo, modales y secciones.
* `styles.css` -> Estilos oscuros Netlink, badges, animaciones y fuentes personalizadas.
* `app.js` -> Lógica JavaScript para simulador de horario/IP, validación de tolerancia, eventos de modales y gráficos Chart.js.
* `README.md` -> Documentación técnica y manual de implementación.

---

## Instrucciones de Uso

1. Descomprimir el archivo ZIP en una carpeta local.
2. Hacer doble clic sobre `index.html` para abrir la plataforma en cualquier navegador (Chrome, Edge, Firefox).
3. Navegar libremente entre las pestañas **"Control de Tiempos"** y **"Ventas Caídas"**.
