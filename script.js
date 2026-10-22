
const listaProdutos = document.getElementById("lista-produtos");
const formulario = document.getElementById("form-produto");
const campoPesquisa = document.getElementById("pesquisa");

let produtos = [];

// CONSULTAR A API E CARREGAR OS PRODUTOS
async function carregarProdutos() {
    listaProdutos.textContent = "";

    const carregando = document.createElement("tr");
    const mensagem = document.createElement("td");
    mensagem.colSpan = 6;
    mensagem.textContent = "Carregando produtos...";
    carregando.appendChild(mensagem);
    listaProdutos.appendChild(carregando);

    try {
        const resposta = await fetch("/api/produtos");

        if (!resposta.ok) {
            throw new Error("Falha ao consultar produtos.");
        }

        produtos = await resposta.json();
        renderizarProdutos(produtos);
        atualizarResumo(produtos);
    } catch (erro) {
        console.error(erro);
        listaProdutos.textContent = "";

        const linha = document.createElement("tr");
        const celula = document.createElement("td");
        celula.colSpan = 6;
        celula.textContent =
            "Não foi possível carregar os produtos.";
        linha.appendChild(celula);
        listaProdutos.appendChild(linha);
    }
}

// MOSTRAR OS PRODUTOS NA TABELA
function renderizarProdutos(lista) {
    listaProdutos.textContent = "";

    if (lista.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");
        celula.colSpan = 6;
        celula.textContent = "Nenhum produto encontrado.";
        linha.appendChild(celula);
        listaProdutos.appendChild(linha);
        return;
    }

    lista.forEach(produto => {
        const linha = document.createElement("tr");

        const valores = [
            produto.id,
            produto.nome,
            produto.categoria,
            Number(produto.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            }),
            produto.quantidade
        ];

        valores.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaStatus = document.createElement("td");
        const status = document.createElement("span");

        status.classList.add("status");

        if (produto.quantidade <= produto.estoque_minimo) {
            status.classList.add("low");
            status.textContent = "Estoque baixo";
        } else {
            status.classList.add("available");
            status.textContent = "Disponível";
        }

        celulaStatus.appendChild(status);
        linha.appendChild(celulaStatus);
        listaProdutos.appendChild(linha);
    });
}

// ATUALIZAR OS CARTÕES DE RESUMO
function atualizarResumo(lista) {
    const cartoes = document.querySelectorAll(".stat-card");

    if (cartoes.length < 3) return;

    cartoes[0].querySelector("h2").textContent = lista.length;

    const estoqueBaixo = lista.filter(
        produto => produto.quantidade <= produto.estoque_minimo
    ).length;

    cartoes[1].querySelector("h2").textContent = estoqueBaixo;

    const categorias = new Set(
        lista.map(produto => produto.categoria_id)
    );

    cartoes[2].querySelector("h2").textContent = categorias.size;
}

// PESQUISAR PRODUTOS
campoPesquisa.addEventListener("input", () => {
    const termo = campoPesquisa.value.trim().toLowerCase();

    const filtrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo)
    );

    renderizarProdutos(filtrados);
});

// CADASTRAR UM NOVO PRODUTO
formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const dados = new FormData(formulario);

    const novoProduto = {
        nome: dados.get("nome"),
        categoria_id: Number(dados.get("categoria")),
        preco: Number(dados.get("preco")),
        quantidade: Number(dados.get("quantidade")),
        estoque_minimo: Number(dados.get("estoque_minimo"))
    };

    try {
        const resposta = await fetch("/api/produtos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoProduto)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível cadastrar."
            );
        }

        alert("Produto cadastrado com sucesso!");
        formulario.reset();

        await carregarProdutos();

    } catch (erro) {
        console.error(erro);
        alert(erro.message);
    }
});

// CARREGAR OS DADOS QUANDO A PÁGINA ABRIR
carregarProdutos();
