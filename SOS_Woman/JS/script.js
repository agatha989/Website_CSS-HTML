// 1. ANIMAÇÃO DE REVELAÇÃO AO ABRIR E ROLAR (SUBINDO E INDO DE 50% A 100% DE COR)
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // 2. EFEITO 3D TÁTIL E LEVANTADA SUAVE NOS CARDS AO PASSAR O MOUSE
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posição X dentro do card
            const y = e.clientY - rect.top;  // Posição Y dentro do card
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Rotação suave (máximo de 5 graus para manter elegância e acolhimento)
            const rotateX = ((y - centerY) / centerY) * -4.5;
            const rotateY = ((x - centerX) / centerX) * 4.5;

            card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg)';
        });
    });
});

// 3. FUNÇÃO DE SAÍDA RÁPIDA (REDIRECIONAMENTO IMEDIATO PARA PÁGINA NEUTRA)
function quickExit() {
    window.location.replace('https://www.google.com/search?q=previsao+do+tempo');
}

// 4. CONTROLE DO MODAL DE RELATO
function openRelatoModal() {
    const modal = document.getElementById('modal-relato');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeRelatoModal() {
    const modal = document.getElementById('modal-relato');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function salvarRelato() {
    const texto = document.getElementById('texto-relato').value.trim();
    const feedback = document.getElementById('feedback-relato');
    if (texto.length > 0) {
        feedback.classList.remove('hidden');
        document.getElementById('texto-relato').value = '';
    }
}

// 5. BUSCA REAL DE REDE DE APOIO
async function buscarApoio(event) {
    event.preventDefault();
    const campo = document.getElementById('campo-cidade');
    const consulta = campo.value.trim();
    const cep = consulta.replace(/\D/g, '');
    const resultado = document.getElementById('resultado-busca');
    if (!consulta) {
        resultado.textContent = 'Digite uma cidade, o CEP ou use sua localização atual.';
        campo.focus();
        return;
    }

    const botao = event.submitter || document.querySelector('#rede-apoio button[type="submit"]');
    const textoBotao = botao.querySelector('span').textContent;
    botao.disabled = true;
    botao.classList.add('opacity-70', 'cursor-wait');
    botao.querySelector('span').textContent = 'Localizando...';
    resultado.textContent = 'Procurando localização e unidades próximas...';

    try {
        let consultaMapa;

        if (/^\d{8}$/.test(cep) || /^\d{5}-?\d{3}$/.test(consulta)) {
            const endereco = await localizarCep(cep);
            consultaMapa = `${consulta}, ${endereco}, Brasil`;
        } else {
            consultaMapa = `${consulta}, Brasil`;
        }

        const pontos = criarPontosGoogle(consultaMapa);
        renderizarPontos(pontos);
        atualizarMapaGoogle(`Delegacia Especializada de Atendimento à Mulher perto de ${consultaMapa}`);
        mostrarAreaApoio();

        resultado.innerHTML = `<span class="text-sos-roxo font-semibold">✓ Veja no Google Maps a unidade mais próxima de ${escaparHtml(consultaMapa)}.</span>`;
    } catch (erro) {
        resultado.innerHTML = `<span class="text-sos-laranja font-semibold">${escaparHtml(erro.message || 'Não foi possível localizar este endereço. Tente novamente com cidade e estado.')} Ligue 180 para orientação.</span>`;
    } finally {
        botao.disabled = false;
        botao.classList.remove('opacity-70', 'cursor-wait');
        botao.querySelector('span').textContent = textoBotao;
    }
}

async function usarLocalizacaoAtual() {
    const resultado = document.getElementById('resultado-busca');
    if (!navigator.geolocation) {
        resultado.textContent = 'Seu navegador não permite usar a localização atual.';
        return;
    }

    resultado.textContent = 'Obtendo sua localização atual...';
    navigator.geolocation.getCurrentPosition(async posicao => {
        try {
            const lat = posicao.coords.latitude;
            const lon = posicao.coords.longitude;
            const localizacaoAtual = `${lat},${lon}`;
            const pontos = criarPontosGoogle(localizacaoAtual);
            renderizarPontos(pontos);
            atualizarMapaGoogle(`Delegacia Especializada de Atendimento à Mulher perto de ${localizacaoAtual}`);
            mostrarAreaApoio();

            resultado.innerHTML = '<span class="text-sos-roxo font-semibold">✓ Veja no Google Maps as unidades mais próximas da sua localização atual.</span>';
        } catch (_) {
            resultado.textContent = 'Não foi possível buscar os pontos próximos da sua localização.';
        }
    }, () => {
        resultado.textContent = 'Não foi possível acessar sua localização. Permita o acesso ou digite sua cidade ou CEP.';
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
    });
}

async function localizarCep(cep) {
    const viaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!viaCep.ok) throw new Error('Não foi possível consultar este CEP.');
    const endereco = await viaCep.json();
    if (endereco.erro) throw new Error('CEP não encontrado.');

    return [
        endereco.logradouro,
        endereco.bairro,
        endereco.localidade,
        endereco.uf,
        endereco.cep
    ].filter(Boolean).join(', ');
}

function atualizarMapaGoogle(consulta) {
    const mapa = document.getElementById('mapa-apoio');
    mapa.src = `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&z=12&output=embed`;
}

function criarPontosGoogle(localizacao) {
    const categorias = [
        {
            titulo: 'Delegacia Especializada de Atendimento à Mulher - Plantão 24h',
            descricao: 'DEAM • Atendimento especializado',
            pesquisa: `Delegacia Especializada de Atendimento à Mulher - Plantão 24h perto de ${localizacao}`,
            icone: 'pino',
            fundo: 'bg-sos-card-rosa'
        },
        {
            titulo: 'Casa da Mulher Brasileira',
            descricao: 'Acolhimento, atendimento jurídico e apoio psicossocial',
            pesquisa: `Casa da Mulher Brasileira mais próxima de ${localizacao}`,
            icone: 'casa',
            fundo: 'bg-sos-card-amarelo'
        },
        {
            titulo: 'Centro de Referência de Assistência Social',
            descricao: 'CRAS • Rede gratuita de assistência social',
            pesquisa: `CRAS mais próximo de ${localizacao}`,
            icone: 'coracao',
            fundo: 'bg-sos-card-azul'
        }
    ];

    return categorias.map(categoria => ({
        encontrado: true,
        nome: categoria.titulo,
        descricao: categoria.descricao,
        icone: categoria.icone,
        fundo: categoria.fundo,
        mapaUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(categoria.pesquisa)}`
    }));
}

// Os mesmos SVGs dos cards do HTML, guardados aqui para o JS reaproveitar.
const ICONES_PONTO = {
    pino: '<svg class="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    casa: '<svg class="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    coracao: '<svg class="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>'
};

function mostrarAreaApoio() {
    const area = document.getElementById('area-apoio');
    area.classList.remove('hidden');
    requestAnimationFrame(() => area.classList.add('is-visible'));
}

function renderizarPontos(pontos) {
    const container = document.getElementById('lista-pontos-apoio');
    container.innerHTML = pontos.map(ponto => {
        return `
            <a href="${ponto.mapaUrl}" target="_blank" rel="noopener noreferrer" class="card-3d group p-4 sm:p-[18px] rounded-[20px] bg-sos-branco-quente flex items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-[16px] ${ponto.fundo} text-sos-uva flex items-center justify-center shrink-0">
                        ${ICONES_PONTO[ponto.icone]}
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-medium text-sos-escuro text-base sm:text-[17px] leading-[1.3]">${escaparHtml(ponto.nome)}</h4>
                        <p class="text-[12px] sm:text-[13px] text-sos-texto mt-0.5">${escaparHtml(ponto.descricao)}</p>
                    </div>
                </div>
                <span class="text-sos-uva text-lg shrink-0 group-hover:translate-x-1 transition-transform" aria-label="Abrir no Google Maps">↗</span>
            </a>`;
    }).join('');
}

function escaparHtml(texto) {
    const elemento = document.createElement('div');
    elemento.textContent = String(texto);
    return elemento.innerHTML;
}
