// app.js - SENATI Sistema de Exámenes Portable
const DB_KEY = 'senati_exam_db';
const SESSION_KEY = 'senati_current_user';
const ADMIN_PASSWORD = 'admin0000'; // admin con PIN 0000

// --- UTILIDADES CORE ---
const getDB = () => JSON.parse(localStorage.getItem(DB_KEY)) || { users: [] };
const saveDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
const getCurrentUser = () => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    return getDB().users.find(u => u.id === userId);
};
const generateId = () => 'usr_' + Math.random().toString(36).substring(2, 11);

// --- UTILIDADES DE ENCRIPTACIÓN SIMPLE (Base64) ---
const encryptData = (data) => btoa(JSON.stringify(data));
const decryptData = (encryptedStr) => {
    try {
        return JSON.parse(atob(encryptedStr));
    } catch (e) {
        return null;
    }
};

// --- VALIDADORES ---
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    return {
        isValid: minLength && hasNumber && hasUppercase,
        minLength,
        hasNumber,
        hasUppercase
    };
}

function getPasswordStrength(password) {
    const validation = validatePassword(password);
    if (!validation.minLength) return 'weak';
    if (!validation.hasNumber || !validation.hasUppercase) return 'medium';
    return 'strong';
}

// --- FUNCIONES DE CUENTAS PORTABLES ---
function exportarCuenta() {
    const user = getCurrentUser();
    if (!user) {
        alert('❌ Debes iniciar sesión para exportar tu cuenta.');
        return;
    }

    const accountData = {
        user: {
            nombre: user.nombre,
            apellido: user.apellido,
            edad: user.edad,
            genero: user.genero,
            carrera: user.carrera,
            password: user.password,
            pin: user.pin
        },
        history: user.history || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    // Encriptar con Base64
    const encrypted = encryptData(accountData);
    const filename = `${user.nombre}_${user.apellido}_SENATI_${Date.now()}.json`;

    // Descargar archivo
    const blob = new Blob([JSON.stringify({ data: encrypted }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ Cuenta exportada como: ${filename}\n\n💡 Guarda este archivo en un lugar seguro. Podrás importarlo en otros dispositivos.`);
}

function importarCuenta(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = JSON.parse(e.target.result);
                const decryptedData = decryptData(fileContent.data);

                if (!decryptedData || !decryptedData.user) {
                    reject('❌ Archivo corrupto o inválido.');
                    return;
                }

                const db = getDB();
                const fullName = `${decryptedData.user.nombre} ${decryptedData.user.apellido}`.trim();

                // Verificar si el usuario ya existe
                const existingUser = db.users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase());
                if (existingUser) {
                    // Actualizar o crear nuevo
                    const shouldUpdate = confirm(`El usuario "${fullName}" ya existe en este dispositivo. ¿Deseas actualizar su información?`);
                    if (shouldUpdate) {
                        Object.assign(existingUser, {
                            nombre: decryptedData.user.nombre,
                            apellido: decryptedData.user.apellido,
                            edad: decryptedData.user.edad,
                            genero: decryptedData.user.genero,
                            carrera: decryptedData.user.carrera,
                            password: decryptedData.user.password,
                            pin: decryptedData.user.pin,
                            history: decryptedData.history || []
                        });
                    } else {
                        reject('Importación cancelada.');
                        return;
                    }
                } else {
                    // Crear nuevo usuario
                    const newUser = {
                        id: generateId(),
                        nombre: decryptedData.user.nombre,
                        apellido: decryptedData.user.apellido,
                        fullName: fullName,
                        edad: decryptedData.user.edad,
                        genero: decryptedData.user.genero,
                        carrera: decryptedData.user.carrera,
                        password: decryptedData.user.password,
                        pin: decryptedData.user.pin,
                        deviceInfo: getDeviceInfo(),
                        history: decryptedData.history || []
                    };
                    db.users.push(newUser);
                }

                saveDB(db);
                resolve({
                    success: true,
                    message: `✅ Cuenta importada exitosamente. Bienvenido, ${fullName}!`,
                    user: decryptedData.user
                });
            } catch (error) {
                reject(`❌ Error al procesar el archivo: ${error.message}`);
            }
        };
        reader.onerror = () => reject('❌ Error al leer el archivo.');
        reader.readAsText(file);
    });
}

// --- FUNCIONES DE HISTORIAL PORTÁTIL ---
function exportarHistorial() {
    const user = getCurrentUser();
    if (!user) {
        alert('❌ Debes iniciar sesión para exportar tu historial.');
        return;
    }

    const historialData = {
        usuario: user.fullName,
        exportDate: new Date().toISOString(),
        examenesTotales: user.history.length,
        promedio: user.history.length > 0 ? 
            Math.round(user.history.reduce((a, b) => a + b.score, 0) / user.history.length) : 0,
        historial: user.history
    };

    const filename = `${user.nombre}_${user.apellido}_Historial_${Date.now()}.json`;
    const blob = new Blob([JSON.stringify(historialData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ Historial exportado: ${filename}`);
}

function importarHistorial(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const historialData = JSON.parse(e.target.result);
                const user = getCurrentUser();

                if (!user) {
                    reject('❌ Debes iniciar sesión primero.');
                    return;
                }

                if (!Array.isArray(historialData.historial)) {
                    reject('❌ Formato de historial inválido.');
                    return;
                }

                const db = getDB();
                const userIndex = db.users.findIndex(u => u.id === user.id);

                // Fusionar historial (evitar duplicados)
                const nuevoHistorial = historialData.historial.filter(newExam =>
                    !user.history.some(existing => 
                        existing.date === newExam.date && existing.exam === newExam.exam
                    )
                );

                db.users[userIndex].history = [...db.users[userIndex].history, ...nuevoHistorial];
                saveDB(db);

                resolve({
                    success: true,
                    message: `✅ Se añadieron ${nuevoHistorial.length} exámenes al historial.`
                });
            } catch (error) {
                reject(`❌ Error al procesar historial: ${error.message}`);
            }
        };
        reader.onerror = () => reject('❌ Error al leer el archivo.');
        reader.readAsText(file);
    });
}

