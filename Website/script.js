// ==========================================
// ESTADO DO CARRINHO E INICIALIZAÇÃO
// ==========================================
let carrinho = (JSON.parse(localStorage.getItem("carrinhoAtelie")) || [])
  .filter((item) => typeof item.preco === "number" && !isNaN(item.preco))
  .map((item) => ({ ...item, qtd: item.qtd || 1 }));

document.addEventListener("DOMContentLoaded", () => {
  atualizarContadorCarrinho();
  carregarAvaliacoes();
  configurarBusca();
  configurarFiltros();
  
  // INICIALIZA O CARROSSEL SE EXISTIR NA PÁGINA
  if (document.querySelectorAll(".slide").length > 0) {
    reiniciarTemporizador();
  }
});

// ==========================================
// CARRINHO DE COMPRAS & GAVETA LATERAL
// ==========================================
function salvarCarrinho() {
  localStorage.setItem("carrinhoAtelie", JSON.stringify(carrinho));
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function pegarImagemDoCard() {
  const card = window.event?.target?.closest(".card-produto");
  return card?.querySelector(".img-produto")?.getAttribute("src") || "";
}

function adicionarAoCarrinho(nome, preco, img) {
  img = img || pegarImagemDoCard();
  const existente = carrinho.find((item) => item.nome === nome);
  if (existente) {
    existente.qtd++;
  } else {
    carrinho.push({ nome, preco, qtd: 1, img });
  }
  salvarCarrinho();
  atualizarContadorCarrinho();
  abrirCarrinho();
}

function adicionarComOpcao(evento, nomeBase) {
  // Encontra o card-produto onde ocorreu o clique no botão
  const botao = evento.currentTarget || evento.target;
  const card = botao.closest(".card-produto");

  if (!card) return;

  const select = card.querySelector(".select-opcao");
  const opcaoSelecionada = select.options[select.selectedIndex];
  
  const preco = parseFloat(select.value);
  const rotulo = opcaoSelecionada.dataset.rotulo || opcaoSelecionada.text;
  const img = card.querySelector(".img-produto")?.getAttribute("src") || "";

  // Adiciona ao carrinho formatado com o nome e a opção (ex: Kit de Ímãs (Kit 6))
  adicionarAoCarrinho(`${nomeBase} (${rotulo})`, preco, img);
}

function atualizarPrecoCard(select) {
  const card = select.closest(".card-produto");
  card.querySelector(".preco").innerText = formatarPreco(parseFloat(select.value));
}

function atualizarContadorCarrinho() {
  const badge = document.querySelector(".badge-carrinho");
  const totalPecas = carrinho.reduce((soma, item) => soma + item.qtd, 0);
  if (badge) badge.innerText = totalPecas;
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

  if (carrinho.length === 0) {
    container.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio 🛍️</p>`;
    totalElemento.innerText = "R$ 0,00";
    return;
  }

  let html = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.qtd;
    total += subtotal;
    html += `
      <div class="item-gaveta">
        ${item.img ? `<img src="${item.img}" alt="${item.nome}" class="img-item-gaveta">` : ""}
        <div class="info-item-gaveta">
          <strong>${item.nome}</strong>
          <p class="preco-unit">${item.qtd}x ${formatarPreco(item.preco)}</p>
          <div class="controle-qtd">
            <button onclick="alterarQuantidade(${index}, -1)">−</button>
            <span>${item.qtd}</span>
            <button onclick="alterarQuantidade(${index}, 1)">+</button>
          </div>
        </div>
        <div class="lado-direito-item">
          <button onclick="removerItemCarrinho(${index})" class="btn-remover" title="Remover">
            <i class="fa-solid fa-trash"></i>
          </button>
          <strong class="subtotal-item">${formatarPreco(subtotal)}</strong>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  totalElemento.innerText = formatarPreco(total);
}

// ==========================================
// ALTERAR QUANTIDADE SIMPLES NA GAVETA
// ==========================================
function alterarQuantidade(index, mudanca) {
  carrinho[index].qtd += mudanca;

  // Se a quantidade zerar, remove o item do carrinho
  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }

  salvarCarrinho();
  atualizarContadorCarrinho();
  renderizarItensCarrinho();
}

function removerItemCarrinho(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarContadorCarrinho();
  renderizarItensCarrinho();
}

function enviarPedidoFinalWhatsApp() {
  if (carrinho.length === 0) return;

  const telefone = "5521980033100";
  let mensagem = "Olá, Manu! Quero finalizar o pedido do meu carrinho:\n\n";
  let total = 0;

  carrinho.forEach((item) => {
    const subtotal = item.preco * item.qtd;
    mensagem += `• ${item.qtd}x ${item.nome} - ${formatarPreco(subtotal)}\n`;
    total += subtotal;
  });

  mensagem += `\n*Total: ${formatarPreco(total)}*`;
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

// CLIQUE NO ÍCONE DO CARRINHO NO TOPO
document.addEventListener("click", (e) => {
  if (e.target.closest(".carrinho")) {
    abrirCarrinho();
  }
});

// ==========================================
// SISTEMA DE BUSCA DE PRODUTOS
// ==========================================
function configurarBusca() {
  const inputBusca = document.querySelector(".box-busca input");
  const btnBusca = document.querySelector(".btn-busca");

  if (!inputBusca) return;

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
    if (nomeProduto.toLowerCase().includes(termo)) {
      produto.style.display = "flex";
    } else {
      produto.style.display = "none";
    }
  });
}

