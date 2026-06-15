# 🎓 SENATI Simulador - Sistema Portable con Cuentas en la Nube (JSON)

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Funcionalidades Nuevas](#funcionalidades-nuevas)
3. [Cómo Funcionan las Cuentas Portables](#cómo-funcionan-las-cuentas-portables)
4. [Guía Completa para Usuarios](#guía-completa-para-usuarios)
5. [Panel de Administración](#panel-de-administración)
6. [Validador de Preguntas](#validador-de-preguntas)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Descripción General

Tu nuevo sistema SENATI ya **NO depende de un solo navegador o dispositivo**. Ahora puedes:
- ✅ Crear una cuenta en tu PC
- ✅ Exportarla como archivo JSON a carpeta "Descargas"
- ✅ Llevar ese archivo a otra PC/celular
- ✅ Importarlo y recuperar tu cuenta completa
- ✅ Todos tus exámenes y calificaciones se sincronizan

### ¿Por qué esto es importante?
Antes: localStorage = datos atados al navegador de una PC
Ahora: Archivo JSON = datos portátiles a cualquier dispositivo

---

## 🚀 Funcionalidades Nuevas

### 1️⃣ **SISTEMA DE CUENTAS PORTABLES**
- **Exportar Cuenta**: Descarga automáticamente un archivo .json con tus datos
- **Importar Cuenta**: Carga ese archivo en una nueva PC y recuperas tu cuenta
- Los datos se encriptan en Base64 (protección básica)

### 2️⃣ **VALIDACIÓN DE CONTRASEÑA**
Ahora se requiere:
- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 número (0-9)
- ✅ Al menos 1 mayúscula (A-Z)
- ✅ Confirmación de contraseña (debe coincidir)
- ✅ Confirmación de PIN (debe coincidir)

### 3️⃣ **SINCRONIZACIÓN DE HISTORIAL**
En el Dashboard aparecen 2 nuevos botones:
- 📥 **Importar Historial**: Carga exámenes de otro dispositivo
- 💾 **Exportar Historial**: Descarga todos tus exámenes en JSON

### 4️⃣ **PANEL DE ADMINISTRACIÓN** (Hidden)
- Acceso: Usuario "admin", PIN "0000"
- Funciones:
  - Ver todos los usuarios del dispositivo
  - Resetear contraseña de usuarios
  - 🗑️ Borrar TODO el sistema (con confirmación doble)

### 5️⃣ **VALIDADOR DE PREGUNTAS**
Nueva utilidad para limpiar automáticamente:
- Espacios dobles → espacios únicos
- Caracteres distorsionados → eliminados
- Valida que cada pregunta tenga 5 opciones
- Verifica que respuestaCorrecta sea 0-4

---

## 📱 Cómo Funcionan las Cuentas Portables

### Flujo Completo:

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: REGISTRO EN PC 1                                    │
│─────────────────────────────────────────────────────────────│
│ Nombre: Juan García                                         │
│ Carrera: Linux Red Hat                                      │
│ Contraseña: Senati2024!                                     │
│ PIN: 1234                                                   │
│ ↓                                                            │
│ "¿Deseas exportar tu cuenta como backup?" → SÍ             │
│ ↓                                                            │
│ Descarga: Juan_Garcia_SENATI_1718362400000.json            │
│ (Archivo guardado en Descargas)                            │
└─────────────────────────────────────────────────────────────┘
         ↓ (llevar archivo USB a otra PC)
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: IMPORTACIÓN EN PC 2 (Navegador diferente)          │
│─────────────────────────────────────────────────────────────│
│ 1. Abre https://tunominio.com/index.html                  │
│ 2. Click en pestaña "⬆️ Importar"                          │
│ 3. Selecciona: Juan_Garcia_SENATI_1718362400000.json      │
│ 4. Click "Importar Cuenta"                                 │
│ 5. Mensaje: "✅ Cuenta importada exitosamente"            │
│ ↓                                                            │
│ Login como: Juan García + Contraseña + PIN                │
│ ✅ Acceso al Dashboard con historial sincronizado        │
└─────────────────────────────────────────────────────────────┘
```

### Estructura del archivo JSON (Encriptado en Base64):

```json
{
  "data": "eyJ1c2VyIjp7Im5vbWJyZSI6Ikpva..."
}

// Decodificado (ilustrativo):
{
  "user": {
    "nombre": "Juan",
    "apellido": "García",
    "edad": 25,
    "genero": "M",
    "carrera": "Linux Red Hat",
    "password": "Senati2024!",
    "pin": "1234"
  },
  "history": [
    {
      "exam": "Basico",
      "date": "15/06/2026 10:30",
      "score": 85,
      "correct": 85,
      "total": 100,
      "timeTaken": "2h 15m"
    }
  ],
  "exportDate": "2026-06-15T10:45:23.000Z",
  "version": "1.0"
}
```

---

## 👥 Guía Completa para Usuarios

### Para ESTUDIANTES:

#### 📝 REGISTRO:
1. Abre `index.html`
2. Click "📝 Registrarse"
3. Completa: Nombre, Apellido, Edad, Género, Carrera
4. **Contraseña**: Mínimo 8 caracteres, 1 número, 1 mayúscula
   - ❌ Mal: "password" (sin número ni mayúscula)
   - ✅ Bien: "Senati2024!"
5. Confirma Contraseña (debe ser idéntica)
6. PIN: 4 dígitos (ej: 1234)
7. Confirma PIN
8. Click "Registrarse"
9. **IMPORTANTE**: Cuando te pregunte si exportar → **CLICK SÍ**
10. Se descarga automáticamente `TuNombre_TuApellido_SENATI_[número].json`
11. **Guarda este archivo en un lugar seguro** (Drive, Dropbox, USB, etc.)

#### 🔐 INICIAR SESIÓN:
1. Click "🔐 Iniciar"
2. Nombre Completo (ej: Juan García)
3. Contraseña
4. PIN
5. Click "Iniciar Sesión"

#### ➡️ CAMBIAR DE DISPOSITIVO:
1. En el nuevo dispositivo, abre `index.html`
2. Click "⬆️ Importar"
3. Selecciona el archivo JSON que descargaste
4. Click "Importar Cuenta"
5. El sistema te pregunta si deseas actualizar o crear nueva cuenta
6. ✅ Una vez importado, inicia sesión normalmente
7. Tu historial de exámenes estará sincronizado

#### 📊 EXPORTAR/IMPORTAR HISTORIAL:
**Exportar** (descargara todos tus exámenes):
1. En Dashboard, click "📊 Exportar Historial"
2. Se descarga: `NombreApellido_Historial_[número].json`

**Importar** (agregar exámenes de otra PC):
1. En Dashboard, click "📥 Importar Historial"
2. Selecciona el archivo JSON descargado
3. Se fusionan sin duplicados

---

## 🔧 Panel de Administración

### Acceso (Oculto):
1. En `index.html`, pestaña "⚙️ Admin"
2. PIN: `0000`
3. Contraseña de admin: `admin0000`

### Funciones Disponibles:

#### 📋 Ver Usuarios:
- Lista todos los usuarios registrados en ese navegador/dispositivo
- Muestra: Nombre, Carrera, Cantidad de exámenes, Fecha de creación

#### 🔑 Resetear Contraseña:
- Click en botón "Resetear" junto a cualquier usuario
- Ingresa nueva contraseña (debe cumplir: 8+ chars, 1 número, 1 mayúscula)
- La contraseña se actualiza inmediatamente

#### 🗑️ DESTRUIR SISTEMA:
- Botón rojo al fondo
- **ADVERTENCIA**: Borra TODO
  - Todos los usuarios
  - Todos los registros de exámenes
  - Toda la configuración
  - NO SE PUEDE DESHACER
- Requiere 2 confirmaciones
- Si ejecutas, se reinicia en 2 segundos

---

## 🧹 Validador de Preguntas

### ¿Para qué sirve?
Limpia automáticamente los arrays de preguntas:
- Elimina espacios dobles/múltiples
- Elimina caracteres distorsionados
- Valida que cada pregunta tenga 5 opciones
- Valida que `respuestaCorrecta` sea 0-4
- Genera reporte de errores

### Cómo usarlo:

#### Opción 1: Desde la Consola (Recomendado)

```javascript
// 1. Abre la consola del navegador (F12)
// 2. Copia-pega el archivo validador-preguntas.js en <script>

// 3. Ejecuta en consola:
validarYLimpiarTodo()

// Salida esperada:
// ✅ BASICO: 150/150 válidas
// ✅ INTERMEDIO: 100/100 válidas  
// ✅ AVANZADO: 50/50 válidas

// 4. Descarga las preguntas limpias:
descargarPreguntasLimpias()
// Descarga: preguntas-limpias-1718362400000.json

// 5. (Opcional) Genera reporte HTML:
descargarReporteHTML()
// Descarga: reporte-preguntas-1718362400000.html
```

#### Opción 2: Desde app.js (Integración)

```javascript
// Ya está integrado, solo ejecuta en consola:
validarYLimpiarPreguntas({
  basico: preguntasNivel1,
  intermedio: preguntasNivel2,
  avanzado: preguntasNivel3
})
```

### Salida del Validador:

```
🔍 INICIANDO VALIDACIÓN DE PREGUNTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ BASICO: 150/150 válidas
  (Sin errores)

⚠️ INTERMEDIO: 99/100 válidas
  ❌ Errores encontrados:
    • Pregunta 42: "¿Qué es un router?"
      - respuestaCorrecta: 9 (debe ser 0-4)
      - No tiene exactamente 5 opciones (tiene 4)

✅ AVANZADO: 50/50 válidas
  (Sin errores)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TODAS LAS PREGUNTAS ESTÁN EN ORDEN
📊 RESUMEN: 299/300 preguntas válidas

✨ Datos guardados en: window.preguntasValidadas
Usa: descargarPreguntasLimpias()
```

---

## ❓ Preguntas Frecuentes

### P: ¿Es seguro compartir el archivo JSON?
**R**: El contenido está encriptado en Base64 (protección básica). Para máxima seguridad, no lo compartas públicamente. Guárdalo en Drive privado, Dropbox o USB encriptada.

### P: ¿Qué pasa si pierdo el archivo JSON?
**R**: Si tienes acceso a ese navegador/dispositivo, sigue siendo válido crear otro backup. Si no, necesitas crear una nueva cuenta.

### P: ¿Puedo usar la misma cuenta en 2 dispositivos simultáneamente?
**R**: Técnicamente sí (localStorage independiente), pero los cambios no se sincronizan en tiempo real. Sincroniza manualmente con exportar/importar historial.

### P: ¿Qué pasa si cambio mi contraseña?
**R**: Solo se actualiza en ese navegador. Para usar la nueva contraseña en otro dispositivo, exporta nuevamente tu cuenta (sobrescribirá el archivo anterior).

### P: ¿El PIN puede ser distinto de 4 dígitos?
**R**: No, siempre debe ser 4 dígitos. Si intentas menos, el sistema lo rechaza.

### P: ¿Cómo recupero mi contraseña si la olvido?
**R**: 
- En el mismo navegador: No hay recuperación automática (diseño de seguridad)
- En panel admin (PIN 0000): Resetea la contraseña manualmente
- Desde otro dispositivo: Importa tu cuenta JSON anterior

### P: ¿Qué debo hacer si encuentro preguntas con errores?
**R**: 
1. Nota el número de pregunta y nivel
2. Abre F12 → Consola → `validarYLimpiarTodo()`
3. El reporte te mostrará exactamente qué está mal
4. Puedes descargar el archivo limpiado y reemplazar los arrays en los .js

### P: ¿Puedo exportar/importar historial sin exportar cuenta?
**R**: Sí, son independientes. Exportar historial solo guarda tus exámenes.

### P: ¿Dónde se guardan todos los datos?
**R**: En `localStorage` del navegador (clave: `senati_exam_db`). En la consola puedes ver:
```javascript
console.log(localStorage.getItem('senati_exam_db'))
```

### P: ¿Qué pasa si borro el localStorage?
**R**: Pierdes todos los datos. Por eso es importante exportar regularmente.

### P: ¿Puedo usar este sistema sin acceso a internet?
**R**: Sí, funciona 100% offline. Todo está en el navegador.

### P: ¿Es compatible con todos los navegadores?
**R**: Sí, funciona en Chrome, Firefox, Safari, Edge. localStorage existe en todos.

---

## 🎯 Resumen de Pasos para Guiar a Usuarios

### Para Maestros/Coordinadores:

1. **Comunicar el cambio**:
   > "El sistema ahora es portable. Pueden usar su cuenta en cualquier dispositivo"

2. **Solicitar que exporten su cuenta**:
   > "Al registrarse, hacer click en SÍ para exportar. Guardar el archivo en Drive/Dropbox"

3. **Para sincronización multi-dispositivo**:
   > "1. Importa el archivo JSON en el nuevo dispositivo
   > 2. Exporta tu historial en PC vieja
   > 3. Importa historial en PC nueva"

4. **Para validar preguntas** (antes de impartir un examen):
   > "Abrir F12 → Consola → ejecutar: validarYLimpiarTodo()"

5. **Backup diario** (opcional):
   > "Los estudiantes pueden exportar historial cada semana para tener backup"

---

## 🔐 Seguridad y Privacidad

### Qué se protege:
- ✅ Datos encriptados en Base64 (archivo JSON)
- ✅ PIN obligatorio para cada inicio de sesión
- ✅ Contraseña validada (requisitos fuertes)

### Qué NO se protege:
- ⚠️ localStorage de navegador (no encriptado)
- ⚠️ Archivo JSON en "Descargas" (sin encriptación adicional)

### Recomendaciones:
- Usar en navegador con sesiones privadas si es PC compartida
- Guardar JSONs en carpeta protegida (no Desktop público)
- No compartir JSONs por email o redes
- Cambiar contraseña periódicamente

---

## 🛠️ Archivos Incluidos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Autenticación (4 pestañas) |
| `app.js` | Lógica principal + funciones portables |
| `inicio.html` | Dashboard con botones de sincronización |
| `basico.js`, `intermedio.js`, `avanzado.js` | Bancos de preguntas |
| `estilos.css` | Diseño glassmorphism |
| `validador-preguntas.js` | Utilidad para limpiar preguntas |

---

## 📞 Soporte Rápido

Si algo no funciona:

1. **Abre la Consola** (F12)
2. **Revisa si hay errores** (pestaña "Console")
3. **Prueba los comandos**:
   ```javascript
   // Ver base de datos completa
   localStorage.getItem('senati_exam_db')
   
   // Ver usuario actual
   getCurrentUser()
   
   // Ver sesión
   localStorage.getItem('senati_current_user')
   ```

4. **Si necesitas borrar TODO**:
   ```javascript
   localStorage.clear() // Limpia todo localStorage
   ```

---

## 📈 Roadmap Futuro

- [ ] Sincronización en la nube (Firebase)
- [ ] Encriptación AES-256 para JSONs
- [ ] Sincronización en tiempo real multi-dispositivo
- [ ] Estadísticas analíticas detalladas
- [ ] Modo offline con sincronización posterior
- [ ] Interfaz móvil nativa

---

**Versión**: 1.0 (Junio 2026)  
**Desarrollador**: Equipo SENATI  
**Licencia**: Uso Interno
