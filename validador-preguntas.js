/**
 * VALIDADOR Y LIMPIADOR DE PREGUNTAS - SENATI Examen
 * 
 * Este archivo contiene utilidades para validar y limpiar los bancos de preguntas.
 * 
 * INSTRUCCIONES DE USO:
 * 1. Carga primero basico.js, intermedio.js y avanzado.js en tu página
 * 2. Luego carga este archivo: validador-preguntas.js
 * 3. Abre la consola del navegador (F12)
 * 4. Ejecuta: validarYLimpiarTodo()
 * 5. Revisa el reporte en la consola
 * 6. Si todo está bien, descargue las preguntas limpias
 */

/**
 * Limpia espacios múltiples, caracteres raros y normaliza texto
 */
function limpiarTexto(texto) {
    if (!texto) return '';
    return texto
        .replace(/\s{2,}/g, ' ') // Espacios múltiples -> espacio único
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Caracteres invisibles
        .trim();
}

/**
 * Valida que una pregunta tenga la estructura correcta
 */
function validarPregunta(pregunta, indice) {
    const errores = [];

    // Validar que sea un objeto
    if (typeof pregunta !== 'object' || !pregunta) {
        errores.push(`Pregunta ${indice + 1}: No es un objeto válido`);
        return errores;
    }

    // Validar campos obligatorios
    if (!pregunta.pregunta || typeof pregunta.pregunta !== 'string') {
        errores.push(`Pregunta ${indice + 1}: Campo 'pregunta' vacío o inválido`);
    }

    if (!Array.isArray(pregunta.opciones) || pregunta.opciones.length !== 5) {
        errores.push(`Pregunta ${indice + 1}: Debe tener exactamente 5 opciones (tiene ${pregunta.opciones?.length || 0})`);
    }

    if (typeof pregunta.respuestaCorrecta !== 'number' || pregunta.respuestaCorrecta < 0 || pregunta.respuestaCorrecta > 4) {
        errores.push(`Pregunta ${indice + 1}: respuestaCorrecta debe ser 0-4 (tiene ${pregunta.respuestaCorrecta})`);
    }

    // Validar opciones individuales
    if (Array.isArray(pregunta.opciones)) {
        pregunta.opciones.forEach((opt, optIdx) => {
            if (!opt || typeof opt !== 'string') {
                errores.push(`Pregunta ${indice + 1}, Opción ${optIdx + 1}: está vacía o no es texto`);
            }
        });
    }

    return errores;
}

/**
 * Limpia y normaliza una pregunta individual
 */
function limpiarPregunta(pregunta, indice) {
    const preguntaLimpia = {
        id: pregunta.id || indice + 1,
        curso: limpiarTexto(pregunta.curso || 'Sin categoría'),
        pregunta: limpiarTexto(pregunta.pregunta),
        opciones: [],
        respuestaCorrecta: pregunta.respuestaCorrecta,
        explicacion: limpiarTexto(pregunta.explicacion || '')
    };

    // Limpiar opciones
    if (Array.isArray(pregunta.opciones)) {
        preguntaLimpia.opciones = pregunta.opciones.map(opt => limpiarTexto(opt));
    }

    return preguntaLimpia;
}

/**
 * Analiza un banco de preguntas y reporta problemas
 */
function analizarBanco(nombre, preguntas) {
    const resultado = {
        nombre: nombre,
        total: preguntas.length,
        validas: 0,
        conErrores: 0,
        errores: [],
        advertencias: [],
        preguntasLimpias: []
    };

    preguntas.forEach((preg, idx) => {
        const errores = validarPregunta(preg, idx);

        if (errores.length === 0) {
            resultado.validas++;
            resultado.preguntasLimpias.push(limpiarPregunta(preg, idx));
        } else {
            resultado.conErrores++;
            resultado.errores.push({
                indice: idx,
                pregunta: preg.pregunta?.substring(0, 50) + '...',
                errores: errores
            });
        }

        // Advertencias (problemas menores)
        if (preg.pregunta && preg.pregunta.length > 300) {
            resultado.advertencias.push(`Pregunta ${idx + 1}: Muy larga (${preg.pregunta.length} caracteres)`);
        }
        if (!preg.explicacion || preg.explicacion.trim() === '') {
            resultado.advertencias.push(`Pregunta ${idx + 1}: Sin explicación`);
        }
    });

    return resultado;
}

