# Escoteiros

🎮 **Jogar online:** http://cacaivilela.github.io/escoteiros/

Jogo 3D em terceira pessoa ambientado no **Camping Municipal da Lagoa dos Patos**
(São Lourenço do Sul – RS), sede do Grupo Escoteiro Garibaldi.

O mapa foi construído a partir da geometria real do OpenStreetMap (`mapa.js`):
contorno da península do camping, Praia do Camping, Iate Clube, Arroio São Lourenço,
estradas internas de terra, Campo do Camping, lanchonete, banheiros, entrada pela
Alameda Mano Serpa e o farol "São Lourenço (Curva)" na lagoa. Estruturas descritas
pela prefeitura (quadras de vôlei/bocha, playground, churrasqueiras individuais e
coletivas, tanques, chuveiros) foram posicionadas de forma aproximada.

## Como jogar

Precisa de um servidor HTTP local (o navegador bloqueia `file://` para scripts externos):

```bash
cd escoteiros
python3 -m http.server 8080
# abra http://localhost:8080
```

| Tecla | Ação |
|---|---|
| W A S D / setas | mover |
| Shift | correr |
| Espaço | pular |
| Mouse | girar câmera (roda = zoom) |
| E | interagir (falar, pegar lenha, montar barraca, hastear bandeira, acender fogueira, continuar falas) |
| Q | habilidade do personagem |
| ← → | nas cenas: bater as asas do gavião, remar, soltar/recolher linha da pipa |
| Esc | sair de um minigame |
| M | mapa grande |
| P | tirar foto (vai pro 📷 Álbum do menu) |

**🌐 Online:** no menu, *Jogar online* → *Criar uma sala* mostra um código (ex.: `LOBO-7K2`); os amigos abrem o jogo (o link do GitHub Pages),
vão em *Jogar online* e digitam o código. Até 6 por sala. Cada um faz as suas tarefas; vocês se veem no camping e no minimapa.
**T** abre as frases prontas (1–7). Precisa de internet (usa o servidor gratuito do PeerJS só pra achar a sala).

**Controles (até 4 jogadores, tela dividida):** dá pra misturar Xbox e controles do Recalbox (USB genéricos tipo Super Nintendo).
No menu o controle navega sem mouse (◀▶▲▼ escolhe, A confirma, B fecha painel, Start começa); no jogo, Start pausa.
Cada controle novo aperta Start pra entrar. Um controle genérico que o jogo não conhece pergunta, na primeira vez, qual botão
faz cada coisa (pular, interagir, habilidade, mapa, correr, start, sair) e guarda isso no navegador; o ❓ Controles do menu tem
"Configurar os controles de novo".

No **celular/tablet** aparecem joystick e botões na tela (✋ = E, ⤒ pular, 🏃 correr, ⭐ habilidade, 🗺️ mapa, 📷 foto, ⏸ pausa);
a câmera gira arrastando o dedo do lado direito e dois dedos dão zoom. Pra ver no computador: `index.html?toque`.

## Capítulos
Na tela inicial dá pra escolher o capítulo (cada um é um sábado da alcateia no camping):
1. O acampamento — chegada, bandeira, fogueira, o Fantasma, a noite e o dia seguinte
2. Uma semana depois
3. Mais um sábado
4. O Distrital (tema Pokémon)

Os capítulos 2 a 4 ficam em `cap2.js`, `cap3.js` e `cap4.js` (carregados depois de `game.js`).

## Tarefas (capítulo 1)
A lista começa vazia: cada tarefa aparece quando alguém pede (o Pai na chegada, o Chefe Diego, a Akelá, a Larissa,
a Maria, o Davi, o Alisson). O grafo do capítulo está desenhado em `dados/cap1_missoes.js`:
1. Apresentar-se ao Chefe Diego na portaria (o Pai pede)
2. Fazer a bandeira na árvore do lobinhos.com (o Chefe pede)
3. Juntar 6 lenhas na mata — 3 com a pederneira (a Akelá pede; a lenha só aparece depois disso)
4. Acender a fogueira do conselho (a Akelá pede)
5. Opcionais: pederneira no baú (Larissa), Praia do Camping (Maria), molhe e farol (Davi), achar o Fantasma (Alisson)

