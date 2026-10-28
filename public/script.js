// =====================================================
// FUNÇÃO PARA TROCAR DE TELA
// =====================================================

function mostrarTela(tela) {

    // Se não foi informada uma tela,
    // volta para o login.

    if (!tela) {

        tela = "telaLogin";

    }


    const telas =
        document.querySelectorAll(".tela");


    telas.forEach(elemento => {

        elemento.classList.add("escondida");

    });


    const telaSelecionada =
        document.getElementById(tela);


    if (telaSelecionada) {

        telaSelecionada.classList.remove("escondida");

    }

}


// =====================================================
// LOGIN
// =====================================================

const formLogin =
    document.getElementById("formLogin");


if (formLogin) {

    formLogin.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const senha =
                document
                    .getElementById("loginSenha")
                    .value;


            if (!email || !senha) {

                alert(
                    "Preencha o e-mail e a senha."
                );

                return;

            }


            try {

                const resposta =
                    await fetch(
                        "/api/login",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                senha: senha

                            })

                        }
                    );


                const dados =
                    await resposta.json();


                if (dados.sucesso) {


                    // Guardar usuário
                    // no navegador

                    localStorage.setItem(

                        "usuario",

                        JSON.stringify(
                            dados.usuario
                        )

                    );


                    alert(
                        "Login realizado com sucesso!"
                    );


                    // Ir para área de tarefas

                    window.location.href =
                        "tarefas.html";


                } else {

                    alert(
                        dados.mensagem
                        ||
                        "E-mail ou senha incorretos."
                    );

                }


            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );


                alert(
                    "Erro ao conectar com o servidor."
                );

            }

        }
    );

}


// =====================================================
// CADASTRO DE USUÁRIO
// =====================================================

const formCadastroUsuario =
    document.getElementById(
        "formCadastroUsuario"
    );


if (formCadastroUsuario) {

    formCadastroUsuario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nome =
                document
                    .getElementById("nomeUsuario")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("emailUsuario")
                    .value
                    .trim();


            const senha =
                document
                    .getElementById("senhaUsuario")
                    .value;


            const confirmarSenha =
                document
                    .getElementById(
                        "confirmarSenhaUsuario"
                    )
                    .value;


            if (!nome || !email || !senha) {

                alert(
                    "Preencha todos os campos."
                );

                return;

            }


            if (senha !== confirmarSenha) {

                alert(
                    "As senhas não são iguais."
                );

                return;

            }


            if (senha.length < 6) {

                alert(
                    "A senha deve possuir pelo menos 6 caracteres."
                );

                return;

            }


            try {

                const resposta =
                    await fetch(
                        "/api/cadastro",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                nome: nome,

                                email: email,

                                senha: senha

                            })

                        }
                    );


                const dados =
                    await resposta.json();


                if (dados.sucesso) {

                    alert(
                        "Cadastro realizado com sucesso!"
                    );


                    formCadastroUsuario.reset();


                    window.location.href =
                        "index.html";


                } else {

                    alert(
                        dados.mensagem
                        ||
                        "Erro ao realizar cadastro."
                    );

                }


            } catch (erro) {

                console.error(
                    "Erro no cadastro:",
                    erro
                );


                alert(
                    "Erro ao conectar com o servidor."
                );

            }

        }
    );

}


// =====================================================
// CADASTRO DE ADMINISTRADOR
// =====================================================

const formCadastroAdmin =
    document.getElementById(
        "formCadastroAdmin"
    );


if (formCadastroAdmin) {

    formCadastroAdmin.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nome =
                document
                    .getElementById("nomeAdmin")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("emailAdmin")
                    .value
                    .trim();


            const senha =
                document
                    .getElementById("senhaAdmin")
                    .value;


            const confirmarSenha =
                document
                    .getElementById(
                        "confirmarSenhaAdmin"
                    )
                    .value;


            if (!nome || !email || !senha) {

                alert(
                    "Preencha todos os campos."
                );

                return;

            }


            if (senha !== confirmarSenha) {

                alert(
                    "As senhas não são iguais."
                );

                return;

            }


            if (senha.length < 6) {

                alert(
                    "A senha deve possuir pelo menos 6 caracteres."
                );

                return;

            }


            try {

                const resposta =
                    await fetch(
                        "/api/cadastro-admin",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                nome: nome,

                                email: email,

                                senha: senha

                            })

                        }
                    );


                const dados =
                    await resposta.json();


                if (dados.sucesso) {

                    alert(
                        "Cadastro realizado com sucesso!"
                    );


                    formCadastroAdmin.reset();


                    window.location.href =
                        "index.html";


                } else {

                    alert(
                        dados.mensagem
                        ||
                        "Erro ao realizar cadastro."
                    );

                }


            } catch (erro) {

                console.error(
                    "Erro no cadastro de administrador:",
                    erro
                );


                alert(
                    "Erro ao conectar com o servidor."
                );

            }

        }
    );

}


// =====================================================
// VERIFICAR USUÁRIO LOGADO
// =====================================================

function obterUsuarioLogado() {

    const usuario =
        localStorage.getItem("usuario");


    if (!usuario) {

        return null;

    }


    try {

        return JSON.parse(usuario);

    } catch (erro) {

        console.error(
            "Erro ao ler usuário:",
            erro
        );


        localStorage.removeItem("usuario");

        return null;

    }

}

function irParaCadastro() {
    window.location.href = "cadastro.html";
}

function irParaAdmin() {
    window.location.href = "admin.html";
}


// =====================================================
// SAIR
// =====================================================

function sair() {

    localStorage.removeItem("usuario");

    window.location.href =
        "index.html";

}


// =====================================================
// EXPOR FUNÇÕES PARA O HTML
// =====================================================

window.mostrarTela = mostrarTela;

window.sair = sair;