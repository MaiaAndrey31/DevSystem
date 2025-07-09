const Database = require('better-sqlite3');
const path = require('path');

// Caminho para o banco de dados SQLite
const dbPath = path.join(__dirname, '..', 'pedidos.db');
const db = new Database(dbPath);

// Executar a migração
try {
    console.log('Iniciando migração: Adicionando coluna tipo_trofeu à tabela pedidos...');
    
    // Verificar se a coluna já existe
    const columnExists = db.prepare(`
        SELECT COUNT(*) as count 
        FROM pragma_table_info('pedidos') 
        WHERE name = 'tipo_trofeu'
    `).get();

    if (columnExists.count === 0) {
        // Adicionar a nova coluna
        db.exec(`
            ALTER TABLE pedidos 
            ADD COLUMN tipo_trofeu TEXT
        `);
        console.log('Migração concluída com sucesso: Coluna tipo_trofeu adicionada.');
    } else {
        console.log('A coluna tipo_trofeu já existe na tabela pedidos.');
    }
} catch (error) {
    console.error('Erro durante a migração:', error.message);
} finally {
    // Fechar a conexão com o banco de dados
    db.close();
}