## Como o código está organizado
| Pasta/arquivo | O que é |
|---|---|
| `dados/` | **conteúdo**, sem lógica: fichas dos personagens e cães (`personagens.js`), tabela de itens (`itens.js`), posições e lugares do cap. 1 (`cap1_lugares.js`), missões de cada capítulo com o grafo desenhado no cabeçalho (`cap1_missoes.js` … `cap4_missoes.js`), falas em formato de roteiro (`cap1_dialogos.js`). Dá pra mudar uma fala ou criar uma missão sem mexer em código. |
| `motor/` | lógica genérica, sem DOM/THREE: `missoes.js` (estados escondida → disponível → ativa → concluída, gatilhos, `exporta`/`importa` pra salvar o progresso, `avancaAte` pra retomar) e `dialogos.js` (escolhe a fala pelas condições, preenche `{nome}` etc.). |
| `game.js` | o jogo em si: mapa 3D, boneco base (`escoteiro(ficha)`), física, câmera, HUD, minigames, noite e dia 2 do cap. 1. |
| `cap2.js` `cap3.js` `cap4.js` `mods.js` | capítulos seguintes e mods. As missões dos caps. 2–4 já são do motor (cada capítulo começa com `Missoes.carrega(DADOS.capNMissoes)` e usa `Missoes.da/conclui/texto`); as falas ainda estão no código (próximo passo: roteiro em `dados/capN_dialogos.js`). O DLC (`mods.js`) ainda escreve direto na lista. |
| `extras.js` | distintivos costurados na manga (`dados/distintivos.js`), álbum de fotos, dicas pra quem está começando e o salvar/Continuar. |
| `grama.js` | grama de fios em 3 tapetes que andam com o jogador (uns 300 mil fios: perto, finos e densos; meio e longe: fios mais largos e espaçados), cobrindo o gramado até onde a vista alcança; o vento balança e ela deita embaixo do jogador, NPCs, cachorros e bichos, conforme o tamanho de cada um. Se o jogo ficar lento, usa menos fios sozinha. |
| `online.js` | jogar online: salas com código (LOBO-7K2), computadores ligados direto (WebRTC/PeerJS); cada um vê os amigos andando, pulando, com caretas e frases prontas (T). Sem bate-papo digitado. |
| `toque.js` | controles de toque: os botões mandam as mesmas teclas do teclado, então o jogo não precisa saber que é um celular. |
| `testes/` | testes sem navegador (abaixo). |
| `docs/ENGINE.md` + `engine-hello/` | comparação de engines e o hello world em Godot (issue #1). |
| `BUGS.md` | caderno de bugs com passos pra repetir. |

## Testes
Precisa do `gjs` (JavaScript do GNOME; `sudo apt install gjs`). Leva menos de 2 segundos:
```bash
./testes/roda.sh            # → "capítulos 1–4 OK" ou a lista do que quebrou
./testes/roda.sh --sabota   # quebra os dados de propósito e mostra que o teste acusa
```
- `testes/cap1.test.js`: um robô joga o capítulo 1 pelo motor de missões e pelo roteiro (fala com o Chefe → bandeira ativa,
  bandeira → Akelá dá lenha e fogueira, pederneira encurta a lenha, praia/molhe por posição, Fantasma…) e confere as regras:
  lista vazia no início, item só depois da missão, "falar com X" nunca conclui por chegar perto, marcador só de missão ativa.
  Também confere que os dados batem entre si (toda missão tem quem dá, toda fala aponta pra missão que existe, toda ficha tem 2+ traços).
- `testes/capitulos.test.js`: o mesmo pros capítulos 2, 3 e 4 (um arquivo só, parametrizado): dados válidos e batendo com o
  código do capítulo, um robô que joga cada um pelo motor até o fim (dá → gatilho → conclui → abre a próxima), os pontos de
  retomar e o salvar/restaurar (`Missoes.exporta()` no meio do capítulo, recarrega, `Missoes.importa()`, estado igual).
- `testes/fumaca.test.js`: carrega **todos** os arquivos do jogo num navegador de mentira (THREE/DOM falsos) — pega erro de
  sintaxe e variável inexistente — e depois joga o capítulo 1 **dentro do game.js**, usando os pontos de interação de verdade
  ("Falar com Chefe Diego", "Pegar lenha", "Abrir o baú"…), e começa os capítulos 2, 3, 4 e um do DLC jogando um trecho de cada
  (pega a tela preta do bug #10 e confere que a lista do HUD recomeça a cada capítulo).

## Distintivos, álbum, dicas e salvar
- **🎖️ Distintivos** (menu): 13 conquistas do jogo (minijogos, achar o Fantasma, molhe, explorar 12 lugares, fotos). Os 6 primeiros
  aparecem costurados nas mangas do uniforme. Pra criar um novo: uma linha em `dados/distintivos.js` + `ganhaDistintivo('id')` onde ele é ganho
  (ou o campo `missao`, que dá o distintivo quando essa missão termina).
- **📷 Álbum** (menu): fotos tiradas com P; dá pra ver grande, baixar e apagar. Ficam as 30 mais novas.
- **🎓 Dicas**: aparecem uma vez cada, na hora certa (andar, câmera, E, tarefas/mapa, habilidade, foto, caras) e com o nome do botão
  do teclado, do controle ou do celular. Embaixo do botão de começar dá pra desligar ou "ver de novo".
- **▶ Continuar** (menu): no dia do cap. 1 o jogo salva sozinho a cada tarefa e de 20 em 20 s (missões + onde você está);
  nos caps. 2 e 3 salva o começo do capítulo e o último ponto de retomar. O cap. 4 não tem Continuar: começa sempre do início. Fica tudo no navegador (`escoteiros.save`).

## Mods e mais
Botão 🧩 na tela inicial (embaixo de Personalizar): loja de mods (velocidade, gravidade da Lua, gigante, pôr do sol…), criador de mods
(controles + código JS opcional, salva e baixa .json; o **Tamanho** vai de 15× menor a 20× maior, e a câmera acompanha; também **Gordura**, **Altura**, **Cabeça** — que cresce a partir do pescoço —, **🕊️ Voar** e **👻 Atravessar paredes**), skins prontas/criadas/importadas e o DLC Mega Camping (40 capítulos gerados, 55 minijogos, 12 bichos, 4 skins).
Tudo fica em `localStorage` (`escoteiros.mods`); a lógica está em `mods.js`.

## Modo debug
`index.html?debug&pos=x,y&yaw=r&pitch=r&dist=n` pula a tela inicial e posiciona o
jogador (coordenadas em metros, origem em -31.377612, -51.969367). `&top=400` dá
vista aérea. Atalhos pra testar:
- `&missao=lenha` — conclui tudo até a missão `lenha` (na ordem de `dados/cap1_missoes.js`) e deixa ela ativa; `&missao=tudo` conclui todas.
- `&fichas` — teste de reconhecimento (issue #4): todos os personagens em fila a 5 m da câmera; `&fichas&nomes` mostra quem é quem. Mostre pra alguém da família e pergunte "quem é esse?".
- `&intro`, `&noite`, `&dia2`, `&noite2`, `&caes`, `&fuga=2`, `&mini=pesca`… (veja o fim de `game.js`).
- `&grama=0` desliga a grama de fios (`&grama=0.5` metade, `&grama=2` o dobro).
- `&toque` mostra os controles de celular; `&distintivos` costura todos os distintivos (sem salvar); `&salvar` grava o save mesmo no debug
  (normalmente o `?debug` não mexe no save de verdade).
- Capítulos: `&cap2[=obra|gaviao|bandeira|iate|save|farol]`, `&cap3[=materiais|montar|pipa|casinha|noite]`,
  `&cap4[=ginasios|pedra|cascata|…|terra|liga|foto|despedida]` (veja o fim de `cap2.js`, `cap3.js`, `cap4.js`).
  Retomar: `cap2=save` (depois da bandeira), `cap3=noite` (o grito), `index.html?continuar=pedra` (cap. 4, no molhe).

Dados do mapa © colaboradores do OpenStreetMap (ODbL). Motor: three.js r128.
