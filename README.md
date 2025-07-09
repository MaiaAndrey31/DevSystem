# API Trofy

Sistema de gerenciamento de pedidos para a Trofy, incluindo painel administrativo e integração com Google Sheets e serviço de notificação por WhatsApp.

## 🚀 Funcionalidades

- Cadastro de novos pedidos
- Acompanhamento de status de pedidos
- Painel administrativo responsivo
- Integração com Google Sheets
- Notificações automáticas por WhatsApp
- Banco de dados SQLite local

## 🛠️ Pré-requisitos

- Node.js 16.x ou superior
- npm 8.x ou superior
- Conta de serviço do Google Cloud para integração com Google Sheets

## 🚀 Instalação

1. **Clonar o repositório**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd api-trofy
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```env
   PORT=3000
   NODE_ENV=development
   GOOGLE_SHEETS_ID=sua_planilha_id
   ```

4. **Configurar credenciais do Google**
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou selecione um existente
   - Ative a API Google Sheets
   - Crie uma conta de serviço
   - Baixe o arquivo JSON de credenciais
   - Salve como `config/service-account.json`
   - Compartilhe sua planilha do Google com o e-mail da conta de serviço

5. **Iniciar o servidor**
   ```bash
   # Modo desenvolvimento (com recarregamento automático)
   npm run dev

   # Modo produção
   npm start
   ```

6. **Acessar o painel administrativo**
   Abra o navegador e acesse:
   ```
   http://localhost:3000/admin
   ```

## 🗃️ Estrutura do Projeto

```
/api
  server.js       # Ponto de entrada da API
  db.js          # Configuração do banco de dados
  sheets.js      # Integração com Google Sheets
  ia.js          # Integração com serviço de IA/WhatsApp
/admin
  index.html     # Painel administrativo
  app.js         # Lógica do frontend
  style.css      # Estilos do painel
/database
  pedidos.db     # Banco de dados SQLite
/config
  service-account.json  # Credenciais do Google
```

## 🔄 Rotas da API

- `POST /pedidos` - Criar novo pedido
- `PUT /pedidos/:id` - Atualizar status de um pedido
- `GET /pedidos` - Listar todos os pedidos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça o push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✉️ Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/api-trofy](https://github.com/seu-usuario/api-trofy)
