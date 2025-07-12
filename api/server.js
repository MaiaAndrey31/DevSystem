const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const sheets = require('./sheets');
const ia = require('./ia');

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

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`API rodando em http://${HOST}:${PORT}`);
  console.log('Endpoints disponíveis:');
  console.log(`- POST   http://${HOST}:${PORT}/pedidos`);
  console.log(`- PUT    http://${HOST}:${PORT}/pedidos/:id`);
  console.log(`- GET    http://${HOST}:${PORT}/pedidos`);
});
