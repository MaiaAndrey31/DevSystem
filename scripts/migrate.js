const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuração do banco de dados
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/pedidos.db');
const dbDir = path.dirname(dbPath);

// Criar diretório do banco de dados se não existir
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Diretório criado: ${dbDir}`);
}

// Conectar ao banco de dados
const db = new Database(dbPath);

// Habilitar chaves estrangeiras
db.pragma('foreign_keys = ON');

// Criar tabelas
try {
    // Iniciar transação
    db.exec('BEGIN TRANSACTION');

    // Tabela de pedidos
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
            status TEXT NOT NULL DEFAULT 'Novo pedido',
            bonus_escolhido TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Criar índices
    db.exec('CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em ON pedidos(criado_em)');
    
    // Tabela de histórico de status (opcional, para rastrear mudanças de status)
    db.exec(`
        CREATE TABLE IF NOT EXISTS historico_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            status_anterior TEXT,
            novo_status TEXT NOT NULL,
            rastreio TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        )
    `);
    
    // Trigger para atualizar a data de atualização
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS atualiza_data_atualizacao
        AFTER UPDATE ON pedidos
        BEGIN
            UPDATE pedidos 
            SET atualizado_em = CURRENT_TIMESTAMP 
            WHERE id = NEW.id;
        END;
    `);
    
    // Trigger para registrar mudanças de status
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS registrar_mudanca_status
        AFTER UPDATE ON pedidos
        WHEN OLD.status IS NOT NEW.status OR OLD.rastreio IS NOT NEW.rastreio
        BEGIN
            INSERT INTO historico_status (pedido_id, status_anterior, novo_status, rastreio)
            VALUES (NEW.id, OLD.status, NEW.status, NEW.rastreio);
        END;
    `);
    
    // Commit da transação
    db.exec('COMMIT');
    
    console.log('✅ Migração concluída com sucesso!');
    console.log(`📁 Banco de dados: ${dbPath}`);
    
} catch (error) {
    // Em caso de erro, faz rollback
    db.exec('ROLLBACK');
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
} finally {
    // Fechar conexão com o banco de dados
    db.close();
}
