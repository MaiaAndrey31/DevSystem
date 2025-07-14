const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const sheets = require('./sheets');
const ia = require('./ia');
const linksRouter = require('./routes/links');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota para criar um novo pedido
app.post('/pedidos', async (req, res) => {
  try {
    const pedido = req.body;
    
    // Validação dos campos obrigatórios
    if (!pedido.tipo_trofeu || typeof pedido.tipo_trofeu !== 'string' || pedido.tipo_trofeu.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'O campo tipo_trofeu é obrigatório e não pode estar vazio' 
      });
    }
    
    pedido.status = 'Novo pedido'; // status padrão
    const id = await db.insertPedido(pedido);
    await sheets.addPedido(id, pedido);
    await ia.notify(pedido);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar o pedido' });
  }
});

// Rota para atualizar status de um pedido
app.put('/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rastreio } = req.body;

    const pedido = await db.updateStatus(id, status, rastreio);
    await sheets.updatePedido(id, status, rastreio);
    await ia.notify(pedido);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar o pedido' });
  }
});

// Rota de saúde
app.get('/health', (_, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'API Trofy',
    version: '1.0.0'
  });
});

// Rota de teste
app.get('/teste', (_, res) => {
  res.json({ mensagem: 'API está funcionando corretamente!', data: new Date().toISOString() });
});

// Rota para listar todos os pedidos
app.get('/pedidos', async (_, res) => {
  try {
    const pedidos = await db.getPedidos();
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
  }
});

// Inicializar tabela de links
async function initializeDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        icon VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela de links inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar tabela de links:', error);
  }
}

// Rotas da API
app.use('/api/links', linksRouter);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Inicializar o banco de dados e depois iniciar o servidor
initializeDatabase().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`API rodando em http://${HOST}:${PORT}`);
    console.log('\nEndpoints de Pedidos:');
    console.log(`- POST   http://${HOST}:${PORT}/pedidos`);
    console.log(`- PUT    http://${HOST}:${PORT}/pedidos/:id`);
    console.log(`- GET    http://${HOST}:${PORT}/pedidos`);
    
    console.log('\nEndpoints de Links:');
    console.log(`- GET    http://${HOST}:${PORT}/api/links`);
    console.log(`- GET    http://${HOST}:${PORT}/api/links/:id`);
    console.log(`- POST   http://${HOST}:${PORT}/api/links`);
    console.log(`- PUT    http://${HOST}:${PORT}/api/links/:id`);
    console.log(`- DELETE http://${HOST}:${PORT}/api/links/:id`);
  });
});
