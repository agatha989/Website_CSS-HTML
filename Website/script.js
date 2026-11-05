// ==========================================
// 1. LISTA DE PRODUTOS (edite SÓ AQUI para mudar produtos)
//    - preco: para produto com preço único
//    - opcoes: para produto com vários tamanhos/quantidades
//    - destaque: true  => aparece em "Mais Vendidos" na página inicial
// ==========================================
const PRODUTOS = [
  { id: "calendario", nome: "Calendário Magnético", categoria: "imas", img: "imagens/calendario.png", preco: 29.9, destaque: true },
  { id: "ima-redondo", nome: "Kit Ímã Redondo (4 unidades)", categoria: "imas", img: "imagens/ima_redondo.png", preco: 24 },
  { id: "kit-ima-quadrado", nome: "Kit Ímãs Quadrados (5x5 cm)", categoria: "imas", img: "imagens/ima_quadrado.png", destaque: true,
    opcoes: [
      { rotulo: "Kit 2", preco: 18 }, { rotulo: "Kit 4", preco: 30 }, { rotulo: "Kit 6", preco: 42 },
      { rotulo: "Kit 8", preco: 52 }, { rotulo: "Kit 10", preco: 60 }, { rotulo: "Kit 12", preco: 69 },
    ] },
  { id: "abridor-garrafa", nome: "Chaveiro Abridor de Garrafa (44mm)", categoria: "chaveiros", img: "imagens/AbridordeGarrafa.png", preco: 13, destaque: true },
  { id: "chaveiro-espelho", nome: "Chaveiro Espelho (58mm)", categoria: "chaveiros", img: "imagens/chaveiro_espelho.png", preco: 15 },
  { id: "abridor-lata", nome: "Chaveiro Abridor de Lata (32mm)", categoria: "chaveiros", img: "imagens/abridordelata.png", preco: 12 },
  { id: "botton", nome: "Bottons (44mm)", categoria: "bottons", img: "imagens/Bottons.png", destaque: true,
    opcoes: [ { rotulo: "1 unidade", preco: 4.5 }, { rotulo: "5 unidades", preco: 20 } ] },
  { id: "enfeite-natal", nome: "Enfeite de Natal", categoria: "natal", img: "imagens/EnfeitedeNatal.png",
    opcoes: [ { rotulo: "1 unidade", preco: 12 }, { rotulo: "3 unidades", preco: 30 }, { rotulo: "6 unidades", preco: 55 } ] },
  { id: "caixinha-natal", nome: "Caixinha de Natal", categoria: "natal", img: "imagens/caixinha_natal.jpeg", preco: 59.9 },
  { id: "photocard", nome: "Photocard Personalizado", categoria: "photocards", img: "imagens/photocard.png",
    opcoes: [ {rotulo: "unidade", preco: 3}, { rotulo: "Kit 10 personalizado na frente", preco: 20 }, { rotulo: "Kit 10 personalizado frente e verso", preco: 26 } ] },
  { id: "foto-ima", nome: "Foto Ímã lembranças estilo polaroid", categoria: "imas", img: "imagens/foto_ima.png",
    opcoes: [ {rotulo: "unidade", preco: 5.5}, { rotulo: "Kit 10", preco: 50 } ] },
  ];

const TITULOS_CATEGORIA = {
  todos: "Todos os Produtos ✨",
  imas: "Ímãs Personalizados 💖",
  chaveiros: "Chaveiros Exclusivos 🔑",
  natal: "Especial Natal 🎄",
  bottons: "Bottons & Pins 🔘",
  photocards: "Photocards Personalizados 📸"
};

// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================
function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

