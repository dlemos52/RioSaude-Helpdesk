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
            select.innerHTML = `<option value=>${incluirTodas ? 'Selecione a unidade...' : 'Selecione...'}</option>`;
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
            // Admin e Técnico têm visão completa de todos os chamados.
            if (currentUser === 'admin' || currentUser === 'tecnico') return chamados;

            // Funcionário visualiza somente os chamados abertos por ele.
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
        let chamadoParaExcluirId = null; // Variável para armazenar o ID alvo da exclusão
        let registroParaExcluir = null;
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

        function atualizarRelogio() {
            const agora = new Date();
            const dia = String(agora.getDate()).padStart(2, '0');
            const mes = String(agora.getMonth() + 1).padStart(2, '0');
            const ano = agora.getFullYear();
            const horas = String(agora.getHours()).padStart(2, '0');
            const minutos = String(agora.getMinutes()).padStart(2, '0');
            const segundos = String(agora.getSeconds()).padStart(2, '0');
            document.getElementById('live-datetime').innerText = `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
        }
        setInterval(atualizarRelogio, 1000);
        atualizarRelogio();
        inicializarUnidades();

        document.getElementById('usuario')?.addEventListener('input', function() {
            const usuario = this.value.trim().toLowerCase();
            preencherSelectUnidades('loginUnidade', usuario === 'admin');
        });

        document.getElementById('loginUnidade')?.addEventListener('change', function() {
            const unidade = this.value;
            const usuario = document.getElementById('usuario')?.value.trim().toLowerCase();
            // Para usuários comuns, a unidade define automaticamente o escopo do sistema.
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
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
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
            const welcome = document.getElementById('mobile-login-welcome');
            const formContainer = document.getElementById('login-form-container');
            if (welcome) welcome.style.display = 'none';
            if (formContainer) formContainer.classList.add('mobile-form-open');
        }

        function fecharFormularioLogin() {
            const welcome = document.getElementById('mobile-login-welcome');
            const formContainer = document.getElementById('login-form-container');
            if (formContainer) formContainer.classList.remove('mobile-form-open');
            if (welcome) welcome.style.display = 'flex';
        }

        const STORAGE_SESSAO = 'helpdeskRioSaudeSessao';

        function salvarSessao() {
            if (!currentUser || !currentUnit) return;
            const sessao = {
                currentUser,
                currentUnit,
                employeeLogin: currentEmployee?.login || null,
                scrollY: window.scrollY || 0,
                pagina: document.querySelector('.card:target')?.id || null
            };
            localStorage.setItem(STORAGE_SESSAO, JSON.stringify(sessao));
        }

        function limparSessaoSalva() {
            localStorage.removeItem(STORAGE_SESSAO);
        }

        function restaurarSessao() {
            try {
                const salvo = localStorage.getItem(STORAGE_SESSAO);
                if (!salvo) return false;

                const sessao = JSON.parse(salvo);
                if (!sessao?.currentUser || !sessao?.currentUnit) return false;

                currentUser = sessao.currentUser;
                currentUnit = sessao.currentUnit;
                currentEmployee = null;

                if (currentUser === 'funcionario') {
                    currentEmployee = funcionarios.find(f =>
                        f.login && sessao.employeeLogin &&
                        f.login.toLowerCase() === sessao.employeeLogin.toLowerCase()
                    ) || null;
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

                // Restaura exatamente a posição em que o usuário estava antes do F5.
                requestAnimationFrame(() => {
                    window.scrollTo({ top: Number(sessao.scrollY) || 0, behavior: 'auto' });
                });
                return true;
            } catch (erro) {
                console.warn('Não foi possível restaurar a sessão:', erro);
                limparSessaoSalva();
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
            cancelarEdicaoOuEncerramento();
            fecharScanner();
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
                modInv.style.display = 'none';
                modCad.style.display = 'none';
            } else {
                modInv.style.display = 'block';
                modCad.style.display = 'block';
            }

            let nomePerfil = 'Admin';
            if (currentUser === 'tecnico') nomePerfil = 'Técnico';
            if (currentUser === 'funcionario') nomePerfil = 'Funcionário';
            document.getElementById('user-display').innerText = `Perfil: ${nomePerfil}`;

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

        function atualizarDashboardAdmin() {
            if (currentUser !== 'admin') return;

            const funcionariosVisiveis = funcionariosDaUnidadeAtual();
            const chamadosVisiveis = chamadosDaUnidadeAtual();
            document.getElementById('kpi-total-funcionarios').innerText = funcionariosVisiveis.length;

            const unidadesSet = new Set();
            funcionariosVisiveis.forEach(f => { if(f.unidade) unidadesSet.add(f.unidade); });
            chamadosVisiveis.forEach(c => { if(c.unidade) unidadesSet.add(c.unidade); });
            document.getElementById('kpi-total-unidades').innerText = unidadesSet.size;

            let abertos = 0, andamento = 0, fechados = 0;
            let totalAvaliados = 0, totalSatisfeitos = 0;

            chamadosVisiveis.forEach(c => {
                if (c.status === 'aberto') abertos++;
                else if (c.status === 'andamento') andamento++;
                else if (c.status === 'encerrado') {
                    fechados++;
                    if (c.avaliacao) {
                        totalAvaliados++;
                        if (c.avaliacao === 'feliz') totalSatisfeitos++;
                    }
                }
            });

            document.getElementById('kpi-chamados-abertos').innerText = abertos;
            document.getElementById('kpi-chamados-andamento').innerText = andamento;
            document.getElementById('kpi-chamados-fechados').innerText = fechados;

            let percSatisfacao = 0;
            if (totalAvaliados > 0) {
                percSatisfacao = Math.round((totalSatisfeitos / totalAvaliados) * 100);
            }
            document.getElementById('kpi-satisfacao').innerText = `${percSatisfacao}%`;
        }

        function atualizarMarcas() {
            const tipo = document.getElementById('invEquipamento').value;
            const selectMarca = document.getElementById('invMarca');
            selectMarca.innerHTML = '<option value="">Selecione a marca</option>';

            let lista = (tipo === 'Impressora') ? marcasImpressora : (tipo !== '' ? marcasGerais : []);
            lista.forEach(marca => {
                const opt = document.createElement('option');
                opt.value = marca;
                opt.innerText = marca;
                selectMarca.appendChild(opt);
            });
        }

        function preencherFormularioInventario(item) {
            document.getElementById('invPatrimonio').value = item.patrimonio;
            document.getElementById('invSerial').value = item.serial;
            document.getElementById('invEquipamento').value = item.equipamento;
            atualizarMarcas();
            document.getElementById('invMarca').value = item.marca;
            document.getElementById('invSetor').value = item.setor;
            document.getElementById('invResponsavel').value = item.responsavel;
            document.getElementById('invTelefone').value = item.telefone;
        }

        function cadastrarInventario(event) {
            event.preventDefault();
            if (currentUser !== 'admin' && currentUser !== 'tecnico') {
                mostrarToast('Acesso restrito', 'Somente perfis autorizados podem cadastrar equipamentos.');
                return;
            }

            const item = {
                patrimonio: document.getElementById('invPatrimonio').value.trim(),
                serial: document.getElementById('invSerial').value.trim(),
                equipamento: document.getElementById('invEquipamento').value,
                marca: document.getElementById('invMarca').value,
                setor: document.getElementById('invSetor').value,
                responsavel: document.getElementById('invResponsavel').value.trim(),
                telefone: document.getElementById('invTelefone').value.trim()
            };

            if (inventarioEditIndex !== null && currentUser === 'admin') {
                inventario[inventarioEditIndex] = item;
                inventarioEditIndex = null;
                document.querySelector('#formInventario button[type="submit"]').innerText = 'Cadastrar no Inventário';
                document.getElementById('formInventario').reset();
                document.getElementById('invMarca').innerHTML = '<option value="">Selecione primeiro</option>';
                renderizarTabelas();
                mostrarToast('Editado', 'Equipamento atualizado com sucesso!');
                return;
            }

            inventario.push(item);
            document.getElementById('formInventario').reset();
            document.getElementById('invMarca').innerHTML = '<option value="">Selecione primeiro</option>';
            renderizarTabelas();
            mostrarToast('Sucesso', 'Equipamento cadastrado no inventário!');
        }

        function editarInventario(index) {
            if (currentUser !== 'admin' && currentUser !== 'tecnico') {
                mostrarToast('Acesso restrito', 'A edição do inventário está disponível somente para administrador e técnico.');
                return;
            }
            abrirConfirmacaoEdicao('inventario', index);
        }

        function excluirInventario(index) {
            if (currentUser !== 'admin') return;
            registroParaExcluir = { tipo: 'inventario', index };
            document.getElementById('texto-aviso-exclusao').innerText =
                `O equipamento "${inventario[index].equipamento} - ${inventario[index].patrimonio}" será permanentemente excluído do inventário. Deseja continuar?`;
            document.getElementById('modal-confirmar-exclusao').style.display = 'flex';
        }

        function preencherFormularioFuncionario(item) {
            document.getElementById('funcNome').value = item.nome;
            document.getElementById('funcUnidade').value = item.unidade;
            document.getElementById('funcSetor').value = item.setor;
            document.getElementById('funcTelefone').value = item.telefone;
            document.getElementById('funcLogin').value = item.login || '';
            document.getElementById('funcSenha').value = item.senha || '123';
        }

        function cadastrarFuncionario(event) {
            event.preventDefault();
            if (currentUser !== 'admin' && currentUser !== 'tecnico') {
                mostrarToast('Acesso restrito', 'Somente perfis autorizados podem cadastrar funcionários.');
                return;
            }

            const novoFunc = {
                nome: document.getElementById('funcNome').value.trim(),
                unidade: document.getElementById('funcUnidade').value,
                setor: document.getElementById('funcSetor').value,
                telefone: document.getElementById('funcTelefone').value.trim(),
                login: document.getElementById('funcLogin').value.trim().toLowerCase(),
                senha: document.getElementById('funcSenha').value
            };

            const loginDuplicado = funcionarios.some((f, i) =>
                f.login && f.login.toLowerCase() === novoFunc.login && i !== funcionarioEditIndex
            );
            if (loginDuplicado) {
                mostrarToast('Login já cadastrado', 'Informe um login diferente para este funcionário.');
                return;
            }

            if (funcionarioEditIndex !== null && (currentUser === 'admin' || currentUser === 'tecnico')) {
                funcionarios[funcionarioEditIndex] = novoFunc;
                funcionarioEditIndex = null;
                document.querySelector('#formFuncionario button[type="submit"]').innerText = 'Cadastrar Funcionário';
                document.getElementById('formFuncionario').reset();
                aplicarPermissoesPerfil();
                renderizarTabelas();
                mostrarToast('Editado', 'Funcionário atualizado com sucesso!');
                return;
            }

            funcionarios.push(novoFunc);
            document.getElementById('formFuncionario').reset();
            aplicarPermissoesPerfil();
            renderizarTabelas();
            mostrarToast('Sucesso', 'Funcionário cadastrado com sucesso!');
        }

        function editarFuncionario(index) {
            if (currentUser !== 'admin' && currentUser !== 'tecnico') {
                mostrarToast('Acesso restrito', 'A edição de funcionários está disponível somente para administrador e técnico.');
                return;
            }
            abrirConfirmacaoEdicao('funcionario', index);
        }

        let registroParaEditar = null;

        function abrirConfirmacaoEdicao(tipo, index) {
            registroParaEditar = { tipo, index };
            const titulo = tipo === 'funcionario' ? 'Editar funcionário' : 'Editar equipamento';
            const nome = tipo === 'funcionario'
                ? funcionarios[index].nome
                : `${inventario[index].equipamento} - ${inventario[index].patrimonio}`;
            document.getElementById('titulo-aviso-edicao').innerText = titulo;
            document.getElementById('texto-aviso-edicao').innerText = `Deseja editar o registro "${nome}"? Escolha Editar para continuar ou Sair para cancelar.`;
            document.getElementById('modal-confirmar-edicao').style.display = 'flex';
        }

        function fecharModalEdicao() {
            registroParaEditar = null;
            document.getElementById('modal-confirmar-edicao').style.display = 'none';
        }

        function confirmarEdicaoRegistro() {
            if (!registroParaEditar) return;
            const registro = registroParaEditar;
            fecharModalEdicao();
            if (registro.tipo === 'funcionario') {
                funcionarioEditIndex = registro.index;
                preencherFormularioFuncionario(funcionarios[registro.index]);
                const btn = document.querySelector('#formFuncionario button[type="submit"]');
                btn.innerText = 'Salvar Alterações';
                rolarParaSecao('modulo-cadastro');
            } else {
                inventarioEditIndex = registro.index;
                preencherFormularioInventario(inventario[registro.index]);
                const btn = document.querySelector('#formInventario button[type="submit"]');
                btn.innerText = 'Salvar Alterações';
                rolarParaSecao('modulo-inventario');
            }
        }

        function excluirFuncionario(index) {
            if (currentUser !== 'admin') return;
            registroParaExcluir = { tipo: 'funcionario', index };
            document.getElementById('texto-aviso-exclusao').innerText =
                `O funcionário "${funcionarios[index].nome}" será permanentemente excluído do cadastro. Deseja continuar?`;
            document.getElementById('modal-confirmar-exclusao').style.display = 'flex';
        }

        function salvarChamadoOuSolucao(event) {
            event.preventDefault();
            const editId = document.getElementById('chamadoEditId').value;
            const nomeSolicitante = document.getElementById('chamadoNome').value.trim();

            const funcionarioExiste = funcionarios.some(f => f.nome.toLowerCase() === nomeSolicitante.toLowerCase());
            if (!funcionarioExiste) {
                mostrarToast('Usuário Não Cadastrado', 'O usuário informado não está cadastrado. Solicite o suporte de TI para realizar o cadastro.');
                return;
            }

            if (editId) {
                const ch = chamados.find(item => item.id == editId);
                if (ch) {
                    const modo = document.getElementById('chamadoModo').value;

                    if (modo === 'editar') {
                        ch.nome = nomeSolicitante;
                        ch.setor = document.getElementById('chamadoSetor').value;
                        ch.telefone = document.getElementById('chamadoTelefone').value;
                        ch.unidade = document.getElementById('chamadoUnidade').value;
                        ch.categoria = document.getElementById('chamadoCategoria').value;
                        ch.descricao = document.getElementById('selectDescricaoCombo').value === 'outro'
                            ? document.getElementById('chamadoDescricao').value.trim()
                            : document.getElementById('selectDescricaoCombo').value;

                        cancelarEdicaoOuEncerramento();
                        renderizarTabelas();
                        mostrarToast('Editado', `Chamado #${ch.id} atualizado com sucesso!`);
                    } else {
                        const comboSol = document.getElementById('selectSolucaoCombo').value;
                        const solucaoTexto = comboSol === 'outro' ? document.getElementById('textoSolucao').value.trim() : comboSol;

                        ch.status = 'encerrado';
                        ch.solucao = solucaoTexto;

                        cancelarEdicaoOuEncerramento();
                        renderizarTabelas();
                        mostrarToast('Encerrado', `Chamado #${ch.id} encerrado com solução registrada! Status atualizado para verde e satisfação liberada!`);
                    }
                }
            } else {
                const comboDesc = document.getElementById('selectDescricaoCombo').value;
                const unidadeSelecionada = document.getElementById('chamadoUnidade').value;
                if (!unidadeAtualPermiteRegistro(unidadeSelecionada)) {
                    mostrarToast('Unidade inválida', 'O chamado deve ser aberto na unidade selecionada no login.');
                    return;
                }
                let descFinal = comboDesc === 'outro' ? document.getElementById('chamadoDescricao').value : comboDesc;

                const novoChamado = {
                    id: chamados.length > 0 ? Math.max(...chamados.map(c => c.id)) + 1 : 1,
                    nome: nomeSolicitante,
                    login: currentUser === 'funcionario' && currentEmployee ? currentEmployee.login : '',
                    setor: document.getElementById('chamadoSetor').value,
                    telefone: document.getElementById('chamadoTelefone').value,
                    unidade: document.getElementById('chamadoUnidade').value,
                    categoria: document.getElementById('chamadoCategoria').value,
                    descricao: descFinal,
                    status: 'aberto',
                    solucao: "",
                    avaliacao: null
                };
                chamados.push(novoChamado);
                document.getElementById('formChamado').reset();
                document.getElementById('selectDescricaoCombo').value = '';
                document.getElementById('chamadoDescricao').style.display = 'none';
                renderizarTabelas();
                mostrarToast('Chamado Aberto', `Chamado #${novoChamado.id} registrado com sucesso!`);
            }
        }

        function lidarMudancaStatus(id, novoStatus) {
            const ch = chamados.find(item => item.id === id);
            if (!ch) return;

            if (novoStatus === 'encerrado') {
                document.getElementById('chamadoEditId').value = ch.id;
                document.getElementById('chamadoModo').value = 'encerrar';
                document.getElementById('titulo-form-chamado').innerText = `Encerrar Chamado #${ch.id} (Informar Solução)`;
                
                document.getElementById('chamadoNome').value = ch.nome;
                document.getElementById('chamadoSetor').value = ch.setor;
                document.getElementById('chamadoTelefone').value = ch.telefone;
                document.getElementById('chamadoUnidade').value = ch.unidade;
                document.getElementById('chamadoCategoria').value = ch.categoria;

                document.getElementById('selectDescricaoCombo').value = "outro";
                document.getElementById('chamadoDescricao').style.display = 'block';
                document.getElementById('chamadoDescricao').value = ch.descricao;

                document.getElementById('bloco-solucao-container').style.display = 'block';
                document.getElementById('selectSolucaoCombo').required = true;

                document.getElementById('btn-submit-chamado').innerText = 'Salvar e Sair (Encerrar)';
                document.getElementById('btn-submit-chamado').style.backgroundColor = 'var(--success)';
                document.getElementById('btn-cancelar-edicao').style.display = 'inline-block';

                rolarParaSecao('modulo-abertura');
            } else {
                ch.status = novoStatus;
                renderizarTabelas();
                mostrarToast('Status Atualizado', `Chamado #${id} alterado para ${novoStatus.toUpperCase()}`);
            }
        }

        /* FUNÇÕES DO MODAL DE EXCLUSÃO PERSONALIZADO */
        function excluirChamado(id) {
            if (currentUser !== 'admin') return;
            chamadoParaExcluirId = id;
            registroParaExcluir = { tipo: 'chamado', id };
            document.getElementById('texto-aviso-exclusao').innerText =
                `O chamado #${id} será permanentemente excluído do sistema. Deseja continuar?`;
            document.getElementById('modal-confirmar-exclusao').style.display = 'flex';
        }

        function fecharModalExclusao() {
            chamadoParaExcluirId = null;
            registroParaExcluir = null;
            document.getElementById('modal-confirmar-exclusao').style.display = 'none';
        }

        function confirmarExclusaoRegistro() {
            if (!registroParaExcluir || currentUser !== 'admin') {
                fecharModalExclusao();
                return;
            }

            const registro = registroParaExcluir;

            if (registro.tipo === 'chamado') {
                chamados = chamados.filter(item => item.id !== registro.id);
                fecharModalExclusao();
                renderizarTabelas();
                mostrarToast('Excluído', `Chamado #${registro.id} removido com sucesso!`);
                return;
            }

            if (registro.tipo === 'inventario') {
                const item = inventario[registro.index];
                inventario.splice(registro.index, 1);
                fecharModalExclusao();
                renderizarTabelas();
                mostrarToast('Excluído', `Equipamento "${item?.patrimonio || ''}" removido do inventário com sucesso!`);
                return;
            }

            if (registro.tipo === 'funcionario') {
                const item = funcionarios[registro.index];
                funcionarios.splice(registro.index, 1);
                fecharModalExclusao();
                renderizarTabelas();
                mostrarToast('Excluído', `Funcionário "${item?.nome || ''}" removido com sucesso!`);
            }
        }

        function editarChamado(id) {
            if (currentUser !== 'admin') {
                mostrarToast('Acesso restrito', 'A edição de chamados está disponível somente para o administrador.');
                return;
            }

            const ch = chamados.find(item => item.id === id);
            if (!ch) return;

            document.getElementById('chamadoEditId').value = ch.id;
            document.getElementById('chamadoModo').value = 'editar';
            document.getElementById('titulo-form-chamado').innerText = `Editar Chamado #${ch.id}`;

            document.getElementById('chamadoNome').value = ch.nome;
            document.getElementById('chamadoSetor').value = ch.setor;
            document.getElementById('chamadoTelefone').value = ch.telefone;
            document.getElementById('chamadoUnidade').value = ch.unidade;
            document.getElementById('chamadoCategoria').value = ch.categoria;

            const descricaoCombo = document.getElementById('selectDescricaoCombo');
            const descricaoOpcao = [...descricaoCombo.options].some(o => o.value === ch.descricao && o.value !== 'outro');

            if (descricaoOpcao) {
                descricaoCombo.value = ch.descricao;
                document.getElementById('chamadoDescricao').style.display = 'none';
            } else {
                descricaoCombo.value = 'outro';
                document.getElementById('chamadoDescricao').style.display = 'block';
                document.getElementById('chamadoDescricao').value = ch.descricao;
            }

            document.getElementById('bloco-solucao-container').style.display = 'none';
            document.getElementById('selectSolucaoCombo').required = false;
            document.getElementById('btn-submit-chamado').innerText = 'Salvar Alterações';
            document.getElementById('btn-submit-chamado').style.backgroundColor = 'var(--primary-color)';
            document.getElementById('btn-cancelar-edicao').style.display = 'inline-block';

            rolarParaSecao('modulo-abertura');
        }

        function cancelarEdicaoOuEncerramento() {
            document.getElementById('formChamado').reset();
            document.getElementById('chamadoEditId').value = '';
            document.getElementById('chamadoModo').value = '';
            document.getElementById('titulo-form-chamado').innerText = 'Abrir Novo Chamado de Suporte';
            document.getElementById('selectDescricaoCombo').value = '';
            document.getElementById('chamadoDescricao').style.display = 'none';
            document.getElementById('bloco-solucao-container').style.display = 'none';
            document.getElementById('selectSolucaoCombo').required = false;
            document.getElementById('textoSolucao').style.display = 'none';

            document.getElementById('btn-submit-chamado').innerText = 'Enviar Chamado';
            document.getElementById('btn-submit-chamado').style.backgroundColor = 'var(--primary-color)';
            document.getElementById('btn-cancelar-edicao').style.display = 'none';
        }

        function avaliarChamado(id, nota) {
            const ch = chamados.find(item => item.id === id);
            if (ch) {
                ch.avaliacao = nota;
                renderizarTabelas();
                mostrarToast('Avaliação Registrada', 'Obrigado pelo seu feedback!');
            }
        }

        function renderizarTabelas() {
            atualizarDashboardAdmin();

            const tbodyInv = document.querySelector('#tabelaInventario tbody');
            tbodyInv.innerHTML = '';
            inventario.forEach((item, index) => {
                const acoes = (currentUser === 'admin' || currentUser === 'tecnico')
                    ? `<div class="admin-actions">
                        <button type="button" class="action-edit" onclick="editarInventario(${index})">Editar</button>
                        ${currentUser === 'admin' ? `<button type="button" class="action-delete" onclick="excluirInventario(${index})">Excluir</button>` : ''}
                       </div>`
                    : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${item.patrimonio}</td><td>${item.serial}</td><td>${item.equipamento}</td><td>${item.marca}</td><td>${item.setor}</td><td>${item.responsavel}</td><td style="white-space: nowrap; font-size: 0.8rem;">${item.telefone}</td><td class="admin-only-cell">${acoes}</td>`;
                tbodyInv.appendChild(tr);
            });

            const tbodyFunc = document.querySelector('#tabelaFuncionarios tbody');
            tbodyFunc.innerHTML = '';
            funcionariosDaUnidadeAtual().forEach(item => {
                const originalIndex = funcionarios.indexOf(item);
                const acoes = (currentUser === 'admin' || currentUser === 'tecnico')
                    ? `<div class="admin-actions">
                        <button type="button" class="action-edit" onclick="editarFuncionario(${originalIndex})">Editar</button>
                        ${currentUser === 'admin' ? `<button type="button" class="action-delete" onclick="excluirFuncionario(${originalIndex})">Excluir</button>` : ''}
                       </div>`
                    : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${item.nome}</td><td>${item.unidade}</td><td>${item.setor}</td><td style="white-space: nowrap; font-size: 0.8rem;">${item.telefone}</td><td>${item.login || '—'}</td><td>${item.senha ? '••••••••' : '—'}</td><td class="admin-only-cell">${acoes}</td>`;
                tbodyFunc.appendChild(tr);
            });

            const tbodyCh = document.querySelector('#tabelaChamados tbody');
            tbodyCh.innerHTML = '';

            let chamadosFiltrados = chamadosDaUnidadeAtual();
            if (termoBuscaGlobal) {
                const termoLimpo = termoBuscaGlobal.replace('#', '').toLowerCase();
                chamadosFiltrados = chamadosDaUnidadeAtual().filter(ch => {
                    const matchNome = ch.nome.toLowerCase().includes(termoLimpo);
                    const matchId = String(ch.id) === termoLimpo;
                    return matchNome || matchId;
                });
            }

            if (chamadosFiltrados.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="9" style="text-align: center; color: #64748b; padding: 15px;">Nenhum chamado encontrado para "${termoBuscaGlobal}".</td>`;
                tbodyCh.appendChild(tr);
                return;
            }

            chamadosFiltrados.forEach(ch => {
                let badgeClass = 'badge-aberto';
                if (ch.status === 'andamento') badgeClass = 'badge-andamento';
                if (ch.status === 'encerrado') badgeClass = 'badge-encerrado';

                let textoDescricaoSolucao = `<strong>Descrição:</strong> ${ch.descricao}`;
                if (ch.status === 'encerrado' && ch.solucao) {
                    textoDescricaoSolucao += `<br><span style="color: var(--success);"><strong>Solução:</strong> ${ch.solucao}</span>`;
                }

                let acoesHtml = '';
                let botaoExcluirHtml = `<button type="button" class="action-delete" onclick="excluirChamado(${ch.id})" style="display: block; margin-top: 4px; width: 100%;">Excluir</button>`;

                if (currentUser === 'admin' || currentUser === 'tecnico') {
                    let seletorStatus = `
                        <select onchange="lidarMudancaStatus(${ch.id}, this.value)" style="padding: 4px; font-size: 0.8rem; border-radius: 4px; margin-bottom: 3px; display: block; width: 100%;">
                            <option value="aberto" ${ch.status === 'aberto' ? 'selected' : ''}>Aberto</option>
                            <option value="andamento" ${ch.status === 'andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="encerrado" ${ch.status === 'encerrado' ? 'selected' : ''}>Encerrado</option>
                        </select>
                    `;

                    let statusAvaliacaoAdmin = '';
                    if (ch.status === 'encerrado') {
                        if (ch.avaliacao) {
                            statusAvaliacaoAdmin = `<span style="font-size: 0.8rem; color: #16a34a; font-weight: 600; display: block; margin-top: 2px;">Avaliação: ${ch.avaliacao === 'feliz' ? '😊 Satisfeito' : '😞 Insatisfeito'}</span>`;
                        } else {
                            statusAvaliacaoAdmin = `<span style="font-size: 0.75rem; color: #64748b; display: block; margin-top: 2px;">Aguardando avaliação</span>`;
                        }
                    }
                    const botoesAdmin = currentUser === 'admin'
                        ? `<button type="button" class="action-edit" onclick="editarChamado(${ch.id})">Editar</button>${botaoExcluirHtml}`
                        : '';
                    acoesHtml = seletorStatus + statusAvaliacaoAdmin + botoesAdmin;

                } else {
                    if (ch.status === 'encerrado') {
                        if (ch.avaliacao) {
                            acoesHtml = `<span style="font-size: 0.8rem; color: #16a34a; font-weight: 600;">Avaliado: ${ch.avaliacao === 'feliz' ? '😊 Satisfeito' : '😞 Insatisfeito'}</span>`;
                        } else {
                            acoesHtml = `
                                <div class="satisfaction-options">
                                    <button type="button" onclick="avaliarChamado(${ch.id}, 'feliz')" title="Satisfeito">😊</button>
                                    <button type="button" onclick="avaliarChamado(${ch.id}, 'triste')" title="Insatisfeito">😞</button>
                                </div>
                            `;
                        }
                    } else {
                        acoesHtml = `<span style="font-size: 0.75rem; color: #64748b;">Aguardando encerramento</span>`;
                    }
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${ch.id}</td>
                    <td>${ch.nome}</td>
                    <td>${ch.setor}</td>
                    <td style="white-space: nowrap; font-size: 0.8rem;">${ch.telefone}</td>
                    <td>${ch.unidade}</td>
                    <td>${ch.categoria}</td>
                    <td style="font-size: 0.82rem; line-height: 1.3;">${textoDescricaoSolucao}</td>
                    <td><span class="badge ${badgeClass}">${ch.status.toUpperCase()}</span></td>
                    <td>${acoesHtml}</td>
                `;
                tbodyCh.appendChild(tr);
            });
        }

        function iniciarScanner(inputId) {
            targetInputId = inputId;
            document.getElementById('scanner-modal').style.display = 'flex';
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(stream => {
                    mediaStream = stream;
                    document.getElementById('video-scanner').srcObject = stream;
                })
                .catch(err => {
                    mostrarToast('Câmera Indisponível', 'Não foi possível acessar a câmera do dispositivo.');
                    fecharScanner();
                });
        }

        function fecharScanner() {
            document.getElementById('scanner-modal').style.display = 'none';
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                mediaStream = null;
            }
        }


// Restaura automaticamente a sessão e a posição da página após F5/recarregamento.
setTimeout(() => restaurarSessao(), 0);
