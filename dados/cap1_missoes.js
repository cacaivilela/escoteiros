// ---------- CAPÍTULO 1 — MISSÕES (só dados, nada de lógica) ----------
// Grafo do capítulo (caixinha = missão, seta = "abre", etiqueta = gatilho de conclusão):
//
//   [chefe] ──falar com Chefe Diego──▶ [bandeira] ──minigame bandeira──▶ [lenha] ──6 lenhas (3 com pederneira)──▶
//                                          │                              [fogueira] ──minigame fogo──▶ (dormir na barraca)
//                                          ├──▶ [praia] ──chegar na Praia do Camping──▶
//                                          └──▶ [molhe] ──chegar ao molhe──▶
//   [pederneira] (a Larissa dá a qualquer hora) ──pegar no baú──▶   (com ela, a meta de lenha cai pra 3)
//   [phantom]    (o Alisson dá a qualquer hora) ──levar o Fantasma até o Alisson──▶
//
// Campos de cada missão:
//   id        nome curto usado no código e nos testes
//   txt       texto na lista de tarefas ({n}/{meta} vira o progresso em missões de item)
//   quem      quem dá a missão (personagem ou cutscene) — documentação e conferência nos testes
//   inicio    true = já começa DISPONÍVEL (alguém pode dar a qualquer hora); senão fica ESCONDIDA até outra missão abrir
//   abre      ids que ficam disponíveis quando esta é concluída
//   gatilho   como ela termina: { tipo: 'falar', com } | { tipo: 'minigame', nome } | { tipo: 'item', item, meta }
//                               | { tipo: 'chegar', lugar } ou { tipo: 'chegar', x, y, r } | { tipo: 'custom' } (o código conclui)
//   marcador  [x, y] no mapa (coordenadas osm) — só aparece enquanto a missão está ativa
//   opcional  true = não precisa dela pra terminar o dia

var DADOS = globalThis.DADOS || {};
DADOS.cap1Missoes = [
  { id: 'chefe', txt: 'Voltar à portaria e se apresentar ao Chefe Diego', quem: 'Pai', inicio: true,
    gatilho: { tipo: 'falar', com: 'Chefe Diego' }, marcador: [190, 211], abre: ['bandeira'] },

  { id: 'bandeira', txt: 'Fazer a bandeira com a alcateia na árvore do lobinhos.com, em frente à cantina', quem: 'Chefe Diego',
    gatilho: { tipo: 'minigame', nome: 'bandeira' }, marcador: [-34, 2], abre: ['lenha', 'fogueira', 'praia', 'molhe'] },

  { id: 'lenha', txt: 'Juntar lenha na mata ({n}/{meta}) — com a pederneira bastam 3', quem: 'Akelá',
    gatilho: { tipo: 'item', item: 'lenha', meta: 6 } },

  { id: 'fogueira', txt: 'Acender a fogueira do conselho na sede', quem: 'Akelá',
    gatilho: { tipo: 'minigame', nome: 'fogo' }, marcador: [-186, -136] },

  { id: 'pederneira', txt: 'Pegar a pederneira no baú da casinha do salva-vidas', quem: 'Lobinha Larissa', inicio: true, opcional: true,
    gatilho: { tipo: 'item', item: 'pederneira', meta: 1 }, marcador: [95, -17] },

  { id: 'phantom', txt: 'Achar o Fantasma, o cachorro do camping (preto em cima, branco embaixo), pro Alisson', quem: 'Lobinho Alisson', inicio: true, opcional: true,
    gatilho: { tipo: 'custom' }, marcador: [-34, 2] },

  { id: 'praia', txt: 'Ir até a Praia do Camping com a Maria', quem: 'Lobinha Maria', opcional: true,
    gatilho: { tipo: 'chegar', lugar: 'praia' }, marcador: [60, -40] },

  { id: 'molhe', txt: 'Chegar ao molhe na ponta do camping e ver o farol', quem: 'Lobinho Davi', opcional: true,
    gatilho: { tipo: 'chegar', x: 244, y: -130, r: 14 }, marcador: [244, -130] },
];
