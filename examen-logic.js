// examen-logic.js

// --- CONFIGURACIÓN Y ESTADO ---
let currentExam = null;
let currentQuestionIndex = 0;
let examStartTime = null;
let timerInterval = null;
let examInProgress = false;

// --- UTILIDADES ---
const DB_KEY = 'senati_exam_db';
const SESSION_KEY = 'senati_current_user';

const getDB = () => JSON.parse(localStorage.getItem(DB_KEY)) || { users: [] };
const saveDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
const getCurrentUser = () => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    return getDB().users.find(u => u.id === userId);
};

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- INICIALIZACIÓN ---
globalThis.initExam = function() {
    const user = getCurrentUser();
    if (!user) {
        globalThis.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(globalThis.location.search);
    const nivel = Number.parseInt(urlParams.get('nivel'));

    if (!nivel || !globalThis.examData?.[nivel]) {
        alert('Nivel de examen no válido.');
        globalThis.location.href = 'inicio.html';
        return;
    }

    currentExam = globalThis.examData[nivel];
    document.title = `SENATI - ${currentExam.nombre}`;
    document.getElementById('exam-title').textContent = currentExam.nombre;
    document.getElementById('total-count').textContent = currentExam.total;
};

globalThis.acceptRules = function() {
    document.getElementById('rules-modal').style.display = 'none';
    document.getElementById('exam-header').style.display = 'flex';
    
    // Preparar preguntas mezcladas
    const mixedQuestions = shuffleArray(currentExam.preguntas).map((q, idx) => {
        const shuffledOptions = shuffleArray([...q.opciones]);
        const newCorrectIndex = shuffledOptions.indexOf(q.opciones[q.respuestaCorrecta]);
        return {
            ...q,
            tempId: idx,
            opciones: shuffledOptions,
            respuestaCorrecta: newCorrectIndex
        };
    });

    currentExam.sessionQuestions = mixedQuestions;
    currentExam.answers = {};
    examStartTime = Date.now();
    examInProgress = true;

    enableAntiCheat();
    startTimer();
    renderQuestion(0);
};

// --- TIMER ---
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - examStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        document.getElementById('timer').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// --- ANTI-CHEAT ---
function enableAntiCheat() {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'p')) {
            e.preventDefault();
        }
    });
}

function handleVisibilityChange() {
    if (document.hidden && examInProgress) {
        alert("⚠️ ¡ALERTA DE SEGURIDAD!\n\nSe ha detectado que cambiaste de pestaña o minimizaste el navegador.\n\nEl examen se cerrará automáticamente por intento de uso de IA o materiales externos.");
        examInProgress = false;
        clearInterval(timerInterval);
        globalThis.location.href = 'inicio.html';
    }
}

// --- RENDERIZADO ---
function renderQuestion(index) {
    currentQuestionIndex = index;
    const q = currentExam.sessionQuestions[index];
    const answered = Object.keys(currentExam.answers).length;
    
    document.getElementById('answered-count').textContent = answered;

    const container = document.getElementById('exam-container');
    container.innerHTML = `
        <div class="glass-card question-card">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(answered / currentExam.total) * 100}%"></div>
            </div>
            
            <span class="question-number">Pregunta ${index + 1} de ${currentExam.total}</span>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">${q.curso}</p>
            
            <h3 style="margin-bottom: 1.5rem; line-height: 1.5;">${q.pregunta}</h3>
            
            <div class="options-group">
                ${q.opciones.map((opt, optIdx) => `
                    <label class="option-label ${currentExam.answers[q.tempId] === optIdx ? 'selected' : ''}" 
                           onclick="selectOption(${q.tempId}, ${optIdx}, this)">
                        <input type="radio" name="q-${q.tempId}" value="${optIdx}" 
                               ${currentExam.answers[q.tempId] === optIdx ? 'checked' : ''} style="display:none;">
                        <strong style="color: var(--primary); margin-right: 0.8rem;">${String.fromCodePoint(65 + optIdx)}.</strong>
                        ${opt}
                    </label>
                `).join('')}
            </div>
            
            <div class="nav-buttons">
                <button class="btn-nav" onclick="prevQuestion()" ${index === 0 ? 'disabled' : ''}>
                    ⬅️ Anterior
                </button>
                ${index === currentExam.total - 1 ? `
                    <button class="btn-nav btn-submit" onclick="submitExam()">
                        💾 Entregar Examen
                    </button>
                ` : `
                    <button class="btn-nav" onclick="nextQuestion()">
                        Siguiente ➡️
                    </button>
                `}
            </div>
        </div>
    `;
}

