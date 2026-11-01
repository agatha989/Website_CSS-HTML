// ==========================================
// ESTADO DO CARRINHO E INICIALIZAÇÃO
// ==========================================
let carrinho = JSON.parse(localStorage.getItem("carrinhoAtelie")) || [];

document.addEventListener("DOMContentLoaded", () => {
  atualizarContadorCarrinho();
});

function adicionarAoCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  localStorage.setItem("carrinhoAtelie", JSON.stringify(carrinho));
  atualizarContadorCarrinho();
  abrirCarrinho(); // Abre a gaveta para você VER o item adicionado!
}

function atualizarContadorCarrinho() {
  const badge = document.querySelector(".badge-carrinho");
  if (badge) badge.innerText = carrinho.length;
}

function abrirCarrinho() {
  const painel = document.getElementById("painelCarrinho");
  const overlay = document.getElementById("overlayCarrinho");
  if (!painel) return;

  renderizarItensCarrinho();
  painel.classList.add("aberto");
  overlay.classList.add("aberto");
}

function fecharCarrinho() {
  document.getElementById("painelCarrinho")?.classList.remove("aberto");
  document.getElementById("overlayCarrinho")?.classList.remove("aberto");
}

function renderizarItensCarrinho() {
  const container = document.getElementById("itensCarrinhoGaveta");
  const totalElemento = document.getElementById("valorTotalCarrinho");
  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  if (carrinho.length === 0) {
    container.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio 🛍️</p>`;
    totalElemento.innerText = "R$ 0,00";
    return;
  }

  carrinho.forEach((item, index) => {
    total += item.preco;
    container.innerHTML += `
      <div class="item-gaveta">
        <div>
          <strong>${item.nome}</strong>
          <p>R$ ${item.preco.toFixed(2).replace(".", ",")}</p>
        </div>
        <button onclick="removerItemCarrinho(${index})" class="btn-remover">&times;</button>
      </div>
    `;
  });

  totalElemento.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function removerItemCarrinho(index) {
  carrinho.splice(index, 1);
  localStorage.setItem("carrinhoAtelie", JSON.stringify(carrinho));
  atualizarContadorCarrinho();
  renderizarItensCarrinho();
}

function enviarPedidoFinalWhatsApp() {
  if (carrinho.length === 0) return;

  const telefone = "5521980033100";
  let mensagem = "Olá, Manu! Quero finalizar o pedido do meu carrinho:\n\n";
  let total = 0;

  carrinho.forEach(item => {
    mensagem += `• ${item.nome} - R$ ${item.preco.toFixed(2).replace(".", ",")}\n`;
    total += item.preco;
  });

  mensagem += `\n*Total: R$ ${total.toFixed(2).replace(".", ",")}*`;
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

// Clicar no ícone de carrinho no topo abre o painel
document.addEventListener("click", (e) => {
  if (e.target.closest(".carrinho")) {
    abrirCarrinho();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  atualizarContadorCarrinho();
  carregarAvaliacoes();
  configurarBusca();
  configurarFiltros();
});

// ==========================================
// 1. SISTEMA DE BUSCA DE PRODUTOS
// ==========================================
function configurarBusca() {
  const inputBusca = document.querySelector(".box-busca input");
  const btnBusca = document.querySelector(".btn-busca");

  if (!inputBusca) return;

  // Busca enquanto o usuário digita
  inputBusca.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase().trim();
    filtrarPorTexto(termo);
  });

  if (btnBusca) {
    btnBusca.addEventListener("click", () => {
      const termo = inputBusca.value.toLowerCase().trim();
      filtrarPorTexto(termo);
    });
  }
}

function filtrarPorTexto(termo) {
  const produtos = document.querySelectorAll(".card-produto");

  produtos.forEach((produto) => {
    const nomeProduto = produto.getAttribute("data-nome") || "";
    if (nomeProduto.includes(termo)) {
      produto.style.display = "flex";
    } else {
      produto.style.display = "none";
    }
  });
}

// ==========================================
// 2. FILTRO POR CATEGORIAS (ÍMÃS, CHAVEIROS, ETC)
// ==========================================
function configurarFiltros() {
  const linksCategorias = document.querySelectorAll(".link-cat");

  linksCategorias.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const categoriaSelecionada = link.getAttribute("data-categoria");

      const produtos = document.querySelectorAll(".card-produto");
      produtos.forEach((produto) => {
        const catProduto = produto.getAttribute("data-categoria");

        if (categoriaSelecionada === "todos" || catProduto === categoriaSelecionada) {
          produto.style.display = "flex";
        } else {
          produto.style.display = "none";
        }
      });
    });
  });
}

// ==========================================
// 3. FUNCIONALIDADE DO CARRINHO DE COMPRAS
// ==========================================
function adicionarAoCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  localStorage.setItem("carrinhoAtelie", JSON.stringify(carrinho));
  atualizarContadorCarrinho();

  // Alerta simples e amigável
  alert(`"${nome}" foi adicionado ao seu carrinho! 🛍️✨`);
}

function atualizarContadorCarrinho() {
  const badge = document.querySelector(".badge-carrinho");
  if (badge) {
    badge.innerText = carrinho.length;
  }
}

// Ao clicar no ícone do carrinho no topo, abre a finalização pelo WhatsApp!
document.addEventListener("click", (e) => {
  if (e.target.closest(".carrinho")) {
    finalizarPedidoWhatsApp();
  }
});

function finalizarPedidoWhatsApp() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio! Escolha alguns mimos na vitrine primeiro. 💕");
    return;
  }

  const telefone = "5521980033100";
  let mensagem = "Olá, Manu! Gostaria de fazer o pedido dos seguintes mimos:\n\n";
  let total = 0;

  carrinho.forEach((item, index) => {
    mensagem += `• ${item.nome} - R$ ${item.preco.toFixed(2).replace(".", ",")}\n`;
    total += item.preco;
  });

  mensagem += `\n*Total estimado: R$ ${total.toFixed(2).replace(".", ",")}*`;
  mensagem += "\n\nPodemos combinar a entrega e personalização?";

  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  document.addEventListener("click", (e) => {
  if (e.target.closest(".carrinho")) {
    abrirCarrinho();
  }
});
  }

// ==========================================
// 5. SISTEMA DE AVALIAÇÕES (LOCALSTORAGE)
// ==========================================
function salvarAvaliacao() {
  const nome = document.getElementById("nomeCliente").value.trim();
  const nota = document.getElementById("notaCliente").value;
  const texto = document.getElementById("textoCliente").value.trim();

  if (nome === "" || texto === "") {
    alert("Por favor, preencha seu nome e a mensagem antes de enviar! 💕");
    return;
  }

  const estrelas = "⭐".repeat(parseInt(nota));

  const novaAvaliacao = {
    nome: nome,
    estrelas: estrelas,
    texto: texto
  };

  let listaAvaliacoes = JSON.parse(localStorage.getItem("avaliacoesAtelie")) || [];
  listaAvaliacoes.unshift(novaAvaliacao);
  localStorage.setItem("avaliacoesAtelie", JSON.stringify(listaAvaliacoes));

  document.getElementById("nomeCliente").value = "";
  document.getElementById("textoCliente").value = "";

  carregarAvaliacoes();
}

function carregarAvaliacoes() {
  const container = document.getElementById("containerAvaliacoes");
  if (!container) return;

  let listaAvaliacoes = JSON.parse(localStorage.getItem("avaliacoesAtelie")) || [];

  container.innerHTML = "";

  listaAvaliacoes.forEach((item) => {
    const cardHtml = `
      <div class="card-avaliacao">
        <div class="estrelas">${item.estrelas}</div>
        <p class="texto-avaliacao">"${item.texto}"</p>
        <span class="nome-cliente">— ${item.nome}</span>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

// REDIRECIONAR DA HOME PARA A PÁGINA DE PRODUTOS
function irParaBusca() {
  const input = document.getElementById("inputBuscaHome");
  if (!input) return;
  const termo = input.value.trim();
  if (termo !== "") {
    window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
  }
}

// LER PARÂMETROS DA URL E FILTRAR PRODUTOS NA PÁGINA PRODUTOS.HTML
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoria = urlParams.get("cat");
  const busca = urlParams.get("busca");

  const titulo = document.getElementById("tituloCategoria");
  const produtos = document.querySelectorAll(".card-produto");

  // SE VEIO UMA CATEGORIA PELA URL
  if (categoria) {
    // Destaca o link ativo na sidebar
    document.querySelectorAll(".lista-cat-sidebar a").forEach(link => {
      if (link.getAttribute("data-cat") === categoria) {
        link.classList.add("ativo");
      }
    });

    // Atualiza o título da página
    if (titulo) {
      const nomesCat = {
        todos: "Todos os Produtos ✨",
        imas: "Ímãs Personalizados 🧲",
        chaveiros: "Chaveiros Exclusivos 🔑",
        natal: "Especial Natal 🎄",
        bottons: "Bottons & Pins 🔘"
      };
      titulo.innerText = nomesCat[categoria] || "Nossos Produtos ✨";
    }

    // Filtra os cards
    produtos.forEach(prod => {
      const catProd = prod.getAttribute("data-categoria");
      if (categoria === "todos" || catProd === categoria) {
        prod.style.display = "flex";
      } else {
        prod.style.display = "none";
      }
    });
  }

  // SE VEIO UMA BUSCA PELA URL
  if (busca) {
    if (titulo) titulo.innerText = `Resultados para "${busca}" 🔍`;
    produtos.forEach(prod => {
      const nomeProd = prod.getAttribute("data-nome") || "";
      if (nomeProd.includes(busca.toLowerCase())) {
        prod.style.display = "flex";
      } else {
        prod.style.display = "none";
      }
    });
  }
});

// FILTRO EM TEMPO REAL DENTRO DA PÁGINA PRODUTOS.HTML
function filtrarNaPagina() {
  const termo = document.getElementById("buscaSidebar").value.toLowerCase().trim();
  const produtos = document.querySelectorAll(".card-produto");

  produtos.forEach(prod => {
    const nome = prod.getAttribute("data-nome") || "";
    if (nome.includes(termo)) {
      prod.style.display = "flex";
    } else {
      prod.style.display = "none";
    }
  });
}