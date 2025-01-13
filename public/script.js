//// Variáveis globais 
let clientesData;
let promocaoData;
let foraDeLinhaData;
let listaPrecosData;
let icmsSTData;
//// Variáveis globais 

//Função para atualizar os caches no navegador
const timestamp = new Date().getTime();

// Função para carregar os JSONs 
fetch(`/data/cliente.json?cacheBust=${timestamp}`)
    .then(response => response.json())
    .then(data => {
        clientesData = data;
    });

fetch(`/data/Promocao.json?cacheBust=${timestamp}`)
    .then(response => response.json())
    .then(data => {
        promocaoData = data;
    });

fetch(`/data/Fora de linha.json?cacheBust=${timestamp}`)
    .then(response => response.json())
    .then(data => {
        foraDeLinhaData = data;
    });

fetch(`/data/Lista-precos.json?cacheBust=${timestamp}`)
    .then(response => response.json())
    .then(data => {
        listaPrecosData = data;
    });

fetch(`/data/ICMS-ST.json?cacheBust=${timestamp}`)
    .then(response => response.json())
    .then(data => {
        icmsSTData = data;
    });

// Função para formatar o CNPJ com máscara
function formatarCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

// Função para formatar o CEP com máscara
function formatarCEP(cep) {
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

// Função para ajustar o CNPJ com zeros à esquerda, se necessário
function ajustarCNPJ(cnpj) {
    while (cnpj.length < 14) {
        cnpj = '0' + cnpj;
    }
    return cnpj;
}

// Função para buscar o produto em promoção
function buscarPromocao(cod) {
    for (let i = 1; i < promocaoData.length; i++) {
        if (promocaoData[i][0] == cod) {
            return promocaoData[i];
        }
    }
    return null;
}

// Função para verificar se o código está fora de linha
function verificarForaDeLinha(cod) {
    for (let i = 1; i < foraDeLinhaData.length; i++) {
        if (foraDeLinhaData[i][0] == cod) {
            return true;
        }
    }
    return false;
}

// Função para buscar dados na Lista de Preços
function buscarListaPrecos(cod) {
    for (let i = 1; i < listaPrecosData.length; i++) {
        if (listaPrecosData[i][2] == cod) {
            return listaPrecosData[i];
        }
    }
    return null;
}

// Função para buscar os dados do cliente pelo CNPJ
function buscarCliente(cnpj) {
    // Ajusta o CNPJ com zeros à esquerda
    cnpj = ajustarCNPJ(cnpj);

    for (let i = 1; i < clientesData.length; i++) {
        let cnpjCliente = ajustarCNPJ(clientesData[i][1].toString());
        if (cnpjCliente === cnpj) {
            return clientesData[i];
        }
    }
    return null;
}



// Função para verificar se o CNPJ é composto apenas de zeros
function cnpjInvalido(cnpj) {
    return /^0+$/.test(cnpj);
}


// Função para limpar todos os campos relacionados ao cliente
function limparCamposCliente() {
    document.getElementById('razao_social').value = '';
    document.getElementById('ie').value = '';
    document.getElementById('representante').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('uf').value = '';
    document.getElementById('cep').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('email_fiscal').value = '';
    document.getElementById('cod_cliente').value = '';
    document.getElementById('pay').value = '';
    document.getElementById('group').value = '';
    document.getElementById('transp').value = '';
    document.getElementById('codgroup').value = '';
    document.getElementById('email_rep').value = '';
}

// Adiciona o evento de focus no campo CNPJ
document.getElementById('cnpj').addEventListener('focus', function () {
    limparCamposCliente(); // Limpa todos os campos relacionados ao cliente
});

// Função para buscar os dados do cliente pelo CNPJ
function buscarCliente(cnpj) {
    // Ajusta o CNPJ com zeros à esquerda
    cnpj = ajustarCNPJ(cnpj);

    for (let i = 1; i < clientesData.length; i++) {
        let cnpjCliente = ajustarCNPJ(clientesData[i][1].toString());
        if (cnpjCliente === cnpj) {
            return clientesData[i];
        }
    }
    return null;
}


// Função para preencher os campos ao digitar o CNPJ
document.getElementById('cnpj').addEventListener('blur', function () {
    
    let cnpj = this.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Verifica se o campo está vazio
    if (cnpj === '') {
            return; // Sai da função sem buscar dados
    }

    // Verifica se o CNPJ é inválido (apenas zeros)
    if (cnpjInvalido(cnpj)) {
        alert("CNPJ inválido.");
        this.value = ''; // Limpa o campo CNPJ
        return; // Sai da função sem buscar dados
    }


    cnpj = ajustarCNPJ(cnpj);

    // Aplica a máscara ao CNPJ
    this.value = formatarCNPJ(cnpj);

    let cliente = buscarCliente(cnpj);
    if (cliente) {
        document.getElementById('razao_social').value = cliente[3];
        document.getElementById('ie').value = cliente[2];
        document.getElementById('representante').value = `${cliente[15]} - ${cliente[16]}`;
        document.getElementById('endereco').value = cliente[8];
        document.getElementById('bairro').value = cliente[9];
        document.getElementById('cidade').value = cliente[10];
        document.getElementById('uf').value = cliente[11];

        // Aplica a máscara ao CEP
        let cep = cliente[12].toString();
        document.getElementById('cep').value = formatarCEP(cep);

        document.getElementById('telefone').value = cliente[4];
        document.getElementById('email').value = cliente[6];
        document.getElementById('email_fiscal').value = cliente[7];
        document.getElementById('cod_cliente').value = cliente[17];
        document.getElementById('pay').value = cliente[14];
        document.getElementById('group').value = cliente[19];
        document.getElementById('transp').value = cliente[20];
        document.getElementById('codgroup').value = cliente[18];
        document.getElementById('representanteId').value = cliente[15];
        document.getElementById('formPagId').value = cliente[25];
        document.getElementById('condPagId').value = cliente[27];
        document.getElementById('PercentualComissaoItem').value = cliente[23];
        document.getElementById('PercentualComissaoServico').value = cliente[24];
        document.getElementById('ContatoClienteId').value = cliente[28];
        document.getElementById('formPagDescricao').value = cliente[26];
        document.getElementById('email_rep').value = cliente[22];

    } else {
        alert("Cliente não encontrado.");
    }
});

// Função para zerar os campos da tabela "DADOS PEDIDO"
function zerarCamposPedido() {
    const linhas = document.querySelectorAll('#dadosPedido tbody tr');
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        inputs.forEach(input => input.value = ''); // Zera o valor de cada input
    });

    // Atualiza os totais após zerar os campos
    atualizarTotalComImposto();
    atualizarTotalVolumes();
    atualizarTotalProdutos();
}

