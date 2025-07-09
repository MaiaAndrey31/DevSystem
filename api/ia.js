const axios = require('axios');

// URL da API de notificação da IA (pode ser configurada via variável de ambiente)
const IA_BASE_URL = process.env.IA_BASE_URL || 'http://ia.seuservidor.local';
const IA_NOTIFY_ENDPOINT = `${IA_BASE_URL}/notify`;

/**
 * Envia notificação para o serviço de IA
 * @param {Object} pedido - Dados do pedido
 * @returns {Promise<Object>} Resposta da API de IA
 */
async function notify(pedido) {
  try {
    const payload = {
      nome: pedido.nome,
      telefone: pedido.telefone,
      status: pedido.status,
      tipo_trofeu: pedido.tipo_trofeu,
      rastreio: pedido.rastreio || null,
      timestamp: new Date().toISOString()
    };

    console.log(`Enviando notificação para IA:`, JSON.stringify(payload, null, 2));
    
    // Se a URL da IA não estiver configurada, apenas registra no log
    if (!IA_BASE_URL || IA_BASE_URL.includes('seuservidor.local')) {
      console.warn('URL da IA não configurada. Notificação não enviada.');
      return { success: false, message: 'URL da IA não configurada' };
    }

    const response = await axios.post(IA_NOTIFY_ENDPOINT, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000 // Timeout de 5 segundos
    });

    console.log(`Resposta da IA: ${response.status} - ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    // Em produção, você pode querer implementar uma fila de retentativa aqui
    console.error('Erro ao notificar IA:', error.message);
    if (error.response) {
      console.error('Resposta de erro da IA:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    throw error;
  }
}

/**
 * Verifica a saúde do serviço de IA
 * @returns {Promise<Object>} Status do serviço
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${IA_BASE_URL}/health`, { timeout: 3000 });
    return {
      status: 'ok',
      response: response.data
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      code: error.code
    };
  }
}

module.exports = { 
  notify,
  checkHealth
};
