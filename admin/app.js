// Configurações da API (definidas em config.js)
console.log('Configurações da API:', window.API_CONFIG);
const API_BASE_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:3000';
const PEDIDOS_ENDPOINT = `${API_BASE_URL}/pedidos`;
console.log('API_BASE_URL:', API_BASE_URL);
console.log('PEDIDOS_ENDPOINT:', PEDIDOS_ENDPOINT);

// Configurações de requisição padrão
const DEFAULT_REQUEST_OPTIONS = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Estado da aplicação
let state = {
    pedidos: [],
    pedidosFiltrados: [],
    filtros: {
        status: '',
        busca: ''
    },
    paginacao: {
        paginaAtual: 1,
        itensPorPagina: 10,
        totalItens: 0
    },
    pedidoSelecionado: null
};

// Elementos da interface
const elementos = {
    // Tabela e lista
    tabelaPedidos: document.getElementById('pedidos-table'),
    corpoTabela: document.getElementById('pedidos-body'),
    templatePedido: document.getElementById('pedido-template'),
    
    // Filtros
    filtroStatus: document.getElementById('status-filter'),
    inputBusca: document.getElementById('search'),
    btnAplicarFiltros: document.getElementById('apply-filters'),
    btnResetarFiltros: document.getElementById('reset-filters'),
    
    // Paginação
    btnPaginaAnterior: document.getElementById('prev-page'),
    btnProximaPagina: document.getElementById('next-page'),
    infoPaginacao: document.getElementById('page-info'),
    infoContagem: document.getElementById('showing-count'),
    infoTotal: document.getElementById('total-count'),
    
    // Modal
    modal: document.getElementById('pedido-modal'),
    modalTitulo: document.getElementById('pedido-id'),
    btnFecharModal: document.querySelector('.close-modal'),
    btnFecharModalFooter: document.getElementById('fechar-modal'),
    
    // Detalhes do pedido no modal
    clienteNome: document.getElementById('cliente-nome'),
    clienteEmail: document.getElementById('cliente-email'),
    clienteTelefone: document.getElementById('cliente-telefone'),
    clienteCpf: document.getElementById('cliente-cpf'),
    enderecoCompleto: document.getElementById('endereco-completo'),
    clienteCep: document.getElementById('cliente-cep'),
    bonusEscolhido: document.getElementById('bonus-escolhido'),
    tipoTrofeu: document.getElementById('tipo-trofeu'),
    historicoAtualizacoes: document.getElementById('historico-atualizacoes'),
    
    // Formulário de atualização
    selectStatus: document.getElementById('novo-status'),
    inputRastreio: document.getElementById('codigo-rastreio'),
    btnAtualizarStatus: document.getElementById('atualizar-status'),
    btnNotificarCliente: document.getElementById('enviar-notificacao'),
    
    // Status da API
    statusIndicator: document.getElementById('api-status'),
    statusDot: document.querySelector('.status-dot')
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Configurar event listeners
    configurarEventListeners();
    
    // Carregar dados iniciais
    verificarConexaoAPI()
        .then(() => carregarPedidos())
        .catch(erro => {
            console.error('Erro ao conectar à API:', erro);
            mostrarErro('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        });
});

/**
 * Configura os event listeners da aplicação
 */
function configurarEventListeners() {
    // Filtros
    elementos.btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    elementos.btnResetarFiltros.addEventListener('click', resetarFiltros);
    elementos.inputBusca.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });
    
    // Paginação
    elementos.btnPaginaAnterior.addEventListener('click', () => mudarPagina(-1));
    elementos.btnProximaPagina.addEventListener('click', () => mudarPagina(1));
    
    // Modal
    elementos.btnFecharModal.addEventListener('click', fecharModal);
    elementos.btnFecharModalFooter.addEventListener('click', fecharModal);
    window.addEventListener('click', (e) => {
        if (e.target === elementos.modal) fecharModal();
    });
    
    // Atualização de status
    elementos.btnAtualizarStatus.addEventListener('click', atualizarStatusPedido);
    elementos.btnNotificarCliente.addEventListener('click', notificarCliente);
    
    // Atualização manual
    document.getElementById('refresh-btn').addEventListener('click', () => {
        carregarPedidos();
        mostrarMensagem('Lista de pedidos atualizada!');
    });
}

