// ---------- CAPÍTULO 3 — MISSÕES (só dados, nada de lógica) ----------
// Mais um sábado: dia de pipa com o Pai, concurso na praia, pipa enroscada e o grito do Iate Clube à noite.
// Grafo do capítulo (caixinha = missão, seta = "abre", etiqueta = gatilho de conclusão):
//
//   [c3_akela] ──falar com a Akelá──▶ [c3_pai] ──falar com o Pai──▶ ┬─▶ [c3_bambu] ──3 varetas de bambu──┐
//                                                                 ├─▶ [c3_papel] ──papel de seda────────┼──▶ [c3_montar] (o Pai só dá
//                                                                 └─▶ [c3_linha] ──carretel de linha────┘     com os 3 materiais)
//   [c3_montar] ──3 etapas com o Pai (cap3.js)──▶ [c3_empinar] ──pipa a 40 m (cap3.js)──▶ [c3_concurso] ──80 m (cap3.js)──▶
//   [c3_casinha] ──soltar a pipa da casinha (cap3.js)──▶ [c3_joaquim] ──pegar a pipa na árvore (cap3.js)──▶
//   [c3_grito] ──falar com o Chefe Diego──▶ [c3_iate] ──chegar no Iate Clube──▶ [c3_velejador] ──conversa com o Velejador (cap3.js)──▶
//   [c3_fogueira] ──contar pra alcateia na fogueira (cap3.js)──▶ (fim do capítulo)
//
// O Velejador não tem ficha (é figurante), por isso c3_velejador é custom e não "falar".
// Ponto de retomar (save): 'noite' → tudo até c3_joaquim concluído, c3_grito ativa (cap3.js: retomaCap3Noite).
// Formato dos campos: veja dados/cap1_missoes.js.

var DADOS = globalThis.DADOS || {};
DADOS.cap3Missoes = [
  { id: 'c3_akela', txt: 'Sábado de pipa! Falar com a Akelá na árvore do lobinhos.com', quem: 'Akelá', inicio: true,
    gatilho: { tipo: 'falar', com: 'Akelá' }, marcador: [-34, 2], abre: ['c3_pai'] },

  { id: 'c3_pai', txt: 'Falar com o Pai na portaria — ele ensina a fazer pipa', quem: 'Akelá',
    gatilho: { tipo: 'falar', com: 'Pai' }, abre: ['c3_bambu', 'c3_papel', 'c3_linha'] },

  { id: 'c3_bambu', txt: 'Cortar 3 varetas de bambu na mata, atrás da cancha de bocha ({n}/{meta})', quem: 'Pai',
    gatilho: { tipo: 'item', item: 'bambu', meta: 3 }, abre: ['c3_montar'] },

  { id: 'c3_papel', txt: 'Pegar papel de seda na cantina', quem: 'Pai',
    gatilho: { tipo: 'item', item: 'papel', meta: 1 }, abre: ['c3_montar'] },

  { id: 'c3_linha', txt: 'Pegar o carretel de linha na caixa de pioneiria, na frente da sede', quem: 'Pai',
    gatilho: { tipo: 'item', item: 'linha', meta: 1 }, marcador: [-201, -131], abre: ['c3_montar'] },

  { id: 'c3_montar', txt: 'Montar a pipa com o Pai na portaria (0/3 etapas)', quem: 'Pai',
    gatilho: { tipo: 'custom' }, abre: ['c3_empinar'] },

  { id: 'c3_empinar', txt: 'Empinar a pipa na Praia do Camping (chegar a 40 m)', quem: 'Pai',
    gatilho: { tipo: 'custom' }, marcador: [75, -32], abre: ['c3_concurso'] },

  { id: 'c3_concurso', txt: 'Concurso de altura: passar as pipas do Dudu, da Maria e do Joaquim (80 m)', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [75, -32], abre: ['c3_casinha'] },

  { id: 'c3_casinha', txt: 'Soltar a pipa que enroscou na casinha do salva-vidas', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [95, -17], abre: ['c3_joaquim'] },

  { id: 'c3_joaquim', txt: 'Pegar a pipa do Joaquim na árvore do lobinhos.com (subir pelo A de bambu)', quem: 'Lobinho Joaquim',
    gatilho: { tipo: 'custom' }, marcador: [-34, 2], abre: ['c3_grito'] },

  { id: 'c3_grito', txt: 'Um grito estranho vindo do Iate Clube! Falar com o Chefe Diego', quem: 'Akelá',
    gatilho: { tipo: 'falar', com: 'Chefe Diego' }, abre: ['c3_iate'] },

  { id: 'c3_iate', txt: 'À noite: ir até o Iate Clube pela estrada da portaria, com a lanterna', quem: 'Chefe Diego',
    gatilho: { tipo: 'chegar', x: 300, y: 150, r: 60 }, marcador: [300, 150], abre: ['c3_velejador'] },

  { id: 'c3_velejador', txt: 'Descobrir o que era o grito: falar com o Velejador', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [306, 168], abre: ['c3_fogueira'] },

  { id: 'c3_fogueira', txt: 'Voltar pra Fogueira do Conselho, ao lado da sede do Grupo Escoteiro (🔥 no mapa), e contar pra alcateia', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-186, -136] },
];
