const fetch = require('node-fetch');

let authToken = null;
let tokenExpirationTime = null;

// Função para autenticar e obter o token
async function authenticate() {
  try {
    const response = await fetch('https://gateway-ng.dbcorp.com.br:55500/identidade-service/autenticar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://kidszone-ng.dbcorp.com.br'
      },
      body: JSON.stringify({
        usuario: "alex.l",
        senha: "@Al@2313",
        origin: "kidszone-ng"
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na autenticação: ${response.statusText}`);
    }

    const data = await response.json();
    authToken = data.tokenAcesso; // Atualizado para tokenAcesso
    tokenExpirationTime = Date.now() + 2 * 60 * 60 * 1000;
    console.log('Autenticado com sucesso, token obtido.');
  } catch (error) {
    console.error('Erro ao autenticar:', error);
  }
}

// Função para verificar se o token está válido ou se precisamos renovar
async function checkToken() {
  if (!authToken || Date.now() > tokenExpirationTime) {
    console.log('Token expirado ou inexistente. Autenticando...');
    await authenticate();
  }
}

// Função para calcular as datas de início e fim (últimos 30 dias)
function getLast30Days() {
  const hoje = new Date();
  const dataFim = hoje.toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD
  const dataInicio = new Date(hoje.setDate(hoje.getDate() - 60)).toISOString().split('T')[0]; // Data 30 dias atrás
  return { dataInicio, dataFim };
}

// Função para buscar os pedidos de venda
async function fetchOrderDetails(status = 3) {
  await checkToken();

  if (!authToken) {
    console.error('Erro: Token não obtido.');
    return;
  }

  // Calcula as datas dinamicamente
  const { dataInicio, dataFim } = getLast30Days();
   
  console.log(`Buscando pedidos com status: ${status}, DataPedidoInicio: ${dataInicio}, DataPedidoFim: ${dataFim}`);


  try {
    const response = await fetch(
      `https://gateway-ng.dbcorp.com.br:55500/vendas-service/pedido?DataPedidoInicio=${dataInicio}&DataPedidoFim=${dataFim}&status=${status}&EmpresaCodigo=2&PageNumber=1&PageSize=200`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);
    }

    const ordersData = await response.json();
    console.log('Pedidos recebidos:', ordersData); // Log dos dados recebidos

    return ordersData.dados || []; // Retorna o array de pedidos
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
  }
}

// Função para buscar representantes para cada cliente
async function fetchOrdersWithRepresentatives(status = 3) {

  const orders = await fetchOrderDetails(status);

  const representativeEndpoint = 'https://gateway-ng.dbcorp.com.br:55500/pessoa-service/representante/cliente/';

  const ordersWithRepresentatives = await Promise.all(
    orders.map(async (order) => {
      const clienteCodigo = order.cliente.codigo;

      try {
        const repResponse = await fetch(`${representativeEndpoint}${clienteCodigo}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        const repData = await repResponse.json();
        return {
          ...order,
          representante: repData[0] || null // Combina os dados do representante
        };
      } catch (error) {
        console.error(`Erro ao buscar representante para cliente ${clienteCodigo}:`, error);
        return {
          ...order,
          representante: null
        };
      }
    })
  );

  return ordersWithRepresentatives;
}

// Função para buscar detalhes do pedido de venda
async function fetchOrdersWithdetailsAndRepresentatives (status = 3) {

   const orders2 = await fetchOrdersWithRepresentatives(status) ;

   const IdOrdersDetailsEndpoint = 'https://gateway-ng.dbcorp.com.br:55500/vendas-service/pedido/';

   const ordersWithDetails = await Promise.all(

      orders2.map(async (order) => {
        try {
            const response = await fetch(`${IdOrdersDetailsEndpoint}${order.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar detalhes do pedido ${order.id}: ${response.statusText}`);
            }

            const orderDetails = await response.json();
            return {
                ...order,
                detalhes: orderDetails,
            };
        } catch (error) {
            console.error(`Erro ao buscar detalhes para o pedido com ID ${order.id}:`, error);
            return {
                ...order,
                detalhes: null, // Caso haja erro, atribui null aos detalhes
            };
        }
      })
   
   );

   return ordersWithDetails;
}


async function  fetchOrdersWithdetailsAndRepresentativesWithTransport(status = 3) {

    const orders3 = await fetchOrdersWithdetailsAndRepresentatives(status) ;   

    const transportEndpoint = 'https://gateway-ng.dbcorp.com.br:55500/pessoa-service/transportadora/codigo/'

    const transportWithDetails = await Promise.all(
      
        orders3.map(async (order) => {
           
           try {
              
              const response = await fetch(`${transportEndpoint}${order.transportadoraCodigo}`,{
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json',
                  },
              });
            
              
              if (!response.ok) {
                  throw new Error(`Erro ao buscar detalhes da transportadora ${order.transportadoraCodigo}: ${response.statusText}`);
              }

              const transportDetails = await response.json();
              return {
                ...order,
                detalhes_transporte : transportDetails,
              };  

           } catch (error) {
              console.error(`Erro ao buscar detalhes do id da transportadora ${order.transportadoraCodigo}:`, error);
              return {
                ...order,
                detalhes_transporte: null, // Caso haja erro, atribui null aos detalhes
              };
           }

        })

    );

    return transportWithDetails;
    
}

const fetchOrderDetailsById = async (id, status = 3) => {
  try {
    const response = await fetch(`/api/pedidos/${id}?status=${status}`);
    if (!response.ok) throw new Error(`Erro ao carregar pedido ${id}: ${response.statusText}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do pedido com ID ${id}:`, error);
    throw error;
  }
};

setInterval(checkToken, 60 * 60 * 1000);  // Verifica o token a cada 1 hora

// Exportar as funções
module.exports = {
  authenticate,
  checkToken,
  fetchOrderDetails,
  fetchOrdersWithRepresentatives,
  fetchOrdersWithdetailsAndRepresentatives,
  fetchOrdersWithdetailsAndRepresentativesWithTransport,
  fetchOrderDetailsById
};
