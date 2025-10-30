# Guía del Panel de Administración

## 📁 Estructura de Rutas

```
/admin
├── page.tsx              → Home/Dashboard principal
├── add-roll/
│   └── page.tsx         → Formulario para crear nuevos rolls
├── metrics/
│   └── page.tsx         → Página de métricas y estadísticas
└── export/
    └── page.tsx         → Página de exportación de datos
```

## 🎨 Páginas Creadas

### 1. `/admin` - Dashboard Principal

**Archivo:** `src/app/admin/page.tsx`

**Funcionalidad actual:**

- Vista general del panel de administración
- Cards con estadísticas principales (placeholders)
- Acciones rápidas con links a otras secciones
- Sección de actividad reciente

**TODO para completar:**

- [ ] Conectar con API para obtener estadísticas reales
- [ ] Implementar lista de actividad reciente
- [ ] Agregar gráficos de resumen
- [ ] Implementar sistema de notificaciones

**Componentes sugeridos:**

```tsx
// hooks/useStats.ts
export function useStats() {
  // Fetch data from API
  const [stats, setStats] = useState({
    totalRolls: 0,
    totalPhotos: 0,
    lastRoll: null,
  });

  // Implement fetch logic

  return stats;
}
```

---

### 2. `/admin/add-roll` - Crear Nuevo Roll

**Archivo:** `src/app/admin/add-roll/page.tsx`

**Funcionalidad actual:**

- Formulario completo para subir rolls
- Upload de múltiples imágenes
- Campos de metadatos (ID, nombre, fecha, filmstock)
- Notas individuales por imagen
- Validación básica

**TODO para completar:**

- [ ] Mejorar validación de formulario
- [ ] Agregar preview de imágenes antes de subir
- [ ] Implementar drag & drop para imágenes
- [ ] Agregar barra de progreso en upload
- [ ] Validar formato y tamaño de imágenes
- [ ] Agregar campo de ubicación/GPS
- [ ] Implementar autoguardado de drafts

**API Endpoint:**

- Actualmente apunta a: `/pages/api/admin/upload`
- Verifica que este endpoint esté correctamente implementado

---

### 3. `/admin/metrics` - Métricas y Estadísticas

**Archivo:** `src/app/admin/metrics/page.tsx`

**Funcionalidad actual:**

- Template con secciones de estadísticas
- Cards para métricas principales
- Placeholders para gráficos

**TODO para completar:**

- [ ] Implementar gráfico de rolls por mes
- [ ] Implementar gráfico de filmstocks más usados
- [ ] Agregar tabla de rolls recientes con datos reales
- [ ] Implementar filtros por fecha
- [ ] Agregar métricas de engagement (si aplica)
- [ ] Implementar exportación de reportes

**Librerías recomendadas:**

```bash
# Para gráficos
npm install recharts
# o
npm install chart.js react-chartjs-2
```

**Ejemplo de implementación:**

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// En el componente
const data = [
  { month: "Ene", rolls: 4 },
  { month: "Feb", rolls: 3 },
  // ...
];

<LineChart width={500} height={300} data={data}>
  <XAxis dataKey="month" />
  <YAxis />
  <CartesianGrid strokeDasharray="3 3" />
  <Line type="monotone" dataKey="rolls" stroke="#8884d8" />
</LineChart>;
```

---

### 4. `/admin/export` - Exportación de Datos

**Archivo:** `src/app/admin/export/page.tsx`

**Funcionalidad actual:**

- Opciones de exportación (JSON, CSV, Backup)
- UI para diferentes formatos
- Placeholders para exportaciones recientes

**TODO para completar:**

- [ ] Implementar exportación a JSON
- [ ] Implementar exportación a CSV
- [ ] Implementar backup completo (datos + imágenes)
- [ ] Agregar historial de exportaciones
- [ ] Implementar descarga automática de archivos
- [ ] Agregar opciones de filtrado (rango de fechas, rolls específicos)
- [ ] Implementar compresión de archivos (ZIP)

**Ejemplo de implementación:**

```tsx
const handleExportJSON = async () => {
  const response = await fetch("/api/admin/export?format=json");
  const data = await response.json();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portfolio-export-${new Date().toISOString()}.json`;
  a.click();
};
```

---

## 🔧 Componentes Comunes

### Estilos Consistentes

Todos los componentes usan las siguientes clases base:

- **Cards:** `bg-neutral-950/40 backdrop-blur-lg border border-neutral-800`
- **Buttons:** `bg-transparent hover:bg-neutral-600/20 rounded-none border border-neutral-700`
- **Inputs:** `bg-transparent border-neutral-700 rounded-none backdrop-blur-sm`
- **Text:** `lowercase` (todo en minúsculas según tu diseño)

### Animaciones

Usando Framer Motion con el patrón:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

---

## 📡 APIs a Implementar

### GET `/api/admin/stats`

Retorna estadísticas generales:

```json
{
  "totalRolls": 12,
  "totalPhotos": 284,
  "lastUpload": "2024-10-20T10:30:00Z",
  "monthlyGrowth": 15
}
```

### POST `/api/admin/upload`

Ya existe, verifica que funcione correctamente

### GET `/api/admin/rolls`

Lista de todos los rolls:

```json
{
  "rolls": [
    {
      "id": "roll-001",
      "name": "Santiago Centro",
      "date": "Diciembre 2024",
      "filmstock": "Kodak Portra 400",
      "photoCount": 24
    }
  ]
}
```

### GET `/api/admin/export`

Query params: `?format=json|csv|backup`
Retorna los datos en el formato solicitado

---

## 🎯 Próximos Pasos Recomendados

1. **Implementar Base de Datos**

   - Define el schema para rolls y fotos
   - Implementa Prisma/MongoDB/tu elección

2. **Crear APIs**

   - Implementa los endpoints mencionados
   - Agrega autenticación/autorización

3. **Mejorar UX**

   - Agrega loading states
   - Implementa error handling
   - Agrega confirmaciones para acciones destructivas

4. **Features Adicionales**
   - Sistema de búsqueda
   - Edición de rolls existentes
   - Eliminación de rolls/fotos
   - Gestión de múltiples usuarios
   - Sistema de tags/categorías

---

## 🎨 Paleta de Colores Usada

```css
/* Backgrounds */
bg-neutral-950/40  /* Cards principales */
bg-neutral-950/30  /* Cards secundarios */
bg-neutral-800     /* Elements destacados */

/* Borders */
border-neutral-800 /* Principal */
border-neutral-700 /* Hover/Active */

/* Text */
text-white         /* Principal */
text-neutral-300   /* Secundario */
text-neutral-400   /* Terciario */
text-neutral-500   /* Disabled */

/* Status */
text-green-400     /* Success */
text-blue-400      /* Info */
text-red-400       /* Error */
```

---

## 📝 Notas Importantes

1. **Todos los textos están en lowercase** - Mantén esta consistencia
2. **Usa font-['Playfair']** para títulos
3. **Backdrop blur** en todos los cards para efecto glassmorphism
4. **Rounded-none** - Sin bordes redondeados según el diseño
5. **Transitions suaves** - duration-200 o 0.5s según el caso

---

¡Buena suerte con el desarrollo! 🚀
