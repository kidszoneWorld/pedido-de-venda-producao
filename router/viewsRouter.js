const express = require('express');
const path = require('path');
const pdfController = require('../controllers/pdfController');
const orderController = require('../controllers/orderController'); // Importa o controlador
const invoicesController = require('../controllers/invoicesControllers');
const { authMiddleware, authenticateUser } = require('../middleware/authMiddleware');
const inputOrdersController = require('../controllers/inputOrdersControllers');
const eficienciaController = require('../controllers/eficienciaController');
const displayController = require('../controllers/displayController');  
const redesController = require('../controllers/redesController');  
const sellOutController = require('../controllers/sellOutController');

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

// Rota para a página de eficiencia cliente (eficiencia.html)
router.get('/eficiencia',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'eficiencia.html'));
});

// Rota para a página de eficiencia cliente (sellOut.html)
router.get('/sellOut',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'sellOut.html'));
});

// Rota para a página de eficiencia cliente (display.html)
router.get('/display',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'display.html'));
});

// Rota para a página de eficiencia cliente (redes.html)
router.get('/redes',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'redes.html'));
});

// Rota para a página de detalhes do pedido (detalhes.html)
router.get('/logistica',authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'logistica.html'));
});



// Rota para a página (video.html)
router.get('/video',authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'video.html'));
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


/////banco de dados mogondb atlas

router.get('/api/eficiencia/:codgroup', eficienciaController.getEficienciaBycodgroup);
router.post('/api/eficiencia/salvar', eficienciaController.salvarEficiencia);

router.get('/api/display/:codgroup', displayController.getDisplayBycodgroup);
router.post('/api/display/salvar', displayController.salvarDisplay);
router.delete('/api/display/remover', displayController.removerLinhaDisplay);

router.get('/api/redes/:codgroup', redesController.getRedesBycodgroup);
router.post('/api/redes/salvar', redesController.salvarRedes);
router.delete('/api/redes/remover', redesController.removerLinhaRedes);


router.get('/api/sellOut/:codgroup', sellOutController.getSellOutBycodgroup);
router.post('/api/sellOut/salvar', sellOutController.salvarSellOut);        
router.delete('/api/sellOut/remover', sellOutController.removerLinhaSellOut);


module.exports = router;
