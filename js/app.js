let currentUser = null;
let currentEmployee = null;
let currentUnit = null;

// Unidades oficiais da rede municipal consultadas no portal da Secretaria Municipal de Saúde.
const unidadesSaude = {
    'Hospitais Municipais': [
        'Hospital Municipal Souza Aguiar',
        'Hospital Municipal Miguel Couto',
        'Hospital Municipal Salgado Filho',
        'Hospital Municipal Lourenço Jorge',
        'Hospital Municipal Pedro II',
        'Hospital Municipal Evandro Freire',
        'Hospital Municipal Rocha Faria',
        'Hospital Municipal Rocha Maia',
        'Hospital Municipal Francisco da Silva Telles',
        'Hospital Municipal Albert Schweitzer',
        'Hospital Municipal Paulino Werneck',
        'Hospital Municipal Jurandir Manfredini'
    ],
    'Maternidades': [
        'Hospital Maternidade Fernando Magalhães',
        'Hospital Maternidade Carmela Dutra',
        'Hospital Maternidade Herculano Pinheiro',
        'Hospital Maternidade Alexander Fleming',
        'Hospital Maternidade Maria Amélia Buarque de Hollanda',
        'Maternidade Leila Diniz',
        'Maternidade da Rocinha',
        'Hospital Maternidade Paulino Werneck',
        'Hospital da Mulher Mariska Ribeiro'
    ],
    'UPAs 24 Horas': [
        'UPA Rocinha',
        'UPA Complexo do Alemão',
        'UPA Manguinhos',
        'UPA Del Castilho',
        'UPA Engenho de Dentro',
        'UPA Madureira',
        'UPA Costa Barros',
        'UPA Rocha Miranda',
        'UPA Cidade de Deus',
        'UPA Vila Kennedy',
        'UPA Senador Camará',
        'UPA Magalhães Bastos',
        'UPA Sepetiba',
        'UPA Paciência',
        'UPA João XXIII (Santa Cruz)'
    ],
    'CER / Emergência': [
        'CER Barra da Tijuca',
        'CER Campo Grande',
        'CER Centro',
        'CER Leblon',
        'CER Ilha',
        'CER Santa Cruz'
    ]
};

function listaUnidades() {
    return Object.values(unidadesSaude).flat();
}

function preencherSelectUnidades(id, incluirTodas = false) {
    const select = document.getElementById(id);
    if (!select) return;
    const valorAtual = select.value;
    select.innerHTML = `<option value="">${incluirTodas ? 'Selecione a unidade...' : 'Selecione...'}</option>`;
    if (incluirTodas) {
        const optTodas = document.createElement('option');
        optTodas.value = '__TODAS__';
        optTodas.textContent = 'Todas as unidades (visão administrativa)';
        select.appendChild(optTodas);
    }
    Object.entries(unidadesSaude).forEach(([grupo, unidades]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = grupo;
        unidades.forEach(unidade => {
            const opt = document.createElement('option');
            opt.value = unidade;
            opt.textContent = unidade;
            optgroup.appendChild(opt);
        });
        select.appendChild(optgroup);
    });
    if ([...select.options].some(o => o.value === valorAtual)) select.value = valorAtual;
}

function inicializarUnidades() {
    preencherSelectUnidades('loginUnidade');
    preencherSelectUnidades('funcUnidade');
    preencherSelectUnidades('chamadoUnidade');
}

function unidadeAtualPermiteRegistro(unidade) {
    return currentUnit === '__TODAS__' || currentUnit === unidade;
}

function chamadosDaUnidadeAtual() {
    if (currentUser === 'admin' || currentUser === 'tecnico') return chamados;

    if (currentUser === 'funcionario' && currentEmployee) {
        return chamados.filter(c => {
            const mesmoLogin = currentEmployee.login && c.login && c.login.toLowerCase() === currentEmployee.login.toLowerCase();
            const mesmoNome = c.nome && currentEmployee.nome && c.nome.toLowerCase() === currentEmployee.nome.toLowerCase();
            return mesmoLogin || mesmoNome;
        });
    }

    if (!currentUnit || currentUnit === '__TODAS__') return chamados;
    return chamados.filter(c => c.unidade === currentUnit);
}

function funcionariosDaUnidadeAtual() {
    if (!currentUnit || currentUnit === '__TODAS__') return funcionarios;
    return funcionarios.filter(f => f.unidade === currentUnit);
}

let targetInputId = null;
let mediaStream = null;
let termoBuscaGlobal = "";
let registroParaExcluir = null;
let tipoExclusao = null;
let inventarioEditIndex = null;
let funcionarioEditIndex = null;

let chamados = [
    { id: 1, nome: "Enfermeira Ana Paula", login: "ana.paula", setor: "Enfermagem", telefone: "(21) 97777-1111", unidade: "Hospital Maternidade Carmela Dutra", categoria: "Prontuário Eletrônico", descricao: "Erro ao salvar triagem obstétrica.", status: "aberto", solucao: "", avaliacao: null },
    { id: 2, nome: "Dr. Roberto Mendes", login: "roberto.mendes", setor: "Recepção da Emergência", telefone: "(21) 96666-2222", unidade: "Hospital Municipal Souza Aguiar", categoria: "Rede / Internet", descricao: "Queda de conexão recorrente no posto.", status: "andamento", solucao: "", avaliacao: null },
    { id: 3, nome: "Carlos Alberto", login: "carlos.alberto", setor: "Diretoria", telefone: "(21) 98888-3333", unidade: "Hospital Municipal Miguel Couto", categoria: "Equipamento Médico", descricao: "Manutenção preventiva em monitor.", status: "encerrado", solucao: "Substituição do cabo de força danificado e reconfiguração de IP.", avaliacao: "feliz" }
];
let funcionarios = [
    { nome: "Enfermeira Ana Paula", unidade: "Hospital Maternidade Carmela Dutra", setor: "Enfermagem", telefone: "(21) 97777-1111", login: "ana.paula", senha: "123" },
    { nome: "Dr. Roberto Mendes", unidade: "Hospital Municipal Souza Aguiar", setor: "Recepção da Emergência", telefone: "(21) 96666-2222", login: "roberto.mendes", senha: "123" },
    { nome: "Carlos Alberto", unidade: "Hospital Municipal Miguel Couto", setor: "Diretoria", telefone: "(21) 98888-3333", login: "carlos.alberto", senha: "123" }
];
let inventario = [
    { patrimonio: "P01", serial: "S1234", equipamento: "Desktop", marca: "Dell", setor: "Recepção da Emergência", responsavel: "Carlos Alberto", telefone: "(21) 98888-1111" }
];