// ==========================================
// FILTRO POR CATEGORIAS
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
// SISTEMA DE AVALIAÇÕES
// ==========================================
function salvarAvaliacao() {
  const nome = document.getElementById("nomeCliente").value.trim();
  const nota = document.getElementById("notaCliente").value;
  const texto = document.getElementById("textoCliente").value.trim();

  if (nome === "" || texto === "") return;

  const estrelas = "⭐".repeat(parseInt(nota));
  const novaAvaliacao = { nome, estrelas, texto };

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

  listaAvaliacoes.forEach((item, index) => {
    const cardHtml = `
      <div class="card-avaliacao">
        <button class="btn-excluir-avaliacao" onclick="excluirAvaliacao(${index})" title="Excluir">🗑️</button>
        <div class="estrelas">${item.estrelas}</div>
        <p class="texto-avaliacao">"${item.texto}"</p>
        <span class="nome-cliente">— ${item.nome}</span>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

function excluirAvaliacao(index) {
  let lista = JSON.parse(localStorage.getItem("avaliacoesAtelie")) || [];
  lista.splice(index, 1);
  localStorage.setItem("avaliacoesAtelie", JSON.stringify(lista));
  carregarAvaliacoes();
}


// ==========================================
// NAVEGAÇÃO & PARÂMETROS URL (PRODUTOS.HTML)
// ==========================================
function irParaBusca() {
  const input = document.getElementById("inputBuscaHome");
  if (!input) return;
  const termo = input.value.trim();
  if (termo !== "") {
    window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoria = urlParams.get("cat");
  const busca = urlParams.get("busca");

  const titulo = document.getElementById("tituloCategoria");
  const produtos = document.querySelectorAll(".card-produto");

  if (categoria) {
    document.querySelectorAll(".lista-cat-sidebar a").forEach(link => {
      if (link.getAttribute("data-cat") === categoria) {
        link.classList.add("ativo");
      }
    });

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

    produtos.forEach(prod => {
      const catProd = prod.getAttribute("data-categoria");
      if (categoria === "todos" || catProd === categoria) {
        prod.style.display = "flex";
      } else {
        prod.style.display = "none";
      }
    });
  }

  if (busca) {
    if (titulo) titulo.innerText = `Resultados para "${busca}" 🔍`;
    produtos.forEach(prod => {
      const nomeProd = prod.getAttribute("data-nome") || "";
      if (nomeProd.toLowerCase().includes(busca.toLowerCase())) {
        prod.style.display = "flex";
      } else {
        prod.style.display = "none";
      }
    });
  }
});

function filtrarNaPagina() {
  const termo = document.getElementById("buscaSidebar").value.toLowerCase().trim();
  const produtos = document.querySelectorAll(".card-produto");

  produtos.forEach(prod => {
    const nome = prod.getAttribute("data-nome") || "";
    if (nome.toLowerCase().includes(termo)) {
      prod.style.display = "flex";
    } else {
      prod.style.display = "none";
    }
  });
}

// ==========================================
// LÓGICA DO CARROSSEL DE BANNERS ROTATIVO
// ==========================================
let slideAtual = 0;
let tempoTrocaAuto;

function mostrarSlide(indice) {
  const slides = document.querySelectorAll(".slide");
  const bolinhas = document.querySelectorAll(".bolinha");

  if (slides.length === 0) return;

  if (indice >= slides.length) slideAtual = 0;
  else if (indice < 0) slideAtual = slides.length - 1;
  else slideAtual = indice;

  slides.forEach((s) => s.classList.remove("item-ativo"));
  bolinhas.forEach((b) => b.classList.remove("ativa"));

  slides[slideAtual].classList.add("item-ativo");
  if (bolinhas[slideAtual]) {
    bolinhas[slideAtual].classList.add("ativa");
  }

  reiniciarTemporizador();
}

function mudarSlide(direcao) {
  mostrarSlide(slideAtual + direcao);
}

function irParaSlide(indice) {
  mostrarSlide(indice);
}

function reiniciarTemporizador() {
  clearInterval(tempoTrocaAuto);
  tempoTrocaAuto = setInterval(() => {
    mudarSlide(1);
  }, 5000);
}