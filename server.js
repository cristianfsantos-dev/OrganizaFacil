const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// CONEXÃO COM MYSQL
// =====================================================

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "organizaFacil",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =====================================================
// TESTAR BANCO
// =====================================================

async function testarBanco() {
    try {
        const conexao = await db.getConnection();

        console.log("MySQL conectado com sucesso!");

        conexao.release();

    } catch (erro) {
        console.error("Erro ao conectar ao MySQL:");
        console.error(erro.message);
    }
}

testarBanco();

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {

    try {

        const { email, senha } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "Preencha o e-mail e a senha."
            });

        }

        // ---------------------------------------------
        // PROCURAR USUÁRIO
        // ---------------------------------------------

        const [usuarios] = await db.query(
            `
            SELECT
                id,
                nome,
                email,
                senha
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );

        if (usuarios.length > 0) {

            const usuario = usuarios[0];

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );

            if (!senhaCorreta) {

                return res.status(401).json({
                    sucesso: false,
                    mensagem: "E-mail ou senha incorretos."
                });

            }

            return res.json({

                sucesso: true,

                mensagem:
                    "Login realizado com sucesso!",

                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: "usuario"
                }

            });

        }

        // ---------------------------------------------
        // PROCURAR ADMINISTRADOR
        // ---------------------------------------------

        const [administradores] = await db.query(
            `
            SELECT
                id,
                nome,
                email,
                senha
            FROM administradores
            WHERE email = ?
            `,
            [email]
        );

        if (administradores.length > 0) {

            const admin =
                administradores[0];

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    admin.senha
                );

            if (!senhaCorreta) {

                return res.status(401).json({
                    sucesso: false,
                    mensagem:
                        "E-mail ou senha incorretos."
                });

            }

            return res.json({

                sucesso: true,

                mensagem:
                    "Login realizado com sucesso!",

                usuario: {
                    id: admin.id,
                    nome: admin.nome,
                    email: admin.email,
                    tipo: "admin"
                }

            });

        }

        return res.status(401).json({
            sucesso: false,
            mensagem:
                "E-mail ou senha incorretos."
        });

    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro interno do servidor."
        });

    }

});

// =====================================================
// CADASTRO DE USUÁRIO
// =====================================================

app.post("/api/cadastro", async (req, res) => {

    try {

        const {
            nome,
            email,
            senha
        } = req.body;

        if (!nome || !email || !senha) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Preencha todos os campos."
            });

        }

        if (senha.length < 6) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "A senha deve possuir pelo menos 6 caracteres."
            });

        }

        // Verificar usuário

        const [existente] =
            await db.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                `,
                [email]
            );

        if (existente.length > 0) {

            return res.status(409).json({
                sucesso: false,
                mensagem:
                    "Este e-mail já está cadastrado."
            });

        }

        // Verificar administrador

        const [adminExistente] =
            await db.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                `,
                [email]
            );

        if (adminExistente.length > 0) {

            return res.status(409).json({
                sucesso: false,
                mensagem:
                    "Este e-mail já está cadastrado."
            });

        }

        const senhaCriptografada =
            await bcrypt.hash(
                senha,
                10
            );

        await db.query(
            `
            INSERT INTO usuarios
            (
                nome,
                email,
                senha
            )
            VALUES (?, ?, ?)
            `,
            [
                nome,
                email,
                senhaCriptografada
            ]
        );

        res.status(201).json({

            sucesso: true,

            mensagem:
                "Cadastro realizado com sucesso!"

        });

    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao realizar cadastro."
        });

    }

});

// =====================================================
// CADASTRO DE ADMINISTRADOR
// =====================================================

app.post(
    "/api/cadastro-admin",
    async (req, res) => {

        try {

            const {
                nome,
                email,
                senha
            } = req.body;

            if (!nome || !email || !senha) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Preencha todos os campos."
                });

            }

            if (senha.length < 6) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "A senha deve possuir pelo menos 6 caracteres."
                });

            }

            const [usuarioExistente] =
                await db.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE email = ?
                    `,
                    [email]
                );

            if (usuarioExistente.length > 0) {

                return res.status(409).json({
                    sucesso: false,
                    mensagem:
                        "Este e-mail já está cadastrado."
                });

            }

            const [adminExistente] =
                await db.query(
                    `
                    SELECT id
                    FROM administradores
                    WHERE email = ?
                    `,
                    [email]
                );

            if (adminExistente.length > 0) {

                return res.status(409).json({
                    sucesso: false,
                    mensagem:
                        "Este e-mail já está cadastrado."
                });

            }

            const senhaCriptografada =
                await bcrypt.hash(
                    senha,
                    10
                );

            await db.query(
                `
                INSERT INTO administradores
                (
                    nome,
                    email,
                    senha
                )
                VALUES (?, ?, ?)
                `,
                [
                    nome,
                    email,
                    senhaCriptografada
                ]
            );

            res.status(201).json({

                sucesso: true,

                mensagem:
                    "Cadastro realizado com sucesso!"

            });

        } catch (erro) {

            console.error(
                "Erro no cadastro de administrador:",
                erro
            );

            res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro ao realizar cadastro."
            });

        }

    }
);

// =====================================================
// LISTAR TAREFAS
// =====================================================

