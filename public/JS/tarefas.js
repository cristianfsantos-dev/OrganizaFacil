// =====================================================
// VERIFICAR USUÁRIO LOGADO
// =====================================================

const usuarioSalvo =
    localStorage.getItem("usuario");

if (!usuarioSalvo) {

    window.location.href =
        "index.html";

}

let usuario = null;

try {

    usuario =
        JSON.parse(usuarioSalvo);

} catch (erro) {

    console.error(
        "Erro ao carregar usuário:",
        erro
    );

    localStorage.removeItem(
        "usuario"
    );

    window.location.href =
        "index.html";

}


// =====================================================
// VARIÁVEIS
// =====================================================

let tarefas = [];


// =====================================================
// QUANDO A PÁGINA CARREGAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        mostrarNomeUsuario();

        configurarModal();

        configurarFiltros();

        carregarTarefas();

    }
);


// =====================================================
// MOSTRAR NOME DO USUÁRIO
// =====================================================

function mostrarNomeUsuario() {

    const elementoNome =
        document.getElementById(
            "nomeUsuario"
        );

    if (
        elementoNome &&
        usuario
    ) {

        elementoNome.textContent =
            usuario.nome;

    }

}


// =====================================================
// BOTÃO SAIR
// =====================================================

function sair() {

    localStorage.removeItem(
        "usuario"
    );

    window.location.href =
        "index.html";

}

window.sair = sair;


// =====================================================
// ABRIR NOVA TAREFA
// =====================================================

function abrirNovaTarefa() {

    const modal =
        document.getElementById(
            "modalTarefa"
        );

    const formulario =
        document.getElementById(
            "formTarefa"
        );

    const tituloModal =
        document.getElementById(
            "tituloModal"
        );

    const tarefaId =
        document.getElementById(
            "tarefaId"
        );

    if (!modal) {
        return;
    }

    if (formulario) {

        formulario.reset();

    }

    if (tituloModal) {

        tituloModal.textContent =
            "Nova tarefa";

    }

    if (tarefaId) {

        tarefaId.value = "";

    }

    const prioridade =
        document.getElementById(
            "prioridade"
        );

    const status =
        document.getElementById(
            "status"
        );

    if (prioridade) {

        prioridade.value =
            "media";

    }

    if (status) {

        status.value =
            "pendente";

    }

    modal.classList.remove(
        "escondido"
    );

}

window.abrirNovaTarefa =
    abrirNovaTarefa;


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModal() {

    const modal =
        document.getElementById(
            "modalTarefa"
        );

    if (modal) {

        modal.classList.add(
            "escondido"
        );

    }

}


// =====================================================
// CONFIGURAR MODAL
// =====================================================

function configurarModal() {

    const fechar =
        document.getElementById(
            "fecharModal"
        );

    const cancelar =
        document.getElementById(
            "cancelarModal"
        );

    if (fechar) {

        fechar.addEventListener(
            "click",
            fecharModal
        );

    }

    if (cancelar) {

        cancelar.addEventListener(
            "click",
            fecharModal
        );

    }

    const modal =
        document.getElementById(
            "modalTarefa"
        );

    if (modal) {

        modal.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modal
                ) {

                    fecharModal();

                }

            }
        );

    }

    const formulario =
        document.getElementById(
            "formTarefa"
        );

    if (formulario) {

        formulario.addEventListener(
            "submit",
            salvarTarefa
        );

    }

}


// =====================================================
// CARREGAR TAREFAS DO MYSQL
// =====================================================

async function carregarTarefas() {

    try {

        if (
            !usuario ||
            !usuario.id
        ) {

            console.error(
                "Usuário não possui ID."
            );

            return;

        }

        const resposta =
            await fetch(
                `/api/tarefas/${usuario.id}`
            );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar tarefas."
            );

        }

        const dados =
            await resposta.json();

        console.log(
            "Tarefas recebidas:",
            dados
        );

        if (
            Array.isArray(
                dados
            )
        ) {

            tarefas =
                dados;

        } else if (
            Array.isArray(
                dados.tarefas
            )
        ) {

            tarefas =
                dados.tarefas;

        } else {

            tarefas = [];

        }

        renderizarTarefas();

        atualizarEstatisticas();

    } catch (erro) {

        console.error(
            "Erro ao carregar tarefas:",
            erro
        );

        tarefas = [];

        renderizarTarefas();

        atualizarEstatisticas();

    }

}


