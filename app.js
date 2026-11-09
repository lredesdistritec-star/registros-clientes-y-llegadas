// LOGICA Y EVENTOS DE NETLINK V2

// Variables Globales
let currentPendingAction = null;
let paretoChartInstance = null;

// Configuración de Horarios Oficiales (Para evaluación de tolerancia ±3 min)
// Lunes a Viernes: 9:30 AM (9:30) y 6:00 PM (18:00)
// Sábados: 9:00 AM (9:00) y 1:00 PM (13:00)
const TOLERANCE_MINUTES = 3;

// Mock Data de Ventas Caídas
let salesRecords = [
    { id: 1, date: "2026-10-27", clientName: "Juan Carlos Pérez", clientId: "1.094.123.456", clientPhone: "300 123 4567", productRef: "iPhone 13 128GB", saleValue: 3490000, lossStage: "Enrolamiento / Plataforma", managementSummary: "Plataforma Banco de Bogotá colapsó en biometría facial.", saleStatus: "Perdida Definitiva" },
    { id: 2, date: "2026-10-27", clientName: "María Fernanda Gómez", clientId: "1.088.987.654", clientPhone: "311 987 6543", productRef: "Redmi Note 13", saleValue: 1250000, lossStage: "Gestión en Sede / Tienda", managementSummary: "Llegó a sede pero dieron prioridad a clientes de piso.", saleStatus: "En Seguimiento" },
    { id: 3, date: "2026-10-28", clientName: "Carlos Alberto Ríos", clientId: "1.012.345.678", clientPhone: "315 456 7890", productRef: "Galaxy S24 Ultra", saleValue: 4800000, lossStage: "Referenciación / Cartera", managementSummary: "Demora prolongada en la llamada de validación de cartera.", saleStatus: "En Seguimiento" }
];

// Iniciar componentes al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
});

// Cambiar de Pestaña (Navegación Sidebar)
function switchTab(tabName) {
    const sectionTiempos = document.getElementById('sectionTiempos');
    const sectionVentas = document.getElementById('sectionVentas');
    const navTiempos = document.getElementById('tabNavTiempos');
    const navVentas = document.getElementById('tabNavVentas');

    if (tabName === 'tiempos') {
        sectionTiempos.classList.remove('hidden');
        sectionTiempos.classList.add('block');
        sectionVentas.classList.remove('block');
        sectionVentas.classList.add('hidden');

        navTiempos.classList.add('active', 'text-netlink-green');
        navTiempos.classList.remove('text-gray-400');
        navVentas.classList.remove('active', 'text-netlink-green');
        navVentas.classList.add('text-gray-400');
    } else if (tabName === 'ventas') {
        sectionVentas.classList.remove('hidden');
        sectionVentas.classList.add('block');
        sectionTiempos.classList.remove('block');
        sectionTiempos.classList.add('hidden');

        navVentas.classList.add('active', 'text-netlink-green');
        navVentas.classList.remove('text-gray-400');
        navTiempos.classList.remove('active', 'text-netlink-green');
        navTiempos.classList.add('text-gray-400');

        updateDashboard();
    }
}

// Reloj Digital en Vivo
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const liveClockEl = document.getElementById('liveClock');
    const liveDateEl = document.getElementById('liveDate');
    
    if (liveClockEl) liveClockEl.textContent = `${hours}:${minutes}:${seconds}`;
    if (liveDateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        liveDateEl.textContent = now.toLocaleDateString('es-CO', options);
    }
}

