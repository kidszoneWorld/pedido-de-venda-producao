let ordersData = [];

let currentFilters = {
        representante: '',
        clienteCNPJ: '',
        status: '',
        dataInicio: '',
        dataFim: '',
        statusSeparacao: '' 
   };

   // Função para formatar as datas no formato YYYY-MM-DD
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Retorna no formato YYYY-MM-DD
    }


// Mostrar Feedback
function showFeedback(message) {
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'block';
    feedback.textContent = message;
}

// Ocultar Feedback
function hideFeedback() {
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'none';
    feedback.textContent = '';
}

// Carregar detalhes dos pedidos
async function loadOrderDetails(status = currentFilters.status) {

    currentFilters.status = status;

    const queryParams = new URLSearchParams({
        status: currentFilters.status,
        codRep: currentFilters.representante || '',
        clienteCNPJ: currentFilters.clienteCNPJ || '',
        DataPedidoInicio: formatDate(currentFilters.dataInicio) || '',
        DataPedidoFim: formatDate(currentFilters.dataFim) || '',
        statusSeparacao: currentFilters.statusSeparacao || ''
    });

    showFeedback("Carregando pedidos, aguarde...");

    try {
        const response = await fetch(`/api/pedidos?${queryParams.toString()}`);
        if (response.status === 404) {
            renderTable([]);
            showFeedback("Nenhum dado encontrado com os filtros aplicados.");
            return;
        }

        if (!response.ok) throw new Error(`Erro ao obter pedidos: ${response.statusText}`);

        ordersData = await response.json();
        renderTable(ordersData);
        hideFeedback();
    } catch (error) {
        console.error('Erro ao carregar os detalhes dos pedidos:', error);
        showFeedback("Erro ao carregar dados. Recarregue a página e tente novamente.");
    }
}

// Renderizar tabela
function renderTable(data) {
    const orderTableBody = document.querySelector('#order-table tbody');
    orderTableBody.innerHTML = ''; // Limpar tabela
    data.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.dataPedido ? new Date(order.dataPedido).toLocaleDateString('pt-BR') : 'N/A'}</td>
            <td><a href="detalhes?pedidoId=${order.id}&status=${currentFilters.status}" target="_blank">${order.codigo}</a></td>
            <td>${order.status}</td>
            <td>${mapStatusSeparacao(order.statusSeparacao)}</td>
            <td>${order.cliente.codigo}</td>
            <td>${order.cliente.nomeAbreviado}</td>
            <td>${order.cliente.documento.numeroTexto}</td>
            <td>${order.representante?.id || 'Não informado'}</td>
            <td>${order.representante?.nomeAbreviado || 'Não informado'}</td>
            <td>${order.detalhes?.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'N/A'}</td>
            <td>${order.detalhes_transporte?.nomeAbreviado || 'Não informado'}</td>
        `;
        orderTableBody.appendChild(row);
    });
}

// Mapear Status de Separação
function mapStatusSeparacao(status) {
    switch (status) {
        case 0: return 'Não Separado';
        case 1: return 'Separado Parcial';
        case 2: return 'Separado Total';
        default: return 'Desconhecido';
    }
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
                const representanteFilter = document.getElementById('representanteFilter');

                if (userNumero) {
                    representanteFilter.value = userNumero;
                    representanteFilter.disabled = true; // Bloqueia o campo
                    currentFilters.representante = userNumero; // Atualiza o filtro global
                }

                // Simula o clique no botão "Aplicar Filtros" para carregar os dados filtrados automaticamente
               await applyFilters();
               //await loadOrderDetails(this.value);
            } else {
                console.warn('Usuário não autenticado');
                window.location.href = '/login2'; // Redireciona para a página de login
            }
        } catch (error) {
            console.error('Erro ao carregar os dados da sessão:', error);
        }
});


async function applyFilters() {

    // Atualizar filtros globais com valores do DOM
    currentFilters.representante = document.getElementById('representanteFilter').value.trim();
    currentFilters.clienteCNPJ = document.getElementById('clienteCNPJFilter').value.trim();
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.dataInicio = document.getElementById('dataPedidoInicioFilter').value;
    currentFilters.dataFim = document.getElementById('dataPedidoFimFilter').value;
    currentFilters.statusSeparacao = document.getElementById('statusSeparacaoFilter').value;

    await loadOrderDetails(currentFilters.status);
}


// Limpar Filtros
async function clearFilters() {

    showFeedback("Carregando dados padrão, aguarde...");

    // Verificar se o usuário é representante
    const isRep = window.sessionData?.userNumero !== null;


    // Limpar os campos do formulário
    document.getElementById('clienteCNPJFilter').value = '';
    document.getElementById('dataPedidoInicioFilter').value = '';
    document.getElementById('dataPedidoFimFilter').value = '';
    document.getElementById('statusFilter').value = '6';
    document.getElementById('statusSeparacaoFilter').value = '';

    // Limpar o estado global de filtros
    currentFilters = {
        representante: isRep ? currentFilters.representante : '', // Mantém para REP, limpa para outros usuários
        clienteCNPJ: '',
        status: '',
        dataInicio: '',
        dataFim: '',
        statusSeparacao: '' 
    };

    await loadOrderDetails(currentFilters.status);
}


// Eventos dos botões de filtro
document.getElementById('applyFilters').addEventListener('click', applyFilters);
document.getElementById('clearFilters').addEventListener('click', clearFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('statusSeparacaoFilter').addEventListener('change', applyFilters);



document.getElementById('logoutButton').addEventListener('click', async () => {
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