// Simulación de huella digital del dispositivo (Anti-Bot básico)
const getDeviceInfo = () => {
    return {
        ua: navigator.userAgent,
        lang: navigator.language,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency || 'unknown',
        timestamp: Date.now()
    };
};

// --- AUTENTICACIÓN MEJORADA ---
function registerUser(formData) {
    const db = getDB();
    const fullName = `${formData.nombre} ${formData.apellido}`.trim();
    
    if (db.users.some(u => u.fullName.toLowerCase() === fullName.toLowerCase())) {
        return { success: false, message: '❌ Este usuario ya está registrado.' };
    }

    // Validar contraseña
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        return {
            success: false,
            message: '❌ Contraseña débil.\nRequisitos:\n- Mínimo 8 caracteres\n- Al menos 1 número\n- Al menos 1 mayúscula'
        };
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.passwordConfirm) {
        return { success: false, message: '❌ Las contraseñas no coinciden.' };
    }

    // Validar PIN
    if (formData.pin !== formData.pinConfirm) {
        return { success: false, message: '❌ Los PINs no coinciden.' };
    }

    const newUser = {
        id: generateId(),
        nombre: formData.nombre,
        apellido: formData.apellido,
        fullName: fullName,
        edad: Number.parseInt(formData.edad),
        genero: formData.genero,
        carrera: formData.carrera,
        password: formData.password,
        pin: formData.pin,
        deviceInfo: getDeviceInfo(),
        history: [],
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    // Generar descarga automática de backup
    setTimeout(() => {
        const shouldExport = confirm('✅ Cuenta creada exitosamente.\n\n💾 ¿Deseas exportar tu cuenta como backup?\n\nEsto te permitirá usarla en otros dispositivos.');
        if (shouldExport) {
            localStorage.setItem(SESSION_KEY, newUser.id);
            exportarCuenta();
            localStorage.removeItem(SESSION_KEY);
        }
    }, 500);

    return { success: true, message: '✅ Registro exitoso. Ahora puedes iniciar sesión.' };
}

