document.addEventListener("DOMContentLoaded", () => {
    const btPdfGeneration = document.getElementById('button_pdf');
    const modal1 = document.getElementById('customModal1');
    const closeButton1 = document.querySelector('.close-button1');
    const confirmButton1 = document.getElementById('confirmButton1');
    const cancelButton1 = document.getElementById('cancelButton1');
    const feedbackDiv = document.getElementById('feedback1'); // Div de feedback para o envio do e-mail

    btPdfGeneration.addEventListener("click", async () => {
        console.log('Botão de PDF clicado');
        const elementsToHide = document.querySelectorAll('.no-print');
        elementsToHide.forEach(el => el.style.display = 'none');

        const elementsToHide1 = document.querySelectorAll('.button-group');
        elementsToHide1.forEach(el1 => el1.style.display = 'none');

        const content = document.querySelector('.container');
        const razaoSocial = document.getElementById('razao_social').value;
        const codCliente = document.getElementById('cod_cliente').value;
        const representante = document.getElementById('representante').value;

        const filename = `Pedido de Venda ${razaoSocial} - ${codCliente} e Rep ${representante}.pdf`;

        const options = {
            margin: [0, 0, 0, 0],
            filename: filename,
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
            pagebreak: { mode: 'avoid-all' }
        };

        try {
            // Gera o PDF para download
            const pdfBlob = await html2pdf().set(options).from(content).output('blob');
            console.log('PDF gerado como blob.');

            const pdfURL = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = pdfURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log('PDF baixado com sucesso.');

            alert('PDF criado e salvo nos downloads.');

            // Exibe o modal de confirmação
            modal1.style.display = "block";

            // Fecha o modal ao clicar no botão "Não" ou no botão de fechar
            closeButton1.addEventListener("click", () => {
                modal1.style.display = "none";
                elementsToHide.forEach(el => el.style.display = 'block');
                elementsToHide1.forEach(el1 => el1.style.display = 'flex');
            });

            cancelButton1.addEventListener("click", () => {
                modal1.style.display = "none";
                console.log('Envio de e-mail cancelado.');
                elementsToHide.forEach(el => el.style.display = 'block');
                elementsToHide1.forEach(el1 => el1.style.display = 'flex');
            });

            confirmButton1.addEventListener("click", async () => {
                modal1.style.display = "none";

                // Exibe a mensagem de feedback
                feedbackDiv.textContent = 'Aguarde, estamos enviando o e-mail...';
                feedbackDiv.style.display = 'block';

                try {

                     // Oculta a mensagem de feedback antes de gerar o PDF para envio
                     feedbackDiv.style.display = 'none';

                    // Reexibe os elementos antes de gerar o PDF para envio
                    elementsToHide1.forEach(el1 => el1.style.display = 'none');

                    // Gera o PDF novamente em base64 para envio
                    const pdfBase64 = await html2pdf().set(options).from(content).outputPdf('datauristring');

                    // Oculta os elementos novamente após a captura
                    elementsToHide1.forEach(el1 => el1.style.display = 'flex');

                     // Exibe a mensagem de feedback novamente enquanto envia o e-mail
                    feedbackDiv.style.display = 'block';

                    // Envia o PDF em base64 para o servidor
                    const response = await fetch('/send-pdf', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ pdfBase64, razaoSocial, codCliente, representante })
                    });

                    const result = await response.text();
                    console.log(result);
                    alert(result);
                } catch (error) {
                    console.error('Erro ao enviar o e-mail:', error);
                    alert('Erro ao enviar o e-mail.');
                } finally {
                    // Oculta a mensagem de feedback e reexibe os elementos
                    feedbackDiv.style.display = 'none';
                    elementsToHide.forEach(el => el.style.display = 'block');
                    elementsToHide1.forEach(el1 => el1.style.display = 'flex');
                }
            });
        } catch (error) {
            console.error('Erro ao salvar ou enviar o PDF:', error);
        } finally {
            elementsToHide.forEach(el => el.style.display = 'block');
            elementsToHide1.forEach(el1 => el1.style.display = 'flex');
        }
    });
});
