// ---------- CAPÍTULO 4: o Distrital (tema Pokémon) ----------
// As alcateias dos outros grupos do distrito chegam de ônibus no camping. Cada base é um GINÁSIO: um desafio escoteiro
// pra chegar no líder, que faz um quiz de Pokémon; acertou, ganha a insígnia. Com as 6 insígnias, a Liga com a Akelá.
// Depois: troca de lenço com um lobinho visitante, foto oficial na árvore do lobinhos.com e despedida do ônibus. 14 missões.

var CAP4 = { ativo: false, fase: null, insignias: {}, lideres: {}, visitantes: [], onibus: null, desafio: null, continuar: null };
// 8 ginásios, na ordem de Kanto: Pedra → Cascata → Trovão → Arco-íris → Alma → Lama → Vulcão → Terra (um abre depois do outro)
const GINASIOS = [
  { id: 'pedra', nome: 'Ginásio de Pedra', emoji: '🪨', insignia: 'Insígnia da Pedra', lugar: 'no molhe, na ponta do camping', x: 245, y: -128, lenco: 0x8a7a6a, lider: 'chefe', desafio: 'pedras', txt: 'Juntar 3 pedras redondas no molhe',
    quiz: ['Onix é de que tipos?', ['Pedra e Aço', 'Pedra e Terra', 'Só Pedra', 'Pedra e Água'], 1] },
  { id: 'cascata', nome: 'Ginásio da Cascata', emoji: '💧', insignia: 'Insígnia da Cascata', lugar: 'na Praia do Camping, perto da casinha do salva-vidas', x: 100, y: -22, lenco: 0x1e90ff, desafio: 'pesca', txt: 'Pescar 2 peixes na lagoa',
    quiz: ['Qual destes é um Pokémon de Água?', ['Charmander', 'Squirtle', 'Bulbasaur', 'Pikachu'], 1] },
  { id: 'trovao', nome: 'Ginásio do Trovão', emoji: '⚡', insignia: 'Insígnia do Trovão', lugar: 'no Campo do Camping', x: 175, y: 60, lenco: 0xf2c94c, desafio: 'futebol', txt: 'Fazer 3 gols em 5 chutes',
    quiz: ['Qual é o Pokémon do Ash?', ['Pikachu', 'Raichu', 'Eevee', 'Meowth'], 0] },
  { id: 'arcoiris', nome: 'Ginásio do Arco-íris', emoji: '🌈', insignia: 'Insígnia do Arco-íris', lugar: 'na mata, perto dos bambuzais atrás da cancha de bocha', x: -88, y: -50, lenco: 0x2fa84f, desafio: 'amarrar', txt: 'Dar 3 nós certos na corda',
    quiz: ['Bulbasaur é de que tipos?', ['Planta e Água', 'Só Planta', 'Planta e Fogo', 'Planta e Veneno'], 3] },
  { id: 'alma', nome: 'Ginásio da Alma', emoji: '☠️', insignia: 'Insígnia da Alma', lugar: 'na cancha de bocha', x: -64, y: -66, lenco: 0x9b3fb5, desafio: 'bocha', txt: 'Uma bola a menos de 3 m do bolim em 3 jogadas',
    quiz: ['Qual destes é um Pokémon de Veneno?', ['Geodude', 'Koffing', 'Psyduck', 'Growlithe'], 1] },
  { id: 'lama', nome: 'Ginásio da Lama', emoji: '🔮', insignia: 'Insígnia da Lama', lugar: 'no playground', x: 0, y: -56, lenco: 0xe84a8a, desafio: 'fantasma', txt: 'Adivinhar onde o Fantasma se escondeu e achar ele',
    quiz: ['Abra é de que tipo?', ['Fantasma', 'Normal', 'Psíquico', 'Elétrico'], 2] },
  { id: 'vulcao', nome: 'Ginásio do Vulcão', emoji: '🔥', insignia: 'Insígnia do Vulcão', lugar: 'na Fogueira do Conselho, ao lado da sede', x: -182, y: -131, lenco: 0xe0402a, desafio: 'fogo', txt: 'Acender a fogueira com a pederneira',
    quiz: ['Charmander evolui para...?', ['Charizard', 'Magmar', 'Charmeleon', 'Vulpix'], 2] },
  { id: 'terra', nome: 'Ginásio da Terra', emoji: '🌎', insignia: 'Insígnia da Terra', lugar: 'na frente da sede do Grupo Escoteiro', x: -206, y: -126, lenco: 0x3a2a1a, desafio: 'martelar', txt: 'Pregar 4 pregos da cerca da sede',
    quiz: ['Diglett é de que tipo?', ['Pedra', 'Terra', 'Normal', 'Planta'], 1] },
];
const LIGA_QUIZ = [
  ['Quantos Pokémon tinha na primeira geração?', ['100', '151', '251', '386'], 1],
  ['Qual Pokémon evolui para Pikachu?', ['Raichu', 'Plusle', 'Pichu', 'Nenhum, Pikachu não evolui'], 2],
  ['Quem é o Pokémon falante da Equipe Rocket?', ['Persian', 'Meowth', 'Wobbuffet', 'Ekans'], 1],
];
const C4_MISSOES = [
  ['c4_akela', 'Sábado do Distrital! Falar com a Akelá na árvore do lobinhos.com'],
  ['c4_onibus', 'Receber o ônibus das alcateias visitantes na portaria'],
  ['c4_abertura', 'Abertura do Distrital: falar com o Chefe Diego na árvore do lobinhos.com'],
  ['c4_gym_pedra', '🪨 Ginásio de Pedra (molhe): desafio + quiz do líder'],
  ['c4_gym_cascata', '💧 Ginásio da Cascata (Praia do Camping): desafio + quiz do líder'],
  ['c4_gym_trovao', '⚡ Ginásio do Trovão (Campo do Camping): desafio + quiz do líder'],
  ['c4_gym_arcoiris', '🌈 Ginásio do Arco-íris (mata, atrás da cancha de bocha): desafio + quiz do líder'],
  ['c4_gym_alma', '☠️ Ginásio da Alma (cancha de bocha): desafio + quiz do líder'],
  ['c4_gym_lama', '🔮 Ginásio da Lama (playground): desafio + quiz do líder'],
  ['c4_gym_vulcao', '🔥 Ginásio do Vulcão (Fogueira do Conselho): desafio + quiz do líder'],
  ['c4_gym_terra', '🌎 Ginásio da Terra (frente da sede): desafio + quiz do líder'],
  ['c4_liga', 'Liga do Distrital: com as 8 insígnias, o quiz final com a Akelá'],
  ['c4_foto', 'Foto oficial do Distrital na árvore do lobinhos.com'],
  ['c4_despedida', 'Despedir as alcateias visitantes no ônibus, na portaria'],
];
function c4Missao(id) { const m = C4_MISSOES.find(x => x[0] === id); if (m && !missoes.find(x => x.id === id)) { missoes.push({ id, txt: m[1], ok: false }); renderMissoes(); } }