function loginUser(fullName, password, pin) {
    const db = getDB();
    const user = db.users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase());
    
    if (!user) return { success: false, message: '❌ Usuario no encontrado.' };
    if (user.password !== password) return { success: false, message: '❌ Contraseña incorrecta.' };
    if (user.pin !== pin) return { success: false, message: '❌ PIN de seguridad incorrecto.' };

    user.deviceInfo = getDeviceInfo();
    saveDB(db);
    localStorage.setItem(SESSION_KEY, user.id);
    return { success: true, user };
}

function loginAdmin(pin) {
    if (pin !== '0000') {
        return { success: false, message: '❌ PIN de administrador incorrecto.' };
    }
    localStorage.setItem(SESSION_KEY, 'ADMIN_MODE');
    return { success: true, message: '✅ Acceso de administrador concedido.' };
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    globalThis.location.href = 'index.html';
}

// --- PANEL DE ADMINISTRACIÓN ---
function getAdminUsers() {
    const db = getDB();
    return db.users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        carrera: user.carrera,
        exams: user.history.length,
        created: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));
}

function resetUserPassword(userId, newPassword) {
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false, message: '❌ Usuario no encontrado.' };

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        return { success: false, message: '❌ Contraseña débil.' };
    }

    user.password = newPassword;
    saveDB(db);
    return { success: true, message: `✅ Contraseña de ${user.fullName} reseteada.` };
}

function deleteUser(userId) {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, message: '❌ Usuario no encontrado.' };

    const deletedUser = db.users[index].fullName;
    db.users.splice(index, 1);
    saveDB(db);
    return { success: true, message: `✅ Usuario ${deletedUser} eliminado.` };
}

function limpiarSistema() {
    const confirmed = confirm('⚠️ ¡ADVERTENCIA!\n\nEstas a punto de DESTRUIR TODO el sistema:\n- Todos los usuarios\n- Todos los registros de exámenes\n- Toda la configuración\n\n¿Estás completamente seguro?');
    
    if (!confirmed) return { success: false, message: 'Operación cancelada.' };

    const confirmedAgain = confirm('SEGUNDA CONFIRMACIÓN:\n\n¿Realmente deseas continuar? Esta acción NO SE PUEDE DESHACER.');
    
    if (!confirmedAgain) return { success: false, message: 'Operación cancelada.' };

    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('current_exam_session');
    
    return {
        success: true,
        message: '✅ Sistema destruido completamente. La aplicación se reiniciará en 2 segundos...'
    };
}