const marcasGerais = ["Dell", "Positivo", "Daten", "Lenovo", "LG", "AOC", "Philips", "Samsung", "TCE", "Panasonic", "Sony", "Vizzion", "Itautec", "Outros"];
const marcasImpressora = ["Brother", "HP", "Lexmark", "Pantum", "Xerox", "Okidata", "Outros"];

function atualizarMarcas() {
    const selectEquip = document.getElementById('invEquipamento');
    const selectMarca = document.getElementById('invMarca');
    if (!selectEquip || !selectMarca) return;

    const tipo = selectEquip.value;
    const marcaAtual = selectMarca.value;
    selectMarca.innerHTML = '<option value="">Selecione a marca...</option>';

    let lista = marcasGerais;
    if (tipo === 'Impressora') {
        lista = marcasImpressora;
    } else if (!tipo) {
        selectMarca.innerHTML = '<option value="">Selecione primeiro</option>';
        return;
    }

    lista.forEach(marca => {
        const opt = document.createElement('option');
        opt.value = marca;
        opt.textContent = marca;
        selectMarca.appendChild(opt);
    });

    if ([...selectMarca.options].some(o => o.value === marcaAtual)) {
        selectMarca.value = marcaAtual;
    }
}

function atualizarRelogio() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    const relogioEl = document.getElementById('live-datetime');
    if (relogioEl) relogioEl.innerText = `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

const dadosPersistenciaProntos = restaurarDadosSistema();
inicializarUnidades();

window.addEventListener('DOMContentLoaded', () => {
    restaurarSessao();
});

document.getElementById('usuario')?.addEventListener('input', function() {
    const usuario = this.value.trim().toLowerCase();
    preencherSelectUnidades('loginUnidade', usuario === 'admin');
});

document.getElementById('loginUnidade')?.addEventListener('change', function() {
    const unidade = this.value;
    const usuario = document.getElementById('usuario')?.value.trim().toLowerCase();
    if (usuario !== 'admin') {
        currentUnit = unidade;
    }
});

function mostrarToast(titulo, mensagem) {
    document.getElementById('toast-title').innerText = titulo;
    document.getElementById('toast-message').innerText = mensagem;
    document.getElementById('toast-modal').style.display = 'flex';
}

function fecharToast() {
    document.getElementById('toast-modal').style.display = 'none';
}

function toggleMenuMobile() {
    const dropdown = document.getElementById('dropdownMenuMobile');
    if (dropdown) dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
}

window.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdownMenuMobile');
    const btnMenu = document.getElementById('btnMenuMobile');
    if (dropdown && btnMenu && !dropdown.contains(e.target) && !btnMenu.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

function construirMenuMobileDropdown() {
    const dropdown = document.getElementById('dropdownMenuMobile');
    if (!dropdown) return;
    dropdown.innerHTML = '';

    let itens = [];
    if (currentUser === 'admin') {
        itens = [
            { texto: '📋 Dashboard Administrativo', acao: () => rolarParaSecao('panel-admin') },
            { texto: '💻 Cadastrar Inventário', acao: () => rolarParaSecao('modulo-inventario') },
            { texto: '👥 Cadastrar Funcionário', acao: () => rolarParaSecao('modulo-cadastro') },
            { texto: '🛠️ Abrir Novo Chamado', acao: () => rolarParaSecao('modulo-abertura') }
        ];
    } else if (currentUser === 'tecnico') {
        itens = [
            { texto: '📋 Painel Técnico', acao: () => rolarParaSecao('panel-tecnico') },
            { texto: '💻 Cadastrar Inventário', acao: () => rolarParaSecao('modulo-inventario') },
            { texto: '👥 Cadastrar Funcionário', acao: () => rolarParaSecao('modulo-cadastro') },
            { texto: '🛠️ Abrir Novo Chamado', acao: () => rolarParaSecao('modulo-abertura') }
        ];
    } else {
        itens = [
            { texto: '👤 Área do Funcionário', acao: () => rolarParaSecao('panel-funcionario') },
            { texto: '🛠️ Abrir Novo Chamado', acao: () => rolarParaSecao('modulo-abertura') }
        ];
    }

    itens.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = item.texto;
        btn.onclick = () => {
            item.acao();
            dropdown.style.display = 'none';
        };
        dropdown.appendChild(btn);
    });
}

function rolarParaSecao(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setTimeout(salvarSessao, 350);
    }
}

let ultimoSalvamentoScroll = 0;
window.addEventListener('scroll', function() {
    if (!currentUser) return;
    const agora = Date.now();
    if (agora - ultimoSalvamentoScroll < 300) return;
    ultimoSalvamentoScroll = agora;
    salvarSessao();
}, { passive: true });

function executarBuscaGlobal() {
    const val = document.getElementById('globalSearchInput').value.trim();
    termoBuscaGlobal = val;
    document.getElementById('btn-limpar-busca').style.display = val ? 'inline-block' : 'none';
    renderizarTabelas();
    rolarParaSecao('tabelaChamados');
}

function limparBuscaGlobal() {
    document.getElementById('globalSearchInput').value = '';
    termoBuscaGlobal = '';
    document.getElementById('btn-limpar-busca').style.display = 'none';
    renderizarTabelas();
}

function tratarSelecaoDescricao(valor) {
    const txtArea = document.getElementById('chamadoDescricao');
    if (valor === 'outro') {
        txtArea.style.display = 'block';
        txtArea.value = '';
        txtArea.required = true;
    } else {
        txtArea.style.display = 'none';
        txtArea.value = valor;
        txtArea.required = false;
    }
}

function tratarSelecaoSolucao(valor) {
    const txtArea = document.getElementById('textoSolucao');
    if (valor === 'outro') {
        txtArea.style.display = 'block';
        txtArea.value = '';
        txtArea.required = true;
    } else {
        txtArea.style.display = 'none';
        txtArea.value = valor;
        txtArea.required = false;
    }
}

function abrirFormularioLogin() {
    const welcome = document.getElementById('login-welcome-screen');
    const formContainer = document.getElementById('login-form-container');
    if (welcome) welcome.style.display = 'none';
    if (formContainer) formContainer.classList.add('mobile-form-open');
}

function fecharFormularioLogin() {
    const welcome = document.getElementById('login-welcome-screen');
    const formContainer = document.getElementById('login-form-container');
    if (formContainer) formContainer.classList.remove('mobile-form-open');
    if (welcome) welcome.style.display = 'flex';
}

const STORAGE_SESSAO = 'helpdeskRioSaudeSessao';
const STORAGE_CHAMADOS = 'helpdeskRioSaudeChamados';
const STORAGE_FUNCIONARIOS = 'helpdeskRioSaudeFuncionarios';
const STORAGE_INVENTARIO = 'helpdeskRioSaudeInventario';
const STORAGE_DADOS_SESSAO = 'helpdeskRioSaudeDadosSessao';

const DB_NOME = 'HelpdeskRIOSaudeDB';
const DB_VERSAO = 1;
let bancoDados = null;

function abrirBancoDados() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB não disponível neste navegador.'));
            return;
        }
        const request = indexedDB.open(DB_NOME, DB_VERSAO);
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(DB_STORE)) {
                db.createObjectStore(DB_STORE, { keyPath: 'id' });
            }
        };
        request.onsuccess = function(event) {
            bancoDados = event.target.result;
            resolve(bancoDados);
        };
        request.onerror = function() {
            reject(request.error || new Error('Falha ao abrir o banco local.'));
        };
    });
}

function lerBancoDados() {
    return abrirBancoDados().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const request = store.get('principal');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    }));
}

function gravarBancoDados() {
    const dados = {
        id: 'principal',
        chamados: Array.isArray(chamados) ? chamados : [],
        funcionarios: Array.isArray(funcionarios) ? funcionarios : [],
        inventario: Array.isArray(inventario) ? inventario : [],
        salvoEm: Date.now()
    };
    return abrirBancoDados().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(dados);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error || new Error('Falha ao gravar no banco local.'));
        tx.onabort = () => reject(tx.error || new Error('Transação do banco cancelada.'));
    }));
}

function salvarDadosSistema() {
    const dados = {
        chamados: chamados,
        funcionarios: funcionarios,
        inventario: inventario,
        salvoEm: Date.now()
    };
    const texto = JSON.stringify(dados);

    try {
        localStorage.setItem(STORAGE_CHAMADOS, JSON.stringify(chamados));
        localStorage.setItem(STORAGE_FUNCIONARIOS, JSON.stringify(funcionarios));
        localStorage.setItem(STORAGE_INVENTARIO, JSON.stringify(inventario));
        localStorage.setItem(STORAGE_DADOS_SESSAO, texto);
        sessionStorage.setItem(STORAGE_DADOS_SESSAO, texto);
    } catch (erro) {
        console.warn('LocalStorage indisponível:', erro);
    }

    gravarBancoDados().catch(erro => {
        console.warn('Não foi possível gravar no banco IndexedDB:', erro);
    });
}

function aplicarDadosPersistidos(dados) {
    if (!dados) return;
    if (Array.isArray(dados.funcionarios)) funcionarios = dados.funcionarios;
    if (Array.isArray(dados.chamados)) chamados = dados.chamados;
    if (Array.isArray(dados.inventario)) inventario = dados.inventario;
}

function obterDadosStorage() {
    try {
        const backup = sessionStorage.getItem(STORAGE_DADOS_SESSAO) || localStorage.getItem(STORAGE_DADOS_SESSAO);
        if (backup) {
            const dados = JSON.parse(backup);
            if (dados && (Array.isArray(dados.funcionarios) || Array.isArray(dados.chamados) || Array.isArray(dados.inventario))) {
                return dados;
            }
        }

        const funcionariosSalvos = localStorage.getItem(STORAGE_FUNCIONARIOS);
        const chamadosSalvos = localStorage.getItem(STORAGE_CHAMADOS);
        const inventarioSalvo = localStorage.getItem(STORAGE_INVENTARIO);
        return {
            funcionarios: funcionariosSalvos ? JSON.parse(funcionariosSalvos) : funcionarios,
            chamados: chamadosSalvos ? JSON.parse(chamadosSalvos) : chamados,
            inventario: inventarioSalvo ? JSON.parse(inventarioSalvo) : inventario,
            salvoEm: 0
        };
    } catch (erro) {
        console.warn('Não foi possível ler os dados locais:', erro);
        return null;
    }
}

function restaurarDadosSistema() {
    const dadosStorage = obterDadosStorage();
    if (dadosStorage) aplicarDadosPersistidos(dadosStorage);

    return lerBancoDados().then(dadosBanco => {
        const dataStorage = Number(dadosStorage?.salvoEm || 0);
        const dataBanco = Number(dadosBanco?.salvoEm || 0);

        if (dadosBanco && dataBanco >= dataStorage) {
            aplicarDadosPersistidos(dadosBanco);
        } else if (dadosStorage) {
            return gravarBancoDados();
        } else {
            return gravarBancoDados();
        }
        return true;
    }).catch(erro => {
        console.warn('IndexedDB indisponível. O sistema continuará com armazenamento local:', erro);
        return false;
    });
}

function salvarSessao() {
    if (!currentUser || !currentUnit) return;
    const sessao = {
        currentUser,
        currentUnit,
        employeeLogin: currentEmployee?.login || null,
        employeeName: currentEmployee?.nome || null,
        funcionariosSnapshot: funcionarios,
        scrollY: window.scrollY || 0,
        pagina: document.querySelector('.card:target')?.id || null,
        timestamp: Date.now()
    };
    const dados = JSON.stringify(sessao);
    try {
        localStorage.setItem(STORAGE_SESSAO, dados);
        sessionStorage.setItem(STORAGE_SESSAO, dados);
    } catch (erro) {
        console.warn('Não foi possível salvar a sessão local:', erro);
    }
}

function limparSessaoSalva() {
    localStorage.removeItem(STORAGE_SESSAO);
    sessionStorage.removeItem(STORAGE_SESSAO);
    sessionStorage.removeItem(STORAGE_DADOS_SESSAO);
}

function obterSessaoSalva() {
    return sessionStorage.getItem(STORAGE_SESSAO) || localStorage.getItem(STORAGE_SESSAO);
}

function restaurarSessao() {
    try {
        const salvo = obterSessaoSalva();
        if (!salvo) return false;

        const sessao = JSON.parse(salvo);
        if (!sessao?.currentUser || !sessao?.currentUnit) return false;

        currentUser = sessao.currentUser;
        currentUnit = sessao.currentUnit;
        currentEmployee = null;

        if (Array.isArray(sessao.funcionariosSnapshot) && sessao.funcionariosSnapshot.length) {
            funcionarios = sessao.funcionariosSnapshot;
            try {
                localStorage.setItem(STORAGE_FUNCIONARIOS, JSON.stringify(funcionarios));
                sessionStorage.setItem(STORAGE_DADOS_SESSAO, JSON.stringify({
                    chamados, funcionarios, inventario, salvoEm: Date.now()
                }));
            } catch (erro) {
                console.warn('Não foi possível sincronizar o cadastro restaurado:', erro);
            }
        }

        if (currentUser === 'funcionario') {
            currentEmployee = funcionarios.find(f =>
                f.login && sessao.employeeLogin &&
                f.login.toLowerCase() === sessao.employeeLogin.toLowerCase()
            ) || null;

            if (!currentEmployee && sessao.employeeName) {
                currentEmployee = funcionarios.find(f =>
                    f.nome && f.nome.toLowerCase() === sessao.employeeName.toLowerCase()
                ) || null;
            }

            if (!currentEmployee) {
                limparSessaoSalva();
                currentUser = null;
                currentUnit = null;
                return false;
            }
        }

        const loginScreen = document.getElementById('login-screen');
        const appScreen = document.getElementById('app-screen');
        if (loginScreen) loginScreen.style.display = 'none';
        if (appScreen) appScreen.style.display = 'flex';

        aplicarPermissoesPerfil();
        construirMenuMobileDropdown();
        renderizarTabelas();

        salvarSessao();

        const restaurarPosicao = () => {
            const posicao = Number(sessao.scrollY) || 0;
            window.scrollTo({ top: posicao, left: 0, behavior: 'auto' });
        };
        requestAnimationFrame(restaurarPosicao);
        setTimeout(restaurarPosicao, 100);
        setTimeout(restaurarPosicao, 350);
        setTimeout(restaurarPosicao, 700);
        return true;
    } catch (erro) {
        console.warn('Não foi possível restaurar a sessão:', erro);
        return false;
    }
}

function realizarLogin(event) {
    event.preventDefault();
    const usuarioInput = document.getElementById('usuario').value.trim().toLowerCase();
    const senhaInput = document.getElementById('senha').value;
    const unidadeInput = document.getElementById('loginUnidade').value;

    if (!unidadeInput) {
        mostrarToast('Unidade obrigatória', 'Selecione a unidade de saúde antes de entrar no sistema.');
        return;
    }

    if (unidadeInput === '__TODAS__' && usuarioInput !== 'admin') {
        mostrarToast('Acesso restrito', 'A opção Todas as unidades está disponível somente para o administrador.');
        return;
    }

    let perfil = null;
    if (usuarioInput === 'admin' || usuarioInput === 'tecnico') {
        if (senhaInput !== '123') {
            mostrarToast('Atenção', 'Senha incorreta! Para este acesso, use a senha padrão: 123');
            return;
        }
        perfil = usuarioInput;
    } else {
        const funcionario = funcionarios.find(f => f.login && f.login.toLowerCase() === usuarioInput);
        if (!funcionario) {
            mostrarToast('Erro de Login', 'Login não encontrado. Verifique o login informado.');
            return;
        }
        if ((funcionario.senha || '123') !== senhaInput) {
            mostrarToast('Atenção', 'Senha incorreta. Verifique a senha cadastrada para este usuário.');
            return;
        }
        if (funcionario.unidade !== unidadeInput) {
            mostrarToast('Unidade incorreta', `Este usuário está cadastrado na unidade ${funcionario.unidade}. Selecione a unidade correta para entrar.`);
            return;
        }
        perfil = 'funcionario';
        currentEmployee = funcionario;
    }

    if (perfil) {
        currentUser = perfil;
        if (perfil !== 'funcionario') currentEmployee = null;
        currentUnit = unidadeInput;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'flex';
        
        aplicarPermissoesPerfil();
        construirMenuMobileDropdown();
        renderizarTabelas();
        salvarSessao();
        mostrarToast('Bem-vindo!', `Sessão iniciada como ${currentUser.toUpperCase()} — ${currentUnit === '__TODAS__' ? 'Todas as unidades' : currentUnit}`);
    } else {
        mostrarToast('Erro de Login', 'Usuário ou senha não reconhecidos. Use um acesso administrativo ou um login cadastrado.');
    }
}

function realizarLogout() {
    limparSessaoSalva();
    currentUser = null;
    currentEmployee = null;
    currentUnit = null;
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('loginForm').reset();
    fecharFormularioLogin();
    limparBuscaGlobal();
    if (typeof cancelarEdicaoOuEncerramento === 'function') cancelarEdicaoOuEncerramento();
    if (typeof fecharScanner === 'function') fecharScanner();
}

function aplicarPermissoesPerfil() {
    const appScreen = document.getElementById('app-screen');
    if (appScreen) appScreen.classList.toggle('admin-mode', currentUser === 'admin');

    document.getElementById('panel-admin').style.display = (currentUser === 'admin') ? 'block' : 'none';
    document.getElementById('panel-tecnico').style.display = (currentUser === 'tecnico') ? 'block' : 'none';
    document.getElementById('panel-funcionario').style.display = (currentUser === 'funcionario') ? 'block' : 'none';

    const modInv = document.getElementById('modulo-inventario');
    const modCad = document.getElementById('modulo-cadastro');

    if (currentUser === 'funcionario') {
        if (modInv) modInv.style.display = 'none';
        if (modCad) modCad.style.display = 'none';
    } else {
        if (modInv) modInv.style.display = 'block';
        if (modCad) modCad.style.display = 'block';
    }

    let nomePerfil = 'Admin';
    if (currentUser === 'tecnico') nomePerfil = 'Técnico';
    if (currentUser === 'funcionario') nomePerfil = 'Funcionário';
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) userDisplay.innerText = `Perfil: ${nomePerfil}`;

    const unidadeChamado = document.getElementById('chamadoUnidade');
    if (unidadeChamado) {
        unidadeChamado.disabled = currentUnit !== '__TODAS__';
        if (currentUnit !== '__TODAS__') unidadeChamado.value = currentUnit;
    }
    const unidadeFuncionario = document.getElementById('funcUnidade');
    if (unidadeFuncionario && currentUnit !== '__TODAS__') {
        unidadeFuncionario.value = currentUnit;
        unidadeFuncionario.disabled = true;
    } else if (unidadeFuncionario) {
        unidadeFuncionario.disabled = false;
    }
}

// ==========================================
// REGISTRAR AVALIAÇÃO DE SATISFAÇÃO (PELO USUÁRIO)
// ==========================================
function avaliarChamado(id, tipoAvaliacao) {
    const chamado = chamados.find(c => c.id === Number(id));
    if (!chamado) return;

    chamado.avaliacao = tipoAvaliacao; // 'feliz' ou 'triste'
    salvarDadosSistema();
    renderizarTabelas();
    salvarSessao();

    const textoAvaliacao = tipoAvaliacao === 'feliz' ? 'Feliz (Satisfeito) 😊' : 'Triste (Insatisfeito) 😞';
    mostrarToast('Obrigado pela avaliação!', `Sua opinião (${textoAvaliacao}) foi registrada com sucesso.`);
}

// ==========================================
// ATUALIZAÇÃO DO DASHBOARD (KPIs)
// ==========================================
function atualizarDashboardKPIs() {
    const totalFuncionarios = funcionarios.length;
    const elFunc = document.getElementById('kpi-total-funcionarios');
    if (elFunc) elFunc.innerText = totalFuncionarios;

    const totalUnidades = Object.values(unidadesSaude).reduce((acc, curr) => acc + curr.length, 0);
    const elUnidades = document.getElementById('kpi-total-unidades');
    if (elUnidades) elUnidades.innerText = totalUnidades;

    let abertos = 0;
    let andamento = 0;
    let fechados = 0;

    chamados.forEach(c => {
        if (c.status === 'aberto') abertos++;
        else if (c.status === 'andamento') andamento++;
        else if (c.status === 'encerrado' || c.status === 'fechado') fechados++;
    });

    const elAbertos = document.getElementById('kpi-chamados-abertos');
    if (elAbertos) elAbertos.innerText = abertos;

    const elAndamento = document.getElementById('kpi-chamados-andamento');
    if (elAndamento) elAndamento.innerText = andamento;

    const elFechados = document.getElementById('kpi-chamados-fechados');
    if (elFechados) elFechados.innerText = fechados;

    // Cálculo dinâmico e preciso da Satisfação baseado na votação real dos chamados encerrados
    let totalAvaliados = 0;
    let avaliacoesPositivas = 0;

    chamados.forEach(c => {
        if (c.avaliacao) {
            totalAvaliados++;
            if (c.avaliacao === 'feliz') {
                avaliacoesPositivas++;
            }
        }
    });

    const percentualSatisfacao = totalAvaliados > 0 ? Math.round((avaliacoesPositivas / totalAvaliados) * 100) : 0;
    const elSatisfacao = document.getElementById('kpi-satisfacao');
    if (elSatisfacao) elSatisfacao.innerText = `${percentualSatisfacao}%`;
}

// ==========================================
// RENDERIZAÇÃO DAS TABELAS E DASHBOARD
// ==========================================

function renderizarTabelas() {
    atualizarDashboardKPIs();

    // 1. Renderizar Inventário
    const corpoInventario = document.querySelector('#tabelaInventario tbody');
    if (corpoInventario) {
        corpoInventario.innerHTML = '';
        inventario.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.patrimonio}</td>
                <td>${item.serial}</td>
                <td>${item.equipamento}</td>
                <td>${item.marca}</td>
                <td>${item.setor}</td>
                <td>${item.responsavel}</td>
                <td>${item.telefone}</td>
                <td class="admin-only-column">
                    <button type="button" class="action-icon-btn" onclick="prepararEdicaoInventario(${index})" title="Editar">✏️</button>
                    <button type="button" class="action-icon-btn" onclick="solicitarExclusaoInventario(${index})" title="Excluir">🗑️</button>
                </td>
            `;
            corpoInventario.appendChild(tr);
        });
    }

    // 2. Renderizar Funcionários
    const corpoFuncionarios = document.querySelector('#tabelaFuncionarios tbody');
    if (corpoFuncionarios) {
        corpoFuncionarios.innerHTML = '';
        funcionarios.forEach((func, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${func.nome}</td>
                <td>${func.unidade}</td>
                <td>${func.setor}</td>
                <td>${func.telefone}</td>
                <td>${func.login}</td>
                <td>••••</td>
                <td class="admin-only-column">
                    <button type="button" class="action-icon-btn" onclick="prepararEdicaoFuncionario(${index})" title="Editar">✏️</button>
                    <button type="button" class="action-icon-btn" onclick="solicitarExclusaoFuncionario(${index})" title="Excluir">🗑️</button>
                </td>
            `;
            corpoFuncionarios.appendChild(tr);
        });
    }

    // 3. Renderizar Chamados (Com botões interativos de Pesquisa de Satisfação na visão do funcionário ou ícone visível para Admin/Técnico)
    const corpoChamados = document.querySelector('#tabelaChamados tbody');
    if (corpoChamados) {
        corpoChamados.innerHTML = '';
        let lista = chamadosDaUnidadeAtual();

        if (termoBuscaGlobal) {
            const termo = termoBuscaGlobal.toLowerCase();
            lista = lista.filter(c => 
                String(c.id).includes(termo) || 
                (c.nome && c.nome.toLowerCase().includes(termo)) ||
                (c.descricao && c.descricao.toLowerCase().includes(termo))
            );
        }

        lista.forEach(chamado => {
            const tr = document.createElement('tr');
            
            let statusTexto = 'Aberto';
            let corBadge = '#ef4444'; // Vermelho

            if (chamado.status === 'andamento') {
                statusTexto = 'Em Andamento (A caminho)';
                corBadge = '#f97316'; // Laranja
            } else if (chamado.status === 'encerrado' || chamado.status === 'fechado') {
                statusTexto = 'Fechado / Encerrado';
                corBadge = '#22c55e'; // Verde
            }

            // Lógica de Renderização da Avaliação de Satisfação
            let htmlAvaliacao = '';
            const isFechado = (chamado.status === 'encerrado' || chamado.status === 'fechado');

            if (isFechado) {
                if (chamado.avaliacao === 'feliz') {
                    htmlAvaliacao = '<br><span style="color:var(--success); font-weight:bold;">Avaliação: 😊 Satisfeito (Feliz)</span>';
                } else if (chamado.avaliacao === 'triste') {
                    htmlAvaliacao = '<br><span style="color:#ef4444; font-weight:bold;">Avaliação: 😞 Insatisfeito (Triste)</span>';
                } else {
                    // Se estiver fechado e for a visão do funcionário dono do chamado, exibe os botões de votação interativos
                    const eDonoDoChamado = currentUser === 'funcionario';
                    if (eDonoDoChamado) {
                        htmlAvaliacao = `
                            <br><div style="margin-top:6px; background:#f0fdf4; padding:6px; border-radius:6px; border:1px solid #bbf7d0;">
                                <small style="display:block; color:#166534; font-weight:bold; margin-bottom:4px;">Como você avalia este atendimento?</small>
                                <button type="button" onclick="avaliarChamado(${chamado.id}, 'feliz')" style="background:#22c55e; color:#fff; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; margin-right:4px;" title="Satisfeito">😊 Satisfeito</button>
                                <button type="button" onclick="avaliarChamado(${chamado.id}, 'triste')" style="background:#ef4444; color:#fff; border:none; padding:3px 8px; border-radius:4px; cursor:pointer;" title="Insatisfeito">😞 Insatisfeito</button>
                            </div>
                        `;
                    } else {
                        htmlAvaliacao = '<br><small style="color:var(--warning);">Aguardando avaliação do usuário</small>';
                    }
                }
            }

            tr.innerHTML = `
                <td>#${chamado.id}</td>
                <td>${chamado.nome}</td>
                <td>${chamado.setor}</td>
                <td>${chamado.telefone}</td>
                <td>${chamado.unidade}</td>
                <td>${chamado.categoria}</td>
                <td>${chamado.descricao} ${chamado.solucao ? '<br><small style="color:var(--success)"><b>Solução:</b> ' + chamado.solucao + '</small>' : ''} ${htmlAvaliacao}</td>
                <td><span class="status-badge" style="background:${corBadge}; color:#fff; padding:3px 8px; border-radius:4px; font-weight:bold;">${statusTexto}</span></td>
                <td>
                    <button type="button" class="action-icon-btn" onclick="prepararEdicaoChamado(${chamado.id})" title="Editar / Atender">✏️</button>
                    <button type="button" class="action-icon-btn" onclick="solicitarExclusaoChamado(${chamado.id})" title="Excluir">🗑️</button>
                </td>
            `;
            corpoChamados.appendChild(tr);
        });
    }
}

// ==========================================
// CADASTRO DE FUNCIONÁRIO
// ==========================================
function cadastrarFuncionario(event) {
    event.preventDefault();

    const nome = document.getElementById('funcNome').value.trim();
    const unidade = document.getElementById('funcUnidade').value;
    const setor = document.getElementById('funcSetor').value;
    const telefone = document.getElementById('funcTelefone').value.trim();
    const login = document.getElementById('funcLogin').value.trim().toLowerCase();
    const senha = document.getElementById('funcSenha').value;

    if (funcionarioEditIndex !== null && funcionarioEditIndex >= 0) {
        funcionarios[funcionarioEditIndex] = { nome, unidade, setor, telefone, login, senha };
        funcionarioEditIndex = null;
        mostrarToast('Sucesso', 'Funcionário atualizado com êxito!');
    } else {
        const existe = funcionarios.some(f => f.login && f.login.toLowerCase() === login);
        if (existe) {
            mostrarToast('Atenção', 'Já existe um funcionário cadastrado com este login.');
            return;
        }
        funcionarios.push({ nome, unidade, setor, telefone, login, senha });
        mostrarToast('Sucesso', 'Funcionário cadastrado com êxito!');
    }

    document.getElementById('formFuncionario').reset();
    if (currentUnit !== '__TODAS__' && document.getElementById('funcUnidade')) {
        document.getElementById('funcUnidade').value = currentUnit;
    }
    
    salvarDadosSistema();
    renderizarTabelas();
    salvarSessao();
}

// ==========================================
// CADASTRO DE INVENTÁRIO
// ==========================================
function cadastrarInventario(event) {
    event.preventDefault();

    const equipamento = document.getElementById('invEquipamento').value;
    const marca = document.getElementById('invMarca').value;
    const setor = document.getElementById('invSetor').value;
    const patrimonio = document.getElementById('invPatrimonio').value.trim();
    const serial = document.getElementById('invSerial').value.trim();
    const responsavel = document.getElementById('invResponsavel').value.trim();
    const telefone = document.getElementById('invTelefone').value.trim();

    if (inventarioEditIndex !== null && inventarioEditIndex >= 0) {
        inventario[inventarioEditIndex] = { patrimonio, serial, equipamento, marca, setor, responsavel, telefone };
        inventarioEditIndex = null;
        mostrarToast('Sucesso', 'Equipamento atualizado no inventário!');
    } else {
        inventario.push({ patrimonio, serial, equipamento, marca, setor, responsavel, telefone });
        mostrarToast('Sucesso', 'Equipamento cadastrado no inventário!');
    }

    document.getElementById('formInventario').reset();
    const selectMarca = document.getElementById('invMarca');
    if (selectMarca) selectMarca.innerHTML = '<option value="">Selecione primeiro</option>';

    salvarDadosSistema();
    renderizarTabelas();
    salvarSessao();
}

// ==========================================
// ABERTURA E SALVAMENTO DE CHAMADOS / ATENDIMENTO
// ==========================================
function salvarChamadoOuSolucao(event) {
    event.preventDefault();

    const editId = document.getElementById('chamadoEditId').value;
    const nome = document.getElementById('chamadoNome').value.trim();
    const setor = document.getElementById('chamadoSetor').value;
    const unidade = document.getElementById('chamadoUnidade').value;
    const telefone = document.getElementById('chamadoTelefone').value.trim();
    const categoria = document.getElementById('chamadoCategoria').value;
    const descricao = document.getElementById('chamadoDescricao').value.trim();
    
    const statusSelect = document.getElementById('chamadoStatusSelect');
    const statusEscolhido = statusSelect ? statusSelect.value : 'aberto';

    const textoSolucaoEl = document.getElementById('textoSolucao');
    const solucao = textoSolucaoEl ? textoSolucaoEl.value.trim() : '';

    if (editId) {
        const chamado = chamados.find(c => c.id === Number(editId));
        if (chamado) {
            chamado.nome = nome;
            chamado.setor = setor;
            chamado.unidade = unidade;
            chamado.telefone = telefone;
            chamado.categoria = categoria;
            chamado.descricao = descricao;
            chamado.status = statusEscolhido;
            
            if (statusEscolhido === 'encerrado' || statusEscolhido === 'fechado') {
                chamado.status = 'encerrado';
                chamado.solucao = solucao || 'Atendimento concluído.';
            } else {
                chamado.solucao = '';
                chamado.avaliacao = null; // Reseta se reabrir o chamado
            }
            mostrarToast('Sucesso', `Chamado #${chamado.id} atualizado com êxito!`);
        }
    } else {
        const novoId = chamados.length > 0 ? Math.max(...chamados.map(c => c.id)) + 1 : 1;
        const novoChamado = {
            id: novoId,
            nome: nome,
            login: currentEmployee ? currentEmployee.login : (currentUser || 'admin'),
            setor: setor,
            telefone: telefone,
            unidade: unidade,
            categoria: categoria,
            descricao: descricao,
            status: 'aberto',
            solucao: '',
            avaliacao: null
        };
        chamados.push(novoChamado);
        mostrarToast('Sucesso', `Novo chamado #${novoId} aberto com sucesso!`);
    }

    document.getElementById('formChamado').reset();
    const inputEditId = document.getElementById('chamadoEditId');
    if (inputEditId) inputEditId.value = '';
    const tituloForm = document.getElementById('titulo-form-chamado');
    if (tituloForm) tituloForm.innerText = 'Abrir Novo Chamado de Suporte';
    const btnSubmit = document.getElementById('btn-submit-chamado');
    if (btnSubmit) btnSubmit.innerText = 'Enviar Chamado';
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    if (btnCancelar) btnCancelar.style.display = 'none';
    
    const blocoStatus = document.getElementById('bloco-status-atendimento');
    if (blocoStatus) blocoStatus.style.display = 'none';
    const blocoSolucao = document.getElementById('bloco-solucao-container');
    if (blocoSolucao) blocoSolucao.style.display = 'none';

    const unidadeChamado = document.getElementById('chamadoUnidade');
    if (unidadeChamado && currentUnit !== '__TODAS__') {
        unidadeChamado.value = currentUnit;
    }

    salvarDadosSistema();
    renderizarTabelas();
    salvarSessao();
}