app.get(
    "/api/tarefas/:usuarioId",
    async (req, res) => {

        try {

            const { usuarioId } =
                req.params;

            if (!usuarioId) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Usuário não informado."
                });

            }

            const [tarefas] =
                await db.query(
                    `
                    SELECT
                        id,
                        usuario_id,
                        titulo,
                        descricao,
                        prazo,
                        prioridade,
                        status,
                        criado_em

                    FROM tarefas

                    WHERE usuario_id = ?

                    ORDER BY
                        CASE prioridade
                            WHEN 'alta' THEN 1
                            WHEN 'media' THEN 2
                            WHEN 'baixa' THEN 3
                        END,

                        prazo IS NULL,

                        prazo ASC,

                        criado_em DESC
                    `,
                    [usuarioId]
                );

            res.json({

                sucesso: true,

                tarefas: tarefas

            });

        } catch (erro) {

            console.error(
                "Erro ao buscar tarefas:",
                erro
            );

            res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro ao buscar tarefas."
            });

        }

    }
);

// =====================================================
// CADASTRAR TAREFA
// =====================================================

app.post(
    "/api/tarefas",
    async (req, res) => {

        try {

            const {
                usuario_id,
                titulo,
                descricao,
                prazo,
                prioridade,
                status
            } = req.body;

            if (!usuario_id || !titulo) {

                return res.status(400).json({

                    sucesso: false,

                    mensagem:
                        "O usuário e o título são obrigatórios."

                });

            }

            const prioridadesValidas = [
                "baixa",
                "media",
                "alta"
            ];

            const statusValidos = [
                "pendente",
                "em_andamento",
                "concluida"
            ];

            if (
                !prioridadesValidas.includes(
                    prioridade
                )
            ) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Prioridade inválida."
                });

            }

            if (
                !statusValidos.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Status inválido."
                });

            }

            const [usuario] =
                await db.query(
                    `
                    SELECT id
                    FROM usuarios
                    WHERE id = ?
                    `,
                    [usuario_id]
                );

            if (usuario.length === 0) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        "Usuário não encontrado."
                });

            }

            const [resultado] =
                await db.query(
                    `
                    INSERT INTO tarefas
                    (
                        usuario_id,
                        titulo,
                        descricao,
                        prazo,
                        prioridade,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        usuario_id,
                        titulo,
                        descricao || null,
                        prazo || null,
                        prioridade,
                        status
                    ]
                );

            res.status(201).json({

                sucesso: true,

                mensagem:
                    "Tarefa cadastrada com sucesso!",

                id:
                    resultado.insertId

            });

        } catch (erro) {

            console.error(
                "Erro ao cadastrar tarefa:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao cadastrar tarefa."

            });

        }

    }
);

// =====================================================
// EDITAR TAREFA
// =====================================================

app.put(
    "/api/tarefas/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                usuario_id,
                titulo,
                descricao,
                prazo,
                prioridade,
                status
            } = req.body;

            if (!usuario_id || !titulo) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Usuário e título são obrigatórios."
                });

            }

            const prioridadesValidas = [
                "baixa",
                "media",
                "alta"
            ];

            const statusValidos = [
                "pendente",
                "em_andamento",
                "concluida"
            ];

            if (
                !prioridadesValidas.includes(
                    prioridade
                )
            ) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Prioridade inválida."
                });

            }

            if (
                !statusValidos.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Status inválido."
                });

            }

            const [resultado] =
                await db.query(
                    `
                    UPDATE tarefas

                    SET
                        titulo = ?,
                        descricao = ?,
                        prazo = ?,
                        prioridade = ?,
                        status = ?

                    WHERE id = ?

                    AND usuario_id = ?
                    `,
                    [
                        titulo,
                        descricao || null,
                        prazo || null,
                        prioridade,
                        status,
                        id,
                        usuario_id
                    ]
                );

            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        "Tarefa não encontrada."
                });

            }

            res.json({

                sucesso: true,

                mensagem:
                    "Tarefa atualizada com sucesso!"

            });

        } catch (erro) {

            console.error(
                "Erro ao editar tarefa:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao editar tarefa."

            });

        }

    }
);

// =====================================================
// ALTERAR STATUS / CONCLUIR
// =====================================================

app.put(
    "/api/tarefas/:id/status",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                status,
                usuario_id
            } = req.body;

            const statusValidos = [
                "pendente",
                "em_andamento",
                "concluida"
            ];

            if (!usuario_id) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Usuário não informado."
                });

            }

            if (
                !statusValidos.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Status inválido."
                });

            }

            const [resultado] =
                await db.query(
                    `
                    UPDATE tarefas

                    SET status = ?

                    WHERE id = ?

                    AND usuario_id = ?
                    `,
                    [
                        status,
                        id,
                        usuario_id
                    ]
                );

            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        "Tarefa não encontrada."
                });

            }

            res.json({

                sucesso: true,

                mensagem:
                    "Status atualizado com sucesso!"

            });

        } catch (erro) {

            console.error(
                "Erro ao alterar status:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao alterar status."

            });

        }

    }
);

// =====================================================
// EXCLUIR TAREFA
// =====================================================

app.delete(
    "/api/tarefas/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { usuario_id } =
                req.body;

            if (!usuario_id) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Usuário não informado."
                });

            }

            const [resultado] =
                await db.query(
                    `
                    DELETE FROM tarefas

                    WHERE id = ?

                    AND usuario_id = ?
                    `,
                    [
                        id,
                        usuario_id
                    ]
                );

            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        "Tarefa não encontrada."
                });

            }

            res.json({

                sucesso: true,

                mensagem:
                    "Tarefa excluída com sucesso!"

            });

        } catch (erro) {

            console.error(
                "Erro ao excluir tarefa:",
                erro
            );

            res.status(500).json({

                sucesso: false,

                mensagem:
                    "Erro ao excluir tarefa."

            });

        }

    }
);

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor rodando em http://localhost:${PORT}`
        );
        
    }
);