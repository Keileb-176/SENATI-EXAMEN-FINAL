# 🎓 SENATI Simulador - Sistema Portable v1.0

## ✨ Cambios Implementados

### 1. **4 NUEVAS PESTAÑAS EN AUTENTICACIÓN**

#### `index.html` - Actualizado

| Pestaña | Función |
|---------|----------|
| 🔐 **Iniciar** | Login estándar (Nombre, Contraseña, PIN) |
| 📝 **Registrarse** | Nuevo registro con validación fuerte + exportación automática |
| ⬆️ **Importar** | Carga archivo JSON de cuenta desde otro dispositivo |
| ⚙️ **Admin** | Panel oculto (PIN: 0000) para administración |

**Nuevas Funcionalidades en Registro:**
- ✅ Indicador visual de fortaleza de contraseña
- ✅ Validación obligatoria: 8+ caracteres, 1 número, 1 mayúscula
- ✅ Confirmación de Contraseña (debe coincidir)
- ✅ Confirmación de PIN (debe coincidir)
- ✅ Exportación automática de cuenta como JSON al crear usuario

---

### 2. **FUNCIONES DE CUENTAS PORTABLES EN `app.js`**

#### `exportarCuenta()`
```javascript
// Descarga: NombreApellido_SENATI_[timestamp].json
// Contenido: Datos encriptados en Base64
```
- Usuario loggeado → Descarga su perfil completo
- Archivo encriptado (Base64) para protección básica
- Se puede compartir entre dispositivos

#### `importarCuenta(file)`
```javascript
// Selecciona archivo JSON descargado
// Sistema valida y carga en localStorage
// Fusiona con datos existentes inteligentemente
```
- Lee archivo JSON
- Desencripta contenido Base64
- Importa usuario + historial de exámenes
- Pregunta si actualizar usuario existente

---

### 3. **FUNCIONES DE SINCRONIZACIÓN DE HISTORIAL**

#### `exportarHistorial()`
- Descarga todos los exámenes rendidos en JSON
- Formato: `NombreApellido_Historial_[timestamp].json`
- Incluye: calificaciones, fechas, tiempos, respuestas

#### `importarHistorial(file)`
- Lee archivo de historial JSON
- Fusiona exámenes sin duplicados
- Actualiza estadísticas del usuario

#### Ubicación en Dashboard
- 2 nuevos botones en la sección superior
- Accesibles para todo usuario loggeado
- También disponible para exportar cuenta

---

### 4. **PANEL DE ADMINISTRACIÓN OCULTO**

#### Acceso:
- Pestaña "⚙️ Admin" en `index.html`
- PIN: `0000`
- Usuario: `admin`

#### Funcionalidades:

##### 📋 Ver Usuarios
```
Lista:
- Nombre Completo
- Carrera
- Cantidad de exámenes
- Fecha de creación
```

##### 🔑 Resetear Contraseña
- Busca usuario
- Propone nueva contraseña (validada)
- Actualiza inmediatamente en localStorage

##### 🗑️ Destruir Sistema
```
Advertencias:
- Confirma 2 veces (protección anti-accidente)
- Borra: usuarios + exámenes + configuración
- NO SE PUEDE DESHACER
- Se reinicia en 2 segundos
```

---

### 5. **VALIDADOR DE PREGUNTAS - `validador-preguntas.js`**

#### Funciones Principales:

```javascript
// 1. Valida todos los bancos
validarYLimpiarTodo()

// 2. Limpia y descarga preguntas
descargarPreguntasLimpias()

// 3. Genera reporte HTML
descargarReporteHTML()

// 4. Reemplaza arrays en memoria
aplicarPreguntasLimpias()
```

#### Qué valida:
- ✅ 5 opciones por pregunta
- ✅ respuestaCorrecta entre 0-4
- ✅ Espacios múltiples normalizados
- ✅ Caracteres distorsionados detectados
- ✅ Explicaciones presentes

#### Uso Rápido:
```javascript
// En consola (F12):
1. validarYLimpiarTodo()        // Analiza todos los bancos
2. descargarPreguntasLimpias() // Descarga JSON limpio
3. descargarReporteHTML()      // Reporte visual
```

---

### 6. **NUEVAS VALIDACIONES DE CONTRASEÑA**

#### Requisitos Implementados:
```javascript
function validatePassword(password) {
    - Mínimo 8 caracteres
    - Al menos 1 número (0-9)
    - Al menos 1 mayúscula (A-Z)
    
    // Ejemplos:
    ❌ "password"      // Sin número ni mayúscula
    ❌ "Password"      // Sin número
    ❌ "password1"     // Sin mayúscula
    ✅ "Password1"     // Correcto
    ✅ "Senati2024!"   // Correcto
}
```

#### Visual de Fortaleza:
- 🔴 **Débil**: No cumple requisitos
- 🟡 **Media**: Cumple algunos requisitos
- 🟢 **Fuerte**: Cumple todos los requisitos

---

## 📊 ESTRUCTURA DE ARCHIVOS

```
tu_proyecto/
├── index.html                          ✨ ACTUALIZADO (4 pestañas)
├── inicio.html                         ✨ ACTUALIZADO (botones portables)
├── app.js                              ✨ ACTUALIZADO (nuevas funciones)
├── basico.js                           (sin cambios)
├── intermedio.js                       (sin cambios)
├── avanzado.js                         (sin cambios)
├── estilos.css                         (sin cambios)
├── validador-preguntas.js              ✨ NUEVO (limpiador de preguntas)
├── INSTRUCCIONES_NUEVO_SISTEMA.md      ✨ NUEVO (guía completa)
└── README.md                           (este archivo)
```

---

