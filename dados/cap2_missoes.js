// ---------- CAPÍTULO 2 — MISSÕES (só dados, nada de lógica) ----------
// Uma semana depois: a cobra levou a bandeira, o gavião gigante, o barco a remo até o Iate Clube e a lenda do farol.
// Grafo do capítulo (caixinha = missão, seta = "abre", etiqueta = gatilho de conclusão). É uma linha só:
//
//   [c2_akela] ──falar com a Akelá──▶ [c2_rastro] ──olhar os 4 rastros (cap2.js)──▶ [c2_cobra] ──chegar na pedra do arroio──▶
//   [c2_diego] ──falar com o Chefe Diego──▶ [c2_gaviao] ──23 etapas no canteiro (cap2.js)──▶ [c2_pilotar] ──minigame gaviao──▶
//   [c2_pegar] ──pegar a bandeira na pedra (cap2.js)──▶ [bandeira] ──minigame bandeira──▶ [c2_barco] ──chegar remando no Iate (cap2.js)──▶
//   [c2_veleiros] ──fala do Velejador (cap2.js)──▶ [c2_farol] ──o barco do pescador chega (cap2.js)──▶ (fim do capítulo)
//
// Quem dá cada uma é o próprio cap2.js (Missoes.da) no ponto da história; "quem" diz quem pede, pra conferir nos testes.
// O id "bandeira" é o mesmo do cap. 1 de propósito: o minigame da árvore (game.js) conclui com Missoes.minigame('bandeira').
// Ponto de retomar (save): 'bandeira' → tudo até a bandeira concluído, c2_barco ativa (cap2.js: retomaDepoisDaBandeira).
// Formato dos campos: veja dados/cap1_missoes.js.

var DADOS = globalThis.DADOS || {};
DADOS.cap2Missoes = [
  { id: 'c2_akela', txt: 'Sábado de novo! Falar com a Akelá na árvore do lobinhos.com', quem: 'Akelá', inicio: true,
    gatilho: { tipo: 'falar', com: 'Akelá' }, marcador: [-34, 2], abre: ['c2_rastro'] },

  { id: 'c2_rastro', txt: 'Seguir o rastro pelo chão (0/4)', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, abre: ['c2_cobra'] },

  { id: 'c2_cobra', txt: 'Chegar perto da pedra no mato do arroio', quem: 'Akelá',
    gatilho: { tipo: 'chegar', x: -80, y: 0, r: 7 }, marcador: [-80, 0], abre: ['c2_diego'] },

  { id: 'c2_diego', txt: 'Falar com o Chefe Diego na portaria sobre a cobra', quem: 'Akelá',
    gatilho: { tipo: 'falar', com: 'Chefe Diego' }, marcador: [190, 211], abre: ['c2_gaviao'] },

  { id: 'c2_gaviao', txt: 'Construir o gavião gigante no canteiro atrás da cantina (0/23 etapas)', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-64, -22], abre: ['c2_pilotar'] },

  { id: 'c2_pilotar', txt: 'Entrar no gavião e espantar a cobra (← → asas · E bico · Q olhos e grito)', quem: 'Chefe Diego',
    gatilho: { tipo: 'minigame', nome: 'gaviao' }, marcador: [-64, -22], abre: ['c2_pegar'] },

  { id: 'c2_pegar', txt: 'Pegar a bandeira na pedra', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [-80, 0], abre: ['bandeira'] },

  { id: 'bandeira', txt: 'Hastear a bandeira de novo na árvore do lobinhos.com', quem: 'Akelá',
    gatilho: { tipo: 'minigame', nome: 'bandeira' }, marcador: [-34, 2], abre: ['c2_barco'] },

  { id: 'c2_barco', txt: 'Passeio: entrar no barco a remo na Praia do Camping (a Akelá e o Alisson vão junto)', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [100, -30], abre: ['c2_veleiros'] },

  { id: 'c2_veleiros', txt: 'Ver os veleiros do Iate Clube', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, abre: ['c2_farol'] },

  { id: 'c2_farol', txt: 'À noite: esperar na praia, perto da casinha do salva-vidas, e ver a luz', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [95, -17] },
];
