// Função para gerar o link do WhatsApp com mensagem pronta
function enviarPedidoWhatsApp(nomeProduto) {
  // Número de WhatsApp da loja (apenas números)
  const telefone = "5521980033100";
  
  // Criamos a mensagem personalizada
  const mensagem = `Olá, Manu! Vi o site do Ateliê e gostaria de fazer um orçamento do item: ${nomeProduto} 💕`;
  
  // encodeURIComponent garante que espaços e emojis funcionem dentro da URL!
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
  
  // Abre o WhatsApp numa nova aba
  window.open(url, '_blank');
}

// Função para carregar as avaliações salvas assim que a página abre
document.addEventListener("DOMContentLoaded", carregarAvaliacoes);

function salvarAvaliacao() {
  const nome = document.getElementById("nomeCliente").value.trim();
  const nota = document.getElementById("notaCliente").value;
  const texto = document.getElementById("textoCliente").value.trim();

  if (nome === "" || texto === "") {
    alert("Por favor, preencha seu nome e a mensagem antes de enviar! 💕");
    return;
  }

  // Converte o número da nota em emojis de estrelas
  const estrelas = "⭐".repeat(parseInt(nota));

  const novaAvaliacao = {
    nome: nome,
    estrelas: estrelas,
    texto: texto
  };

  // Pega as avaliações já salvas no navegador ou cria uma lista vazia
  let listaAvaliacoes = JSON.parse(localStorage.getItem("avaliacoesAtelie")) || [];

  // Adiciona a nova avaliação no topo da lista
  listaAvaliacoes.unshift(novaAvaliacao);

  // Salva no localStorage
  localStorage.setItem("avaliacoesAtelie", JSON.stringify(listaAvaliacoes));

  // Limpa os campos do formulário
  document.getElementById("nomeCliente").value = "";
  document.getElementById("textoCliente").value = "";

  // Atualiza a tela
  carregarAvaliacoes();
}

function carregarAvaliacoes() {
  const container = document.getElementById("containerAvaliacoes");
  let listaAvaliacoes = JSON.parse(localStorage.getItem("avaliacoesAtelie")) || [];

  container.innerHTML = "";

  // Cria o HTML de cada cartão de avaliação
  listaAvaliacoes.forEach(item => {
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