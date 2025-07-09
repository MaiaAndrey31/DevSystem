const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuração do Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, '..', 'config', 'service-account.json');

// Verifica se o arquivo de credenciais existe
if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.warn('AVISO: Arquivo de credenciais do Google não encontrado. A integração com o Google Sheets será desabilitada.');
  console.warn(`Crie o arquivo em: ${CREDENTIALS_PATH}`);
}

let sheets;
let isConfigured = false;

// Inicializa a API do Google Sheets se as credenciais estiverem disponíveis
if (fs.existsSync(CREDENTIALS_PATH)) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES
    });
    
    sheets = google.sheets({ version: 'v4', auth });
    isConfigured = true;
  } catch (error) {
    console.error('Erro ao configurar a API do Google Sheets:', error);
  }
}

// ID da planilha (deve ser configurado no ambiente ou substituído)
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || 'SUA_PLANILHA_ID';
const SHEET_NAME = 'Pedidos';

/**
 * Adiciona um novo pedido à planilha do Google Sheets
 * @param {Number} id - ID do pedido
 * @param {Object} pedido - Dados do pedido
 */
async function addPedido(id, pedido) {
  if (!isConfigured) {
    console.warn('Google Sheets não configurado. Pulando adição de pedido.');
    return;
  }

  try {
    const values = [
      id,
      pedido.nome,
      pedido.email,
      pedido.telefone,
      pedido.cpf,
      pedido.endereco,
      pedido.cidade,
      pedido.estado,
      pedido.cep,
      pedido.tipo_trofeu || '',
      pedido.bonus_escolhido || '',
      pedido.status,
      new Date().toISOString(),
      '' // Célula vazia para código de rastreio
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values]
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar pedido ao Google Sheets:', error);
    throw error;
  }
}

/**
 * Atualiza o status e código de rastreio de um pedido na planilha
 * @param {Number} id - ID do pedido
 * @param {String} status - Novo status
 * @param {String} rastreio - Código de rastreio
 */
async function updatePedido(id, status, rastreio) {
  if (!isConfigured) {
    console.warn('Google Sheets não configurado. Pulando atualização de pedido.');
    return;
  }

  try {
    // Primeiro, encontre a linha do pedido
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn('Nenhum dado encontrado na planilha.');
      return;
    }

    // Encontra o índice da linha com o ID correspondente (coluna A)
    const rowIndex = rows.findIndex(row => row[0] === id.toString());
    if (rowIndex === -1) {
      console.warn(`Pedido com ID ${id} não encontrado na planilha.`);
      return;
    }

    // Atualiza as colunas de status e rastreio (colunas K e M, respectivamente)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `${SHEET_NAME}!K${rowIndex + 1}`, // Coluna K (status)
            values: [[status]]
          },
          {
            range: `${SHEET_NAME}!M${rowIndex + 1}`, // Coluna M (rastreio)
            values: [[rastreio || '']]
          }
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar pedido no Google Sheets:', error);
    throw error;
  }
}

module.exports = { addPedido, updatePedido };