// painel de insígnias
const insigniasEl = Object.assign(document.body.appendChild(document.createElement('div')), { id: 'insignias' });
insigniasEl.style.cssText = 'display:none;position:fixed;left:50%;top:12px;transform:translateX(-50%);background:rgba(0,0,0,.55);border:2px solid #ffd54a;border-radius:12px;padding:6px 14px;font-size:22px;letter-spacing:4px;z-index:4;pointer-events:none';
function desenhaInsignias() {
  insigniasEl.style.display = CAP4.ativo && CAP4.fase && CAP4.fase !== 'abre' ? 'block' : 'none';
  insigniasEl.innerHTML = GINASIOS.map(g => '<span style="opacity:' + (CAP4.insignias[g.id] ? 1 : 0.22) + '" title="' + g.insignia + '">' + g.emoji + '</span>').join('') + '<span style="font-size:13px;letter-spacing:0;margin-left:10px;opacity:.85">' + Object.keys(CAP4.insignias).length + '/8 insígnias</span>';
}

// ---------- objetos ----------
function criaOnibus() {
  const g = new THREE.Group();
  const amarelo = new THREE.MeshLambertMaterial({ color: 0xf2c94c }), vidro = new THREE.MeshLambertMaterial({ color: 0x2a3a4a });
  g.add(caixa(10, 2.4, 2.6, amarelo, 0, 1.9, 0)); g.add(caixa(10.2, 0.6, 2.7, M.branco, 0, 0.9, 0));
  for (const sz of [-1, 1]) for (let i = -3; i <= 3; i++) g.add(caixa(1.1, 1, 0.05, vidro, i * 1.4, 2.2, sz * 1.31));
  g.add(caixa(0.05, 1.2, 2.2, vidro, 5.03, 2.2, 0));
  for (const sx of [-3.2, 3.2]) for (const sz of [-1.1, 1.1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16), M.preto); r.rotation.x = Math.PI / 2; r.position.set(sx, 0.55, sz); g.add(r); }
  g.add(placa('DISTRITAL 🐺', 0, 3.35, 0, 4));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.visible = false; scene.add(g); return g;
}
function lobinhoVisitante(x, y, rot, nome, lenco, extra) {
  const m = npc(x, y, rot, nome, '', Object.assign({ bone: true, escala: 0.82 + Math.random() * 0.12, lenco: new THREE.MeshLambertMaterial({ color: lenco }) }, extra || {}));
  return m;
}