// --- VALIDADOR Y LIMPIADOR DE PREGUNTAS ---
function validarYLimpiarPreguntas(bancosDePreguntas) {
    /**
     * Función para limpiar y validar arrays de preguntas
     * Uso: validarYLimpiarPreguntas({basico: preguntasNivel1, intermedio: preguntasNivel2, avanzado: preguntasNivel3})
     */
    const resultado = {
        estadisticas: {},
        errores: [],
        preguntasLimpiadas: {}
    };

    for (const [nivel, preguntas] of Object.entries(bancosDePreguntas)) {
        resultado.estadisticas[nivel] = {
            totalPreguntas: preguntas.length,
            erroresEncontrados: 0,
            preguntasCorregidas: 0
        };

        resultado.preguntasLimpiadas[nivel] = preguntas.map((preg, idx) => {
            const erroresEnEstaPregunta = [];
            const preguntaLimpia = { ...preg };

            // 1. Limpiar espacios dobles en pregunta y opciones
            preguntaLimpia.pregunta = preg.pregunta
                .replace(/\s{2,}/g, ' ')
                .trim();

            // 2. Verificar y limpiar opciones
            if (!Array.isArray(preg.opciones) || preg.opciones.length !== 5) {
                erroresEnEstaPregunta.push(`Pregunta ${idx + 1}: No tiene exactamente 5 opciones (tiene ${preg.opciones?.length || 0})`);
            } else {
                preguntaLimpia.opciones = preg.opciones.map(opt => 
                    opt.replace(/\s{2,}/g, ' ').trim()
                );
            }

            // 3. Validar respuesta correcta
            if (typeof preg.respuestaCorrecta !== 'number' || 
                preg.respuestaCorrecta < 0 || 
                preg.respuestaCorrecta > 4) {
                erroresEnEstaPregunta.push(`Pregunta ${idx + 1}: respuestaCorrecta inválida (${preg.respuestaCorrecta}). Debe ser 0-4.`);
            }

            // 4. Limpiar explicación
            if (preg.explicacion) {
                preguntaLimpia.explicacion = preg.explicacion
                    .replace(/\s{2,}/g, ' ')
                    .trim();
            }

            // 5. Verificar caracteres distorsionados comunes
            const texto = `${preguntaLimpia.pregunta} ${preguntaLimpia.opciones.join(' ')} ${preguntaLimpia.explicacion || ''}`;
            const caracteresRaros = texto.match(/[^\w\s.,;:\-()áéíóúñ¿?¡!]/g);
            if (caracteresRaros) {
                erroresEnEstaPregunta.push(`Pregunta ${idx + 1}: Posibles caracteres distorsionados: ${[...new Set(caracteresRaros)].join(', ')}`);
            }

            if (erroresEnEstaPregunta.length > 0) {
                resultado.estadisticas[nivel].erroresEncontrados += erroresEnEstaPregunta.length;
                resultado.errores.push(...erroresEnEstaPregunta);
            }

            resultado.estadisticas[nivel].preguntasCorregidas++;
            return preguntaLimpia;
        });
    }

    return resultado;
}

// Función para exportar el validador de preguntas
function exportarValidadorDePreguntas() {
    const codigo = `
// EJECUTA ESTO EN LA CONSOLA DEL NAVEGADOR PARA LIMPIAR TUS PREGUNTAS

// Primero, define tus arrays de preguntas en la consola o cargalos desde los archivos
// Ejemplo:

const resultado = validarYLimpiarPreguntas({
    basico: preguntasNivel1,
    intermedio: preguntasNivel2,
    avanzado: preguntasNivel3
});

console.log('REPORTE DE VALIDACIÓN:', resultado);
console.log('Estadísticas:', resultado.estadisticas);
console.log('Errores encontrados:', resultado.errores);

// Para usar las preguntas limpias, reemplaza los arrays con:
// preguntasNivel1 = resultado.preguntasLimpiadas.basico;
// preguntasNivel2 = resultado.preguntasLimpiadas.intermedio;
// preguntasNivel3 = resultado.preguntasLimpiadas.avanzado;

// Descarga las preguntas limpias
const datosLimpios = JSON.stringify(resultado.preguntasLimpiadas, null, 2);
const blob = new Blob([datosLimpios], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'preguntas_limpias_' + Date.now() + '.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
`;
    alert('Código de validación copiado. Abre la consola (F12) y ejecuta el código que aparecerá descargado.');
    console.log(codigo);
}

// --- GESTIÓN DE EXAMEN ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startExam(nivel, preguntasSource) {
    const user = getCurrentUser();
    if (!user) { globalThis.location.href = 'index.html'; return; }

    // Reglas pre-examen
    const rulesAccepted = confirm("REGLAS DEL EXAMEN:\n1. PROHIBIDO el uso de IA, celulares o apuntes.\n2. PROHIBIDO cambiar de pestaña o minimizar el navegador (el examen se anulará).\n3. No hay límite de tiempo, pero se registrará tu duración.\n\n¿Aceptas estas reglas y estás listo para comenzar?");
    
    if (!rulesAccepted) {
            globalThis.location.href = 'inicio.html';
    }

    // Preparar sesión
    const shuffledQuestions = shuffleArray([...preguntasSource]).map((q, index) => ({
        ...q,
        tempId: index // Nuevo ID temporal para mezclar
    }));

    const session = {
        nivel: nivel,
        questions: shuffledQuestions,
        answers: {},
        startTime: Date.now()
    };
    
    localStorage.setItem('current_exam_session', JSON.stringify(session));
    enableAntiCheat();
    renderExam();
}

