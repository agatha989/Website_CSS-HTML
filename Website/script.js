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