// ---------- início ----------
function iniciaCap4() {
  if (CAP4.ativo) return;
  preparaSabado(); CAP2.ativo = false; CAP4.ativo = true;
  if (typeof CAP3 !== 'undefined' && CAP3.ativo) { CAP3.ativo = false; if (CAP3.noite) { ligaNoite(false); noite = false; CAP3.noite = false; lampiao.visible = false; } for (const q of (CAP3.pipasNpc || [])) { q.pipa.mesh.visible = false; q.linha.visible = false; } if (CAP3.pipa) { CAP3.pipa.mesh.visible = false; CAP3.linha.visible = false; } }
  if (CAP2.cobra) { CAP2.cobra.mesh.visible = false; CAP2.cobra.mesh.userData.obst.r = 0; }
  bandeira.visible = true; bandeiraAlt = bandeiraAlvo = 5.4;
  CAP4.insignias = {}; CAP4.fase = 'abre'; CAP4.desafio = null;
  interativos.find(i => i.nome === 'Falar com Akelá').acao = c4Akela;
  interativos.find(i => i.nome === 'Falar com Chefe Diego').acao = c4Diego;
  interativos.find(i => i.nome === 'Falar com Pai').acao = () => aviso('Pai: "' + ['Distrital de Pokémon? Na minha época era de... também era Pokémon, na verdade.', 'Cuidado com a linha da pipa... ah não, hoje é Pokémon. Vai lá pegar as insígnias.', 'Se o Dudu fizer 67 de novo eu vou embora na Trailblazer.'][Math.floor(Math.random() * 3)] + '"', 4500);
  interativos.find(i => i.nome === 'Falar com Lobinho Alisson').acao = () => aviso('Lobinho Alisson: "' + (CAP4.insignias.fantasma ? 'O Fantasma se escondeu bem, né? Eu sabia que ele era especial.' : 'Eu sou o treinador do Fantasma. Ele é tipo Fantasma. Óbvio.') + '"', 4000);
  // a Trailblazer sai da frente pro ônibus estacionar
  carro.position.x += 6;
  CAP4.onibus = CAP4.onibus || criaOnibus();
  // líderes de ginásio (lobinhos/escoteiros das alcateias visitantes) — aparecem quando o ônibus chega
  for (const g of GINASIOS) {
    if (g.lider === 'chefe') { CAP4.lideres[g.id] = chefe; if (!chefe.userData.marca) chefe.userData.marca = criaEmoji(g.emoji, g.x, g.y, 3.6); continue; }   // o Chefe Diego é o líder da 1ª base
    if (!CAP4.lideres[g.id]) {
      const m = lobinhoVisitante(g.x, g.y, 0, 'Líder ' + g.nome.replace('Ginásio ', ''), g.lenco, { escala: 1.05, chapeu: true, boneEstilo: 'chapeu', bone: false });
      m.userData.ginasio = g.id; CAP4.lideres[g.id] = m;
      const it = interativos.find(i => i.npcMesh === m); it.acao = () => c4Lider(g);
      m.userData.marca = criaEmoji(g.emoji, g.x, g.y, 3.6);
    }
    const m = CAP4.lideres[g.id]; if (m === chefe) continue; m.visible = false; for (const o of obstaculos) if (o.npc === m) o.r = 0; for (const i of interativos) if (i.npcMesh === m) i.r = 0;
  }
  // lobinho visitante pra trocar lenço, perto da árvore
  if (!CAP4.visitante) { CAP4.visitante = lobinhoVisitante(ARV_BAND[0] + 9, ARV_BAND[1] + 6, 3.6, 'Lobinho Visitante', 0xe0402a, { cabelo: new THREE.MeshLambertMaterial({ color: 0x8a4a1a }), estiloCabelo: 'cacheado' }); interativos.find(i => i.npcMesh === CAP4.visitante).acao = () => aviso('Lobinho Visitante: "Oi! Eu sou do outro grupo do distrito. Que camping legal o de vocês!"', 3500); }
  CAP4.visitante.visible = false; for (const o of obstaculos) if (o.npc === CAP4.visitante) o.r = 0; for (const i of interativos) if (i.npcMesh === CAP4.visitante) i.r = 0;
  missoes.splice(0, missoes.length); c4Missao('c4_akela'); desenhaInsignias();
  cena = { cap2: true, cap4: true, tipo: 'abre', t: 0 };
  textoNoite.textContent = 'Sábado do Distrital — tema: Pokémon'; textoNoite.style.opacity = 1;
  if (CAP4.continuar === 'pedra') retomaCap4Molhe();
}
// save "molhe": Distrital já aberto, ônibus chegou, nenhuma insígnia ainda; começa no molhe com o Chefe Diego (sem botão no menu:
// abre com index.html?continuar=pedra, ou fica guardado no navegador e o cap. 4 continua daí)
function retomaCap4Molhe() {
  const ok = ids => { for (const id of ids) { c4Missao(id); const m = missoes.find(x => x.id === id); if (m) m.ok = true; } };
  missoes.splice(0, missoes.length); ok(['c4_akela', 'c4_onibus', 'c4_abertura']); c4Missao('c4_gym_pedra');
  personalizacao[personagemId].boneEstilo = 'ash'; escolhePersonagem(personagemId);
  const pc = CARRO_CAMINHO[CARRO_CAMINHO.length - 1]; CAP4.onibus.visible = true; CAP4.onibus.position.set(pc[0] - 6, altO(pc[0] - 6, pc[1]), -pc[1]);
  for (const g of GINASIOS) { const m = CAP4.lideres[g.id]; m.visible = true; m.position.set(g.x, altO(g.x, g.y), -g.y); for (const o of obstaculos) if (o.npc === m) { o.x = g.x; o.z = -g.y; o.r = 0.5; } for (const i of interativos) if (i.npcMesh === m) { i.x = g.x; i.z = -g.y; i.r = 3; } }
  CAP4.visitante.visible = true; for (const o of obstaculos) if (o.npc === CAP4.visitante) o.r = 0.5; for (const i of interativos) if (i.npcMesh === CAP4.visitante) i.r = 3;
  CAP4.fase = 'ginasios'; desenhaInsignias();
  estado.pos.set(242, altO(242, -134), 134); estado.yaw = 0.4; jogador.position.copy(estado.pos); cam.yaw = 0.4;
  textoNoite.textContent = 'Continuando: no molhe, antes da primeira insígnia';
  if (cena) cena.t = 1.5;
  setTimeout(() => aviso('Chefe Diego: "Chegou, ' + PERSONAGENS[personagemId].nome + '! Ginásio de Pedra: o desafio são 3 pedras redondas aqui no molhe. Aperte E em mim pra começar."', 6000), 3500);
  try { localStorage.setItem('escoteiros.save', JSON.stringify({ cap: 4, ponto: 'pedra', personagem: personagemId, quando: Date.now() })); } catch (e) {}
}
// ?continuar=pedra na URL (ou save guardado) → escolher o cap. 4 no menu já começa no molhe
{ const c = qs.get('continuar') || ((leSave() || {}).cap === 4 ? (leSave() || {}).ponto : null); if (c === 'pedra') { CAP4.continuar = 'pedra'; if (qs.has('continuar')) { capituloEscolhido = 4; document.querySelectorAll('#inicio .cap').forEach(x => x.classList.toggle('sel', x.dataset.cap === '4')); } } }