function renderExam() {
    const session = JSON.parse(localStorage.getItem('current_exam_session'));
    if (!session) { globalThis.location.href = 'inicio.html'; return; }

    const container = document.getElementById('exam-container');
    if (!container) return; // No estamos en página de examen

    let html = `<div class="glass-card">`;
    session.questions.forEach((q, idx) => {
        html += `
            <div class="mb-4" id="q-${q.tempId}">
                <h3 class="mb-4"><span class="text-muted">Pregunta ${idx + 1}:</span> ${q.pregunta}</h3>
                <div class="options-group">
                    ${q.opciones.map((opt, optIdx) => `
                        <label class="option-label" onclick="selectOption(${q.tempId}, ${optIdx}, this)">
                            <input type="radio" name="q-${q.tempId}" value="${optIdx}" style="display:none;">
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
    html += `
        <button class="btn btn-primary mt-4" onclick="submitExam()">💾 Entregar Examen Final</button>
    </div>`;
    container.innerHTML = html;
}

function selectOption(tempId, optIdx, element) {
    const session = JSON.parse(localStorage.getItem('current_exam_session'));
    session.answers[tempId] = optIdx;
    localStorage.setItem('current_exam_session', JSON.stringify(session));

    // UI Update
    const parent = element.parentElement;
    parent.querySelectorAll('.option-label').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

function submitExam() {
    const session = JSON.parse(localStorage.getItem('current_exam_session'));
    const totalQuestions = session.questions.length;
    const answeredCount = Object.keys(session.answers).length;

    if (answeredCount < totalQuestions) {
        if (!confirm(`Has respondido ${answeredCount} de ${totalQuestions} preguntas. ¿Estás seguro de entregar?`)) return;
    }

    let correctCount = 0;
    const detailedResults = session.questions.map(q => {
        const userAnswer = session.answers[q.tempId];
        const hasAnswer = userAnswer !== undefined;
        const isCorrect = userAnswer === q.respuestaCorrecta;
        if (isCorrect) correctCount++;
        return {
            pregunta: q.pregunta,
            userAnswer: hasAnswer ? q.opciones[userAnswer] : 'Sin responder',
            correctAnswer: q.opciones[q.respuestaCorrecta],
            isCorrect: isCorrect,
            explicacion: q.explicacion
        };
    });

    const endTime = Date.now();
    const timeTakenMs = endTime - session.startTime;
    const hours = Math.floor(timeTakenMs / 3600000);
    const minutes = Math.floor((timeTakenMs % 3600000) / 60000);
    const timeString = `${hours}h ${minutes}m`;

    const score = Math.round((correctCount / totalQuestions) * 100);

    // Guardar en historial
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === getCurrentUser().id);
    db.users[userIndex].history.push({
        exam: session.nivel,
        date: new Date().toLocaleString(),
        score: score,
        correct: correctCount,
        total: totalQuestions,
        timeTaken: timeString,
        details: detailedResults
    });
    saveDB(db);

    examInProgress = false; // Desactivar anti-cheat
    localStorage.removeItem('current_exam_session');
    
    // Mostrar resultados
    showResults(score, correctCount, totalQuestions, timeString, detailedResults);
}

function showResults(score, correct, total, time, details) {
    const container = document.getElementById('exam-container');
    let motivationalMsg;
    if (score >= 90) {
        motivationalMsg = "¡Excelente! Dominas el tema a la perfección. 🏆";
    } else if (score >= 70) {
        motivationalMsg = "¡Buen trabajo! Tienes una base sólida, sigue practicando. 💪";
    } else {
        motivationalMsg = "No te desanimes. Repasa los conceptos y vuelve a intentarlo. 📚";
    }

    let html = `
        <div class="glass-card text-center">
            <h2 class="mb-4">📋 Resultados de la Evaluación</h2>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-value">${score}%</div><div class="stat-label">Calificación</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--success)">${correct}</div><div class="stat-label">Correctas</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--danger)">${total - correct}</div><div class="stat-label">Incorrectas</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--warning)">${time}</div><div class="stat-label">Tiempo Total</div></div>
            </div>
            <p class="mb-4" style="font-size: 1.2rem; font-style: italic;">"${motivationalMsg}"</p>
            
            <h3 class="text-center mb-4">Revisión Detallada</h3>
            <div style="text-align: left;">
                ${details.map((d, i) => `
                    <div class="glass-card mb-4" style="padding: 1.5rem; border-left: 4px solid ${d.isCorrect ? 'var(--success)' : 'var(--danger)'}">
                        <p><strong>${i + 1}. ${d.pregunta}</strong></p>
                        <p style="color: ${d.isCorrect ? 'var(--success)' : 'var(--danger)'}; margin-top: 0.5rem;">
                            Tu respuesta: ${d.userAnswer} ${d.isCorrect ? '✅' : '❌'}
                        </p>
                        ${d.isCorrect ? '' : `<p style="color: var(--success); margin-top: 0.3rem;">Respuesta correcta: ${d.correctAnswer}</p>`}
                        <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;"><em>💡 ${d.explicacion}</em></p>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary mt-4" onclick="globalThis.location.href='inicio.html'">Volver al Dashboard 🏠</button>
        </div>
    `;
    container.innerHTML = html;
}

// --- INICIALIZACIÓN DE PÁGINAS ---
document.addEventListener('DOMContentLoaded', () => {
    const path = globalThis.location.pathname;
    
    // Proteger rutas
    if (!path.includes('index.html') && !getCurrentUser()) {
        globalThis.location.href = 'index.html';
        return;
    }

    // Lógica específica de index.html (Login/Registro)
    if (path.includes('index.html')) {
        setupAuthPage();
    }
    
    // Lógica específica de inicio.html (Dashboard)
    if (path.includes('inicio.html')) {
        setupDashboard();
    }

    // Lógica de exámenes
    if (path.includes('nivel')) {
        // Se cargará dinámicamente según el archivo JS importado
    }
});

function setupAuthPage() {
    const form = document.getElementById('auth-form');
    const tabs = document.querySelectorAll('.auth-tab');
    let mode = 'login';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            mode = tab.dataset.mode;
            renderAuthForm(mode);
        });
    });

    renderAuthForm('login');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (mode === 'register') {
            const res = registerUser(data);
            alert(res.message);
            if (res.success) {
                mode = 'login';
                document.querySelector('[data-mode="login"]').click();
            }
        } else if (mode === 'login') {
            const res = loginUser(data.fullName, data.password, data.pin);
            if (res.success) {
                globalThis.location.href = 'inicio.html';
            } else {
                alert(res.message);
            }
        } else if (mode === 'import') {
            const fileInput = form.querySelector('input[type="file"]');
            if (!fileInput.files.length) {
                alert('❌ Por favor selecciona un archivo JSON.');
                return;
            }
            importarCuenta(fileInput.files[0])
                .then(res => {
                    alert(res.message);
                    if (res.success) {
                        mode = 'login';
                        document.querySelector('[data-mode="login"]').click();
                    }
                })
                .catch(err => alert(err));
        } else if (mode === 'admin') {
            const res = loginAdmin(data.adminPin);
            if (res.success) {
                showAdminPanel();
            } else {
                alert(res.message);
            }
        }
    });
}

function renderAuthForm(mode) {
    const form = document.getElementById('auth-form');
    let html = '';

    if (mode === 'login') {
        html = String.raw`
            <div class="input-group"><label>👤 Nombre Completo</label><input name="fullName" required></div>
            <div class="input-group"><label>🔐 Contraseña</label><input type="password" name="password" required></div>
            <div class="input-group"><label>📍 PIN de 4 dígitos</label><input type="password" name="pin" pattern="\d{4}" maxlength="4" required></div>
            <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
        `;
    } else if (mode === 'register') {
        html = String.raw`
            <div class="input-group"><label>👤 Nombre</label><input name="nombre" required></div>
            <div class="input-group"><label>👤 Apellido</label><input name="apellido" required></div>
            <div style="display:flex;gap:1rem">
                <div class="input-group" style="flex:1"><label>📅 Edad</label><input type="number" name="edad" required></div>
                <div class="input-group" style="flex:1"><label>⚧️ Género</label>
                    <select name="genero" required><option value="M">Masculino</option><option value="F">Femenino</option></select>
                </div>
            </div>
            <div class="input-group"><label>🎓 Carrera</label><input name="carrera" required></div>
            <div class="input-group">
                <label>🔐 Contraseña</label>
                <input type="password" name="password" id="pwd-input" onkeyup="updatePasswordStrength()" required>
                <div class="password-strength" id="pwd-strength"></div>
                <ul class="requirements" id="pwd-requirements">
                    <li id="req-length">Mínimo 8 caracteres</li>
                    <li id="req-number">Al menos 1 número (0-9)</li>
                    <li id="req-upper">Al menos 1 mayúscula (A-Z)</li>
                </ul>
            </div>
            <div class="input-group"><label>🔐 Confirmar Contraseña</label><input type="password" name="passwordConfirm" required></div>
            <div class="input-group"><label>📍 PIN de 4 dígitos</label><input type="password" name="pin" pattern="\d{4}" maxlength="4" required></div>
            <div class="input-group"><label>📍 Confirmar PIN</label><input type="password" name="pinConfirm" pattern="\d{4}" maxlength="4" required></div>
            <button type="submit" class="btn btn-primary">Registrarse</button>
        `;
        setTimeout(() => {
            document.getElementById('pwd-input').addEventListener('keyup', updatePasswordStrength);
        }, 100);
    } else if (mode === 'import') {
        html = String.raw`
            <div class="input-group">
                <label>📁 Selecciona tu archivo SENATI (.json)</label>
                <input type="file" name="accountFile" accept=".json" required style="padding: 0.8rem; border: 1px dashed var(--primary);">
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 1rem 0;">
                💡 Busca el archivo que descargaste cuando creaste tu cuenta.<br>
                Generalmente se llama algo como: Nombre_Apellido_SENATI_[número].json
            </p>
            <button type="submit" class="btn btn-primary">Importar Cuenta</button>
        `;
    } else if (mode === 'admin') {
        html = String.raw`
            <div class="input-group">
                <label>🔑 PIN de Administrador</label>
                <input type="password" name="adminPin" pattern="\d{4}" maxlength="4" required placeholder="Ingresa PIN admin">
            </div>
            <button type="submit" class="btn btn-primary">Acceder Panel Admin</button>
        `;
    }

    form.innerHTML = html;
}

function updatePasswordStrength() {
    const pwd = document.getElementById('pwd-input').value;
    const strength = getPasswordStrength(pwd);
    const validation = validatePassword(pwd);

    const strengthEl = document.getElementById('pwd-strength');
    strengthEl.style.display = 'block';
    strengthEl.className = 'password-strength strength-' + strength;
    strengthEl.textContent = strength === 'strong' ? '✓ Contraseña fuerte' : 
                             strength === 'medium' ? '⚠ Contraseña media' : '✗ Contraseña débil';

    document.getElementById('req-length').classList.toggle('met', validation.minLength);
    document.getElementById('req-number').classList.toggle('met', validation.hasNumber);
    document.getElementById('req-upper').classList.toggle('met', validation.hasUppercase);
}

function showAdminPanel() {
    const users = getAdminUsers();
    const form = document.getElementById('auth-form');

    let html = `
        <h2 style="color: var(--danger); margin-bottom: 1.5rem;">⚙️ PANEL DE ADMINISTRACIÓN</h2>
        <div class="admin-grid">
    `;

    if (users.length === 0) {
        html += `<p style="color: var(--text-muted);">No hay usuarios registrados en este dispositivo.</p>`;
    } else {
        users.forEach(user => {
            html += `
                <div class="user-item">
                    <div>
                        <strong>${user.fullName}</strong><br>
                        <small style="color: var(--text-muted);">${user.carrera} • ${user.exams} exámenes • Desde: ${user.created}</small>
                    </div>
                    <button class="btn btn-outline" onclick="adminResetPassword('${user.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Resetear</button>
                </div>
            `;
        });
    }

    html += `
        </div>
        <button class="danger-btn" onclick="adminDestroySystem()">🗑️ DESTRUIR SISTEMA</button>
        <button class="btn btn-primary" onclick="adminLogout()" style="margin-top: 0.5rem; width:100%;">Salir del Panel</button>
    `;

    form.innerHTML = html;
}

function adminResetPassword(userId) {
    const newPwd = prompt('Ingresa nueva contraseña (mínimo 8 caracteres, 1 número, 1 mayúscula):');
    if (!newPwd) return;

    const res = resetUserPassword(userId, newPwd);
    alert(res.message);
    showAdminPanel();
}

function adminDestroySystem() {
    const res = limpiarSistema();
    if (res.success) {
        alert(res.message);
        setTimeout(() => {
            globalThis.location.href = 'index.html';
        }, 2000);
    } else {
        alert(res.message);
    }
}

function adminLogout() {
    localStorage.removeItem(SESSION_KEY);
    globalThis.location.href = 'index.html';
}

function setupDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Actualizar header
    document.getElementById('headerUserName').textContent = user.fullName;
    document.getElementById('headerUserCareer').textContent = user.carrera;
    document.getElementById('userAvatar').textContent = user.nombre.charAt(0).toUpperCase();
    document.getElementById('welcomeName').textContent = user.nombre;
    
    // Calcular estadísticas
    const history = user.history || [];
    const totalExams = history.length;
    const avgScore = totalExams > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalExams) : 0;
    const bestScore = totalExams > 0 ? Math.max(...history.map(h => h.score)) : 0;
    
    let totalTime = 0;
    history.forEach(h => {
        const parts = h.timeTaken.split(' ');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        totalTime += hours * 60 + minutes;
    });
    const totalHours = Math.floor(totalTime / 60);

    document.getElementById('statExams').textContent = totalExams;
    document.getElementById('statAvg').textContent = avgScore + '%';
    document.getElementById('statBest').textContent = bestScore + '%';
    document.getElementById('statTime').textContent = totalHours + 'h';

    // Agregar botones de exportar/importar
    const dashboardActions = document.getElementById('dashboard-actions');
    if (dashboardActions) {
        dashboardActions.innerHTML = `
            <button class="btn btn-primary" onclick="exportarCuenta()">💾 Exportar Cuenta</button>
            <button class="btn btn-primary" onclick="exportarHistorial()">📊 Exportar Historial</button>
            <button class="btn btn-outline" onclick="importarHistorialUI()">📥 Importar Historial</button>
            <button class="btn btn-outline" onclick="logout()">🚪 Cerrar Sesión</button>
        `;
    }

    // Renderizar historial
    const tbody = document.getElementById('history-table-body');
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aún no has realizado ningún examen.</td></tr>';
    } else {
        tbody.innerHTML = history.slice().reverse().map(h => `
            <tr>
                <td>${h.exam}</td>
                <td>${h.date}</td>
                <td>${h.timeTaken}</td>
                <td><span style="color: ${h.score >= 70 ? 'var(--success)' : 'var(--danger)'}; font-weight:bold;">${h.score}%</span> (${h.correct}/${h.total})</td>
                <td><button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="alert('Detalles: ${h.correct} correctas, ${h.total - h.correct} incorrectas.')">Ver</button></td>
            </tr>
        `).join('');
    }
}

function importarHistorialUI() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        importarHistorial(e.target.files[0])
            .then(res => {
                alert(res.message);
                setupDashboard();
            })
            .catch(err => alert(err));
    };
    input.click();
}