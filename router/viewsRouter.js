const express = require('express');
const path = require('path');
const pdfController = require('../controllers/pdfController');
const orderController = require('../controllers/orderController'); // Importa o controlador
const invoicesController = require('../controllers/invoicesControllers');
const { authMiddleware, authenticateUser } = require('../middleware/authMiddleware');
const inputOrdersController = require('../controllers/inputOrdersControllers');

const router = express.Router();

// Rota para a página inicial
router.get('/', authMiddleware, (req, res) => {
    console.log('Rota / acessada');
    res.sendFile(path.resolve(__dirname, '..', 'views', 'index.html'));
});

// Rota para a página de login
router.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'views', 'login.html'));
});

// Rota para a página de login2
router.get('/login2', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'views', 'login2.html'));
});

// Rota para a página de administração
router.get('/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'views', 'admin.html'));
});

// Rota para a página de pedidos comerciais (comercial.html)
router.get('/comercial', authMiddleware,(req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'views', 'comercial.html'));
});

// Rota para a página de detalhes do pedido (detalhes.html)
router.get('/detalhes',authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'detalhes.html'));
});

// Rota para a página de detalhes do produto (Detalhes_Produtos.html)
router.get('/detalhesProdutos',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'Detalhes_Produtos.html'));
});


// Rota para a página de detalhes do pedido (detalhes.html)
router.get('/logistica',authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'logistica.html'));
});



// Rotas da API de pedidos
router.get('/api/pedidos', orderController.getOrderDetails); // Pedidos com representantes
router.get('/api/pedidos/:id', orderController.getOrderDetailsById); // Detalhes do pedido por ID


// Rotas da API de Logistica
router.get('/api/logistica/onedrive', invoicesController.fetchLogisticsData);


// Rota para página de erro 401 (Senha incorreta)
router.get('/error-401', (req, res) => {
    res.status(401).sendFile(path.join(__dirname, '..', 'views', 'error-401.html'));
});

// Rota para página de erro 404 (Usuário não encontrado)
router.get('/error-404', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'views', 'error-404.html'));
});


// Rota para enviar os dados da sessão para o front-end
router.get('/session-data', authMiddleware, (req, res) => {
    res.json({
        userNumero: req.session.userNumero || '',
        isAuthenticated: req.session.isAuthenticated || false,
        user: req.session.user || null,
    });
});


router.get('/session-test', (req, res) => {
    res.json({
        session: req.session || 'Nenhuma sessão encontrada',
        cookies: req.cookies || 'Nenhum cookie encontrado',
    });
});

// Rota para envio de PDF
router.post('/send-pdf', pdfController.sendPdf);

// Rota para autenticação
router.post('/auth', authenticateUser);

// Rota para Limpar os dados do usuario
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err);
            return res.status(500).send('Erro ao encerrar a sessão.');
        }
        res.clearCookie('connect.sid'); // Limpa o cookie de sessão
        res.status(200).send('Sessão encerrada com sucesso.');
    });
});

//Rota post para pedidos

router.post('/api/pedidos/input', inputOrdersController.fetchImputOrders)








module.exports = router;