// ---------- diálogos ----------
function c4Akela() {
  const f = CAP4.fase;
  if (f === 'abre' || f === 'akela') {
    aviso('Akelá: "' + PERSONAGENS[personagemId].nome + '! Hoje é o DISTRITAL: as alcateias de todo o distrito vêm pro nosso camping, e o tema é POKÉMON! Toma, o boné do Ash pra ti. Agora vai pra portaria receber o ônibus."', 7000);
    personalizacao[personagemId].boneEstilo = 'ash'; escolhePersonagem(personagemId); SOM.coleta();
    completa('c4_akela'); CAP4.fase = 'onibus'; c4Missao('c4_onibus');
  }
  else if (f === 'onibus') aviso('Akelá: "Ficou igualzinho ao Ash! Agora vai pra portaria receber o ônibus."', 4000);
  else if (f === 'abertura') aviso('Akelá: "Fala com o Chefe Diego, ele vai abrir o Distrital e explicar os ginásios."', 4000);
  else if (f === 'ginasios') {
    const n = Object.keys(CAP4.insignias).length, prox = GINASIOS.find(g => !CAP4.insignias[g.id]);
    if (n < 8) aviso('Akelá: "Já tem ' + n + ' insígnia' + (n === 1 ? '' : 's') + '. O próximo é o ' + prox.nome + ' ' + prox.emoji + ', ' + prox.lugar + '. Quando tiver as 8, volta aqui pra Liga!"', 5500);
    else abreQuiz('liga');
  } else if (f === 'foto') aviso('Akelá: "Campeã(o) do Distrital! Agora a foto oficial aqui na árvore, chama todo mundo."', 4500);
  else if (f === 'despedida') aviso('Akelá: "Vai lá na portaria dar tchau pro ônibus!"', 3500);
  else aviso('Akelá: "Que Distrital! Semana que vem tem mais. Grande Uivo!"', 3500);
}
function c4Diego() {
  const f = CAP4.fase;
  if (f === 'abertura') {
    cena = { cap2: true, cap4: true, tipo: 'falas', t: 0, i: -1, falas: [
      'Chefe Diego: "Alcateias do distrito, bem-vindas ao Camping Municipal! Hoje o camping virou a região de Kanto."',
      'Chefe Diego: "São 8 GINÁSIOS espalhados pelo camping, na ordem de Kanto: Pedra, Cascata, Trovão, Arco-íris, Alma, Lama, Vulcão e Terra. Um abre depois do outro."',
      'Chefe Diego: "Em cada um, um desafio escoteiro pra chegar no líder. O líder faz uma pergunta de Pokémon: acertou, ganha a insígnia. Com as 8, a Liga com a Akelá!"',
      'Chefe Diego: "O primeiro é o Ginásio de Pedra, lá no molhe... e o líder sou EU. Te espero lá! Melhor possível! Distrital ABERTO!"',
    ], aoTerminar: () => { cena = null; completa('c4_abertura'); CAP4.fase = 'ginasios'; c4Missao('c4_gym_pedra'); desenhaInsignias(); SOM.uivo();
      const g = GINASIOS[0]; chefe.position.set(g.x, altO(g.x, g.y), -g.y); chefe.rotation.y = 2.6; for (const o of obstaculos) if (o.npc === chefe) { o.x = g.x; o.z = -g.y; } for (const i of interativos) if (i.npcMesh === chefe) { i.x = g.x; i.z = -g.y; }
      aviso('🐺 Alcateias: "AUUUUU!" — primeiro ginásio: Pedra, no molhe, com o próprio Chefe Diego de líder. Siga o 🪨!', 5000); } };
    c2ProximaFala();
  } else if (f === 'ginasios') { if (!CAP4.insignias.pedra) return c4Lider(GINASIOS[0]); const prox = GINASIOS.find(g => !CAP4.insignias[g.id]); aviso('Chefe Diego: "O próximo ginásio é o ' + (prox ? prox.nome + ', ' + prox.lugar : '... nenhum! Vai pra Liga!') + '"', 4000); }
  else if (f === 'onibus') aviso('Chefe Diego: "O ônibus tá chegando pela Alameda! Fica aqui na portaria."', 3500);
  else aviso('Chefe Diego: "Bom Distrital, ' + PERSONAGENS[personagemId].nome + '!"', 3000);
}
function c4Lider(g) {
  if (CAP4.fase !== 'ginasios' && CAP4.fase !== 'troca' && CAP4.fase !== 'foto' && CAP4.fase !== 'despedida' && CAP4.fase !== 'fim') { aviso('Líder: "Espera o Chefe Diego abrir o Distrital!"', 3000); return; }
  if (CAP4.insignias[g.id]) { aviso(lider(g) + ': "Você já tem a ' + g.insignia + '! Boa sorte nos outros ginásios."', 3500); return; }
  const idx = GINASIOS.indexOf(g); if (idx > 0 && !CAP4.insignias[GINASIOS[idx - 1].id]) { const ant = GINASIOS[idx - 1]; aviso(lider(g) + ': "Calma! Na ordem de Kanto, antes de mim vem o ' + ant.nome + ' ' + ant.emoji + ', ' + ant.lugar + '."', 5000); return; }
  const d = CAP4.desafio;
  if (d && d.id === g.id && d.pronto) { abreQuiz(g.id); return; }
  if (d && d.id === g.id && !d.pronto) { iniciaDesafio(g); return; }
  CAP4.desafio = { id: g.id, pronto: false };
  aviso(lider(g) + ': "Bem-vindo ao ' + g.nome + '! Pra me enfrentar, primeiro o desafio: ' + g.txt + '. Aperte E de novo pra começar."', 5500);
}
const lider = g => g.lider === 'chefe' ? 'Chefe Diego' : 'Líder ' + g.nome.replace('Ginásio ', '');
function iniciaDesafio(g) {
  if (mini || cena) return;
  const t = g.desafio;
  if (t === 'fantasma') {
    // o Fantasma sobe na árvore do lobinhos.com (como no cap. 1): tem que subir pelo A de bambu pra achar
    phantom.mesh.visible = true; phantom.mesh.position.set(PHANTOM_ARV[0], ARV_TOPO, -PHANTOM_ARV[1]); phantom.mesh.rotation.set(0, 0.8, 0); phantom.estagio = 9; phantom.seguindo = false;
    CAP4.desafio.esconderijo = PHANTOM_ARV; aviso(lider(g) + ': "O Fantasma se escondeu em algum lugar do camping. Usa a intuição psíquica... e acha ele!"', 5000); SOM.latido();
    return;
  }
  estado.yaw = Math.atan2(CAP4.lideres[g.id].position.x - estado.pos.x, CAP4.lideres[g.id].position.z - estado.pos.z);
  if (t === 'pedras') { CAP4.desafio.pedras = 0; aviso(lider(g) + ': "Tem 3 pedras redondas espalhadas pelo molhe. Traz elas pra mim!"', 4500); return; }
  if (t === 'amarrar') { abreMini('amarrar', ['amarrar', 3, 'Nós do Ginásio do Arco-íris']); return; }
  if (t === 'martelar') { abreMini('martelar', ['martelar', 4, 'Cerca do Ginásio da Terra']); return; }
  if (t === 'fogo') { estado.temPederneira = true; abreMini('fogo'); if (mini) mini.precisa = 99; return; }
  if (t === 'pesca') { abreMini('pesca', ['pesca', 2]); if (mini) mini.precisa = 99; return; }
  if (t === 'bocha') { abreMini('bocha'); if (mini) mini.precisa = 99; return; }
  if (t === 'futebol') { abreMini('futebol'); if (mini) mini.precisa = 99; return; }
}
function desafioVencido(g) {
  if (mini) fechaMini();
  CAP4.desafio.pronto = true; SOM.missao();
  aviso('✅ Desafio do ' + g.nome + ' vencido! Volta no líder (E) pro quiz.', 4000);
  if (g.desafio === 'fogo') { sede.chamas.visible = true; SOM.fogueira(true); }
}
function cap4Etapa() {   // minigames de etapas (amarrar no Arco-íris, martelar na Terra)
  if (!CAP4 || !CAP4.ativo || !CAP4.desafio || CAP4.desafio.pronto) return false;
  const g = GINASIOS.find(x => x.id === CAP4.desafio.id); if (!g || (g.desafio !== 'amarrar' && g.desafio !== 'martelar')) return false;
  desafioVencido(g); return true;
}
// pedras do molhe (Ginásio de Pedra)
const C4_PEDRAS = [[243, -134], [247, -124], [250, -114]];   // em cima do molhe (faixa estreita de pedras)
interativos.push({ x: 0, z: 0, r: 0, nome: 'Pegar a pedra redonda', cond: () => CAP4.ativo && CAP4.desafio && CAP4.desafio.id === 'pedra' && !CAP4.desafio.pronto && CAP4.desafio.pedras !== undefined && CAP4.desafio.pedras < 3, acao: () => {
  CAP4.desafio.pedras++; SOM.coleta(); aviso('🪨 Pedra redonda ' + CAP4.desafio.pedras + '/3!', 2500);
  if (CAP4.desafio.pedras >= 3) desafioVencido(GINASIOS[0]);
} });

