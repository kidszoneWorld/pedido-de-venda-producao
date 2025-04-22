document.getElementById('logoutButton2').addEventListener('click', async () => {
    sessionStorage.clear();
    localStorage.clear();
    await fetch('/logout', { method: 'POST' });
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });
    window.location.href = '/login2';
});


// Função para salvar em PDF
document.getElementById('button_pdf').addEventListener('click', () => {
    const element = document.querySelector('.container');
    html2pdf().from(element).save('solicitacao_investimento_comercial.pdf');
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