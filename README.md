# Escoteiros

🎮 **Jogar online:** https://cacaivilela.github.io/escoteiros/

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
| `dados/` | **conteúdo**, sem lógica: fichas dos personagens e cães (`personagens.js`), tabela de itens (`itens.js`), posições e lugares do cap. 1 (`cap1_lugares.js`), missões (`cap1_missoes.js`), falas em formato de roteiro (`cap1_dialogos.js`). Dá pra mudar uma fala ou criar uma missão sem mexer em código. |
| `motor/` | lógica genérica, sem DOM/THREE: `missoes.js` (estados escondida → disponível → ativa → concluída, gatilhos) e `dialogos.js` (escolhe a fala pelas condições, preenche `{nome}` etc.). |
| `game.js` | o jogo em si: mapa 3D, boneco base (`escoteiro(ficha)`), física, câmera, HUD, minigames, noite e dia 2 do cap. 1. |
| `cap2.js` `cap3.js` `cap4.js` `mods.js` | capítulos seguintes e mods — ainda escrevem as missões e falas direto no código (próximo passo: passar pro motor). |
| `testes/` | testes sem navegador (abaixo). |
| `docs/ENGINE.md` + `engine-hello/` | comparação de engines e o hello world em Godot (issue #1). |
| `BUGS.md` | caderno de bugs com passos pra repetir. |

## Testes
Precisa do `gjs` (JavaScript do GNOME; `sudo apt install gjs`). Leva menos de 2 segundos:
```bash
./testes/roda.sh            # → "capítulo 1 OK" ou a lista do que quebrou
./testes/roda.sh --sabota   # quebra os dados de propósito e mostra que o teste acusa
```
- `testes/cap1.test.js`: um robô joga o capítulo 1 pelo motor de missões e pelo roteiro (fala com o Chefe → bandeira ativa,
  bandeira → Akelá dá lenha e fogueira, pederneira encurta a lenha, praia/molhe por posição, Fantasma…) e confere as regras:
  lista vazia no início, item só depois da missão, "falar com X" nunca conclui por chegar perto, marcador só de missão ativa.
  Também confere que os dados batem entre si (toda missão tem quem dá, toda fala aponta pra missão que existe, toda ficha tem 2+ traços).
- `testes/fumaca.test.js`: carrega **todos** os arquivos do jogo num navegador de mentira (THREE/DOM falsos) — pega erro de
  sintaxe e variável inexistente — e depois joga o capítulo 1 **dentro do game.js**, usando os pontos de interação de verdade
  ("Falar com Chefe Diego", "Pegar lenha", "Abrir o baú"…).

## Mods e mais
Botão 🧩 na tela inicial (embaixo de Personalizar): loja de mods (velocidade, gravidade da Lua, gigante, pôr do sol…), criador de mods
(controles + código JS opcional, salva e baixa .json), skins prontas/criadas/importadas e o DLC Mega Camping (40 capítulos gerados, 55 minijogos, 12 bichos, 4 skins).
Tudo fica em `localStorage` (`escoteiros.mods`); a lógica está em `mods.js`.

## Modo debug
`index.html?debug&pos=x,y&yaw=r&pitch=r&dist=n` pula a tela inicial e posiciona o
jogador (coordenadas em metros, origem em -31.377612, -51.969367). `&top=400` dá
vista aérea. Atalhos pra testar:
- `&missao=lenha` — conclui tudo até a missão `lenha` (na ordem de `dados/cap1_missoes.js`) e deixa ela ativa; `&missao=tudo` conclui todas.
- `&fichas` — teste de reconhecimento (issue #4): todos os personagens em fila a 5 m da câmera; `&fichas&nomes` mostra quem é quem. Mostre pra alguém da família e pergunte "quem é esse?".
- `&intro`, `&noite`, `&dia2`, `&noite2`, `&caes`, `&fuga=2`, `&mini=pesca`… (veja o fim de `game.js`).

Dados do mapa © colaboradores do OpenStreetMap (ODbL). Motor: three.js r128.