// ---------- quiz ----------
function abreQuiz(id) {
  const liga = id === 'liga';
  cena = { cap2: true, cap4: true, tipo: 'quiz', t: 0, id, perguntas: liga ? LIGA_QUIZ : [GINASIOS.find(g => g.id === id).quiz], i: 0, sel: 0, erros: 0 };
  desenhaQuiz();
}
function desenhaQuiz() {
  const q = cena.perguntas[cena.i], g = GINASIOS.find(x => x.id === cena.id);
  destinosEl.style.display = 'block';
  destinosEl.innerHTML = '<b>' + (g ? g.emoji + ' Quiz do ' + g.nome : '🏆 Liga do Distrital (' + (cena.i + 1) + '/' + cena.perguntas.length + ')') + '</b><div style="margin:8px 0 10px">' + q[0] + '</div>' +
    q[1].map((o, i) => '<div class="dest' + (i === cena.sel ? ' sel' : '') + '">' + (i + 1) + ') ' + o + '</div>').join('') + '<small>↑↓ ou 1-4 escolhe · E responde</small>';
}
function respondeQuiz() {
  const q = cena.perguntas[cena.i], g = GINASIOS.find(x => x.id === cena.id), quem = g ? lider(g) : 'Akelá';
  if (cena.sel === q[2]) {
    SOM.coleta(); cena.i++;
    if (cena.i < cena.perguntas.length) { cena.sel = 0; aviso(quem + ': "Certo! Próxima..."', 2000); desenhaQuiz(); return; }
    destinosEl.style.display = 'none'; const id = cena.id; cena = null;
    if (g) {
      CAP4.insignias[id] = true; CAP4.desafio = null; desenhaInsignias(); completa('c4_gym_' + id); SOM.missao();
      const m = CAP4.lideres[id]; if (m.userData.marca) m.userData.marca.visible = false;
      const prox = GINASIOS[GINASIOS.indexOf(g) + 1];
      if (prox) c4Missao('c4_gym_' + prox.id); else c4Missao('c4_liga');
      aviso(quem + ': "ACERTOU! Aqui está a ' + g.insignia + ' ' + g.emoji + '!"' + (prox ? ' Próximo: ' + prox.nome + ' ' + prox.emoji + ', ' + prox.lugar + '.' : ' — 8 insígnias! Vai pra árvore do lobinhos.com enfrentar a Liga com a Akelá!'), 6500);
      if (id === 'lama') { phantom.mesh.position.set(ARV_BAND[0] + 5.4, ARV_BASE - 0.12, -ARV_BAND[1] + 1.2); phantom.mesh.rotation.set(-0.5, 2.6, 0); phantom.estagio = 4; phantom.seguindo = false; }
    } else {
      completa('c4_liga'); CAP4.fase = 'foto'; c4Missao('c4_foto'); SOM.fim();
      aviso('Akelá: "CAMPEÃ(O) DO DISTRITAL! 🏆 As 8 insígnias e a Liga! Agora a foto oficial, aqui na árvore: aperte E em \'Tirar a foto oficial\'."', 7000);
    }
  } else {
    cena.erros++; SOM.grr(); aplicaEmote(jogador, 'triste', 2);
    aviso(quem + ': "Hmm, não é essa. Pensa mais um pouco e tenta de novo!"', 3000);
  }
}
function cap4Tecla(e) {
  if (!CAP4 || !CAP4.ativo || !cena || !cena.cap4) return false;
  if (cena.falas) { if (e.code === 'KeyE' && !e.repeat) c2ProximaFala(); return true; }
  if (cena.tipo === 'quiz') {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') { cena.sel = (cena.sel + 3) % 4; desenhaQuiz(); }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { cena.sel = (cena.sel + 1) % 4; desenhaQuiz(); }
    const n = parseInt(e.key); if (n >= 1 && n <= 4) { cena.sel = n - 1; desenhaQuiz(); }
    if ((e.code === 'Enter' || e.code === 'KeyE') && !e.repeat) respondeQuiz();
    return true;
  }
  return cena.tipo === 'onibus' || cena.tipo === 'foto';
}
function cap4PadExtra(j, inp) {
  if (!CAP4 || !CAP4.ativo || !cena || !cena.cap4 || !inp) return false;
  if (cena.tipo === 'quiz') { if (inp.emote === 'feliz') { cena.sel = (cena.sel + 3) % 4; desenhaQuiz(); } if (inp.emote === 'triste') { cena.sel = (cena.sel + 1) % 4; desenhaQuiz(); } if (inp.interagir || inp.a) respondeQuiz(); return true; }
  return true;
}