// Evita que texto digitado por clientes quebre o HTML (segurança)
function esc(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function lerLocal(chave) {
  try { return JSON.parse(localStorage.getItem(chave)) || []; }
  catch (e) { return []; }
}

// ==========================================
// 3. CARDS DE PRODUTO (a mesma função monta as 2 páginas)
// ==========================================
function montarCard(p) {
  const temOpcoes = Array.isArray(p.opcoes);
  const precoInicial = temOpcoes ? p.opcoes[0].preco : p.preco;

  const select = temOpcoes
    ? `<select class="select-opcao" aria-label="Escolha a opção">
         ${p.opcoes.map((o, i) => `<option value="${i}">${esc(o.rotulo)} — ${formatarPreco(o.preco)}</option>`).join("")}
       </select>`
    : "";

  return `
    <article class="card-produto" data-id="${p.id}">
      <div class="box-foto-produto">
        <img src="${p.img}" alt="${esc(p.nome)}" class="img-produto" loading="lazy">
      </div>
      <div class="info-produto">
        <h3 class="titulo-produto">${esc(p.nome)}</h3>
        ${select}
        <div class="rodape-card">
          <div class="bloco-preco">
            <small>${temOpcoes ? "A partir de" : ""}</small>
            <span class="preco">${formatarPreco(precoInicial)}</span>
          </div>
          <button class="btn-carrinho-float" data-add="${p.id}" title="Adicionar ao carrinho" aria-label="Adicionar ${esc(p.nome)} ao carrinho">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>
        </div>
      </div>
    </article>`;
}

function renderizarProdutos(lista, container) {
  if (!container) return;
  container.innerHTML = lista.length
    ? lista.map(montarCard).join("")
    : `<p class="sem-resultados">Nenhum produto encontrado 🔍</p>`;
}

// Ao trocar a opção do select, atualiza o preço mostrado no card
document.addEventListener("change", (e) => {
  const select = e.target.closest(".select-opcao");
  if (!select) return;
  const card = select.closest(".card-produto");
  const produto = PRODUTOS.find((p) => p.id === card.dataset.id);
  card.querySelector(".preco").innerText = formatarPreco(produto.opcoes[select.value].preco);
  card.querySelector(".bloco-preco small").innerText = "";
});

// ==========================================
// 4. CARRINHO
// ==========================================
let carrinho = lerLocal("carrinhoAtelie")
  .filter((i) => typeof i.preco === "number" && !isNaN(i.preco))
  .map((i) => ({ ...i, qtd: i.qtd || 1 }));

function salvarCarrinho() {
  localStorage.setItem("carrinhoAtelie", JSON.stringify(carrinho));
}

function adicionarAoCarrinho(nome, preco, img) {
  const existente = carrinho.find((i) => i.nome === nome);
  if (existente) existente.qtd++;
  else carrinho.push({ nome, preco, qtd: 1, img });
  salvarCarrinho();
  atualizarContadorCarrinho();
  abrirCarrinho();
}

// Clique em QUALQUER botão de carrinho dos cards
document.addEventListener("click", (e) => {
  const botao = e.target.closest("[data-add]");
  if (botao) {
    const card = botao.closest(".card-produto");
    const p = PRODUTOS.find((x) => x.id === botao.dataset.add);
    const select = card.querySelector(".select-opcao");
    if (select) {
      const op = p.opcoes[select.value];
      adicionarAoCarrinho(`${p.nome} (${op.rotulo})`, op.preco, p.img);
    } else {
      adicionarAoCarrinho(p.nome, p.preco, p.img);
    }
    return;
  }
  if (e.target.closest(".btn-carrinho-topo")) abrirCarrinho();
});

function atualizarContadorCarrinho() {
  const total = carrinho.reduce((soma, i) => soma + i.qtd, 0);
  document.querySelectorAll(".badge-carrinho").forEach((b) => (b.innerText = total));
}

function abrirCarrinho() {
  renderizarItensCarrinho();
  document.getElementById("painelCarrinho")?.classList.add("aberto");
  document.getElementById("overlayCarrinho")?.classList.add("aberto");
}

function fecharCarrinho() {
  document.getElementById("painelCarrinho")?.classList.remove("aberto");
  document.getElementById("overlayCarrinho")?.classList.remove("aberto");
}

function renderizarItensCarrinho() {
  const container = document.getElementById("itensCarrinhoGaveta");
  const totalEl = document.getElementById("valorTotalCarrinho");
  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio 🛍️</p>`;
    totalEl.innerText = "R$ 0,00";
    return;
  }

  let total = 0;
  container.innerHTML = carrinho.map((item, index) => {
    const subtotal = item.preco * item.qtd;
    total += subtotal;
    return `
      <div class="item-gaveta">
        ${item.img ? `<img src="${item.img}" alt="${esc(item.nome)}" class="img-item-gaveta">` : ""}
        <div class="info-item-gaveta">
          <strong>${esc(item.nome)}</strong>
          <p class="preco-unit">${item.qtd}x ${formatarPreco(item.preco)}</p>
          <div class="controle-qtd">
            <button onclick="alterarQuantidade(${index}, -1)" aria-label="Diminuir">−</button>
            <span>${item.qtd}</span>
            <button onclick="alterarQuantidade(${index}, 1)" aria-label="Aumentar">+</button>
          </div>
        </div>
        <div class="lado-direito-item">
          <button onclick="removerItemCarrinho(${index})" class="btn-remover" title="Remover"><i class="fa-solid fa-trash"></i></button>
          <strong class="subtotal-item">${formatarPreco(subtotal)}</strong>
        </div>
      </div>`;
  }).join("");
  totalEl.innerText = formatarPreco(total);
}

function alterarQuantidade(index, mudanca) {
  carrinho[index].qtd += mudanca;
  if (carrinho[index].qtd <= 0) carrinho.splice(index, 1);
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
  carrinho.forEach((i) => {
    const subtotal = i.preco * i.qtd;
    mensagem += `• ${i.qtd}x ${i.nome} - ${formatarPreco(subtotal)}\n`;
    total += subtotal;
  });
  mensagem += `\n*Total: ${formatarPreco(total)}*`;
  window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`, "_blank");
}