// INICIAR EVALUACIÓN DE MARCACIÓN CON TOLERANCIA Y MOTIVOS
function iniciarMarcacion(tipoAccion) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0: Domingo, 1-5: Lun-Vie, 6: Sábado
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalCurrentMinutes = hours * 60 + minutes;
    const timeString = now.toLocaleTimeString('es-CO');

    currentPendingAction = { tipo: tipoAccion, hora: timeString, fecha: now.toISOString().split('T')[0] };

    if (tipoAccion === 'ENTRADA') {
        // Horario objetivo entrada: Lun-Vie 9:30 AM (570 min), Sáb 9:00 AM (540 min)
        const targetMinutes = (dayOfWeek === 6) ? (9 * 60) : (9 * 60 + 30);
        const maxPermitted = targetMinutes + TOLERANCE_MINUTES; // 9:33 AM o 9:03 AM

        if (totalCurrentMinutes <= maxPermitted) {
            // Llegada a tiempo
            showNormalModal("Entrada Registrada a Tiempo", `Has registrado tu entrada laboral exitosamente a las ${timeString}.`);
        } else {
            // Llegada Tardía - Exige Justificación
            const opcionesLlegadaTarde = [
                "Diligencia personal de emergencia",
                "Trancón / Inconveniente en transporte público",
                "Falla en transporte personal / vehículo",
                "Avisé previamente a la jefatura que llegaba tarde",
                "Cita médica / Inconveniente de salud",
                "Otro motivo justificado"
            ];
            showJustificationModal(
                "Alerta: Llegada Tardía Detectada",
                `Has registrado la entrada a las ${timeString}, superando el horario oficial (9:30 AM) y el margen de tolerancia (3 min).`,
                opcionesLlegadaTarde
            );
        }
    } 
    else if (tipoAccion === 'SALIDA') {
        // Horario objetivo salida: Lun-Vie 6:00 PM (1080 min), Sáb 1:00 PM (780 min)
        const targetMinutes = (dayOfWeek === 6) ? (13 * 60) : (18 * 60);

        if (totalCurrentMinutes < targetMinutes) {
            // Salida Anticipada
            const opcionesSalidaAnticipada = [
                "Me otorgaron permiso previamente por Jefatura/TH",
                "Diligencia personal de emergencia",
                "Reponer tiempo ingresado previamente (Tiempo compensado)",
                "Cita médica / Salud"
            ];
            showJustificationModal(
                "Alerta: Salida Anticipada Detectada",
                `Estás marcando la salida a las ${timeString}, antes del horario de cierre oficial (6:00 PM).`,
                opcionesSalidaAnticipada
            );
        } else {
            // Salida Regular / Extendida (Mayor o igual a 6:00 PM)
            const opcionesSalidaExtendida = [
                "Salida en horario regular cumplido",
                "Atención a cliente en sede / Chat activo en redes",
                "Reponer tiempo extra / Ajuste de turno",
                "Solicitado por jefatura para terminar tarea",
                "Cierre comercial de ventas"
            ];
            showJustificationModal(
                "Registro de Salida de Jornada",
                `Estás completando tu jornada laboral a las ${timeString}. Selecciona la actividad finalizada:`,
                opcionesSalidaExtendida,
                false // No es rojo estricto, sino registro final
            );
        }
    } 
    else if (tipoAccion === 'PERMISO') {
        const opcionesPermiso = [
            "Permiso personal previamente autorizado",
            "Diligencia médica / Salud",
            "Cita bancaria o administrativa",
            "Comer alimentos / Pausa autorizada fuera de sede",
            "Otro inconveniente personal"
        ];
        showJustificationModal(
            "Registro de Permiso / Ausencia Temporal",
            `Indica el motivo de la salida temporal a las ${timeString}:`,
            opcionesPermiso,
            false
        );
    }
}

// MOSTRAR MODAL VERDE (NORMAL)
function showNormalModal(title, msg) {
    document.getElementById('normalModalTitle').textContent = title;
    document.getElementById('normalModalMsg').textContent = msg;
    document.getElementById('normalModalTime').textContent = `Hora del Servidor IP Sede: ${new Date().toLocaleTimeString('es-CO')}`;
    
    const modal = document.getElementById('modalNormal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
}

// MOSTRAR MODAL DE JUSTIFICACIÓN (ROJO / EXTANZA)
function showJustificationModal(title, text, optionsArray, isAlert = true) {
    document.getElementById('justifModalTitle').textContent = title;
    document.getElementById('justifAlertText').textContent = text;
    
    const select = document.getElementById('reasonSelect');
    select.innerHTML = '';
    optionsArray.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
    });

    const modal = document.getElementById('modalJustificación');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
}

// CONFIRMAR REGISTRO CON JUSTIFICACIÓN
function confirmarJustificacion() {
    const selectedReason = document.getElementById('reasonSelect').value;
    const detailNote = document.getElementById('reasonDetail').value.trim();

    closeModal('modalJustificación');
    
    const notaCompleta = detailNote ? `${selectedReason} (${detailNote})` : selectedReason;
    showNormalModal(
        "Marcación Registrada Correctamente", 
        `Se ha guardado el registro de [${currentPendingAction.tipo}] con el motivo: "${notaCompleta}".`
    );

    // Resetear formulario interno
    document.getElementById('reasonDetail').value = '';
}

// CERRAR MODALES
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
}

// ================= LÓGICA DE VENTAS CAÍDAS =================

function formatCOP(amount) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

function updateDashboard() {
    renderKPIs();
    renderParetoChart();
    renderTable();
}

