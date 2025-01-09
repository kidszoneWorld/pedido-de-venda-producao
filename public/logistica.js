let ordersData1 = [];

// Mostrar Feedback
function showFeedback(message) {
    const feedback = document.getElementById('feedback1');
    feedback.style.display = 'block';
    feedback.textContent = message;
}

// Ocultar Feedback
function hideFeedback() {
    const feedback = document.getElementById('feedback1');
    feedback.style.display = 'none';
    feedback.textContent = '';
}


// Carregar detalhes dos pedidos
async function loadOrderDetailsFromSharePoint() {

    showFeedback("Carregando dados, aguarde...");

    try {
        const response = await fetch('/api/logistica/onedrive');
        if (!response.ok) throw new Error("Erro ao buscar dados do SharePoint");
        ordersData1 = await response.json();

        renderTable(ordersData1);
        hideFeedback();
    } catch (error) {
        console.error("Erro ao carregar dados do SharePoint:", error);
        showFeedback("Erro ao carregar dados do SharePoint. Recarregue a página.");
    }
}

// Renderizar tabela
function renderTable(data) {
    const orderTableBody1 = document.querySelector('#order-table1 tbody');
    orderTableBody1.innerHTML = ''; // Limpar tabela
    data.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.EMISSÃO ? new Date(order.EMISSÃO).toLocaleDateString('pt-BR') : ''}</td>
            <td>${order.NF || ''}</td>
            <td>${order.codCliente || ''}</td>
            <td>${order.NOME || ''}</td>
            <td>${order.CNPJ.replace(/[\.\-\/]/g, '') || ''}</td>
            <td>${order.UF || ''}</td>
            <td>${order.Rep || ''}</td>
            <td>${order.CodTransporte || ''}</td>
            <td>${order.TRANSPORTES || ''}</td>
            <td>${order.SAÍDA ? new Date(order.SAÍDA).toLocaleDateString('pt-BR') : ''}</td>
            <td>${order.PrevisaoEntrega ? new Date(order.PrevisaoEntrega).toLocaleDateString('pt-BR') : ''}</td>
            <td>${order.ENTREGUE || '' ? new Date(order.PrevisaoEntrega).toLocaleDateString('pt-BR') : ''}</td>
            <td>${order.STATUS_ENTREGA || ''}</td>
            <td>${order.AGENDA || ''}</td>
            <td>${order.OCORRÊNCIA || ''}</td>

        `;
        orderTableBody1.appendChild(row);
    });
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Faz a requisição para obter os dados da sessão
            const response = await fetch('/session-data');
            if (!response.ok) throw new Error('Erro ao buscar dados da sessão');

                const sessionData = await response.json();

                // Define os dados no front-end
                if (sessionData.isAuthenticated) {
                    window.sessionData = sessionData;

                    const userNumero = window.sessionData?.userNumero || null;
                    const representanteFilter = document.getElementById('representanteFilter1');

                    if (userNumero) {
                        representanteFilter.value = userNumero;
                        representanteFilter.disabled = true; // Bloqueia o campo
                    }

                    loadOrderDetailsFromSharePoint();
                } else {
                    console.warn('Usuário não autenticado');
                    window.location.href = '/login2'; // Redireciona para a página de login
                }
            } catch (error) {
                console.error('Erro ao carregar os dados da sessão:', error);
            }
});



// Aplicar Filtros
async function applyFilters1() {
    showFeedback("Aplicando filtros, aguarde...");
    
    try {
        const representanteFilter1 = document.getElementById('representanteFilter1').value.trim();
        const clienteCNPJFilter1 = document.getElementById('clienteCNPJFilter1').value.trim();
        const dataPedidoInicioFilter1 = document.getElementById('dataPedidoInicioFilter1').value;
        const dataPedidoFimFilter1 = document.getElementById('dataPedidoFimFilter1').value;
        const statusFilter1 = document.getElementById('statusFilter1').value;

        // Filtrando os dados
        const filteredData1 = ordersData1.filter(order => {
            const matchRepresentante1 = !representanteFilter1 || order.Rep.toString() === representanteFilter1;
            const matchClienteCNPJ1 = !clienteCNPJFilter1 || order.CNPJ.replace(/[\.\-\/]/g, '') === clienteCNPJFilter1.replace(/[\.\-\/]/g, '');
            const matchDataPedidoInicio1 = !dataPedidoInicioFilter1 || new Date(order.EMISSÃO) >= new Date(dataPedidoInicioFilter1);
            const matchDataPedidoFim1 = !dataPedidoFimFilter1 || new Date(order.EMISSÃO) <= new Date(dataPedidoFimFilter1);
            const matchStatus1 = !statusFilter1 || order.STATUS_ENTREGA.toLowerCase() === (statusFilter1 === "1" ? "entregue" : "pendente");

            return matchRepresentante1 && matchClienteCNPJ1 && matchDataPedidoInicio1 && matchDataPedidoFim1 && matchStatus1;
        });
                if (filteredData1.length === 0) {
            showFeedback("Nenhum dado encontrado com os filtros aplicados.");
        } else {
            hideFeedback();
        }

        renderTable(filteredData1);
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        showFeedback("Erro ao aplicar os filtros. Tente novamente.");
    }
}

// Limpar Filtros
function clearFilters1() {
    document.getElementById('representanteFilter1').value = '';
    document.getElementById('clienteCNPJFilter1').value = '';
    document.getElementById('dataPedidoInicioFilter1').value = '';
    document.getElementById('dataPedidoFimFilter1').value = '';
    document.getElementById('statusFilter1').value = "2";
    renderTable(ordersData1);
}

// Eventos dos botões de filtro
document.getElementById('applyFilters1').addEventListener('click', applyFilters1);
document.getElementById('clearFilters1').addEventListener('click', clearFilters1);


// document.getElementById('statusFilter1').addEventListener('change', function () {
   // const selectedStatus1 = this.value || 1; // Padrão para "Pendente"
   // console.log(`Filtro de status alterado para: ${selectedStatus1}`);
   // loadOrderDetailsFromSharePoint(selectedStatus1);
// });


 // Função para limpar dados do usuário e redirecionar para a página de login
 document.getElementById('logoutButton1').addEventListener('click', async () => {
    // Limpa os dados locais
    sessionStorage.clear();
    localStorage.clear();

    // Faz a requisição ao servidor para destruir a sessão
    await fetch('/logout', { method: 'POST' });

    // Limpa cookies manualmente (como precaução)
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });

    // Redireciona para a página de login
    window.location.href = '/login2';
 });


// Inicializar tabela ao carregar a página
//loadOrderDetailsFromSharePoint();