// ==========================================
// 5. BUSCA (a mesma caixa serve para as 2 páginas)
// ==========================================
function buscarNoTopo() {
  const termo = document.getElementById("buscaTopo")?.value.trim() || "";
  const grid = document.getElementById("gridProdutosCat");
  if (grid) {
    // Já está na página de produtos: filtra na hora
    aplicarFiltros(termo);
  } else if (termo) {
    // Está na home: vai para a página de produtos com a busca
    window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
  }
}

// ==========================================
// 6. PÁGINA PRODUTOS: filtros por categoria + busca
// ==========================================
function aplicarFiltros(termoDigitado) {
  const grid = document.getElementById("gridProdutosCat");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("cat") || "todos";
  const termo = (termoDigitado ?? params.get("busca") ?? "").toLowerCase().trim();

  let lista = PRODUTOS.filter((p) => categoria === "todos" || p.categoria === categoria);
  if (termo) lista = lista.filter((p) => p.nome.toLowerCase().includes(termo));

  const titulo = document.getElementById("tituloCategoria");
  if (titulo) {
    titulo.innerText = termo ? `Resultados para "${termo}" 🔍` : TITULOS_CATEGORIA[categoria] || "Nossos Produtos ✨";
  }
  document.querySelectorAll(".lista-cat-sidebar a").forEach((a) => {
    a.classList.toggle("ativo", a.dataset.cat === categoria);
  });
  renderizarProdutos(lista, grid);
}

// ==========================================
// 7. AVALIAÇÕES (salvas só no navegador de quem enviou)
// ==========================================
function salvarAvaliacao() {
  const nome = document.getElementById("nomeCliente").value.trim();
  const nota = parseInt(document.getElementById("notaCliente").value, 10);
  const texto = document.getElementById("textoCliente").value.trim();
  if (!nome || !texto) return;

  const lista = lerLocal("avaliacoesAtelie");
  lista.unshift({ nome, estrelas: "⭐".repeat(nota), texto });
  localStorage.setItem("avaliacoesAtelie", JSON.stringify(lista));

  document.getElementById("nomeCliente").value = "";
  document.getElementById("textoCliente").value = "";
  carregarAvaliacoes();
}

function carregarAvaliacoes() {
  const container = document.getElementById("containerAvaliacoes");
  if (!container) return;
  container.innerHTML = lerLocal("avaliacoesAtelie").map((item, index) => `
    <div class="card-avaliacao">
      <button class="btn-excluir-avaliacao" onclick="excluirAvaliacao(${index})" title="Excluir">🗑️</button>
      <div class="estrelas">${esc(item.estrelas)}</div>
      <p class="texto-avaliacao">"${esc(item.texto)}"</p>
      <span class="nome-cliente">— ${esc(item.nome)}</span>
    </div>`).join("");
}

function excluirAvaliacao(index) {
  const lista = lerLocal("avaliacoesAtelie");
  lista.splice(index, 1);
  localStorage.setItem("avaliacoesAtelie", JSON.stringify(lista));
  carregarAvaliacoes();
}

// ==========================================
// 8. INICIALIZAÇÃO (roda quando a página abre)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  atualizarContadorCarrinho();
  carregarAvaliacoes();

  // Home: "Mais Vendidos"
  renderizarProdutos(PRODUTOS.filter((p) => p.destaque), document.getElementById("gridMaisVendidos"));

  // Página de produtos
  aplicarFiltros();

  // Enter na caixa de busca
  document.getElementById("buscaTopo")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarNoTopo();
  });
});