function cancelarEdicaoOuEncerramento() {
    const form = document.getElementById('formChamado');
    if (form) form.reset();
    
    const editId = document.getElementById('chamadoEditId');
    if (editId) editId.value = '';
    const titulo = document.getElementById('titulo-form-chamado');
    if (titulo) titulo.innerText = 'Abrir Novo Chamado de Suporte';
    const btnSubmit = document.getElementById('btn-submit-chamado');
    if (btnSubmit) btnSubmit.innerText = 'Enviar Chamado';
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    if (btnCancelar) btnCancelar.style.display = 'none';
    
    const blocoStatus = document.getElementById('bloco-status-atendimento');
    if (blocoStatus) blocoStatus.style.display = 'none';
    const blocoSolucao = document.getElementById('bloco-solucao-container');
    if (blocoSolucao) blocoSolucao.style.display = 'none';
    const descArea = document.getElementById('chamadoDescricao');
    if (descArea) descArea.style.display = 'none';

    const unidadeChamado = document.getElementById('chamadoUnidade');
    if (unidadeChamado && currentUnit !== '__TODAS__') {
        unidadeChamado.value = currentUnit;
    }
}

// ==========================================
// AÇÕES DE EDIÇÃO E EXCLUSÃO (BOTÕES/ÍCONES)
// ==========================================

