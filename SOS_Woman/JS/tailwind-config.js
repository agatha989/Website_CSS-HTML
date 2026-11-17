// ==========================================================================
// CONFIGURAÇÃO DO TAILWIND
// Aqui a gente só dá NOMES para as cores. Os valores reais vivem em
// CSS/style.css, dentro de ":root" (as variáveis --sos-*).
//
// Por que "rgb(var(--sos-roxo) / <alpha-value>)" em vez de "#783F70"?
// Porque assim o Tailwind consegue criar transparência:
//   bg-sos-uva      -> roxo cheio
//   bg-sos-uva/20   -> mesmo roxo com 20% de opacidade
// O <alpha-value> é o espaço onde o Tailwind coloca esse número.
//
// Quer mudar a cor do site inteiro? Edite só CSS/style.css.
// ==========================================================================

const cor = (nomeDaVariavel) => `rgb(var(--sos-${nomeDaVariavel}) / <alpha-value>)`;

tailwind.config = {
    theme: {
        extend: {
            colors: {
                sos: {
                    /* Cores da marca */
                    amarelo: cor('amarelo'),
                    laranja: cor('laranja'),
                    azul: cor('azul'),
                    rosa: cor('rosa'),
                    roxo: cor('roxo'),

                    /* Roxo principal de texto, links e botões */
                    uva: cor('uva'),
                    'uva-escuro': cor('uva-escuro'),
                    'roxo-medio': cor('roxo-medio'),

                    /* Neutros */
                    creme: cor('creme'),
                    'branco-quente': cor('branco-quente'),
                    escuro: cor('escuro'),
                    texto: cor('texto'),
                    borda: cor('borda'),
                    divisor: cor('divisor'),
                    'input-borda': cor('input-borda'),

                    /* Fundos suaves das seções */
                    faixa: cor('faixa'),
                    chip: cor('chip'),
                    'card-rosa': cor('card-rosa'),
                    'card-azul': cor('card-azul'),
                    'card-amarelo': cor('card-amarelo'),
                    lilas: cor('lilas'),
                    'lilas-forte': cor('lilas-forte'),
                    'azul-claro': cor('azul-claro'),
                    'azul-banner': cor('azul-banner'),
                    pessego: cor('pessego'),
                    modal: cor('modal'),

                    /* Rodapé */
                    'divisor-escuro': cor('divisor-escuro'),
                    'footer-texto': cor('footer-texto'),
                    'footer-fraco': cor('footer-fraco'),
                }
            },
            fontFamily: {
                serif: ['"Lora"', 'Georgia', 'serif'],
                sans: ['"DM Sans"', 'sans-serif'],
            },
            boxShadow: {
                // Sombra suave usada no cartão "Aqui, a sua voz importa."
                suave: '0 10px 30px rgb(82 46 74 / 0.08)',
            }
        }
    }
}