// ---------- boné do Ash, ônibus, troca de lenço, foto, despedida ----------
interativos.push({ x: 0, z: 0, r: 14, nome: 'Receber o ônibus', cond: () => CAP4.ativo && CAP4.fase === 'onibus', acao: iniciaOnibus });
interativos.push({ x: ARV_BAND[0], z: -ARV_BAND[1] + 8, r: 7, nome: 'Tirar a foto oficial', cond: () => CAP4.ativo && CAP4.fase === 'foto' && !mini, acao: iniciaFoto });
interativos.push({ x: 0, z: 0, r: 14, nome: 'Despedir o ônibus', cond: () => CAP4.ativo && CAP4.fase === 'despedida', acao: () => {
  cena = { cap2: true, cap4: true, tipo: 'onibus', t: 0, indo: true, idx: CARRO_CAMINHO.length - 1 };
  for (const g of GINASIOS) { if (g.lider === 'chefe') continue; const m = CAP4.lideres[g.id]; m.visible = false; for (const o of obstaculos) if (o.npc === m) o.r = 0; for (const i of interativos) if (i.npcMesh === m) i.r = 0; }
  CAP4.visitante.visible = false; for (const o of obstaculos) if (o.npc === CAP4.visitante) o.r = 0; for (const i of interativos) if (i.npcMesh === CAP4.visitante) i.r = 0;
  aviso('🚌 Alcateias visitantes: "TCHAU, CAMPING! Até o próximo Distrital!"', 4000); SOM.motor(true);
} });
function iniciaOnibus() {
  const c0 = CARRO_CAMINHO[0]; CAP4.onibus.position.set(c0[0], altO(c0[0], c0[1]), -c0[1]); CAP4.onibus.visible = true;
  cena = { cap2: true, cap4: true, tipo: 'onibus', t: 0, idx: 0, indo: false }; SOM.motor(true);
  aviso('🚌 Lá vem o ônibus do distrito pela Alameda Mano Serpa!', 3500);
}
function atualizaOnibus(dt) {
  const b = CAP4.onibus, c = CARRO_CAMINHO; cena.t += dt;
  if (!cena.indo) {
    if (cena.idx < c.length - 1) {
      const alvo = c[cena.idx + 1], dx = alvo[0] - b.position.x, dz = -alvo[1] - b.position.z, d = Math.hypot(dx, dz), passo = 7 * dt;
      if (d <= passo) { b.position.set(alvo[0], 0, -alvo[1]); cena.idx++; } else { b.position.x += dx / d * passo; b.position.z += dz / d * passo; }
      b.position.y = alt(b.position.x, b.position.z); b.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
    } else if (!cena.chegou) {
      cena.chegou = true; cena.t = 0; SOM.motor(false);
      // os líderes descem e vão pros ginásios
      for (const g of GINASIOS) { if (g.lider === 'chefe') continue; const m = CAP4.lideres[g.id]; m.visible = true; m.position.set(g.x, altO(g.x, g.y), -g.y); for (const o of obstaculos) if (o.npc === m) { o.x = g.x; o.z = -g.y; o.r = 0.5; } for (const i of interativos) if (i.npcMesh === m) { i.x = g.x; i.z = -g.y; i.r = 3; } m.userData.marca.visible = false; }
      CAP4.visitante.visible = true; for (const o of obstaculos) if (o.npc === CAP4.visitante) o.r = 0.5; for (const i of interativos) if (i.npcMesh === CAP4.visitante) i.r = 3;
      aviso('🚌 Chegaram! Alcateias de todo o distrito, com lenços de todas as cores. Os líderes já foram pros ginásios.', 5000);
    } else if (cena.t > 4) {
      cena = null; completa('c4_onibus'); CAP4.fase = 'abertura'; c4Missao('c4_abertura');
      // o Chefe Diego vai pra árvore do lobinhos.com abrir o Distrital
      const cx = ARV_BAND[0] + 8, cy = ARV_BAND[1] - 6; chefe.position.set(cx, altO(cx, cy), -cy); chefe.rotation.y = -1.0;
      for (const o of obstaculos) if (o.npc === chefe) { o.x = cx; o.z = -cy; } for (const i of interativos) if (i.npcMesh === chefe) { i.x = cx; i.z = -cy; }
      aviso('Chefe Diego: "Todo mundo pra árvore do lobinhos.com! Vou abrir o Distrital lá."', 4000);
    }
  } else {
    // indo embora: caminho ao contrário
    if (cena.idx > 0) {
      const alvo = c[cena.idx - 1], dx = alvo[0] - b.position.x, dz = -alvo[1] - b.position.z, d = Math.hypot(dx, dz), passo = 7 * dt;
      if (d <= passo) { b.position.set(alvo[0], 0, -alvo[1]); cena.idx--; } else { b.position.x += dx / d * passo; b.position.z += dz / d * passo; }
      b.position.y = alt(b.position.x, b.position.z); b.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
    } else { b.visible = false; SOM.motor(false); cena = null; completa('c4_despedida'); CAP4.fase = 'fim'; SOM.uivo(); setTimeout(() => { aviso('🏕️ FIM DO CAPÍTULO 4 — obrigado por jogar! O Distrital Pokémon: 8 ginásios, 8 insígnias, a Liga e a foto. Até o próximo sábado! 🐺', 12000); SOM.fim(); }, 1500); }
  }
}
function iniciaFoto() {
  // todo mundo em volta da árvore; a câmera enquadra e... 📸
  const gente = [akelaMesh(), chefe, pai, alisson, CAP4.visitante].concat(GINASIOS.filter(g => g.lider !== 'chefe').map(g => CAP4.lideres[g.id])).concat(['Lobinho Dudu', 'Lobinha Maria', 'Lobinho Joaquim', 'Lobinho Davi', 'Lobinha Larissa'].map(n => (npcs.find(x => x.nome === n) || {}).mesh)).filter(Boolean);
  gente.forEach((m, i) => { const a = -0.3 + i / (gente.length - 1) * (Math.PI + 0.6), r = 5.5 + (i % 2) * 1.6; const x = ARV_BAND[0] + Math.cos(a) * r, y = ARV_BAND[1] - 2 - Math.sin(a) * r * 0.5 - (i % 2) * 1.2; m.position.set(x, altO(x, y), -y); m.rotation.y = Math.PI; m.visible = true; for (const o of obstaculos) if (o.npc === m) { o.x = x; o.z = -y; } for (const it of interativos) if (it.npcMesh === m) { it.x = x; it.z = -y; } aplicaEmote(m, 'feliz', 0); });
  estado.pos.set(ARV_BAND[0], altO(ARV_BAND[0], ARV_BAND[1] - 9), -(ARV_BAND[1] - 9)); estado.yaw = Math.PI; jogador.position.copy(estado.pos);
  phantom.mesh.visible = true; phantom.mesh.position.set(ARV_BAND[0] + 2, altO(ARV_BAND[0] + 2, ARV_BAND[1] - 8), -(ARV_BAND[1] - 8)); phantom.mesh.rotation.set(0, Math.PI, 0);
  cena = { cap2: true, cap4: true, tipo: 'foto', t: 0, carona: gente.map(m => ({ mesh: m })) };
  aviso('📸 Fotógrafo: "Todo mundo junto! Digam POKÉMON!"', 3000);
}
function atualizaFoto(dt) {
  cena.t += dt;
  if (cena.t > 3 && !cena.flash) { cena.flash = true; fadeEl.style.background = '#fff'; fadeEl.style.transition = 'opacity .05s'; fadeEl.style.opacity = 1; SOM.pop(); setTimeout(() => { fadeEl.style.opacity = 0; setTimeout(() => { fadeEl.style.background = '#000'; fadeEl.style.transition = 'opacity .7s'; }, 300); }, 120); aviso('📸 Alcateias: "POKÉMOOON!"', 3000); }
  if (cena.t > 5.5) { cena = null; completa('c4_foto'); CAP4.fase = 'despedida'; c4Missao('c4_despedida'); aviso('Akelá: "Ficou linda! Agora o ônibus vai embora, vai lá na portaria dar tchau."', 4500); }
}

