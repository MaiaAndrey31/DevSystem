const Database = require('better-sqlite3');
const path = require('path');

// Caminho para o banco de dados SQLite
const dbPath = path.join(__dirname, '..', 'database', 'pedidos.db');
const db = new Database(dbPath);

// Criar tabela de pedidos se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    cpf TEXT NOT NULL,
    endereco TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    cep TEXT NOT NULL,
    rastreio TEXT,
    status TEXT NOT NULL,
    bonus_escolhido TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Trigger para atualizar a data de atualização automaticamente
db.exec(`
  CREATE TRIGGER IF NOT EXISTS atualiza_data_atualizacao
  AFTER UPDATE ON pedidos
  BEGIN
    UPDATE pedidos SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`);

/**
 * Insere um novo pedido no banco de dados
 * @param {Object} pedido - Dados do pedido
 * @returns {Number} ID do pedido inserido
 */
function insertPedido(pedido) {
  const stmt = db.prepare(`
    INSERT INTO pedidos 
    (nome, email, telefone, cpf, endereco, cidade, estado, cep, status, bonus_escolhido, tipo_trofeu)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    pedido.nome,
    pedido.email,
    pedido.telefone,
    pedido.cpf,
    pedido.endereco,
    pedido.cidade,
    pedido.estado,
    pedido.cep,
    pedido.status || 'Novo pedido',
    pedido.bonus_escolhido || null,
    pedido.tipo_trofeu || 'Não informado'
  );
  
  return result.lastInsertRowid;
}

/**
 * Busca todos os pedidos do banco de dados
 * @returns {Array} Lista de pedidos
 */
function getPedidos() {
  return db.prepare(`
    SELECT id, nome, email, telefone, cpf, endereco, cidade, estado, cep, 
           rastreio, status, bonus_escolhido, tipo_trofeu,
           strftime('%d/%m/%Y %H:%M', criado_em) as criado_em,
           strftime('%d/%m/%Y %H:%M', atualizado_em) as atualizado_em
    FROM pedidos
    ORDER BY criado_em DESC
  `).all();
}

/**
 * Atualiza o status e/ou código de rastreio de um pedido
 * @param {Number} id - ID do pedido
 * @param {String} status - Novo status do pedido
 * @param {String} rastreio - Código de rastreio (opcional)
 * @returns {Object} Pedido atualizado
 */
function updateStatus(id, status, rastreio) {
  const stmt = db.prepare(`
    UPDATE pedidos 
    SET status = COALESCE(?, status), 
        rastreio = COALESCE(?, rastreio)
    WHERE id = ?
    RETURNING *
  `);
  
  return stmt.get(status, rastreio, id);
}

module.exports = { 
  insertPedido, 
  getPedidos, 
  updateStatus 
};
