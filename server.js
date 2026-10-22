const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/teste", async (req, res) => {
    try {
        const [resultado] = await pool.query(
            "SELECT COUNT(*) AS total FROM produtos"
        );

        res.json({
            mensagem: "Conexão com MySQL funcionando!",
            totalProdutos: resultado[0].total
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Não foi possível consultar o banco."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));