/**
 * Verifica a conexão com a API
 */
async function verificarConexaoAPI() {
    try {
        atualizarStatusConexao('connecting');
        console.log('Iniciando verificação de conexão com a API...');
        
        const resposta = await fetch(PEDIDOS_ENDPOINT, {
            method: 'GET',
            ...DEFAULT_REQUEST_OPTIONS,
            headers: {
                ...DEFAULT_REQUEST_OPTIONS.headers
            }
        });
        
        console.log('Resposta da API:', {
            ok: resposta.ok,
            status: resposta.status,
            statusText: resposta.statusText,
            headers: Object.fromEntries(resposta.headers.entries())
        });
        
        if (resposta.ok) {
            const dados = await resposta.json();
            console.log('Dados recebidos:', dados);
            atualizarStatusConexao('connected');
            return true;
        } else {
            const erro = new Error(`Erro na API: ${resposta.status} ${resposta.statusText}`);
            console.error('Erro na resposta da API:', erro);
            throw erro;
        }
    } catch (erro) {
        console.error('Erro na conexão com a API:', erro);
        atualizarStatusConexao('error');
        mostrarErro('Não foi possível conectar ao servidor. Verifique se a API está rodando e tente novamente.');
        throw erro;
    }
}

/**
 * Atualiza o indicador de status da conexão
 * @param {string} status - Estado da conexão (connecting, connected, error)
 */
function atualizarStatusConexao(status) {
    elementos.statusIndicator.className = 'status-indicator';
    elementos.statusIndicator.classList.add(status);
    
    const statusText = {
        'connecting': 'Conectando...',
        'connected': 'Conectado',
        'error': 'Erro de conexão'
    };
    
    elementos.statusIndicator.querySelector('span:last-child').textContent = statusText[status] || '';
}

/**
 * Carrega a lista de pedidos da API
 */
async function carregarPedidos() {
    try {
        mostrarCarregamento(true);
        console.log('Carregando pedidos...');
        
        const resposta = await fetch(PEDIDOS_ENDPOINT, {
            method: 'GET',
            ...DEFAULT_REQUEST_OPTIONS,
            headers: {
                ...DEFAULT_REQUEST_OPTIONS.headers
            }
        });
        
        console.log('Resposta ao carregar pedidos:', {
            ok: resposta.ok,
            status: resposta.status,
            statusText: resposta.statusText
        });
        
        if (!resposta.ok) {
            const erro = new Error(`Erro ao carregar pedidos: ${resposta.status} ${resposta.statusText}`);
            console.error(erro);
            throw erro;
        }
        
        const pedidos = await resposta.json();
        console.log('Pedidos recebidos:', pedidos);
        
        state.pedidos = Array.isArray(pedidos) 
            ? pedidos.map(pedido => ({
                ...pedido,
                // Garante que as datas sejam objetos Date
                criado_em: pedido.criado_em ? new Date(pedido.criado_em) : new Date(),
                atualizado_em: pedido.atualizado_em ? new Date(pedido.atualizado_em) : new Date()
              }))
            : [];
            
        console.log('Pedidos processados:', state.pedidos);
        
        // Aplicar filtros atuais
        aplicarFiltros();
        
    } catch (erro) {
        console.error('Erro ao carregar pedidos:', erro);
        mostrarErro('Não foi possível carregar os pedidos. Verifique sua conexão e tente novamente.');
    } finally {
        mostrarCarregamento(false);
    }
}

/**
 * Aplica os filtros atuais à lista de pedidos
 */
