# Configuração da Conta de Serviço do Google

Para integrar com o Google Sheets, siga estas etapas:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API Google Sheets para o projeto
4. Vá para "APIs e Serviços" > "Credenciais"
5. Clique em "Criar Credenciais" e selecione "Conta de serviço"
6. Preencha os detalhes da conta de serviço e clique em "Criar"
7. Atribua a função "Editor" à conta de serviço
8. Clique em "Concluído"
9. Na lista de contas de serviço, encontre a que você criou e clique no ícone de três pontos > "Gerenciar chaves"
10. Clique em "Adicionar Chave" > "Criar nova chave"
11. Escolha o formato JSON e clique em "Criar"
12. O arquivo JSON será baixado automaticamente
13. Renomeie o arquivo baixado para `service-account.json` e mova para a pasta `config/`
14. Compartilhe sua planilha do Google com o e-mail da conta de serviço (encontrado no campo "client_email" do JSON)

⚠️ **Importante:** Nunca faça commit do arquivo `service-account.json` no controle de versão. Ele contém informações sensíveis.

## Estrutura do arquivo service-account.json

O arquivo deve ter uma estrutura semelhante a esta:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "sua_chave_privada_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n",
  "client_email": "sua-conta-de-servico@seu-projeto.iam.gserviceaccount.com",
  "client_id": "seu_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sua-conta-de-servico%40seu-projeto.iam.gserviceaccount.com"
}
```

## Solução de Problemas

- **Erro de permissão:** Certifique-se de que o e-mail da conta de serviço tem permissão para editar a planilha
- **API não habilitada:** Verifique se a API Google Sheets está habilitada no seu projeto
- **Credenciais inválidas:** Verifique se o arquivo JSON está íntegro e contém as informações corretas