// ---------- por frame e câmera ----------
function atualizaCenaCap4(dt) {
  if (cena.tipo === 'abre') {
    cena.t += dt;
    if (cena.t > 1.0) fadeEl.style.opacity = 0;
    if (cena.t > 3.6) textoNoite.style.opacity = 0;
    if (cena.t > 4.2) { cena = null; document.getElementById('hud').style.opacity = 1; if (CAP4.fase === 'abre') { CAP4.fase = 'akela'; desenhaInsignias(); aviso('Akelá: "' + PERSONAGENS[personagemId].nome + '! Corre aqui, hoje é o Distrital!"', 3000); } }
  } else if (cena.tipo === 'onibus') atualizaOnibus(dt);
  else if (cena.tipo === 'foto') atualizaFoto(dt);
  else { cena.t += dt; estado.vy = 0; }
}
function cameraCap4() {
  if (cena.tipo === 'onibus') { const b = CAP4.onibus.position; camera.position.lerp(new THREE.Vector3(b.x + 14, b.y + 7, b.z + 14), 0.06); camera.lookAt(b.x, b.y + 1.5, b.z); }
  else if (cena.tipo === 'foto') { camera.position.lerp(new THREE.Vector3(ARV_BAND[0], ARV_BASE + 2.2, -ARV_BAND[1] + 18), 0.08); camera.lookAt(ARV_BAND[0], ARV_BASE + 1.2, -ARV_BAND[1] + 4); }
}
function atualizaCap4(dt) {
  if (!CAP4 || !CAP4.ativo) return;
  // pedras do molhe: o interativo pula pra próxima pedra
  const ip = interativos.find(i => i.nome === 'Pegar a pedra redonda'); if (ip) { const d = CAP4.desafio, k = d && d.pedras !== undefined ? d.pedras : 3; const p = C4_PEDRAS[k]; if (p && d && d.id === 'pedra' && !d.pronto) { ip.x = p[0]; ip.z = -p[1]; ip.r = 4; } else ip.r = 0; }
  // ônibus: interativos na portaria
  const pc = CARRO_CAMINHO[CARRO_CAMINHO.length - 1];
  for (const n of ['Receber o ônibus', 'Despedir o ônibus']) { const i = interativos.find(x => x.nome === n); if (i) { i.x = pc[0]; i.z = -pc[1]; } }
  // marcadores dos ginásios: aparecem depois da abertura, somem com a insígnia
  for (const g of GINASIOS) { const m = CAP4.lideres[g.id]; if (m && m.userData.marca) { m.userData.marca.visible = CAP4.fase === 'ginasios' && !CAP4.insignias[g.id]; m.userData.marca.position.y = altO(g.x, g.y) + 3.6 + Math.sin(tempo * 2) * 0.25; } }
  // desafios que a gente acompanha olhando o minigame
  const d = CAP4.desafio;
  if (d && !d.pronto) {
    const g = GINASIOS.find(x => x.id === d.id);
    if (mini) {
      if (g.desafio === 'pesca' && mini.tipo === 'pesca' && mini.peixes >= 2) desafioVencido(g);
      else if (g.desafio === 'fogo' && mini.tipo === 'fogo' && mini.faiscas >= 2) desafioVencido(g);
      else if (g.desafio === 'bocha' && mini.tipo === 'bocha' && mini.jogadas >= 3) { if (mini.melhor < 3) desafioVencido(g); else { mini.jogadas = 0; mini.melhor = 99; mini.msg = 'Nenhuma a menos de 3 m... mais 3 jogadas!'; SOM.grr(); } }
      else if (g.desafio === 'futebol' && mini.tipo === 'futebol' && mini.chutes >= 5) { if (mini.gols >= 3) desafioVencido(g); else { mini.chutes = 0; mini.gols = 0; mini.msg = 'Menos de 3 gols... mais 5 chutes!'; SOM.grr(); } }
    }
    if (g.desafio === 'fantasma' && d.esconderijo && !cena && Math.hypot(estado.pos.x - phantom.mesh.position.x, estado.pos.z - phantom.mesh.position.z) < 4 && Math.abs(estado.pos.y - phantom.mesh.position.y) < 2) { SOM.latido(); aviso('🐕 Achou o Fantasma escondido em cima da árvore! Ele abanou o rabo. Volta no líder da Lama, no playground.', 4000); d.esconderijo = null; d.pronto = true; phantom.seguindo = true; phantom.obst.r = 0; SOM.missao(); }
  }
}

