import fetch from 'node-fetch';

async function adicionarPedidoTeste() {
  const pedidoTeste = {
    nome: "Cliente Teste",
    email: "teste@example.com",
    telefone: "11999999999",
    cpf: "123.456.789-00",
    endereco: "Rua Teste, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01001-000",
    bonus_escolhido: "Bônus de Teste"
  };

  try {
    console.log('Enviando pedido de teste para a API...');
    const response = await fetch('http://localhost:3000/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoTeste),
    });

    const data = await response.json();
    console.log('Resposta da API:', data);
    
    if (response.ok) {
      console.log('✅ Pedido de teste adicionado com sucesso!');
      console.log('ID do pedido:', data.id);
    } else {
      console.error('❌ Erro ao adicionar pedido de teste:', data);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executa a função
adicionarPedidoTeste();
