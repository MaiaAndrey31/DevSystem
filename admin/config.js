// Configurações da API
const API_CONFIG = {
  // URL base da API - ajuste conforme necessário
  BASE_URL: 'http://localhost:3000',
  
  // Configurações de CORS
  CORS: {
    credentials: 'same-origin',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
};

// Exporta a configuração
window.API_CONFIG = API_CONFIG;
