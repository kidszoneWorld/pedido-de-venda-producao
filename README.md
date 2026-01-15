Introdução

Esta documentação tem como objetivo apresentar de forma clara e organizada todas as informações necessárias para o entendimento, utilização e manutenção do site. Aqui você encontrará detalhes sobre a estrutura do projeto, funcionalidades disponíveis, requisitos técnicos, além de orientações para usuários, desenvolvedores e equipes de suporte.

O conteúdo foi elaborado para servir como referência tanto para consultas rápidas quanto para aprofundamento técnico, garantindo que o site possa ser operado, atualizado e evoluído de maneira eficiente e segura.

Recomenda-se a leitura completa desta documentação antes de realizar qualquer alteração no sistema, a fim de evitar inconsistências, falhas de funcionamento ou impactos indesejados na experiência do usuário.

Este site tem como objetivo ser uma plataforma que permita o envio de pedidos dos representantes para o sistema ERP por meio de APIs do DBCorp e também conta com páginas para verificar informações dos pedidos enviados, verificar status de pedido, verificar detalhes de um produto, solicitar cadastro de clientes e solicitar investimentos

Para este site foram utilizados node com javascript e HTML, não contendo um banco de dados próprio, mas, consultando e inclundo dados via API em um banco de dados SQL.
O versionamento do site é controlado apenas pela branch main do site do github sendo hospedado na VERCEL.

Estrutura do projeto:

/pedido-de-venda-producao
|-/controllers
|   |-ClientController.js
|   |-clientePdfController.js
|   |-displayController.js
|   |-eficienciaController.js
|   |-fernandoController.js
|   |-inputOrdersController.js
|   |-invoicesController.js
|   |-orderController.js
|   |-pdf_invest_comercialController.js
|   |-pdf_invest_promotorController.js
|   |-pdfController.js
|   |-productController.js
|   |-redesController.js
|   |-sellOutController.js
|-/middleware
|   |-authMiddleware.js
|-/models
|   |-/Display
|       |-Display.js
|   |-/Redes
|       |-Redes.js
|   |-/SellOut
|       |SellOut2.js
|   |-Cliente.js
|   |-Investimentos.js
|   |-Mercado.js
|   |-Positicacao,js
|   |-Sellin.js
|   |-sellOut.js
|-/public