## 🔄 FLUJO DE DATOS

### Flujo 1: Registro y Exportación
```
Registro → Usuario creado → localStorage
                         ↓
                    Se pregunta si exportar
                         ↓
              Descargar JSON (Base64)
                         ↓
                 Guardar en Descargas
```

### Flujo 2: Importación en Otro Dispositivo
```
Nuevo dispositivo → Importar pestaña
                         ↓
                  Seleccionar JSON
                         ↓
              Desencriptar Base64
                         ↓
           Cargar usuario + historial
                         ↓
                  Login normal
```

### Flujo 3: Sincronización de Historial
```
PC 1: Examen 1, Examen 2
       ↓ Exportar Historial
       └→ JSON descargado
       
PC 2: Examen 3, Examen 4
       ↓ Importar JSON
       
PC 2: Examen 1, Examen 2, Examen 3, Examen 4 ✅
```

---

## 🧪 PRUEBAS RECOMENDADAS

### 1. Prueba de Exportación/Importación:

```
PASO 1 (PC 1):
- Registrarse: Juan García / Senati2024! / 1234
- Exportar cuenta → Juan_Garcia_SENATI_[nro].json
- Realizar 1-2 exámenes

PASO 2 (PC 2, navegador diferente):
- Abrir index.html
- Pestaña "⬆️ Importar"
- Cargar Juan_Garcia_SENATI_[nro].json
- Login con: Juan García / Senati2024! / 1234
- Verificar: Dashboard muestra exámenes de PC 1 ✅

PASO 3 (PC 2):
- Realizar 2-3 exámenes nuevos
- Exportar Historial
- 
PASO 4 (PC 1):
- Importar Historial desde PC 2
- Verificar: Dashboard muestra exámenes de PC 2 ✅
```

### 2. Prueba de Validación de Contraseña:

```
PASO 1: Intentar registrarse con:
- ❌ "123456"           → Rechazado (sin mayúscula)
- ❌ "password"         → Rechazado (sin número)
- ❌ "Pass123"          → Rechazado (7 caracteres)
- ✅ "Senati2024!"      → Aceptado

PASO 2: Verificar indicador:
- Campo rojo    → Débil
- Campo naranja → Media
- Campo verde   → Fuerte
```

### 3. Prueba de Panel Admin:

```
PASO 1: Ir a pestaña "⚙️ Admin"
PASO 2: Ingresar PIN: 0000
PASO 3: Ver lista de usuarios
PASO 4: Click "Resetear" en un usuario
PASO 5: Ingresar nueva contraseña validada
PASO 6: Verificar que se actualiza en "Ver Perfil"
```

### 4. Prueba de Validador de Preguntas:

```
PASO 1: F12 → Consola
PASO 2: validarYLimpiarTodo()
PASO 3: Esperar reporte
PASO 4: Si todo ✅, ejecutar: descargarPreguntasLimpias()
PASO 5: Si hay ❌, verificar reporte HTML: descargarReporteHTML()
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

### ✅ Lo que está protegido:
- Contraseña validada (mínimo 8 chars, 1 número, 1 mayúscula)
- PIN obligatorio en cada login
- Datos encriptados en Base64 en archivos JSON
- Panel admin requiere PIN correcto
- Confirmación doble para destruir sistema

### ⚠️ Limitaciones:
- Base64 es encriptación básica (no para producción)
- localStorage no está encriptado en el navegador
- Si alguien accede a la PC, puede ver localStorage
- Recomendación: Usar en sesión privada si es PC compartida

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Para Producción:**
   - Reemplazar Base64 con AES-256 (libería crypto-js)
   - Implementar sincronización en la nube (Firebase)
   - Hash de contraseña con bcrypt o similar

2. **Para Usuarios:**
   - Crear tutoriales en video
   - Hacer guía en PDF
   - Capacitar a coordinadores

3. **Para Mantenimiento:**
   - Monitorear errores en consola
   - Solicitar feedback de usuarios
   - Iterar según necesidades

---

## 📞 CONTACTO Y SOPORTE

Si algo no funciona:

1. **Abre Consola** (F12)
2. **Busca errores** en pestaña "Console"
3. **Revisa localStorage**:
   ```javascript
   console.log(localStorage)
   ```
4. **Borra localStorage si es necesario**:
   ```javascript
   localStorage.clear()
   ```

---

## 📝 NOTAS TÉCNICAS

### Estructura de localStorage:

```javascript
// Base de datos principal
senati_exam_db: {
  users: [
    {
      id: "usr_abc123",
      nombre: "Juan",
      apellido: "García",
      fullName: "Juan García",
      edad: 25,
      genero: "M",
      carrera: "Linux Red Hat",
      password: "Senati2024!",
      pin: "1234",
      history: [ {...exámenes...} ],
      createdAt: "2026-06-15T10:30:00.000Z"
    }
  ]
}

// Usuario actual en sesión
senati_current_user: "usr_abc123"

// Examen en progreso
current_exam_session: { ...detalles examen... }
```

### Encriptación JSON (Base64):

```javascript
// Encriptar
const data = { user: {...}, history: [...] }
const encrypted = btoa(JSON.stringify(data))

// Desencriptar
const decrypted = JSON.parse(atob(encrypted))
```

---

## 🎯 RESUMEN FINAL

✅ **Problema 1 (Multi-dispositivo):** RESUELTO con cuentas portables JSON  
✅ **Problema 2 (Preguntas distorsionadas):** RESUELTO con validador automático  
✅ **Problema 3 (Falta de control):** RESUELTO con panel admin + destructor sistema  

**Estado:** Listo para producción local  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Autor:** Equipo SENATI

---

*Última actualización: 2026-06-15*