function aplicarFiltros() {
    // Obter valores dos filtros
    state.filtros.status = elementos.filtroStatus.value;
    state.filtros.busca = elementos.inputBusca.value.toLowerCase();
    
    // Aplicar filtros
    state.pedidosFiltrados = state.pedidos.filter(pedido => {
        const correspondeStatus = !state.filtros.status || 
                               pedido.status.toLowerCase() === state.filtros.status.toLowerCase();
        
        const correspondeBusca = !state.filtros.busca || 
                              pedido.nome.toLowerCase().includes(state.filtros.busca) ||
                              pedido.email.toLowerCase().includes(state.filtros.busca) ||
                              pedido.telefone.includes(state.filtros.busca);
        
        return correspondeStatus && correspondeBusca;
    });
    
    // Resetar para a primeira página
    state.paginacao.paginaAtual = 1;
    state.paginacao.totalItens = state.pedidosFiltrados.length;
    
    // Atualizar a interface
    atualizarTabela();
    atualizarControlesPaginacao();
}

/**
 * Reseta todos os filtros
 */
function resetarFiltros() {
    elementos.filtroStatus.value = '';
    elementos.inputBusca.value = '';
    aplicarFiltros();
}

/**
 * Atualiza a tabela de pedidos com os dados atuais
 */
function atualizarTabela() {
    // Limpar tabela
    elementos.corpoTabela.innerHTML = '';
    
    if (state.pedidosFiltrados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="6" class="text-center">
                Nenhum pedido encontrado com os filtros atuais.
            </td>
        `;
        elementos.corpoTabela.appendChild(tr);
        return;
    }
    
    // Calcular itens para a página atual
    const inicio = (state.paginacao.paginaAtual - 1) * state.paginacao.itensPorPagina;
    const fim = inicio + state.paginacao.itensPorPagina;
    const pedidosPagina = state.pedidosFiltrados.slice(inicio, fim);
    
    // Preencher tabela
    pedidosPagina.forEach(pedido => {
        const clone = elementos.templatePedido.content.cloneNode(true);
        const tr = clone.querySelector('tr');
        
        // Preencher dados
        tr.querySelector('.pedido-id').textContent = pedido.id;
        tr.querySelector('.pedido-nome').textContent = pedido.nome;
        tr.querySelector('.pedido-telefone').textContent = formatarTelefone(pedido.telefone);
        
        // Tipo de Troféu
        tr.querySelector('.pedido-tipo-trofeu').textContent = pedido.tipo_trofeu || 'Não informado';
        
        // Status
        const statusBadge = tr.querySelector('.status-badge');
        statusBadge.textContent = pedido.status;
        statusBadge.className = 'status-badge ' + obterClasseStatus(pedido.status);
        
        // Data formatada
        tr.querySelector('.pedido-data').textContent = formatarData(pedido.criado_em);
        
        // Botões de ação
        tr.querySelector('.btn-view').addEventListener('click', () => abrirModalPedido(pedido.id));
        tr.querySelector('.btn-edit').addEventListener('click', () => abrirModalPedido(pedido.id, true));
        
        elementos.corpoTabela.appendChild(clone);
    });
    
    // Atualizar informações de paginação
    elementos.infoTotal.textContent = state.pedidosFiltrados.length;
    elementos.infoContagem.textContent = pedidosPagina.length;
}

/**
 * Atualiza os controles de paginação
 */
function atualizarControlesPaginacao() {
    const totalPaginas = Math.ceil(state.pedidosFiltrados.length / state.paginacao.itensPorPagina);
    
    // Atualizar informações da página
    elementos.infoPaginacao.textContent = `Página ${state.paginacao.paginaAtual} de ${totalPaginas || 1}`;
    
    // Habilitar/desabilitar botões
    elementos.btnPaginaAnterior.disabled = state.paginacao.paginaAtual <= 1;
    elementos.btnProximaPagina.disabled = state.paginacao.paginaAtual >= totalPaginas;
}

/**
 * Muda a página atual
 * @param {number} direcao - 1 para próxima página, -1 para página anterior
 */
function mudarPagina(direcao) {
    const novaPagina = state.paginacao.paginaAtual + direcao;
    const totalPaginas = Math.ceil(state.pedidosFiltrados.length / state.paginacao.itensPorPagina);
    
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        state.paginacao.paginaAtual = novaPagina;
        atualizarTabela();
        atualizarControlesPaginacao();
        
        // Rolar para o topo da tabela
        elementos.tabelaPedidos.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Abre o modal com os detalhes de um pedido
 * @param {number} pedidoId - ID do pedido
 * @param {boolean} modoEdicao - Se verdadeiro, abre o modal em modo de edição
 */
async function abrirModalPedido(pedidoId, modoEdicao = false) {
    try {
        mostrarCarregamento(true);
        
        // Encontrar o pedido na lista
        const pedido = state.pedidos.find(p => p.id === pedidoId);
        
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }
        
        state.pedidoSelecionado = pedido;
        
        // Preencher dados do modal
        elementos.modalTitulo.textContent = `#${pedido.id}`;
        elementos.clienteNome.textContent = pedido.nome;
        elementos.clienteEmail.textContent = pedido.email;
        elementos.clienteTelefone.textContent = formatarTelefone(pedido.telefone);
        elementos.clienteCpf.textContent = formatarCPF(pedido.cpf);
        elementos.enderecoCompleto.textContent = 
            `${pedido.endereco}, ${pedido.cidade} - ${pedido.estado}`;
        elementos.clienteCep.textContent = formatarCEP(pedido.cep);
        elementos.bonusEscolhido.textContent = pedido.bonus_escolhido?.trim() || 'Sem bônus';
        elementos.tipoTrofeu.textContent = pedido.tipo_trofeu || 'Não informado';
        
        // Preencher status atual
        elementos.selectStatus.value = pedido.status || 'Novo pedido';
        
        // Preencher código de rastreio se existir
        elementos.inputRastreio.value = pedido.rastreio || '';
        
        // Carregar histórico de atualizações
        await carregarHistoricoPedido(pedido.id);
        
        // Mostrar o modal
        elementos.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Se estiver em modo de edição, focar no campo de status
        if (modoEdicao) {
            setTimeout(() => {
                elementos.selectStatus.focus();
            }, 300);
        }
        
    } catch (erro) {
        console.error('Erro ao abrir modal do pedido:', erro);
        mostrarErro('Não foi possível carregar os detalhes do pedido.');
    } finally {
        mostrarCarregamento(false);
    }
}