function renderKPIs() {
    const totalCount = salesRecords.length;
    const totalValue = salesRecords.reduce((sum, item) => sum + item.saleValue, 0);
    const recoverableValue = salesRecords.filter(item => item.saleStatus === 'En Seguimiento').reduce((sum, item) => sum + item.saleValue, 0);

    const stageTotals = {};
    salesRecords.forEach(item => { stageTotals[item.lossStage] = (stageTotals[item.lossStage] || 0) + item.saleValue; });

    let criticalStage = "N/A";
    let maxLoss = 0;
    for (const [stage, amount] of Object.entries(stageTotals)) {
        if (amount > maxLoss) { maxLoss = amount; criticalStage = stage; }
    }

    document.getElementById('kpiTotalCount').textContent = totalCount;
    document.getElementById('kpiTotalValue').textContent = formatCOP(totalValue);
    document.getElementById('kpiRecoverableValue').textContent = formatCOP(recoverableValue);
    document.getElementById('kpiCriticalStage').textContent = criticalStage;
}

function renderParetoChart() {
    const canvas = document.getElementById('paretoChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const stages = ["Referenciación / Cartera", "Gestión en Sede / Tienda", "Enrolamiento / Plataforma", "Logística / Envío", "Desistimiento Directo"];
    const totals = stages.map(stage => salesRecords.filter(item => item.lossStage === stage).reduce((sum, item) => sum + item.saleValue, 0));

    if (paretoChartInstance) { paretoChartInstance.destroy(); }

    paretoChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Referenciación', 'Sede/Tienda', 'Enrolamiento', 'Logística', 'Desistimiento'],
            datasets: [{
                label: 'Pérdida en $ COP',
                data: totals,
                backgroundColor: '#ef4444',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#374151' } },
                y: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#374151' } }
            }
        }
    });
}

function renderTable() {
    const tableBody = document.getElementById('recordsTableBody');
    const search = document.getElementById('tableSearch').value.toLowerCase();
    const stageFilter = document.getElementById('filterStage').value;

    tableBody.innerHTML = '';

    const filtered = salesRecords.filter(item => {
        const matchesSearch = item.clientName.toLowerCase().includes(search) || item.productRef.toLowerCase().includes(search);
        const matchesStage = (stageFilter === 'ALL') || (item.lossStage === stageFilter);
        return matchesSearch && matchesStage;
    });

    filtered.forEach(item => {
        const row = document.createElement('tr');
        row.className = "hover:bg-black/30 border-b border-gray-800";
        const isRecoverable = item.saleStatus === 'En Seguimiento';
        const statusBadge = isRecoverable ? 
            `<span class="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-netlink-amber border border-amber-500/40">En Seguimiento</span>` :
            `<span class="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-500/40">Perdida Definitiva</span>`;

        row.innerHTML = `
            <td class="p-3 text-gray-400">${item.date}</td>
            <td class="p-3 font-bold text-white">${item.clientName}<br><span class="text-[10px] font-normal text-gray-500">${item.clientId}</span></td>
            <td class="p-3 text-gray-300">${item.productRef}</td>
            <td class="p-3 font-bold text-red-400">${formatCOP(item.saleValue)}</td>
            <td class="p-3 text-gray-300">${item.lossStage}</td>
            <td class="p-3 text-gray-400 truncate max-w-xs">${item.managementSummary}</td>
            <td class="p-3">${statusBadge}</td>
            <td class="p-3 text-center">
                <button onclick="toggleStatus(${item.id})" class="text-xs text-gray-400 hover:text-netlink-green">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const newRecord = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        clientName: document.getElementById('clientName').value.trim(),
        clientId: document.getElementById('clientId').value.trim(),
        clientPhone: document.getElementById('clientPhone').value.trim(),
        productRef: document.getElementById('productRef').value.trim(),
        saleValue: parseFloat(document.getElementById('saleValue').value),
        lossStage: document.getElementById('lossStage').value,
        managementSummary: document.getElementById('managementSummary').value.trim(),
        saleStatus: document.querySelector('input[name="saleStatus"]:checked').value
    };

    salesRecords.unshift(newRecord);
    document.getElementById('lostSaleForm').reset();
    updateDashboard();
    showNormalModal("Registro Exitoso", "Venta caída agregada al diagnóstico gerencial.");
}

function toggleStatus(id) {
    const index = salesRecords.findIndex(r => r.id === id);
    if (index !== -1) {
        salesRecords[index].saleStatus = salesRecords[index].saleStatus === 'Perdida Definitiva' ? 'En Seguimiento' : 'Perdida Definitiva';
        updateDashboard();
    }
}

function filterTable() { renderTable(); }

function exportToCSV() {
    let csv = 'Fecha,Cliente,Documento,Telefono,Producto,Valor,Etapa,Gestion,Estado\n';
    salesRecords.forEach(r => {
        csv += `"${r.date}","${r.clientName}","${r.clientId}","${r.clientPhone}","${r.productRef}",${r.saleValue},"${r.lossStage}","${r.managementSummary}","${r.saleStatus}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Ventas_Caidas_Netlink.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
