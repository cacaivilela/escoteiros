// ---------- CAPÍTULO 4 — MISSÕES (só dados, nada de lógica) ----------
// O Distrital (tema Pokémon): ônibus das alcateias visitantes, 8 ginásios na ordem de Kanto, a Liga, a foto e a despedida.
// Grafo do capítulo (caixinha = missão, seta = "abre", etiqueta = gatilho de conclusão). Uma linha só:
//
//   [c4_akela] ──falar com a Akelá──▶ [c4_onibus] ──o ônibus chega (cap4.js)──▶ [c4_abertura] ──falar com o Chefe Diego──▶
//   [c4_gym_pedra] ─▶ [c4_gym_cascata] ─▶ [c4_gym_trovao] ─▶ [c4_gym_arcoiris] ─▶ [c4_gym_alma] ─▶ [c4_gym_lama] ─▶ [c4_gym_vulcao] ─▶ [c4_gym_terra]
//        (cada ginásio: desafio + quiz do líder; acertou o quiz → insígnia → cap4.js conclui e dá o próximo)
//   ─▶ [c4_liga] ──quiz final com a Akelá (cap4.js)──▶ [c4_foto] ──foto na árvore (cap4.js)──▶ [c4_despedida] ──o ônibus vai embora (cap4.js)──▶ (fim)
//
// Os ids dos ginásios são 'c4_gym_' + id do ginásio em GINASIOS (cap4.js); o teste confere que batem.
// Ponto de retomar (save / ?continuar=pedra): 'pedra' → Distrital aberto, c4_gym_pedra ativa (cap4.js: retomaCap4Molhe).
// Formato dos campos: veja dados/cap1_missoes.js.

var DADOS = globalThis.DADOS || {};
DADOS.cap4Missoes = [
  { id: 'c4_akela', txt: 'Sábado do Distrital! Falar com a Akelá na árvore do lobinhos.com', quem: 'Akelá', inicio: true,
    gatilho: { tipo: 'falar', com: 'Akelá' }, marcador: [-34, 2], abre: ['c4_onibus'] },

  { id: 'c4_onibus', txt: 'Receber o ônibus das alcateias visitantes na portaria', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [193, 226], abre: ['c4_abertura'] },

  { id: 'c4_abertura', txt: 'Abertura do Distrital: falar com o Chefe Diego na árvore do lobinhos.com', quem: 'Chefe Diego',
    gatilho: { tipo: 'falar', com: 'Chefe Diego' }, marcador: [-34, 2], abre: ['c4_gym_pedra'] },

  { id: 'c4_gym_pedra', txt: '🪨 Ginásio de Pedra (molhe): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [245, -128], abre: ['c4_gym_cascata'] },

  { id: 'c4_gym_cascata', txt: '💧 Ginásio da Cascata (Praia do Camping): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [100, -22], abre: ['c4_gym_trovao'] },

  { id: 'c4_gym_trovao', txt: '⚡ Ginásio do Trovão (Campo do Camping): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [175, 60], abre: ['c4_gym_arcoiris'] },

  { id: 'c4_gym_arcoiris', txt: '🌈 Ginásio do Arco-íris (mata, atrás da cancha de bocha): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-88, -50], abre: ['c4_gym_alma'] },

  { id: 'c4_gym_alma', txt: '☠️ Ginásio da Alma (cancha de bocha): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-64, -66], abre: ['c4_gym_lama'] },

  { id: 'c4_gym_lama', txt: '🔮 Ginásio da Lama (playground): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [0, -56], abre: ['c4_gym_vulcao'] },

  { id: 'c4_gym_vulcao', txt: '🔥 Ginásio do Vulcão (Fogueira do Conselho): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-182, -131], abre: ['c4_gym_terra'] },

  { id: 'c4_gym_terra', txt: '🌎 Ginásio da Terra (frente da sede): desafio + quiz do líder', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-206, -126], abre: ['c4_liga'] },

  { id: 'c4_liga', txt: 'Liga do Distrital: com as 8 insígnias, o quiz final com a Akelá', quem: 'Chefe Diego',
    gatilho: { tipo: 'custom' }, marcador: [-34, 2], abre: ['c4_foto'] },

  { id: 'c4_foto', txt: 'Foto oficial do Distrital na árvore do lobinhos.com', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [-34, 2], abre: ['c4_despedida'] },

  { id: 'c4_despedida', txt: 'Despedir as alcateias visitantes no ônibus, na portaria', quem: 'Akelá',
    gatilho: { tipo: 'custom' }, marcador: [193, 226] },
];
