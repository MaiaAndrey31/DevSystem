const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('Inicializando banco de dados...');

const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'pedidos.db');

// Garantir que o diretório do banco de dados existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Diretório do banco de dados criado em: ${dbDir}`);
}

// Conectar ao banco de dados
const db = new Database(dbPath);
console.log(`Conectado ao banco de dados em: ${dbPath}`);

// Criar a tabela de links se não existir
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Criar trigger para atualizar o campo updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_links_timestamp
    AFTER UPDATE ON links
    BEGIN
      UPDATE links SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log('Tabela de links inicializada com sucesso!');
} catch (error) {
  console.error('Erro ao inicializar o banco de dados:', error);
  process.exit(1);
} finally {
  // Fechar a conexão com o banco de dados
  db.close();
  console.log('Conexão com o banco de dados encerrada.');
}