function prepararEdicaoInventario(index) {
    const item = inventario[index];
    if (!item) return;
    inventarioEditIndex = index;
    
    const inputEquip = document.getElementById('invEquipamento');
    if (inputEquip) {
        inputEquip.value = item.equipamento || '';
        atualizarMarcas();
    }
    const inputMarca = document.getElementById('invMarca');
    if (inputMarca) inputMarca.value = item.marca || '';
    const inputSetor = document.getElementById('invSetor');
    if (inputSetor) inputSetor.value = item.setor || '';
    const inputPat = document.getElementById('invPatrimonio');
    if (inputPat) inputPat.value = item.patrimonio || '';
    const inputSerial = document.getElementById('invSerial');
    if (inputSerial) inputSerial.value = item.serial || '';
    const inputResp = document.getElementById('invResponsavel');
    if (inputResp) inputResp.value = item.responsavel || '';
    const inputTel = document.getElementById('invTelefone');
    if (inputTel) inputTel.value = item.telefone || '';
    
    rolarParaSecao('modulo-inventario');
}

function solicitarExclusaoInventario(index) {
    tipoExclusao = 'inventario';
    registroParaExcluir = index;
    const aviso = document.getElementById('texto-aviso-exclusao');
    if (aviso) aviso.innerText = "Este equipamento será permanentemente excluído do inventário. Deseja continuar?";
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.style.display = 'flex';
}

