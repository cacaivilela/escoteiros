// ---------- CAPÍTULO 1 — LUGARES E POSIÇÕES (só dados) ----------
// A geometria real do camping (contorno, praia, estradas, construções mapeadas) vem do OpenStreetMap e está em mapa.js.
// Aqui ficam as posições que o jogo inventa por cima do mapa: onde cada pessoa está, nomes dos lugares pro HUD,
// destinos do Fantasma, onde cada minigame acontece. Coordenadas em metros (osm): x = leste, y = norte.

var DADOS = globalThis.DADOS || {};
DADOS.cap1Lugares = {
  arvoreDaBandeira: [-34, 2],                    // em frente à cantina
  portaria: [190, 211],
  chuveiroDaPraia: [32, -22],
  casinhaDoSalvaVidas: [95, -17],
  fogueiraDoConselho: [-186, -136],
  barracasDaFamilia: [[-232, -150], [-236, -136], [-230, -122]],   // gêmeo(a), a minha, o Pai
  molhe: { x: 244, y: -130, r: 14 },

  // onde cada pessoa fica no começo do capítulo. "roda" = em roda na árvore da bandeira (ângulo em rad, raio 6 m)
  npcs: [
    { id: 'chefe',   x: 190, y: 211, rot: 2.4 },
    { id: 'pedro',   x: -200, y: -128, rot: 0.5 },
    { id: 'lucas',   x: 185, y: 60, rot: 1 },
    { id: 'akela',   x: -40, y: -2, rot: 0.6 },
    { id: 'dudu',    roda: 0.9 },
    { id: 'maria',   roda: 2.1 },
    { id: 'davi',    roda: 3.3 },
    { id: 'larissa', roda: 4.5 },
    { id: 'joaquim', roda: 5.6 },
    { id: 'alisson', x: -43, y: 9, rot: 2.6 },
  ],
  rodaRaio: 6,

  // os cães do camping (só aparecem depois que o Alisson pede ajuda). O Fantasma começa em cima da árvore.
  cachorros: [
    { id: 'caramelo', x: 35, y: 27 }, { id: 'mel', x: -108, y: -28 }, { id: 'pingo', x: 62, y: -18 },
    { id: 'fumaca', x: -70, y: -62 }, { id: 'bolota', x: -190, y: -125 }, { id: 'thor', x: 150, y: 125 },
  ],

  // caminhos das cutscenes de chegada
  caminhoDoCarro: [[150, 270], [189, 255], [200, 249], [196, 236], [193, 226]],   // Alameda Mano Serpa até a portaria
  caminhoAPe: [[193, 222], [188, 203], [176, 168], [161, 142], [142, 119], [124, 95], [117, 84], [97, 52], [72, 41], [46, 33], [17, 6], [-15, -11], [-31, -18], [-34, -6]],

  // nome do lugar no canto da tela (o primeiro que bater vale; "poly" usa um polígono de mapa.js)
  locais: [
    { nome: 'Portaria', x: 190, y: 210, r: 30 }, { nome: 'Campo do Camping', x: 187, y: 64, r: 30 },
    { nome: 'Árvore do lobinhos.com', x: -34, y: 2, r: 9 }, { nome: 'Cantina (Lanchonete do Camping)', x: -22, y: 8, r: 22 }, { nome: 'Banheiros', x: -50, y: -8, r: 12 },
    { nome: 'Praia do Camping', poly: 'praia' }, { nome: 'Playground', x: 0, y: -62, r: 12 },
    { nome: 'Quadra de Vôlei', x: 120, y: -2, r: 14 }, { nome: 'Casinha do Salva-vidas', x: 95, y: -17, r: 7 }, { nome: 'Cancha de Bocha', x: -70, y: -70, r: 14 },
    { nome: 'Fogueira do Conselho', x: -186, y: -136, r: 7 }, { nome: 'Barracas da família', x: -233, y: -136, r: 10 }, { nome: 'Sede do Grupo Escoteiro Garibaldi', x: -205, y: -135, r: 35 }, { nome: 'Churrasqueira Coletiva', x: 60, y: -6, r: 10 },
    { nome: 'Churrasqueira Coletiva', x: -120, y: -128, r: 10 }, { nome: 'Molhe', x: 247, y: -115, r: 28 },
    { nome: 'Iate Clube', poly: 'iate' }, { nome: 'Lagoa dos Patos', agua: true },
    { nome: 'Área de acampamento', x: -100, y: -20, r: 30 }, { nome: 'Área de acampamento', x: 40, y: 30, r: 22 },
    { nome: 'Área de acampamento', x: -160, y: -90, r: 22 }, { nome: 'Área de acampamento', x: 130, y: 130, r: 20 },
    { nome: 'Mata nativa', poly: 'camping' }, { nome: 'Alameda Mano Serpa', poly: 'continente' },
  ],

  // pra onde o Fantasma leva a Maria (habilidade do biscoito)
  destinos: [['Portaria', 190, 218], ['Árvore do lobinhos.com', -34, -8], ['Praia do Camping', 60, -40], ['Casinha do salva-vidas', 95, -24], ['Sede do Grupo Escoteiro', -200, -138], ['Molhe', 247, -110], ['Campo do Camping', 187, 60], ['Cancha de bocha', -70, -62]],

  // onde cada minigame do menu acontece: [x, y, direção da câmera]
  minigames: { bandeira: [-34, -9, 0], fogo: [-186, -142, 0], martelar: [-204, -126, 0.3], serrar: [-30, -10, 0.4], amarrar: [-70, -2, 0.2], pesca: [320, 195, 0], bocha: [-80, -70, 1.7708], futebol: [172, 58, 0.6] },
};
