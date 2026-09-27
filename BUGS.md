# Caderno de bugs

Toda queixa de quem joga vira uma linha aqui. Sem passos pra repetir, não tem como corrigir.
Formato: **título** · passos · esperado · aconteceu · estado (`aberto` / `corrigido em <commit>` / `fica`, ver README).

Pra reproduzir rápido, use os atalhos do modo debug (README, seção "Modo debug"), por exemplo
`index.html?debug&missao=lenha` começa com tudo feito até a lenha.

| # | Título | Passos pra repetir | Esperado | Aconteceu | Estado |
|---|---|---|---|---|---|
| 1 | Lista de missões aparece inteira no começo | Começar o cap. 1, olhar o canto superior esquerdo | Lista vazia; cada tarefa surge quando alguém pede | 8 tarefas já listadas, inclusive as que ninguém pediu | corrigido (issue #3: `motor/missoes.js`) |
| 2 | Baú da pederneira funciona sem missão | Cap. 1, ir direto pra casinha do salva-vidas, E no baú | Nada acontece até a Larissa contar do baú | Abre e dá a pederneira | corrigido (issue #3) |
| 3 | Lenha coletável antes da missão | Cap. 1, sair pegando lenha antes de fazer a bandeira | Lenha só existe depois que a Akelá pede | Contava (0/6 → 1/6) com a missão ainda "por vir" | corrigido (issue #3) |
| 4 | Pegar item cria missão do nada | (mesmo que #3) | — | — | corrigido (issue #3) |
| 5 | Pouca lenha pra achar | Missão da lenha ativa, procurar na mata | Sobra lenha (20 pra uma meta de 6) | Só 6 no mapa inteiro | corrigido (issue #3) |
| 6 | Jogador atravessa parede | `?debug&pos=-22,8` (cantina), correr contra a parede segurando Shift | Parar na parede | Passa por dentro em alguns ângulos/velocidade | corrigido: o passo agora é dividido em pedaços de 0,25 m com colisão em cada um (`andaEmPassos`); acontecia com turbo/Shift/mod de velocidade e quadros lentos |
| 7 | Câmera entra no chão | `?debug&pos=-186,-136`, girar a câmera pra baixo (pitch alto) num barranco | Câmera fica acima do chão | Vê o terreno por baixo | corrigido: o caso real era em piso elevado (plataforma da árvore, copa, ponte); a câmera agora respeita o piso e o chão também depois do lerp |
| 8 | Pause não sai | Jogando, apertar Esc, clicar em "Pausado — clique para continuar" | Volta pro jogo | Às vezes continua pausado (o navegador recusa `requestPointerLock` logo depois do Esc) | corrigido: `travar()` espera 1,1 s depois do Esc e avisa "Clique de novo" se o navegador recusar |
| 9 | Missão de "falar com X" concluía ao chegar perto | (não acontece mais no cap. 1: o motor só conclui "falar" em `Missoes.falou`) | — | — | corrigido (issue #3) |
| 10 | Tela preta ao começar os caps. 2 a 5 | Menu → escolher cap. 2, 3, 4 ou 5 (DLC) → clicar pra jogar | A tela clareia e o capítulo começa | Fica tudo preto: `preparaSabado` dava `ReferenceError: alisson is not defined` logo depois de escurecer (a mudança dos NPCs pros `dados/` tirou `const alisson` e `const chefe` do `game.js`) | corrigido (`game.js`: `alisson` e `chefe` voltam como atalhos pros NPCs criados pelos dados) |

## Como anotar um bug novo

1. Título curto.
2. Passos: comece do menu (ou de um atalho `?debug&…`) e escreva cada tecla/ação.
3. O que devia acontecer e o que aconteceu.
4. Estado `aberto`. Quando corrigir, rode `./testes/roda.sh` e, se der, acrescente uma conferência no teste pra ele não voltar.
