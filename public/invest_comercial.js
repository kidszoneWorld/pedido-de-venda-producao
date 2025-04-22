document.getElementById('logoutButton2').addEventListener('click', async () => {
    sessionStorage.clear();
    localStorage.clear();
    await fetch('/logout', { method: 'POST' });
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });
    window.location.href = '/login2';
});

// Função para adicionar e remover linhas na tabela de investimentos
const tableBody = document.getElementById('investment-table-body');
document.getElementById('adicionarLinhaInvestimento').addEventListener('click', () => {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="parcela"><input type="text" placeholder="Parcela"></td>
        <td class="valor"><input type="text" placeholder="Valor"></td>
        <td class="valor-pago"><input type="text" placeholder="Valor Pago"></td>
    `;
    tableBody.appendChild(newRow);
});

document.getElementById('excluirLinhaInvestimento').addEventListener('click', () => {
    if (tableBody.rows.length > 1) {
        tableBody.deleteRow(tableBody.rows.length - 1);
    }
});

// Seleciona os checkboxes
const aprovadoCheckbox = document.getElementById('aprovado');
const reprovadoCheckbox = document.getElementById('reprovado');

// Função para garantir que apenas um checkbox esteja marcado
function handleCheckboxSelection() {
    // Quando "Aprovado" é marcado, desmarca "Reprovado"
    aprovadoCheckbox.addEventListener('change', function () {
        if (this.checked) {
            reprovadoCheckbox.checked = false;
        }
    });

    // Quando "Reprovado" é marcado, desmarca "Aprovado"
    reprovadoCheckbox.addEventListener('change', function () {
        if (this.checked) {
            aprovadoCheckbox.checked = false;
        }
    });
}

// Chama a função para inicializar o comportamento
handleCheckboxSelection();