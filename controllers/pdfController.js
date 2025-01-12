const nodemailer = require('nodemailer');

exports.sendPdf = async (req, res) => {

    const { pdfBase64, razaoSocial, codCliente,representante,emailRep } = req.body;

    if (!pdfBase64) {
        return res.status(400).send('Nenhum PDF foi recebido.');
    }

    try {
        // Configurando o transporte usando Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Seu e-mail do Gmail
                pass: process.env.GMAIL_APP_PASSWORD // Substitua pela senha de aplicativo gerada
            },
            tls: {
                rejectUnauthorized: false // Ignora a verificação do certificado
            }
        });

        const subject = `Pedido de Venda ${razaoSocial} - ${codCliente}`;
        const fileName = `Pedido de Venda ${razaoSocial} - ${codCliente} e Rep ${representante}.pdf`;

        // Configurando o e-mail
        await transporter.sendMail({
            from: 'Pedidos KidsZone <kidzonekidszonemail@gmail.com>', // Seu e-mail do Gmail
            to: ['pedidoskz@kidszoneworld.com.br','ti.kz@kidszoneworld.com.br','comercial.kz@kidszoneworld.com.br','alxnvn@yahoo.com.br',emailRep], // Destinatário do e-mail
            subject: subject, // Assunto dinâmico
            text: `Segue em anexo o PDF gerado para o cliente ${razaoSocial} - ${codCliente} representante ${representante}`,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBase64.split(",")[1],
                    encoding: 'base64'
                }
            ]
        });

        res.status(200).send('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        res.status(500).send('Erro ao enviar o e-mail');
    }
};