function prepararEdicaoFuncionario(index) {
    const func = funcionarios[index];
    if (!func) return;
    funcionarioEditIndex = index;
    
    const inputNome = document.getElementById('funcNome');
    if (inputNome) inputNome.value = func.nome || '';
    const inputUnid = document.getElementById('funcUnidade');
    if (inputUnid) inputUnid.value = func.unidade || '';
    const inputSetor = document.getElementById('funcSetor');
    if (inputSetor) inputSetor.value = func.setor || '';
    const inputTel = document.getElementById('funcTelefone');
    if (inputTel) inputTel.value = func.telefone || '';
    const inputLogin = document.getElementById('funcLogin');
    if (inputLogin) inputLogin.value = func.login || '';
    const inputSenha = document.getElementById('funcSenha');
    if (inputSenha) inputSenha.value = func.senha || '';
    
    rolarParaSecao('modulo-cadastro');
}

function solicitarExclusaoFuncionario(index) {
    tipoExclusao = 'funcionario';
    registroParaExcluir = index;
    const aviso = document.getElementById('texto-aviso-exclusao');
    if (aviso) aviso.innerText = "Este funcionário será permanentemente excluído do sistema. Deseja continuar?";
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.style.display = 'flex';
}

function prepararEdicaoChamado(id) {
    const chamado = chamados.find(c => c.id === Number(id));
    if (!chamado) return;
    
    const editId = document.getElementById('chamadoEditId');
    if (editId) editId.value = chamado.id;
    const inputNome = document.getElementById('chamadoNome');
    if (inputNome) inputNome.value = chamado.nome || '';
    const inputSetor = document.getElementById('chamadoSetor');
    if (inputSetor) inputSetor.value = chamado.setor || '';
    const inputUnid = document.getElementById('chamadoUnidade');
    if (inputUnid) inputUnid.value = chamado.unidade || '';
    const inputTel = document.getElementById('chamadoTelefone');
    if (inputTel) inputTel.value = chamado.telefone || '';
    const inputCat = document.getElementById('chamadoCategoria');
    if (inputCat) inputCat.value = chamado.categoria || '';
    
    const txtArea = document.getElementById('chamadoDescricao');
    if (txtArea) {
        txtArea.style.display = 'block';
        txtArea.value = chamado.descricao || '';
    }
    
    let blocoStatus = document.getElementById('bloco-status-atendimento');
    if (!blocoStatus) {
        const formChamado = document.getElementById('formChamado');
        if (formChamado) {
            const divStatus = document.createElement('div');
            divStatus.id = 'bloco-status-atendimento';
            divStatus.className = 'form-group';
            divStatus.style.marginTop = '15px';
            divStatus.innerHTML = `
                <label style="color: var(--warning); font-weight: bold;">Status do Atendimento (Técnico)</label>
                <select id="chamadoStatusSelect" class="form-control" onchange="tratarMudancaStatusTecnico(this.value)" required>
                    <option value="aberto">🔴 Aberto (Aguardando / Não iniciado)</option>
                    <option value="andamento">🟠 Em Andamento (Técnico a caminho / Atendendo)</option>
                    <option value="encerrado">🟢 Fechado / Resolvido</option>
                </select>
            `;
            formChamado.insertBefore(divStatus, document.getElementById('bloco-solucao-container'));
            blocoStatus = divStatus;
        }
    }
    
    if (blocoStatus) {
        blocoStatus.style.display = (currentUser === 'admin' || currentUser === 'tecnico') ? 'block' : 'none';
        const selectStatus = document.getElementById('chamadoStatusSelect');
        if (selectStatus) {
            selectStatus.value = chamado.status === 'encerrado' ? 'encerrado' : (chamado.status || 'aberto');
        }
    }

    const blocoSolucao = document.getElementById('bloco-solucao-container');
    if (blocoSolucao) {
        if (chamado.status === 'encerrado') {
            blocoSolucao.style.display = 'block';
            const textoSol = document.getElementById('textoSolucao');
            if (textoSol) textoSol.value = chamado.solucao || '';
        } else {
            blocoSolucao.style.display = 'none';
        }
    }
    
    const tituloForm = document.getElementById('titulo-form-chamado');
    if (tituloForm) tituloForm.innerText = `Atender / Editar Chamado #${chamado.id}`;
    const btnSubmit = document.getElementById('btn-submit-chamado');
    if (btnSubmit) btnSubmit.innerText = 'Salvar Atendimento';
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    if (btnCancelar) btnCancelar.style.display = 'inline-block';
    
    rolarParaSecao('modulo-abertura');
}