/**
 * Carrega o histórico de atualizações de um pedido
 * @param {number} pedidoId - ID do pedido
 */
async function carregarHistoricoPedido(pedidoId) {
    try {
        // Simulação de histórico - em uma aplicação real, isso viria da API
        const historico = [
            {
                data: new Date(),
                status: 'Novo pedido',
                mensagem: 'Pedido criado pelo cliente.'
            },
            // Mais entradas de histórico seriam adicionadas aqui
        ];
        
        // Atualizar a interface
        const historicoHTML = historico.map(item => `
            <li>
                <strong>${formatarDataHora(item.data)}</strong> - 
                <span class="${obterClasseStatus(item.status)}">${item.status}</span>
                ${item.mensagem ? `<br>${item.mensagem}` : ''}
            </li>
        `).join('');
        
        elementos.historicoAtualizacoes.innerHTML = historicoHTML;
        
    } catch (erro) {
        console.error('Erro ao carregar histórico:', erro);
        elementos.historicoAtualizacoes.innerHTML = '<li>Não foi possível carregar o histórico de atualizações.</li>';
    }
}

/**
 * Atualiza o status de um pedido
 */
async function atualizarStatusPedido() {
    if (!state.pedidoSelecionado) return;
    
    const novoStatus = elementos.selectStatus.value;
    const codigoRastreio = elementos.inputRastreio.value.trim() || null;
    
    try {
        mostrarCarregamento(true);
        
        const resposta = await fetch(`${PEDIDOS_ENDPOINT}/${state.pedidoSelecionado.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: novoStatus,
                rastreio: codigoRastreio
            })
        });
        
        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
        }
        
        // Atualizar o pedido localmente
        const pedidoAtualizado = await resposta.json();
        const index = state.pedidos.findIndex(p => p.id === pedidoAtualizado.id);
        
        if (index !== -1) {
            state.pedidos[index] = {
                ...pedidoAtualizado,
                criado_em: new Date(pedidoAtualizado.criado_em),
                atualizado_em: new Date(pedidoAtualizado.atualizado_em)
            };
            
            // Atualizar o pedido selecionado
            state.pedidoSelecionado = state.pedidos[index];
            
            // Atualizar a tabela
            aplicarFiltros();
            
            // Mostrar mensagem de sucesso
            mostrarMensagem('Status do pedido atualizado com sucesso!');
            
            // Atualizar o histórico
            await carregarHistoricoPedido(pedidoAtualizado.id);
        }
        
    } catch (erro) {
        console.error('Erro ao atualizar status do pedido:', erro);
        mostrarErro('Não foi possível atualizar o status do pedido. Tente novamente.');
    } finally {
        mostrarCarregamento(false);
    }
}

/**
 * Envia uma notificação para o cliente
 */
async function notificarCliente() {
    if (!state.pedidoSelecionado) return;
    
    try {
        mostrarCarregamento(true);
        
        // Aqui você implementaria o envio da notificação
        // Por exemplo, usando a API de notificação configurada
        
        // Simulação de envio
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        mostrarMensagem('Notificação enviada com sucesso!');
        
    } catch (erro) {
        console.error('Erro ao enviar notificação:', erro);
        mostrarErro('Não foi possível enviar a notificação. Tente novamente.');
    } finally {
        mostrarCarregamento(false);
    }
}

/**
 * Fecha o modal de detalhes do pedido
 */
function fecharModal() {
    elementos.modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Limpar seleção após a animação
    setTimeout(() => {
        state.pedidoSelecionado = null;
    }, 300);
}

/**
 * Formata um número de telefone
 */
function formatarTelefone(telefone) {
    if (!telefone) return '';
    
    // Remove tudo que não for dígito
    const numeros = telefone.replace(/\D/g, '');
    
    // Formatação para celular (XX) XXXXX-XXXX
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    // Formatação para telefone fixo (XX) XXXX-XXXX
    if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    // Retorna o número sem formatação se não for possível formatar
    return telefone;
}

/**
 * Formata um CPF
 */
function formatarCPF(cpf) {
    if (!cpf) return '';
    
    // Remove tudo que não for dígito
    const numeros = cpf.replace(/\D/g, '');
    
    // Formatação XXX.XXX.XXX-XX
    if (numeros.length === 11) {
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
}

/**
 * Formata um CEP
 */
function formatarCEP(cep) {
    if (!cep) return '';
    
    // Remove tudo que não for dígito
    const numeros = cep.replace(/\D/g, '');
    
    // Formatação XXXXX-XXX
    if (numeros.length === 8) {
        return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    
    return cep;
}

/**
 * Formata uma data para exibição
 */
function formatarData(data) {
    if (!(data instanceof Date)) {
        data = new Date(data);
    }
    
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formata data e hora para exibição
 */
function formatarDataHora(data) {
    if (!(data instanceof Date)) {
        data = new Date(data);
    }
    
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Retorna a classe CSS para um status específico
 */
function obterClasseStatus(status) {
    if (!status) return '';
    
    const statusClasses = {
        'novo pedido': 'status-novo',
        'em processamento': 'status-processando',
        'enviado': 'status-enviado',
        'entregue': 'status-entregue',
        'cancelado': 'status-cancelado'
    };
    
    return statusClasses[status.toLowerCase()] || '';
}

/**
 * Mostra um indicador de carregamento
 */
function mostrarCarregamento(mostrar) {
    const loadingElements = document.querySelectorAll('.loading-indicator');
    
    if (mostrar) {
        document.body.style.cursor = 'wait';
        loadingElements.forEach(el => el.classList.add('active'));
    } else {
        document.body.style.cursor = '';
        loadingElements.forEach(el => el.classList.remove('active'));
    }
}

/**
 * Mostra uma mensagem de sucesso
 */
function mostrarMensagem(mensagem) {
    // Implementação simplificada - você pode usar uma biblioteca como Toastify.js
    console.log('SUCESSO:', mensagem);
    alert(mensagem);
}

/**
 * Mostra uma mensagem de erro
 */
function mostrarErro(mensagem) {
    // Implementação simplificada
    console.error('ERRO:', mensagem);
    alert(`ERRO: ${mensagem}`);
}