/**
 * FUNCIÓN PRINCIPAL: Valida y limpia todos los bancos
 */
function validarYLimpiarTodo() {
    console.log('%c🔍 INICIANDO VALIDACIÓN DE PREGUNTAS', 'font-size:16px;font-weight:bold;color:#2563eb');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar que existan los bancos
    const bancos = {};

    if (typeof preguntasNivel1 !== 'undefined' && Array.isArray(preguntasNivel1)) {
        bancos.basico = preguntasNivel1;
    } else {
        console.warn('⚠️ preguntasNivel1 no encontrado');
    }

    if (typeof preguntasNivel2 !== 'undefined' && Array.isArray(preguntasNivel2)) {
        bancos.intermedio = preguntasNivel2;
    } else {
        console.warn('⚠️ preguntasNivel2 no encontrado');
    }

    if (typeof preguntasNivel3 !== 'undefined' && Array.isArray(preguntasNivel3)) {
        bancos.avanzado = preguntasNivel3;
    } else {
        console.warn('⚠️ preguntasNivel3 no encontrado');
    }

    if (Object.keys(bancos).length === 0) {
        console.error('❌ No se encontraron bancos de preguntas. Asegúrate de cargar basico.js, intermedio.js y avanzado.js');
        return;
    }

    // Analizar cada banco
    const resultados = {};
    const todosBien = [];
    const algunos Errores = [];

    for (const [nombre, preguntas] of Object.entries(bancos)) {
        resultados[nombre] = analizarBanco(nombre, preguntas);
        const r = resultados[nombre];

        const estado = r.conErrores === 0 ? '✅' : '❌';
        console.log(`${estado} ${nombre.toUpperCase()}: ${r.validas}/${r.total} válidas`);

        if (r.conErrores === 0) {
            todosBien.push(nombre);
        } else {
            algunosErrores.push(nombre);
        }

        if (r.errores.length > 0) {
            console.log(`  ❌ Errores encontrados:`);
            r.errores.forEach(err => {
                console.log(`    • Pregunta ${err.indice + 1}: "${err.pregunta}"`);
                err.errores.forEach(e => console.log(`      - ${e}`));
            });
        }

        if (r.advertencias.length > 0) {
            console.log(`  ⚠️ Advertencias (${r.advertencias.length}):`);
            r.advertencias.slice(0, 3).forEach(w => console.log(`    - ${w}`));
            if (r.advertencias.length > 3) {
                console.log(`    ... y ${r.advertencias.length - 3} más`);
            }
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Resumen final
    const totalPreguntas = Object.values(resultados).reduce((a, b) => a + b.total, 0);
    const totalValidas = Object.values(resultados).reduce((a, b) => a + b.validas, 0);
    const totalErrores = Object.values(resultados).reduce((a, b) => a + b.conErrores, 0);

    if (totalErrores === 0) {
        console.log('%c✅ TODAS LAS PREGUNTAS ESTÁN EN ORDEN', 'font-size:14px;font-weight:bold;color:#10b981');
    } else {
        console.log(`%c⚠️ Se encontraron ${totalErrores} preguntas con errores`, 'font-size:14px;font-weight:bold;color:#dc2626');
    }

    console.log(`📊 RESUMEN: ${totalValidas}/${totalPreguntas} preguntas válidas`);

    // Guardar para descargar
    window.preguntasValidadas = resultados;
    window.preguntasLimpias = {
        basico: resultados.basico?.preguntasLimpias || [],
        intermedio: resultados.intermedio?.preguntasLimpias || [],
        avanzado: resultados.avanzado?.preguntasLimpias || []
    };

    console.log('\n✨ Datos guardados en: window.preguntasValidadas y window.preguntasLimpias');
    console.log('Usa: descargarPreguntasLimpias() para descargar el archivo JSON\n');

    return window.preguntasValidadas;
}

/**
 * Descarga las preguntas limpias como archivo JSON
 */
function descargarPreguntasLimpias() {
    if (!window.preguntasLimpias) {
        console.error('❌ Primero ejecuta: validarYLimpiarTodo()');
        return;
    }

    const data = JSON.stringify(window.preguntasLimpias, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preguntas-limpias-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Archivo descargado: preguntas-limpias-' + new Date().getTime() + '.json');
}

/**
 * Reemplaza los bancos en memoria con las versiones limpias
 * ADVERTENCIA: Esto modifica los arrays globales
 */
function aplicarPreguntasLimpias() {
    if (!window.preguntasLimpias) {
        console.error('❌ Primero ejecuta: validarYLimpiarTodo()');
        return;
    }

    if (typeof preguntasNivel1 !== 'undefined') {
        preguntasNivel1.length = 0;
        preguntasNivel1.push(...window.preguntasLimpias.basico);
        console.log('✅ preguntasNivel1 actualizado');
    }

    if (typeof preguntasNivel2 !== 'undefined') {
        preguntasNivel2.length = 0;
        preguntasNivel2.push(...window.preguntasLimpias.intermedio);
        console.log('✅ preguntasNivel2 actualizado');
    }

    if (typeof preguntasNivel3 !== 'undefined') {
        preguntasNivel3.length = 0;
        preguntasNivel3.push(...window.preguntasLimpias.avanzado);
        console.log('✅ preguntasNivel3 actualizado');
    }

    console.log('✨ Preguntas reemplazadas en memoria');
}

/**
 * Genera un reporte HTML descargable
 */
function descargarReporteHTML() {
    if (!window.preguntasValidadas) {
        console.error('❌ Primero ejecuta: validarYLimpiarTodo()');
        return;
    }

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Validación - SENATI</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 2rem; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; }
        .stat-card { padding: 1rem; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #2563eb; }
        .stat-label { color: #666; font-size: 0.9rem; }
        .error-item { padding: 1rem; background: #fee; border-left: 4px solid #dc2626; margin: 0.5rem 0; border-radius: 4px; }
        .error-text { color: #c5192d; }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 0.8rem; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        tr:hover { background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Reporte de Validación de Preguntas</h1>
        <p>Generado: ${new Date().toLocaleString()}</p>
`;

    // Estadísticas globales
    let totalPreguntas = 0, totalValidas = 0, totalErrores = 0;
    for (const r of Object.values(window.preguntasValidadas)) {
        totalPreguntas += r.total;
        totalValidas += r.validas;
        totalErrores += r.conErrores;
    }

    html += `
        <h2>Estadísticas Generales</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${totalPreguntas}</div>
                <div class="stat-label">Total de Preguntas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value success">${totalValidas}</div>
                <div class="stat-label">Válidas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: ${totalErrores === 0 ? '#10b981' : '#dc2626'};">${totalErrores}</div>
                <div class="stat-label">Con Errores</div>
            </div>
        </div>
`;

    // Reporte por banco
    for (const [nombre, resultado] of Object.entries(window.preguntasValidadas)) {
        html += `
        <h3>${nombre.toUpperCase()}</h3>
        <p>Total: ${resultado.total} | Válidas: <span class="success">${resultado.validas}</span> | Errores: <span class="error-text">${resultado.conErrores}</span></p>
`;

        if (resultado.errores.length > 0) {
            html += `<h4>Errores Detectados:</h4>`;
            resultado.errores.forEach(err => {
                html += `<div class="error-item">
                    <strong>Pregunta ${err.indice + 1}:</strong> ${err.pregunta}
                    <div class="error-text">`;
                err.errores.forEach(e => html += `<br>• ${e}`);
                html += `</div></div>`;
            });
        }
    }

    html += `
        <hr>
        <p style="color: #666; font-size: 0.9rem;"><em>Reporte generado automáticamente por el Validador de Preguntas SENATI</em></p>
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-preguntas-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Reporte HTML descargado');
}

// Exportar para uso en Node.js o módulos (si aplica)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarYLimpiarTodo,
        descargarPreguntasLimpias,
        aplicarPreguntasLimpias,
        descargarReporteHTML,
        limpiarTexto,
        validarPregunta,
        limpiarPregunta,
        analizarBanco
    };
}

console.log('%c✨ Validador de Preguntas SENATI cargado', 'color: #2563eb; font-weight: bold;');
console.log('%cUsa: validarYLimpiarTodo() para iniciar', 'color: #666;');
