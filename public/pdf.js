document.addEventListener("DOMContentLoaded", () => {
    const btPdfGeneration = document.getElementById('button_pdf');

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
            // 1. Gera o PDF em memória
            const pdfBlob = await html2pdf().set(options).from(content).output('blob');
            console.log('PDF gerado como blob.');

            // 2. Salva o PDF no dispositivo (simula o download)
            const pdfURL = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = pdfURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log('PDF baixado com sucesso.');

            alert('PDF criado e salvo nos downloads.');

            // 3. Gera o PDF novamente em base64 para envio
            const pdfBase64 = await html2pdf().set(options).from(content).outputPdf('datauristring');

            // Pergunta ao usuário se deseja enviar o e-mail
            const confirmSend = confirm("Você deseja realmente enviar este e-mail?");
            if (!confirmSend) {
                console.log('Envio de e-mail cancelado.');
                elementsToHide.forEach(el => el.style.display = 'block');
                elementsToHide1.forEach(el1 => el1.style.display = 'flex');
                return;
            }

            // 4. Envia o PDF em base64 para o servidor
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
            console.error('Erro ao salvar ou enviar o PDF:', error);
        } finally {
            elementsToHide.forEach(el => el.style.display = 'block');
            elementsToHide1.forEach(el1 => el1.style.display = 'flex');
        }
    });
});
