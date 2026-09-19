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
1. Apresentar-se à Chefe na portaria
2. Hastear a bandeira na sede do Grupo Escoteiro Garibaldi
3. Montar 3 barracas da patrulha
4. Juntar 6 lenhas na mata
5. Acender a fogueira do conselho
6. Ir até a Praia do Camping
7. Chegar ao molhe e ver o farol

## Mods e mais
Botão 🧩 na tela inicial (embaixo de Personalizar): loja de mods (velocidade, gravidade da Lua, gigante, pôr do sol…), criador de mods
(controles + código JS opcional, salva e baixa .json), skins prontas/criadas/importadas e o DLC Mega Camping (40 capítulos gerados, 55 minijogos, 12 bichos, 4 skins).
Tudo fica em `localStorage` (`escoteiros.mods`); a lógica está em `mods.js`.

## Modo debug
`index.html?debug&pos=x,y&yaw=r&pitch=r&dist=n` pula a tela inicial e posiciona o
jogador (coordenadas em metros, origem em -31.377612, -51.969367). `&top=400` dá
vista aérea.

Dados do mapa © colaboradores do OpenStreetMap (ODbL). Motor: three.js r128.