// =====================================================
// SALVAR TAREFA
// =====================================================

async function salvarTarefa(
    evento
) {

    evento.preventDefault();

    const tarefaId =
        document.getElementById(
            "tarefaId"
        ).value;

    const titulo =
        document.getElementById(
            "titulo"
        ).value
        .trim();

    const descricao =
        document.getElementById(
            "descricao"
        ).value
        .trim();

    const prazo =
        document.getElementById(
            "prazo"
        ).value;

    const prioridade =
        document.getElementById(
            "prioridade"
        ).value;

    const status =
        document.getElementById(
            "status"
        ).value;


    if (!titulo) {

        alert(
            "Digite o título da tarefa."
        );

        return;

    }


    if (
        !usuario ||
        !usuario.id
    ) {

        alert(
            "Usuário não identificado. Faça login novamente."
        );

        return;

    }


    const dados = {

        usuario_id:
            usuario.id,

        titulo:
            titulo,

        descricao:
            descricao,

        prazo:
            prazo || null,

        prioridade:
            prioridade,

        status:
            status

    };


    try {

        let resposta;


        // =================================================
        // EDITAR
        // =================================================

        if (tarefaId) {

            resposta =
                await fetch(
                    `/api/tarefas/${tarefaId}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                dados
                            )

                    }
                );

        }


        // =================================================
        // CADASTRAR
        // =================================================

        else {

            resposta =
                await fetch(
                    "/api/tarefas",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                dados
                            )

                    }
                );

        }


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao salvar tarefa."
            );

        }


        alert(
            tarefaId
                ? "Tarefa atualizada com sucesso!"
                : "Tarefa cadastrada com sucesso!"
        );


        fecharModal();


        // Recarregar do MySQL

        await carregarTarefas();


    } catch (erro) {

        console.error(
            "Erro ao salvar tarefa:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível salvar a tarefa."
        );

    }

}


// =====================================================
// RENDERIZAR TAREFAS
// =====================================================

function renderizarTarefas() {

    const lista =
        document.getElementById(
            "listaTarefas"
        );

    const mensagem =
        document.getElementById(
            "mensagemVazia"
        );


    if (!lista) {

        return;

    }


    const pesquisa =
        document.getElementById(
            "pesquisa"
        )
        ?.value
        .toLowerCase()
        .trim() || "";


    const filtroStatus =
        document.getElementById(
            "filtroStatus"
        )
        ?.value ||
        "todas";


    const filtroPrioridade =
        document.getElementById(
            "filtroPrioridade"
        )
        ?.value ||
        "todas";


    const tarefasFiltradas =
        tarefas.filter(
            function (tarefa) {

                const titulo =
                    String(
                        tarefa.titulo ||
                        ""
                    )
                    .toLowerCase();


                const descricao =
                    String(
                        tarefa.descricao ||
                        ""
                    )
                    .toLowerCase();


                const correspondePesquisa =
                    titulo.includes(
                        pesquisa
                    ) ||
                    descricao.includes(
                        pesquisa
                    );


                const correspondeStatus =
                    filtroStatus ===
                        "todas" ||
                    tarefa.status ===
                        filtroStatus;


                const correspondePrioridade =
                    filtroPrioridade ===
                        "todas" ||
                    tarefa.prioridade ===
                        filtroPrioridade;


                return (
                    correspondePesquisa &&
                    correspondeStatus &&
                    correspondePrioridade
                );

            }
        );


    lista.innerHTML = "";


    if (
        tarefasFiltradas.length ===
        0
    ) {

        if (mensagem) {

            mensagem.style.display =
                "block";

        }

        return;

    }


    if (mensagem) {

        mensagem.style.display =
            "none";

    }


    tarefasFiltradas.forEach(
        function (tarefa) {

            const card =
                criarCardTarefa(
                    tarefa
                );

            lista.appendChild(
                card
            );

        }
    );

}


// =====================================================
// CRIAR CARD DA TAREFA
// =====================================================

function criarCardTarefa(
    tarefa
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "tarefa";


    // =================================================
    // TÍTULO
    // =================================================

    const titulo =
        document.createElement(
            "h3"
        );

    titulo.textContent =
        tarefa.titulo;


    // =================================================
    // DESCRIÇÃO
    // =================================================

    const descricao =
        document.createElement(
            "p"
        );

    descricao.textContent =
        tarefa.descricao ||
        "Sem descrição.";


    // =================================================
    // INFORMAÇÕES
    // =================================================

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "tarefa-info";


    const prazo =
        document.createElement(
            "span"
        );

    prazo.textContent =
        tarefa.prazo
            ? `📅 Prazo: ${formatarData(
                tarefa.prazo
            )}`
            : "📅 Sem prazo";


    const prioridade =
        document.createElement(
            "span"
        );

    prioridade.textContent =
        `Prioridade: ${formatarPrioridade(
            tarefa.prioridade
        )}`;


    const status =
        document.createElement(
            "span"
        );

    status.textContent =
        `Status: ${formatarStatus(
            tarefa.status
        )}`;


    info.appendChild(
        prazo
    );

    info.appendChild(
        prioridade
    );

    info.appendChild(
        status
    );


    // =================================================
    // AÇÕES
    // =================================================

    const acoes =
        document.createElement(
            "div"
        );

    acoes.className =
        "acoes-tarefa";


    // =================================================
    // EDITAR
    // =================================================

    const btnEditar =
        document.createElement(
            "button"
        );

    btnEditar.type =
        "button";

    btnEditar.className =
        "btn-editar";

    btnEditar.textContent =
        "Editar";

    btnEditar.addEventListener(
        "click",
        function () {

            editarTarefa(
                tarefa
            );

        }
    );


    // =================================================
    // CONCLUIR
    // =================================================

    const btnConcluir =
        document.createElement(
            "button"
        );

    btnConcluir.type =
        "button";

    btnConcluir.className =
        "btn-concluir";

    btnConcluir.textContent =
        tarefa.status ===
        "concluida"
            ? "Reabrir"
            : "Concluir";

    btnConcluir.addEventListener(
        "click",
        function () {

            alternarConclusao(
                tarefa
            );

        }
    );


    // =================================================
    // EXCLUIR
    // =================================================

    const btnExcluir =
        document.createElement(
            "button"
        );

    btnExcluir.type =
        "button";

    btnExcluir.className =
        "btn-excluir";

    btnExcluir.textContent =
        "Excluir";

    btnExcluir.addEventListener(
        "click",
        function () {

            excluirTarefa(
                tarefa.id
            );

        }
    );


    acoes.appendChild(
        btnEditar
    );

    acoes.appendChild(
        btnConcluir
    );

    acoes.appendChild(
        btnExcluir
    );


    card.appendChild(
        titulo
    );

    card.appendChild(
        descricao
    );

    card.appendChild(
        info
    );

    card.appendChild(
        acoes
    );


    return card;

}


// =====================================================
// EDITAR TAREFA
// =====================================================

function editarTarefa(
    tarefa
) {

    const modal =
        document.getElementById(
            "modalTarefa"
        );


    document.getElementById(
        "tituloModal"
    ).textContent =
        "Editar tarefa";


    document.getElementById(
        "tarefaId"
    ).value =
        tarefa.id;


    document.getElementById(
        "titulo"
    ).value =
        tarefa.titulo ||
        "";


    document.getElementById(
        "descricao"
    ).value =
        tarefa.descricao ||
        "";


    document.getElementById(
        "prazo"
    ).value =
        tarefa.prazo
            ? String(
                tarefa.prazo
            ).substring(
                0,
                10
            )
            : "";


    document.getElementById(
        "prioridade"
    ).value =
        tarefa.prioridade ||
        "media";


    document.getElementById(
        "status"
    ).value =
        tarefa.status ||
        "pendente";


    modal.classList.remove(
        "escondido"
    );

}


// =====================================================
// CONCLUIR / REABRIR
// =====================================================

async function alternarConclusao(
    tarefa
) {

    const novoStatus =
        tarefa.status ===
        "concluida"
            ? "pendente"
            : "concluida";


    try {

        const resposta =
            await fetch(
                `/api/tarefas/${tarefa.id}/status`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            usuario_id:
                                usuario.id,

                            status:
                                novoStatus

                        })

                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao alterar status."
            );

        }


        await carregarTarefas();


    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível alterar o status."
        );

    }

}


// =====================================================
// EXCLUIR TAREFA
// =====================================================

async function excluirTarefa(
    id
) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir esta tarefa?"
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `/api/tarefas/${id}`,
                {

                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            usuario_id:
                                usuario.id

                        })

                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.mensagem ||
                "Erro ao excluir tarefa."
            );

        }


        alert(
            "Tarefa excluída com sucesso!"
        );


        await carregarTarefas();


    } catch (erro) {

        console.error(
            "Erro ao excluir tarefa:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível excluir a tarefa."
        );

    }

}


// =====================================================
// CONFIGURAR PESQUISA E FILTROS
// =====================================================

function configurarFiltros() {

    const pesquisa =
        document.getElementById(
            "pesquisa"
        );


    const filtroStatus =
        document.getElementById(
            "filtroStatus"
        );


    const filtroPrioridade =
        document.getElementById(
            "filtroPrioridade"
        );


    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            renderizarTarefas
        );

    }


    if (filtroStatus) {

        filtroStatus.addEventListener(
            "change",
            renderizarTarefas
        );

    }


    if (filtroPrioridade) {

        filtroPrioridade.addEventListener(
            "change",
            renderizarTarefas
        );

    }

}


// =====================================================
// ATUALIZAR ESTATÍSTICAS
// =====================================================

function atualizarEstatisticas() {

    const total =
        tarefas.length;


    const pendentes =
        tarefas.filter(
            tarefa =>
                tarefa.status ===
                "pendente"
        ).length;


    const andamento =
        tarefas.filter(
            tarefa =>
                tarefa.status ===
                "em_andamento"
        ).length;


    const concluidas =
        tarefas.filter(
            tarefa =>
                tarefa.status ===
                "concluida"
        ).length;


    const elementoTotal =
        document.getElementById(
            "totalTarefas"
        );


    const elementoPendentes =
        document.getElementById(
            "totalPendentes"
        );


    const elementoAndamento =
        document.getElementById(
            "totalAndamento"
        );


    const elementoConcluidas =
        document.getElementById(
            "totalConcluidas"
        );


    if (elementoTotal) {

        elementoTotal.textContent =
            total;

    }


    if (elementoPendentes) {

        elementoPendentes.textContent =
            pendentes;

    }


    if (elementoAndamento) {

        elementoAndamento.textContent =
            andamento;

    }


    if (elementoConcluidas) {

        elementoConcluidas.textContent =
            concluidas;

    }

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(
    data
) {

    if (!data) {

        return "Sem prazo";

    }


    const partes =
        String(data)
            .substring(
                0,
                10
            )
            .split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =====================================================
// FORMATAR PRIORIDADE
// =====================================================

function formatarPrioridade(
    prioridade
) {

    switch (prioridade) {

        case "alta":
            return "Alta";

        case "media":
            return "Média";

        case "baixa":
            return "Baixa";

        default:
            return prioridade || "-";

    }

}


// =====================================================
// FORMATAR STATUS
// =====================================================

function formatarStatus(
    status
) {

    switch (status) {

        case "pendente":
            return "Pendente";

        case "em_andamento":
            return "Em andamento";

        case "concluida":
            return "Concluída";

        default:
            return status || "-";

    }

}