// debug: ?debug&cap4[=ginasios|pedra|cascata|...|terra|liga|foto|despedida]
if (DEBUG && qs.has('cap4')) try {
  capituloEscolhido = 4; iniciaCap4(); cena = null; fadeEl.style.transition = 'none'; fadeEl.style.opacity = 0; textoNoite.style.opacity = 0; document.getElementById('hud').style.opacity = 1; CAP4.fase = 'akela';
  const f = qs.get('cap4');
  const ok = ids => { for (const id of ids) { c4Missao(id); const m = missoes.find(x => x.id === id); if (m) m.ok = true; } renderMissoes(); };
  const chegou = () => { for (const g of GINASIOS) { const m = CAP4.lideres[g.id]; m.visible = true; m.position.set(g.x, altO(g.x, g.y), -g.y); for (const o of obstaculos) if (o.npc === m) { o.x = g.x; o.z = -g.y; o.r = 0.5; } for (const i of interativos) if (i.npcMesh === m) { i.x = g.x; i.z = -g.y; i.r = 3; } } };
  if (f === 'ginasios' || GINASIOS.some(g => g.id === f)) { ok(['c4_akela', 'c4_onibus', 'c4_abertura']); chegou(); CAP4.fase = 'ginasios'; const k = Math.max(0, GINASIOS.findIndex(g => g.id === f)); for (let i = 0; i < k; i++) { CAP4.insignias[GINASIOS[i].id] = true; ok(['c4_gym_' + GINASIOS[i].id]); } c4Missao('c4_gym_' + GINASIOS[k].id); estado.pos.set(GINASIOS[k].x + 3, altO(GINASIOS[k].x + 3, GINASIOS[k].y), -GINASIOS[k].y); }
  if (f === 'liga' || f === 'foto' || f === 'despedida') { ok(['c4_akela', 'c4_onibus', 'c4_abertura'].concat(GINASIOS.map(g => 'c4_gym_' + g.id))); chegou(); for (const g of GINASIOS) CAP4.insignias[g.id] = true; CAP4.fase = 'ginasios'; c4Missao('c4_liga'); }
  if (f === 'foto' || f === 'despedida') { ok(['c4_liga']); CAP4.fase = 'foto'; c4Missao('c4_foto'); }
  if (f === 'despedida') { ok(['c4_foto']); CAP4.fase = 'despedida'; c4Missao('c4_despedida'); const pc = CARRO_CAMINHO[CARRO_CAMINHO.length - 1]; CAP4.onibus.visible = true; CAP4.onibus.position.set(pc[0], altO(pc[0], pc[1]), -pc[1]); estado.pos.set(pc[0] + 4, altO(pc[0] + 4, pc[1] + 4), -pc[1] - 4); }
  desenhaInsignias();
  if (qs.get('pos')) { const [x, y] = qs.get('pos').split(',').map(Number); estado.pos.set(x, altO(x, y), -y); }
} catch (e) { dbg('ERRO cap4 debug: ' + e.message + ' ' + (e.stack || '').split('\n')[0]); }