function tratarMudancaStatusTecnico(statusValor) {
    const blocoSolucao = document.getElementById('bloco-solucao-container');
    const textoSolucao = document.getElementById('textoSolucao');
    
    if (statusValor === 'encerrado') {
        if (blocoSolucao) blocoSolucao.style.display = 'block';
        if (textoSolucao) {
            textoSolucao.style.display = 'block';
            textoSolucao.required = true;
        }
    } else {
        if (blocoSolucao) blocoSolucao.style.display = 'none';
        if (textoSolucao) {
            textoSolucao.style.display = 'none';
            textoSolucao.required = false;
            textoSolucao.value = '';
        }
    }
}

function solicitarExclusaoChamado(id) {
    tipoExclusao = 'chamado';
    registroParaExcluir = Number(id);
    const aviso = document.getElementById('texto-aviso-exclusao');
    if (aviso) aviso.innerText = `O chamado #${id} será permanentemente excluído. Deseja continuar?`;
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.style.display = 'flex';
}

function fecharModalExclusao() {
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.style.display = 'none';
    registroParaExcluir = null;
    tipoExclusao = null;
}

function confirmarExclusaoRegistro() {
    if (registroParaExcluir === null) return;

    if (tipoExclusao === 'inventario') {
        inventario.splice(registroParaExcluir, 1);
        mostrarToast('Sucesso', 'Equipamento excluído do inventário.');
    } else if (tipoExclusao === 'funcionario') {
        funcionarios.splice(registroParaExcluir, 1);
        mostrarToast('Sucesso', 'Funcionário excluído do sistema.');
    } else if (tipoExclusao === 'chamado') {
        chamados = chamados.filter(c => c.id !== registroParaExcluir);
        mostrarToast('Sucesso', 'Chamado excluído com sucesso.');
    }

    salvarDadosSistema();
    renderizarTabelas();
    fecharModalExclusao();
}