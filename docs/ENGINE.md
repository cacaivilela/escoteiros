# Issue #1 — Engine e peças prontas

## 1. O que o jogo precisa

| Precisa | Hoje (three.js + JS na mão) |
|---|---|
| 3D em terceira pessoa | three.js renderiza; câmera escrita na mão (`game.js`, ~40 linhas, bugs de entrar no chão/parede) |
| Rodar no navegador (GitHub Pages) | sim |
| Física: gravidade, pulo, colisão com árvores/paredes/água | tudo na mão (`resolveColisoes`, `emTerra`, `naAguaRasa`, `sobrePonte`…) — daí "atravessa parede" |
| Controle (Xbox/Recalbox), tela dividida até 4 | na mão (`lerPad`, `renderTudo`) |
| Diálogo, missões, inventário, minimapa | agora em `motor/` + `dados/` (issues #2 e #3), mas ainda nosso |
| Personagens animados | bonecos de blocos, animação de pernas/braços à mão (issue #4) |
| Mapa real (OSM) | `mapa.js` |
| Som | `som.js` (WebAudio na mão) |
| Multiplayer no futuro | nada |
| Rodar no computador de casa (Linux, sem placa de vídeo dedicada) | roda |

## 2. Comparação

| | **Godot 4** | **Babylon.js** | **PlayCanvas** | Unity |
|---|---|---|---|---|
| Grátis? | sim, MIT, sem conta | sim, Apache | grátis com projetos públicos; editor na nuvem | grátis até certo faturamento, precisa conta e login |
| Exporta pra navegador? | sim (HTML5, funciona no GitHub Pages) | é feito pro navegador | é feito pro navegador | sim, mas pesado (WebGL, 30+ MB) |
| Câmera 3ª pessoa pronta | `SpringArm3D` + `Camera3D` (com colisão, sem código) | `FollowCamera`/`ArcRotateCamera` (sem colisão pronta) | script de exemplo | Cinemachine |
| Física/colisão pronta | `CharacterBody3D`, `StaticBody3D` (nativo) | precisa plugin (Havok/Ammo) | Ammo.js | nativo |
| Controle/gamepad | `Input` nativo, mapa de ações | API do navegador | API do navegador | nativo |
| Diálogo / missões prontos | addons: Dialogic, Dialogue Manager, Quest System | não | não | Asset Store (pagos) |
| Personagens animados prontos | importa GLB/FBX, `AnimationPlayer`, `AnimationTree` | importa GLB | importa GLB | sim |
| Tela dividida | `SubViewport` | várias câmeras/viewports | sim | sim |
| Multiplayer | `MultiplayerAPI` nativo | não | não | Netcode |
| Tutoriais em português | muitos (YouTube, docs traduzidas) | poucos | poucos | muitos |
| Roda no computador de casa | sim (arquivo de 100 MB, sem instalar) — **testado aqui, headless** | sim | precisa internet | pesado, precisa conta |
| Trocar o que já temos | reescrever tudo em GDScript/cena | dá pra migrar aos poucos (também é JS) | reescrever | reescrever |

**Escolha: Godot 4.** É o único que resolve *tudo* da lista sem instalar nada além dele e sem escrever física, câmera ou input.
O custo é reescrever o jogo em cima dele (GDScript é parecido com Python; as *regras* do jogo — missões, falas,
fichas — já estão separadas do código em `dados/`, então elas passam pra lá sem mudar).

Segunda opção, se a ideia for continuar em JavaScript: **Babylon.js** com o plugin de física Havok.
Ganha física e câmera, mas diálogo/missão/animação continuam por nossa conta.

## 3. Hello world (feito e testado)

Pasta [`engine-hello/`](../engine-hello): abrir no Godot 4.3 (Project → Import → `project.godot`) e apertar F5.

- **Boneco anda** (setas), **pula** (espaço), **câmera de 3ª pessoa segue** (mouse) e **não atravessa nada**
  (nem o boneco no muro, nem a câmera na árvore).
- Código próprio: **7 linhas** (girar a câmera com o mouse e andar relativo a ela). O resto é o script que o
  próprio Godot gera (`CharacterBody3D` → "Basic Movement") e três nós prontos: `CharacterBody3D`, `SpringArm3D`, `StaticBody3D`.
- Testado sem tela (`godot --headless`): o boneco cai e para no chão (`y=1`, `no_chao=true`), pula (`y=2.07`) e volta,
  anda até o muro em `z=-6` e **para em `z=-5`** (raio 0.5 + parede 0.5) — colisão funcionando com zero linhas de colisão.

Godot 4.3 pra Linux: <https://godotengine.org/download/linux/> (zip de ~50 MB, descompacta e roda).

## 4. Peças prontas que vou usar × código que só eu posso escrever

**Peças prontas (Godot + addons)**

| Problema | Peça |
|---|---|
| andar, pular, gravidade, colisão | `CharacterBody3D` + template "Basic Movement" |
| câmera de 3ª pessoa que não atravessa | `SpringArm3D` + `Camera3D` |
| chão, árvores, prédios, água rasa | `StaticBody3D`/`Area3D` com `CollisionShape3D` |
| controle Xbox, teclado, tela dividida | `Input` (mapa de ações) + `SubViewport` |
| bonecos animados | pacote CC0 (Kenney "Mini Characters" ou Quaternius) + `AnimationPlayer` |
| falas | addon **Dialogue Manager** (roteiro em texto, igual ao nosso `dados/cap1_dialogos.js`) |
| missões | addon **Quest System** ou nosso `motor/missoes.js` traduzido (é pequeno) |
| minimapa | `SubViewport` com câmera de cima |
| som | `AudioStreamPlayer3D` |
| menu, HUD, pause | `Control`, `CanvasLayer`, `get_tree().paused` |
| testes | **GUT** (Godot Unit Test) rodando com `--headless` |

**Código que só eu posso escrever**

- A história: capítulos, falas, quem dá cada missão, o que abre o quê (`dados/`).
- As pessoas: fichas de cada um, traços reconhecíveis (`dados/personagens.js`).
- O lugar: mapa do camping a partir do OSM (`mapa.js` → malha/heightmap no Godot).
- Os minigames do camping (bandeira, fogueira, pesca, bocha…): a *regra* de cada um.
- As habilidades (macramê da Lara, batucada do Caio, Doidera, Biscoito).
- O Fantasma fugindo, a noite assombrada, o gavião gigante: cutscenes e comportamento.

## 5. Regra do projeto

> **Antes de programar algo, perguntar: "alguém já fez isso?"**
> Se a resposta for "todo jogo tem isso" (câmera, colisão, pause, diálogo, inventário), procurar a peça pronta
> (docs do Godot → Asset Library → GitHub). Só escrever à mão o que é *do Escoteiros*.

Vale também no código atual: o primeiro passo desta regra já foi dado nas issues #2/#3 — as *regras* do jogo
ficaram em arquivos de dados e motores pequenos, que são exatamente o que sobrevive à troca de engine.