// Adiciona o evento para zerar os campos quando o tipo de pedido for alterado
document.getElementById('tipo_pedido').addEventListener('change', zerarCamposPedido);

// Função para atualizar o total com imposto de todas as linhas
function atualizarTotalComImposto() {
    let total = 0;
    const linhas = document.querySelectorAll('#dadosPedido tbody tr');
    
    linhas.forEach(tr => {
        const cell = tr.cells[8]?.querySelector('input');
        if (cell && cell.value) {
            const cellValue = cell.value.replace("R$", "").replace(/\./g, "").replace(",", ".");
            const valor = parseFloat(cellValue);
            if (!isNaN(valor)) {
                total += valor;
            }
        }
    });
    
    document.getElementById('total_imp').value = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para atualizar o total de volumes (quantidades) de todas as linhas
function atualizarTotalVolumes() {
    let totalVolumes = 0;
    const linhas = document.querySelectorAll('#dadosPedido tbody tr');

    linhas.forEach(tr => {
        const cell = tr.cells[1]?.querySelector('input');
        if (cell && cell.value) {
            const quantidade = parseFloat(cell.value.replace(",", "."));
            if (!isNaN(quantidade)) {
                totalVolumes += quantidade;
            }
        }
    });

    document.getElementById('volume').value = totalVolumes;
}

// Função para atualizar o total de produtos (quantidade * valor unitário)
function atualizarTotalProdutos() {
    let totalProdutos = 0;
    const linhas = document.querySelectorAll('#dadosPedido tbody tr');

    linhas.forEach(tr => {
        const quantidadeCell = tr.cells[1]?.querySelector('input');
        const valorUnitarioCell = tr.cells[6]?.querySelector('input');
        if (quantidadeCell && valorUnitarioCell && quantidadeCell.value && valorUnitarioCell.value) {
            const quantidade = parseFloat(quantidadeCell.value.replace(",", "."));
            const valorUnitario = parseFloat(valorUnitarioCell.value.replace("R$", "").replace(/\./g, "").replace(",", "."));
            if (!isNaN(quantidade) && !isNaN(valorUnitario)) {
                totalProdutos += quantidade * valorUnitario;
            }
        }
    });

    document.getElementById('total').value = totalProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para adicionar uma nova linha à tabela
document.getElementById('adicionarLinha').addEventListener('click', function () {
    let tbody = document.querySelector('#dadosPedido tbody');
    let tr = document.createElement('tr');

    for (let i = 0; i < 10; i++) {
        let td = document.createElement('td');
        let input = document.createElement('input');
        input.type = 'text';
        input.style.padding = '5px';
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.style.marginLeft ='-0px';

           // Oculta dinamicamente a coluna "Item ID" (10ª coluna)
           if (i === 9) {
            td.style.display = 'none'; // Oculta a célula visualmente
        }
        

        if (i === 0) {
            input.addEventListener('blur', function () {
                let tipoPedido = document.getElementById('tipo_pedido').value;
                let cod = this.value;
                let ufCliente = document.getElementById('uf').value;

                if (verificarForaDeLinha(cod)) {
                    alert("Item fora de linha, favor digitar outro item");
                    this.value = '';
                    return;
                }

                let promocao = buscarPromocao(cod);
                let listaPrecos = buscarListaPrecos(cod);

                if (tipoPedido === 'Promoção') {
                    if (promocao) {
                        preencherLinha(tr, listaPrecos, promocao, ufCliente);
                    } else {
                        alert("Item não está em promoção, digite outro item");
                        this.value = '';
                    }
                } else if (tipoPedido === 'Venda' || tipoPedido === 'Bonificação') {
                    if (promocao) {
                        alert("Item está em promoção, favor mudar o tipo para promoção");
                        this.value = '';
                    } else if (listaPrecos) {
                        preencherLinha(tr, listaPrecos, null, ufCliente);
                    } else {
                        alert("Item não encontrado na lista de preços.");
                        this.value = '';
                    }
                }
            });
        }

        td.appendChild(input);
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
    atualizarTotalComImposto();
    atualizarTotalVolumes();
    atualizarTotalProdutos();
});

// Função para remover a última linha da tabela
document.getElementById('excluirLinha').addEventListener('click', function () {
    let tbody = document.querySelector('#dadosPedido tbody');
    if (tbody.rows.length > 0) {
        tbody.deleteRow(tbody.rows.length - 1);
        atualizarTotalComImposto();
        atualizarTotalVolumes();
        atualizarTotalProdutos();
    } else {
        alert("Nenhuma linha para remover");
    }
});

// Função para verificar duplicatas de código na tabela
function verificarCodigoDuplicado(codigo) {
    const linhas = document.querySelectorAll('#dadosPedido tbody tr');
    let contador = 0;

    linhas.forEach(tr => {
        const inputCodigo = tr.cells[0]?.querySelector('input');
        if (inputCodigo && inputCodigo.value === codigo) {
            contador++;
        }
    });

    return contador > 1;
}

// Função para preencher os dados da linha com os cálculos baseados no IPI e R$ Unitário
function preencherLinha(tr, listaPrecos, promocao = null, ufCliente) { 
    let cells = tr.getElementsByTagName('td');
    let codProduto = cells[0].querySelector('input').value;
    

    if (verificarCodigoDuplicado(codProduto)) {
        alert(`O código "${codProduto}" já existe na lista. Por favor, digite outro código.`);
        cells[0].querySelector('input').value = '';
        return;
    }

    let codGroup = document.getElementById('codgroup').value;
   
    for (let i = 0; i < cells.length; i++) {
        if (i !== 0 && i !== 1) {
            cells[i].querySelector('input').setAttribute('readonly', true);
        }
    }

    let codigoConcatenado = codGroup ? `${codGroup}-${codProduto}` : codProduto;
    let precoEncontrado = listaPrecosData.find(item => item[0] === codigoConcatenado);

    if (precoEncontrado) {
        cells[5].querySelector('input').value = (precoEncontrado[12] * 100).toFixed(2) + '%';
    } else {
        let itemPorCodigo = listaPrecosData.find(item => item[2] == codProduto);
        if (itemPorCodigo) {
            cells[5].querySelector('input').value = (itemPorCodigo[12] * 100).toFixed(2) + '%';
        } else {
            cells[5].querySelector('input').value = '';
        }
    }

    let produtoPromocao = promocaoData.find(item => item[0] == codProduto);

    if (produtoPromocao) {
        cells[6].querySelector('input').value = Number(produtoPromocao[5]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } else {
        let precoEncontrado = listaPrecosData.find(item => item[0] === codigoConcatenado);
        if (precoEncontrado) {
            cells[6].querySelector('input').value = Number(precoEncontrado[11]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
            cells[6].querySelector('input').value = '';
        }
    }

    if (codProduto) {
        let ipiStr = cells[5].querySelector('input').value.replace("%", "");
        let ipi = Number(ipiStr) / 100;
        let valorUnitarioStr = cells[6].querySelector('input').value.replace("R$", "").replace(/\./g, "").replace(",", ".");
        let valorUnitario = Number(valorUnitarioStr);

        if (!isNaN(valorUnitario)) {
            let valorComIPI = valorUnitario * (1 + ipi);
            cells[7].querySelector('input').value = valorComIPI.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } else {
            cells[7].querySelector('input').value = '';
        }
    } else {
        cells[7].querySelector('input').value = '';
    }

    if (listaPrecos) {
        cells[1].querySelector('input').value = '';
        cells[2].querySelector('input').value = listaPrecos[9];
        cells[3].querySelector('input').value = listaPrecos[10];
        cells[4].querySelector('input').value = listaPrecos[4];
        cells[9].querySelector('input').value = listaPrecos[13];
    }

    function atualizarValorTotal() {
        if (codProduto) {
            let quantidade = Number(cells[1].querySelector('input').value);
            let ipiStr = cells[5].querySelector('input').value.replace("%", "");
            let ipi = Number(ipiStr) / 100;
            let valorUnitarioStr = cells[6].querySelector('input').value.replace("R$", "").replace(/\./g, "").replace(",", ".");
            let valorUnitario = Number(valorUnitarioStr);

            if (!isNaN(valorUnitario)) {
                let valorComIPI = valorUnitario * (1 + ipi);
                let valorTotal = valorComIPI * quantidade;
                cells[8].querySelector('input').value = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                atualizarTotalComImposto();
                atualizarTotalVolumes();
                atualizarTotalProdutos();
            } else {
                cells[8].querySelector('input').value = '';
            }
        } else {
            cells[8].querySelector('input').value = '';
        }
    }

    cells[1].querySelector('input').addEventListener('input', function() {
        atualizarValorTotal();
        atualizarTotalVolumes();
        atualizarTotalProdutos();
    });
    cells[6].querySelector('input').addEventListener('input', function() {
        atualizarValorTotal();
        atualizarTotalProdutos();
    });
    cells[8].querySelector('input').addEventListener('input', atualizarTotalComImposto);
}


//--inicio-----envio de dados para o sistema DBCorp-----------------------------------------------------------------------------------------////

const btSistema = document.getElementById('button_sistema');
const feedbackDiv = document.getElementById('feedback1');
const modal = document.getElementById('customModal');
const closeButton = document.querySelector('.close-button');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');

// Função para abrir o modal
btSistema.addEventListener("click", () => {
    modal.style.display = "block"; // Exibe o modal
});

// Fecha o modal ao clicar no botão "Não" ou no botão de fechar
closeButton.addEventListener("click", () => {
    modal.style.display = "none";
});

cancelButton.addEventListener("click", () => {
    modal.style.display = "none";
    console.log('Envio cancelado.');
});

// Executa a lógica de envio ao clicar no botão "Sim"
confirmButton.addEventListener("click", async () => {
    modal.style.display = "none"; // Fecha o modal

    // Exibe a mensagem de feedback
    feedbackDiv.style.display = "block";

    try {

        // Captura as linhas da tabela
        const tableRows = document.querySelectorAll('#dadosPedido tbody tr');

        // Cria o array dinâmico para ItensPedidoVenda
        const itensPedidoVenda = Array.from(tableRows)
            .map(row => {
                const cells = row.querySelectorAll('td input'); // Captura os inputs da linha

                // Verifica se a linha tem dados válidos antes de adicioná-la
                const itemId = Number(cells[9]?.value || 0); // ID do item na décima célula
                const quantidade = Number(cells[1]?.value || 0); // Quantidade na segunda célula

                // Só adiciona a linha se tiver um ItemId e Quantidade válidos
                if (itemId > 0 && quantidade > 0) {
                    return {
                        ItemValorDesconto: 0,
                        ItemPercentualDesconto: 0,
                        EntregasItemPedidoVenda: [
                            {
                                Data: new Date().toISOString(), 
                                DataPrevista: new Date().toISOString(),
                                Quantidade: quantidade,
                            }
                        ],
                        ItemId: itemId,
                        Quantidade: quantidade,
                    };
                }

                return null; // Retorna null para linhas inválidas
            })
            .filter(item => item !== null); // Remove itens nulos do array

        // Cria o corpo da requisição com base nos inputs
        const requestBody = {
            ListaPrecoId: Number(document.getElementById('codgroup').value),
            CondicaoPagamentoId: Number(document.getElementById('condPagId').value),
            FormaPagamentoId: Number(document.getElementById('formPagId').value),
            ValorDesconto: 0,
            PercentualDesconto: 0,
            ItensPedidoVenda: itensPedidoVenda,
            RepresentantesPedidoVendas: [
                {
                    RepresentanteId: Number(document.getElementById('representanteId').value),
                    RepresentantePrincipal: true,
                    PercentualComissaoItem: Number(document.getElementById('PercentualComissaoItem').value),
                    PercentualComissaoServico: Number(document.getElementById('PercentualComissaoServico').value),
                }
            ],
            ClienteId: Number(document.getElementById('cod_cliente').value),
            ContatoClienteId: Number(document.getElementById('ContatoClienteId').value || 0),
            NumeroReferencia: document.getElementById('referencia').value,
            Observacao: document.getElementById('observation').value,
        };

        // Loga o JSON no console
        console.log("JSON enviado para a API:", requestBody);

        // Envia os dados para a API
        const response = await fetch('/api/pedidos/input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (response.ok && (!result.ErrorMessages || result.ErrorMessages.length === 0)) {
            alert("Pedido enviado com sucesso!");
            console.log("Resposta da API:", result);
        } else {
            alert(`Erro ao enviar pedido: ${result.ErrorMessages?.join(", ") || "Erro desconhecido"}`);
            console.error("Erro da API:", result);
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
        alert("Erro ao conectar com o servidor.");
    } finally {
        // Oculta a mensagem de feedback
        feedbackDiv.style.display = "none";
    }
});

//--fim-----envio de dados para o sistema DBCorp------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const helpIcon = document.getElementById('helpIcon');
    const helpModal = document.getElementById('helpModal');
    const overlay = document.getElementById('overlay');
    const closeModal = document.getElementById('closeModal');

    // Abrir modal
    helpIcon.addEventListener('click', () => {
        overlay.style.display = 'block'; // Exibe o overlay
        helpModal.style.display = 'block'; // Exibe o modal
    });

    // Fechar modal
    function closeHelpModal() {
        overlay.style.display = 'none'; // Oculta o overlay
        helpModal.style.display = 'none'; // Oculta o modal
    }

    closeModal.addEventListener('click', closeHelpModal);

    // Fechar modal ao clicar no overlay
    overlay.addEventListener('click', closeHelpModal);
});





btPdfGeneration.addEventListener("click", async () => {
    const razaoSocial = document.getElementById('razao_social').value;
    const codCliente = document.getElementById('cod_cliente').value;
    const representante = document.getElementById('representante').value;
    const emailRep = document.getElementById('email_rep').value;
    const pdfBase64 = await html2pdf().set(options).from(content).outputPdf('datauristring');

    try {
        const response = await fetch('/send-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pdfBase64, razaoSocial, codCliente ,representante,emailRep}) // Envia os dados necessários
        });

        const result = await response.text();
        alert(result);
    } catch (error) {
        console.error('Erro ao enviar o PDF:', error);
        alert('Erro ao enviar o PDF por e-mail');
    }
});





