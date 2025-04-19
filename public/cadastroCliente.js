// Abrir o modal de e-mail ao clicar no botão "SALVAR EM PDF E ENVIAR E-MAIL"
const emailModal = document.getElementById('emailModal');
const buttonPdf = document.getElementById('button_pdf');
const emailCloseButton = document.querySelector('.email-close-button');
const sendEmailButton = document.getElementById('sendEmailButton');
const cancelEmailButton = document.getElementById('cancelEmailButton');

buttonPdf.addEventListener('click', () => {
    emailModal.style.display = 'block';
});

emailCloseButton.addEventListener('click', () => {
    emailModal.style.display = 'none';
});

cancelEmailButton.addEventListener('click', () => {
    emailModal.style.display = 'none';
});

sendEmailButton.addEventListener('click', () => {
    const emailTo = document.getElementById('emailTo').value;
    const emailCc = document.getElementById('emailCc').value;
    const emailSubject = document.getElementById('emailSubject').value;
    const emailBody = document.getElementById('emailBody').value;
    const emailAttachment = document.getElementById('emailAttachment').files;

    if (emailTo && emailSubject && emailBody) {
        alert('E-mail enviado com sucesso!\nPara: ' + emailTo + '\nCc: ' + (emailCc || 'Nenhum') + '\nAssunto: ' + emailSubject);
        emailModal.style.display = 'none';
        document.getElementById('emailForm').reset();
    } else {
        alert('Por favor, preencha os campos obrigatórios (Para, Assunto e Mensagem).');
    }
});

window.addEventListener('click', (event) => {
    if (event.target == emailModal) {
        emailModal.style.display = 'none';
    }
});