globalThis.selectOption = function(tempId, optIdx, element) {
    currentExam.answers[tempId] = optIdx;
    
    const parent = element.parentElement;
    parent.querySelectorAll('.option-label').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
    
    document.getElementById('answered-count').textContent = Object.keys(currentExam.answers).length;
    
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${(Object.keys(currentExam.answers).length / currentExam.total) * 100}%`;
    }
};

globalThis.nextQuestion = function() {
    if (currentQuestionIndex < currentExam.total - 1) {
        renderQuestion(currentQuestionIndex + 1);
    }
};

globalThis.prevQuestion = function() {
    if (currentQuestionIndex > 0) {
        renderQuestion(currentQuestionIndex - 1);
    }
};

globalThis.cancelExam = function() {
    if (confirm('¿Estás seguro de cancelar el examen?\n\nPerderás todo tu progreso.')) {
        examInProgress = false;
        clearInterval(timerInterval);
        globalThis.location.href = 'inicio.html';
    }
};

globalThis.submitExam = function() {
    const answeredCount = Object.keys(currentExam.answers).length;
    
    if (answeredCount < currentExam.total) {
        if (!confirm(`⚠️ Preguntas Incompletas\n\nHas respondido ${answeredCount} de ${currentExam.total} preguntas.\n\n¿Estás seguro de entregar el examen incompleto?`)) {
            return;
        }
    }

    examInProgress = false;
    clearInterval(timerInterval);
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    // Calcular resultados
    let correctCount = 0;
    const detailedResults = currentExam.sessionQuestions.map(q => {
        const userAnswerIdx = currentExam.answers[q.tempId];
        const isCorrect = userAnswerIdx !== undefined && userAnswerIdx === q.respuestaCorrecta;
        if (isCorrect) correctCount++;
        
        return {
            pregunta: q.pregunta,
            curso: q.curso,
            userAnswer: userAnswerIdx === undefined ? 'Sin responder' : q.opciones[userAnswerIdx],
            correctAnswer: q.opciones[q.respuestaCorrecta],
            isCorrect: isCorrect,
            explicacion: q.explicacion
        };
    });

    const endTime = Date.now();
    const timeTakenMs = endTime - examStartTime;
    const hours = Math.floor(timeTakenMs / 3600000);
    const minutes = Math.floor((timeTakenMs % 3600000) / 60000);
    const timeString = `${hours}h ${minutes}m`;

    const score = Math.round((correctCount / currentExam.total) * 100);

    // Guardar en historial
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === getCurrentUser().id);
    if (userIndex !== -1) {
        db.users[userIndex].history.push({
            exam: currentExam.nombre,
            date: new Date().toLocaleString(),
            score: score,
            correct: correctCount,
            total: currentExam.total,
            timeTaken: timeString,
            details: detailedResults
        });
        saveDB(db);
    }

    showResults(score, correctCount, currentExam.total, timeString, detailedResults);
};

function showResults(score, correct, total, time, details) {
    const user = getCurrentUser();
    const container = document.getElementById('exam-container');
    
    let motivationalMsg;
    if (score >= 90) {
        motivationalMsg = "¡Excelente! Dominas el tema a la perfección. 🏆";
    } else if (score >= 70) {
        motivationalMsg = "¡Buen trabajo! Tienes una base sólida, sigue practicando. 💪";
    } else if (score >= 50) {
        motivationalMsg = "Vas por buen camino. Repasa los conceptos y vuelve a intentarlo. 📚";
    } else {
        motivationalMsg = "No te desanimes. Cada intento es una oportunidad de aprender. 💡";
    }

    let emoji;
    if (score >= 90) {
        emoji = "🎉";
    } else if (score >= 70) {
        emoji = "👍";
    } else if (score >= 50) {
        emoji = "📖";
    } else {
        emoji = "💪";
    }

    container.innerHTML = `
        <div class="glass-card text-center" style="animation: fadeIn 0.6s ease-out;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
            <h2 style="margin-bottom: 0.5rem;">📋 REPORTE DE EVALUACIÓN ACADÉMICA</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Estudiante: <strong>${user.fullName}</strong></p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: ${score >= 70 ? 'var(--success)' : 'var(--danger)'};">${score}%</div>
                    <div class="stat-label">Calificación Final</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--success);">${correct}</div>
                    <div class="stat-label">Respuestas Correctas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--danger);">${total - correct}</div>
                    <div class="stat-label">Respuestas Incorrectas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--warning);">${time}</div>
                    <div class="stat-label">Tiempo Total</div>
                </div>
            </div>
            
            <div class="glass-card" style="margin: 2rem 0; background: rgba(37, 99, 235, 0.1); border: 1px solid var(--primary);">
                <p style="font-size: 1.3rem; font-style: italic; color: var(--text-main);">"${motivationalMsg}"</p>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                <button class="btn btn-primary" onclick="window.location.href='inicio.html'">
                    🏠 Volver al Dashboard
                </button>
                <button class="btn btn-outline" onclick="window.location.reload()">
                    🔄 Reintentar Examen
                </button>
            </div>
            
            <h3 style="text-align: left; margin-bottom: 1rem;">📝 Revisión Detallada de Preguntas</h3>
            
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <button class="btn btn-outline" style="width: auto; padding: 0.5rem 1rem;" onclick="filterQuestions('all')">
                    Todas (${total})
                </button>
                <button class="btn btn-outline" style="width: auto; padding: 0.5rem 1rem; border-color: var(--success); color: var(--success);" onclick="filterQuestions('correct')">
                    ✅ Correctas (${correct})
                </button>
                <button class="btn btn-outline" style="width: auto; padding: 0.5rem 1rem; border-color: var(--danger); color: var(--danger);" onclick="filterQuestions('incorrect')">
                    ❌ Incorrectas (${total - correct})
                </button>
            </div>
            
            <div id="questions-review" style="text-align: left;">
                ${renderQuestionsReview(details)}
            </div>
        </div>
    `;

    globalThis.allDetails = details;
}

function renderQuestionsReview(details, filter = 'all') {
    let filtered = details;
    if (filter === 'correct') filtered = details.filter(d => d.isCorrect);
    if (filter === 'incorrect') filtered = details.filter(d => !d.isCorrect);

    if (filtered.length === 0) {
        return '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay preguntas en esta categoría.</p>';
    }

    return filtered.map((d, i) => `
        <div class="glass-card" style="padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid ${d.isCorrect ? 'var(--success)' : 'var(--danger)'}">
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;">${d.curso}</p>
            <p style="margin-bottom: 1rem;"><strong>Pregunta ${i + 1}:</strong> ${d.pregunta}</p>
            
            <div style="margin-bottom: 0.8rem;">
                <span style="color: ${d.isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                    Tu respuesta: ${d.userAnswer} ${d.isCorrect ? '✅' : '❌'}
                </span>
            </div>
            
            ${d.isCorrect ? '' : `
                <div style="margin-bottom: 0.8rem;">
                    <span style="color: var(--success); font-weight: 600;">
                        Respuesta correcta: ${d.correctAnswer} ✅
                    </span>
                </div>
            `}
            
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <p style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">
                    💡 <strong>Explicación:</strong> ${d.explicacion}
                </p>
            </div>
        </div>
    `).join('');
}

globalThis.filterQuestions = function(type) {
    const container = document.getElementById('questions-review');
    if (container && globalThis.allDetails) {
        container.innerHTML = renderQuestionsReview(globalThis.allDetails, type);
    }
};