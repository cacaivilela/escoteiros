// ---------- Mods e mais: baixar/criar mods, skins e DLC (tudo salvo no navegador) ----------
// Um mod é um JSON: { id, nome, emoji, autor, desc, ajustes:{vel,pulo,grav,escala,ceu,neblina,sol}, placa:{texto,x,y}, codigo }
const MODS_CATALOGO = [
  { id: 'turbo', nome: 'Turbo Lobinho', emoji: '⚡', autor: 'lobinhos.com', desc: 'Anda e corre 2x mais rápido pelo camping.', ajustes: { vel: 2 } },
  { id: 'lua', nome: 'Gravidade da Lua', emoji: '🌙', autor: 'lobinhos.com', desc: 'Pula altíssimo e cai devagar, como na Lua.', ajustes: { pulo: 1.6, grav: 0.35 } },
  { id: 'gigante', nome: 'Lobinho Gigante', emoji: '🦖', autor: 'Dudu', desc: 'Você fica 2x maior que todo mundo.', ajustes: { escala: 2 } },
  { id: 'formiga', nome: 'Modo Formiga', emoji: '🐜', autor: 'Maria', desc: 'Fica minúsculo: a grama vira floresta.', ajustes: { escala: 0.45, vel: 0.7 } },
  { id: 'porDoSol', nome: 'Pôr do sol na Lagoa', emoji: '🌅', autor: 'Chefe Diego', desc: 'Céu laranja e luz dourada o dia inteiro.', ajustes: { ceu: '#ff9a4a', neblina: '#ffc98a', sol: 0.7 } },
  { id: 'neblina', nome: 'Neblina da manhã', emoji: '🌫️', autor: 'Akelá', desc: 'Neblina densa: só se enxerga a poucos metros.', ajustes: { neblina: '#dfe6ea', nebPerto: 8, nebLonge: 60 } },
  { id: 'placa', nome: 'Placa da alcateia', emoji: '🪧', autor: 'Alisson', desc: 'Uma placa "Alcateia Garibaldi passou aqui!" na praia.', placa: { texto: 'Alcateia Garibaldi passou aqui!', x: 60, y: -40 } },
  { id: 'superPulo', nome: 'Super Pulo', emoji: '🦘', autor: 'Caio', desc: 'Pulo 2x mais alto com gravidade normal.', ajustes: { pulo: 2 } },
];
const SKINS_CATALOGO = [
  { id: 'laraPokemon', nome: 'Lara Treinadora', emoji: '⚡', perso: 'lara', desc: 'Boné do Ash, camisa vermelha e tênis amarelo.', valores: { boneEstilo: 'ash', corCamisa: '#d8342a', corShort: '#1c3f8f', corTenis: '#ffd54a', corBolsa: '#ffd54a', pulseira: '#ffd54a' } },
  { id: 'laraNoite', nome: 'Lara da Noite', emoji: '🌙', perso: 'lara', desc: 'Tudo escuro com tiara roxa.', valores: { boneEstilo: 'tiara', corTiara: '#9b3fb5', corCamisa: '#1a1a2e', corShort: '#0d0d1a', corTenis: '#9b3fb5', corBolsa: '#2a2a4a' } },
  { id: 'caioBandana', nome: 'Caio Pirata', emoji: '🏴‍☠️', perso: 'caio', desc: 'Bandana preta, camisa listrada de vermelho.', valores: { boneEstilo: 'bandana', corBandana: '#111111', corCamisa: '#b0202a', corShort: '#222222', corTenis: '#111111', corMochila: '#5a3a1e', oculos: true } },
  { id: 'caioNeon', nome: 'Caio Neon', emoji: '🟢', perso: 'caio', desc: 'Verde-limão e roxo brilhante.', valores: { corCamisa: '#8bff3a', corShort: '#6a1fb5', corTenis: '#8bff3a', corMochila: '#6a1fb5', corBaquetas: '#8bff3a', relogio: true } },
  { id: 'duduAura', nome: 'Dudu Aura 42', emoji: '✨', perso: 'dudu', desc: 'Óculos quadrados, dourado e aura ligada.', valores: { oculosEstilo: 'quadrado', corOculos: '#ffd54a', corCamisa: '#ffd54a', corShort: '#222222', corTenis: '#ffd54a', aura: true } },
  { id: 'mariaRosa', nome: 'Maria Rosa-choque', emoji: '🎀', perso: 'maria', desc: 'Coque com laço rosa e tudo rosa.', valores: { estiloCabelo: 'coque', corLaco: '#ff4fa3', boneEstilo: 'tiara', corCamisa: '#ff4fa3', corShort: '#8a1f5a', corTenis: '#ffffff', pulseira: '#ff4fa3' } },
];
const DLC_INFO = { id: 'mega', nome: 'DLC Mega Camping', emoji: '🎒', tam: '312 MB', desc: '40 capítulos novos (5 a 44), 55 minijogos, 12 bichos do Pampa soltos pelo camping e 4 skins exclusivas.',
  skins: [
    { id: 'laraExpl', nome: 'Lara Exploradora', emoji: '🧭', perso: 'lara', desc: 'Chapéu escoteiro, roupa cáqui. [DLC]', valores: { boneEstilo: 'chapeu', corCamisa: '#c9b27a', corShort: '#5a4a2a', corTenis: '#3a2a1a', corBolsa: '#5a4a2a', pulseira: '#8be78b' } },
    { id: 'caioExpl', nome: 'Caio Explorador', emoji: '🗺️', perso: 'caio', desc: 'Chapéu escoteiro, roupa cáqui e relógio. [DLC]', valores: { boneEstilo: 'chapeu', corCamisa: '#c9b27a', corShort: '#5a4a2a', corTenis: '#3a2a1a', corMochila: '#5a4a2a', relogio: true } },
    { id: 'duduGuarda', nome: 'Dudu Guarda-parque', emoji: '🦫', perso: 'dudu', desc: 'Verde-musgo e óculos redondos. [DLC]', valores: { oculosEstilo: 'redondo', corCamisa: '#3f6b3a', corShort: '#2a3a1a', corTenis: '#8b5e34', corMochila: '#3f6b3a' } },
    { id: 'mariaBio', nome: 'Maria Bióloga', emoji: '🔬', perso: 'maria', desc: 'Rabo de cavalo, branco e verde. [DLC]', valores: { estiloCabelo: 'rabo', corLaco: '#3f6b3a', corCamisa: '#ffffff', corShort: '#3f6b3a', corTenis: '#ffffff' } },
  ] };
// ---- conteúdo do DLC: lugares, 55 minijogos, 12 bichos, 40 capítulos ----
const DLC_LUGARES = DESTINOS.concat([['Cantina', -34, 8], ['Playground', 0, -62], ['Quadra de vôlei', 120, -2], ['Fogueira do Conselho', -186, -142]]);
const DLC_MINIS = (function () {
  const T = [['🥔', 'Descascar batata'], ['🏕️', 'Armar a barraca'], ['🏸', 'Rebater a peteca'], ['🍞', 'Cortar o pão'], ['🥫', 'Acertar a lata'], ['🪢', 'Pular corda'], ['🥏', 'Lançar o disco'], ['🐟', 'Pegar peixe na mão'], ['📖', 'Carimbar o passaporte'], ['🪁', 'Pegar a pipa'], ['🎯', 'Arremesso de argola']];
  const M = [['🎈', 'Encher o balão'], ['🛏️', 'Inflar o colchão'], ['🎋', 'Serrar bambu'], ['🛶', 'Remar no caiaque'], ['💧', 'Bombear água'], ['🥘', 'Bater a panela'], ['🐦', 'Correr do quero-quero'], ['🧗', 'Subir na corda'], ['🧀', 'Ralar queijo'], ['🧃', 'Sacudir o suco'], ['🛒', 'Empurrar o carrinho']];
  const S = [['💃', 'Coreografia da alcateia'], ['⛵', 'Nó de escota'], ['📣', 'Grito de guerra'], ['👣', 'Passos do rastreio'], ['📡', 'Código Morse'], ['🚩', 'Sinais de bandeira'], ['🇧🇷', 'Dobrar a bandeira'], ['🌿', 'Trilha de marcas'], ['🎂', 'Receita do bolo'], ['🎺', 'Toque de corneta'], ['🌧️', 'Dança da chuva']];
  const G = [['🎣', 'Puxar a vara'], ['🪔', 'Acender o lampião'], ['🪃', 'Estilingue'], ['🥤', 'Encher o cantil'], ['🍡', 'Assar marshmallow'], ['🌬️', 'Soprar as brasas'], ['🛝', 'Balanço'], ['🪁', 'Segurar a pipa'], ['🌳', 'Escalar a árvore'], ['🏐', 'Saque de vôlei'], ['🔦', 'Lanterna na mata']];
  const K = [['🎒', 'Kim da mochila'], ['🐾', 'Trilha das pegadas'], ['⭐', 'Nomes das estrelas'], ['🪧', 'Placas do camping'], ['🧣', 'Cores do lenço'], ['🦉', 'Sons da mata'], ['👦', 'Ordem da patrulha'], ['🗺️', 'Mapa do tesouro'], ['🔐', 'Senha da sede'], ['🧭', 'Bússola'], ['🥁', 'Repetir o toque']];
  const out = []; let i = 0;
  for (const [mec, lista] of [['timing', T], ['mash', M], ['seq', S], ['segurar', G], ['memoria', K]]) for (const [emoji, nome] of lista) { out.push({ id: 'dm' + i, emoji, nome, mec, lugar: (i * 7) % DLC_LUGARES.length, precisa: 3 + (i % 3) }); i++; }
  return out;
})();
const DLC_BICHOS = [
  ['Capivara', '🦫', 'quad', 0x8b6a3e, 1.3, 60, -30, 'A capivara é o maior roedor do mundo e adora a beira da lagoa.'],
  ['Tartaruga-tigre-d\'água', '🐢', 'quad', 0x3f6b3a, 0.45, 95, -15, 'Toma sol nas pedras e mergulha quando alguém chega perto.'],
  ['Ratão-do-banhado', '🐀', 'quad', 0x5a3a1e, 0.7, 250, 110, 'Parece um castor sem o rabo chato. Vive nos juncos.'],
  ['Gambá', '🦝', 'quad', 0x555555, 0.6, -90, -50, 'Sai de noite e finge de morto quando se assusta.'],
  ['Teiú', '🦎', 'quad', 0x2a2a2a, 0.8, -200, -140, 'Lagarto grande que come ovos e frutas. Não morde se você não mexer.'],
  ['Jacaré-do-papo-amarelo', '🐊', 'quad', 0x4a5a2a, 1.6, 320, 190, 'Fica quietinho na água rasa. Olha de longe!'],
  ['Garça-branca', '🦩', 'ave', 0xffffff, 1.1, 70, -50, 'Fica parada horas esperando um lambari passar.'],
  ['Quero-quero', '🐦', 'ave', 0x9a9a9a, 0.5, 187, 60, 'O guardião do campo: grita "quero-quero!" pra avisar todo mundo.'],
  ['Biguá', '🐧', 'ave', 0x111111, 0.7, 247, -110, 'Mergulha atrás de peixe e depois abre as asas pra secar no molhe.'],
  ['João-de-barro', '🏠', 'ave', 0xb5622a, 0.35, -34, 12, 'Constrói uma casinha de barro com a porta virada pra longe do vento.'],
  ['Coruja-buraqueira', '🦉', 'ave', 0xa08050, 0.4, 120, 10, 'Mora num buraco no chão e fica de guarda o dia todo.'],
  ['Marreca', '🦆', 'ave', 0x6a4a2a, 0.5, 40, -35, 'Nada em bando perto da Praia do Camping.'],
];
const DLC_TITULOS = ['Dia da capivara', 'Caça ao tesouro', 'Olimpíadas da alcateia', 'Sábado de chuva', 'O grande piquenique', 'Noite das estrelas', 'Trilha do jacaré', 'Festa junina', 'Dia da pesca', 'Regata do Iate Clube', 'Corrida de caiaque', 'Oficina de pipas', 'Semana do meio ambiente', 'Visita dos pais', 'Circo da alcateia', 'Dia do quero-quero', 'Gincana das patrulhas', 'Exploradores da lagoa', 'O mapa perdido', 'Concurso de cabana', 'Dia da bandeira', 'Caça aos rastros', 'Cozinheiros do mato', 'Aniversário do Grupo', 'Show de talentos', 'Dia do biguá', 'A bússola do Chefe', 'Fantasma detetive', 'Mutirão do camping', 'Torneio de bocha', 'Copa do Campo', 'Volta ao molhe', 'A coruja curiosa', 'Rádio da alcateia', 'Dia da tartaruga', 'Feira de ciências', 'Acampamento de inverno', 'Amanhecer na praia', 'O último sábado do ano', 'Grande Distrital 2'];
function dlcCapitulo(n) {   // tarefas geradas de forma determinística pelo número do capítulo
  const r = (k, m) => ((n * 2654435761 + k * 40503) >>> 0) % m;
  const t = [];
  t.push({ tipo: 'falar', quem: 'Akelá', txt: 'Falar com a Akelá na árvore do lobinhos.com' });
  const longe = DLC_LUGARES.filter(l => Math.hypot(l[1] - ARV_BAND[0], l[2] - ARV_BAND[1]) > 25);   // perto da Akelá o "ir até" concluía sozinho
  const i1 = r(1, longe.length), l1 = longe[i1]; t.push({ tipo: 'ir', x: l1[1], y: l1[2], txt: 'Ir até: ' + l1[0] });
  const m1 = DLC_MINIS[r(2, 55)]; t.push({ tipo: 'mini', mini: m1, txt: m1.emoji + ' ' + m1.nome + ' (' + DLC_LUGARES[m1.lugar][0] + ')' });
  const b = DLC_BICHOS[r(3, 12)]; t.push({ tipo: 'bicho', bicho: b[0], txt: b[1] + ' Encontrar e observar: ' + b[0] });
  if (n % 2) { const m2 = DLC_MINIS[r(4, 55)]; t.push({ tipo: 'mini', mini: m2, txt: m2.emoji + ' ' + m2.nome + ' (' + DLC_LUGARES[m2.lugar][0] + ')' }); }
  if (n % 3 === 0) { const l2 = longe[(i1 + 1 + r(5, longe.length - 1)) % longe.length]; t.push({ tipo: 'ir', x: l2[1], y: l2[2], txt: 'Ir até: ' + l2[0] }); }
  t.push({ tipo: 'falar', quem: 'Chefe Diego', txt: 'Contar tudo pro Chefe Diego na portaria' });
  return { n, titulo: DLC_TITULOS[n - 5], tarefas: t };
}
const modsEl = document.getElementById('mods');
let modsAba = 'baixar';
const modsSt = { instalados: {}, meus: [], skins: [], dlc: false, dlcOn: true, capsFeitos: {}, bichosVistos: {}, minisFeitos: {} };
try { Object.assign(modsSt, JSON.parse(localStorage.getItem('escoteiros.mods') || '{}')); } catch (e) {}
function salvaMods() { try { localStorage.setItem('escoteiros.mods', JSON.stringify(modsSt)); } catch (e) {} }
const todosMods = () => MODS_CATALOGO.concat(modsSt.meus);
const modAtivo = m => modsSt.instalados[m.id] === true;
function baixaArquivo(nome, obj) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })); a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
function importaArquivo(cb) { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { cb(JSON.parse(r.result)); } catch (e) { alert('Arquivo inválido: ' + e.message); } }; r.readAsText(f); }; i.click(); }
// ---- aplica os mods ativos no jogo ----
const modsPlacas = {};
const DLC = { bichos: [], cap: null, tarefa: 0, ligado: false, menu: null };
function aplicaMods() {
  const a = { vel: 1, pulo: 1, grav: 1, escala: 1, ceu: null, neblina: null, sol: 1, nebPerto: 150, nebLonge: 650 };
  for (const m of todosMods()) {
    if (!modAtivo(m)) { if (modsPlacas[m.id]) { scene.remove(modsPlacas[m.id]); delete modsPlacas[m.id]; } continue; }
    const j = m.ajustes || {};
    for (const k of ['vel', 'pulo', 'grav', 'escala']) if (j[k]) a[k] *= +j[k];
    if (j.ceu) a.ceu = j.ceu; if (j.neblina) a.neblina = j.neblina; if (j.sol) a.sol *= +j.sol; if (j.nebPerto) a.nebPerto = j.nebPerto; if (j.nebLonge) a.nebLonge = j.nebLonge;
    if (m.placa && !modsPlacas[m.id]) modsPlacas[m.id] = placaLivre(String(m.placa.texto).slice(0, 40), +m.placa.x || 0, +m.placa.y || 0, 5, 0.4);
    if (m.codigo && !m._rodou) { m._rodou = true; try { new Function('jogo', m.codigo)({ scene, THREE, jogador, estado, aviso, MOD, placaLivre, npc, SOM, tempo }); } catch (e) { aviso('Erro no mod ' + m.nome + ': ' + e.message, 4000); } }
  }
  dlcLiga(!!(modsSt.dlc && modsSt.dlcOn));
  MOD.vel = a.vel; MOD.pulo = a.pulo; MOD.grav = a.grav; MOD.escala = a.escala;
  if (!noite) {
    scene.background = new THREE.Color(a.ceu || '#9ecbff'); renderer.setClearColor(a.ceu || '#9ecbff');
    scene.fog = new THREE.Fog(a.neblina || '#bfdcff', a.nebPerto, a.nebLonge);
    sol.intensity = 0.95 * a.sol; hemi.intensity = 0.55 * (0.5 + a.sol / 2);
  }
}
// ---- bichos ----
function criaBicho(b) {
  const [nome, emoji, tipo, cor, s, x, y, fato] = b;
  const mat = new THREE.MeshLambertMaterial({ color: cor }), g = new THREE.Group();
  const el = (rx, ry, rz, px, py, pz, m) => { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), m || mat); o.scale.set(rx, ry, rz); o.position.set(px, py, pz); o.castShadow = true; g.add(o); return o; };
  const pernas = [];
  if (tipo === 'quad') {
    el(0.28, 0.24, 0.5, 0, 0.45, 0); el(0.2, 0.18, 0.22, 0, 0.6, 0.5);
    for (const [px, pz] of [[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8), mat); p.position.set(px, 0.22, pz); g.add(p); pernas.push(p); }
    el(0.06, 0.06, 0.25, 0, 0.5, -0.6);
  } else {
    el(0.18, 0.16, 0.26, 0, 0.55, 0); const pesc = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 8), mat); pesc.position.set(0, 0.8, 0.15); g.add(pesc);
    el(0.09, 0.08, 0.1, 0, 1.0, 0.18); const bico = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 8), new THREE.MeshLambertMaterial({ color: 0xffb020 })); bico.rotation.x = Math.PI / 2; bico.position.set(0, 1.0, 0.33); g.add(bico);
    for (const px of [-0.07, 0.07]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), new THREE.MeshLambertMaterial({ color: 0x333333 })); p.position.set(px, 0.2, 0); g.add(p); pernas.push(p); }
  }
  [-1, 1].forEach(sx => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M.preto); o.position.set(sx * 0.08, tipo === 'quad' ? 0.66 : 1.02, tipo === 'quad' ? 0.66 : 0.24); g.add(o); });
  g.scale.setScalar(s); g.position.set(x, altO(x, y), -y); scene.add(g);
  const bicho = { nome, emoji, fato, mesh: g, pernas, x, y, hx: x, hy: y, tx: x, ty: y, t: rnd(0, 3), fase: rnd(0, 6), vel: tipo === 'quad' ? 0.8 : 0.5 };
  bicho.int = { x, z: -y, r: 3.5, nome: 'Observar ' + nome + ' ' + emoji, cond: () => DLC.ligado && !cena && !mini, acao: () => {
    aviso('🔍 ' + nome + ': ' + fato, 5000); SOM.coleta(); modsSt.bichosVistos[nome] = true; salvaMods();
    const t = dlcTarefaAtual(); if (t && t.tipo === 'bicho' && t.bicho === nome) dlcConclui();
  } };
  interativos.push(bicho.int);
  return bicho;
}
function atualizaBichos(dt) {
  for (const b of DLC.bichos) {
    b.t -= dt;
    if (b.t <= 0) { b.t = rnd(2, 6); const nx = b.hx + rnd(-14, 14), ny = b.hy + rnd(-14, 14); if (emTerra(nx, -ny)) { b.tx = nx; b.ty = ny; } }   // na água ficava flutuando
    const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
    if (d > 0.3) {
      const q = { x: b.x + dx / d * b.vel * dt, z: -(b.y + dy / d * b.vel * dt) }; resolveColisoes(q);   // não atravessa prédio nem árvore
      if (emTerra(q.x, q.z)) { b.x = q.x; b.y = -q.z; b.mesh.rotation.y = Math.atan2(dx, -dy); b.fase += dt * 8; } else { b.tx = b.x; b.ty = b.y; b.t = 0; }   // empacou: sorteia outro destino
    }
    b.mesh.position.set(b.x, altO(b.x, b.y), -b.y);
    b.pernas.forEach((p, i) => p.rotation.x = d > 0.3 ? Math.sin(b.fase + (i % 2) * Math.PI) * 0.5 : 0);
    b.int.x = b.x; b.int.z = -b.y;
  }
}
function dlcLiga(on) {
  if (on === DLC.ligado) return;
  DLC.ligado = on;
  if (on && !DLC.bichos.length) { DLC.bichos = DLC_BICHOS.map(criaBicho); DLC_MINIS.forEach(m => { const l = DLC_LUGARES[m.lugar]; interativos.push({ x: l[1], z: -l[2], r: 7, nome: m.emoji + ' ' + m.nome, cond: () => { const t = dlcTarefaAtual(); return DLC.ligado && podeMini() && !!t && t.tipo === 'mini' && t.mini === m; }, acao: () => abreDlcMini(m, false) }); }); }
  for (const b of DLC.bichos) b.mesh.visible = on;
  dlcMenu(on);
}
// ---- menu inicial: seletor de capítulos 5-44 e dos 55 minijogos ----
function dlcMenu(on) {
  if (DLC.menu) { DLC.menu.remove(); DLC.menu = null; }
  if (!on) return;
  const d = document.createElement('div'); d.style.cssText = 'margin:6px 0;font-size:14px'; DLC.menu = d;
  d.innerHTML = '🎒 DLC: <label>Capítulo <select id="dlcCap"><option value="">—</option>' + Array.from({ length: 40 }, (_, i) => i + 5).map(n => '<option value="' + n + '">' + n + ' — ' + DLC_TITULOS[n - 5] + (modsSt.capsFeitos[n] ? ' ✅' : '') + '</option>').join('') + '</select></label> ' +
    '<label>Minijogo <select id="dlcMini"><option value="">— 55 minijogos —</option>' + DLC_MINIS.map((m, i) => '<option value="' + i + '">' + m.emoji + ' ' + m.nome + (modsSt.minisFeitos[m.id] ? ' ✅' : '') + '</option>').join('') + '</select></label>' +
    ' <small style="opacity:.7">bichos vistos: ' + Object.keys(modsSt.bichosVistos).length + '/12</small>';
  document.querySelector('#inicio .caps').after(d);
  d.addEventListener('click', e => e.stopPropagation());
  d.querySelector('#dlcCap').onchange = e => { const n = +e.target.value; if (!n) return; capituloEscolhido = n; document.querySelectorAll('#inicio .cap').forEach(x => x.classList.remove('sel')); };
  d.querySelector('#dlcMini').onchange = e => { const m = DLC_MINIS[+e.target.value]; if (!m) return; e.target.value = ''; const l = DLC_LUGARES[m.lugar]; if (mini) fechaMini(); estado.pos.set(l[1], altO(l[1], l[2]), -l[2]); cam.yaw = 0; cam.pitch = 0.25; cam.dist = 6; camera.position.set(l[1], altO(l[1], l[2]) + 3, -l[2] + 6); inicio.style.display = 'none'; SOM.liga(); SOM.menu(false); SOM.ambiente(true); abreDlcMini(m, true); };
  document.querySelectorAll('#inicio .cap').forEach(el => el.addEventListener('click', () => { const s = document.getElementById('dlcCap'); if (s) s.value = ''; }));
}
// ---- capítulos 5 a 44 ----
const dlcTarefaAtual = () => DLC.cap ? DLC.cap.tarefas[DLC.tarefa] : null;
function dlcInicia(n) {
  DLC.cap = dlcCapitulo(n); DLC.tarefa = 0;
  preparaSabado();
  missoes.splice(0, missoes.length, ...DLC.cap.tarefas.map((t, i) => ({ id: 'dlc' + i, txt: t.txt, ok: false }))); renderMissoes();
  document.querySelector('#missao h3').textContent = 'Capítulo ' + n + ' — ' + DLC.cap.titulo;
  textoNoite.textContent = 'Capítulo ' + n + ' — ' + DLC.cap.titulo; textoNoite.style.opacity = 1;
  setTimeout(() => fadeEl.style.opacity = 0, 900); setTimeout(() => { textoNoite.style.opacity = 0; document.getElementById('hud').style.opacity = 1; aviso('Akelá: "' + PERSONAGENS[personagemId].nome + '! Hoje é ' + DLC.cap.titulo.toLowerCase() + '. Vem cá na árvore!"', 4000); }, 3800);
  const fala = (quem, frases) => () => { aviso(quem + ': "' + frases[Math.floor(Math.random() * frases.length)] + '"', 4000); const t = dlcTarefaAtual(); if (t && t.tipo === 'falar' && t.quem === quem) dlcConclui(); };
  interativos.find(i => i.nome === 'Falar com Akelá').acao = fala('Akelá', ['Sempre alerta! Olha a lista de tarefas de hoje.', 'Hoje é ' + DLC.cap.titulo + '! Bora, alcateia.', 'Cuidado com o jacaré lá no trapiche, hein.']);
  interativos.find(i => i.nome === 'Falar com Chefe Diego').acao = fala('Chefe Diego', ['Mandou bem, lobinho! Sábado que vem tem mais.', 'Fez tudo? Então pode ir brincar com o Fantasma.', 'Viu a capivara? Ela é a dona do camping.']);
  const al = interativos.find(i => i.nome === 'Falar com Lobinho Alisson'); if (al) al.acao = () => aviso('Lobinho Alisson: "Você viu o gambá? Dizem que ele finge de morto!"', 3500);
}
function dlcConclui() {
  const n = DLC.cap.n, titulo = DLC.cap.titulo; completa('dlc' + DLC.tarefa); DLC.tarefa++;
  if (DLC.tarefa >= DLC.cap.tarefas.length) {
    modsSt.capsFeitos[n] = true; salvaMods();
    setTimeout(() => { aviso('🏆 Capítulo ' + n + ' — ' + titulo + ' concluído!', 6000); SOM.fim(); if (n < 44) { proximoCap = n + 1; btnCap2.textContent = '▶ Capítulo ' + (n + 1) + ' — ' + DLC_TITULOS[n - 4]; mostraBtnCap(); } }, 3200);
  }
}
{ const _ic = iniciaCapitulo; iniciaCapitulo = function () { if (capituloEscolhido >= 5) { if (!modsSt.dlc) { capituloEscolhido = 1; return iniciaIntro(); } return dlcInicia(capituloEscolhido); } if (DLC.cap) { DLC.cap = null; document.querySelector('#missao h3').textContent = 'Tarefas do acampamento'; } _ic(); }; }
// ---- 55 minijogos (5 mecânicas: timing, mash, seq, segurar, memoria) ----
function abreDlcMini(m, livre) {
  if (mini || cena) return;
  mini = { tipo: 'dlc', dlc: m, mec: m.mec, t: 0, pos: 0, dir: 1, vel: 1 + (m.precisa - 3) * 0.25, zona: rnd(0.15, 0.85), prog: 0, carga: 0, segurando: false, seq: novaSeq(), i: 0, mostra: 2.5, feitos: 0, precisa: m.precisa, livre, msg: { timing: 'Aperte E quando o marcador estiver na zona verde!', mash: 'Aperte E bem rápido!', seq: 'Aperte as setas na ordem!', segurar: 'Segure E e solte na zona laranja!', memoria: 'Decore a sequência... depois repita com as setas!' }[m.mec] };
  miniEl.style.display = 'block'; desenhaMini();
}
function dlcVence() { const m = mini.dlc, l = mini.livre; modsSt.minisFeitos[m.id] = true; salvaMods(); fechaMini(); if (l) fimLivre(); else { aviso('🏆 ' + m.nome + ' — feito!', 3000); SOM.missao(); const t = dlcTarefaAtual(); if (t && t.tipo === 'mini' && t.mini === m) dlcConclui(); } }
function dlcDesenha() {
  const m = mini, prog = '<div class="prog">' + '▮'.repeat(m.feitos) + '▯'.repeat(Math.max(0, m.precisa - m.feitos)) + '</div>';
  let corpo = '';
  if (m.mec === 'timing') corpo = '<div class="barra"><div class="zona" style="left:' + ((m.zona - 0.07) * 100).toFixed(1) + '%;width:14%"></div><div class="marc" style="left:' + (m.pos * 100).toFixed(1) + '%"></div></div>';
  else if (m.mec === 'mash') corpo = '<div class="barra"><div class="fill serra" style="width:' + (m.prog * 100).toFixed(1) + '%"></div></div>';
  else if (m.mec === 'segurar') corpo = '<div class="barra"><div class="zona fogo" style="left:62%;width:20%"></div><div class="zona ruim" style="left:82%;width:18%"></div><div class="fill" style="width:' + (m.carga * 100).toFixed(1) + '%"></div></div>';
  else corpo = '<div class="seq">' + m.seq.map((k, j) => '<span class="' + (j < m.i ? 'ok' : j === m.i ? 'atual' : '') + '">' + (m.mec === 'memoria' && m.mostra <= 0 && j >= m.i ? '?' : SETAS[k]) + '</span>').join('') + '</div>';
  miniEl.innerHTML = '<b>' + m.dlc.emoji + ' ' + m.dlc.nome + '</b><div class="mmsg">' + m.msg + '</div>' + corpo + prog + '<small>' + (m.mec === 'seq' || m.mec === 'memoria' ? 'Setas (ou WASD)' : 'E') + ' · Esc sai</small>';
}
function dlcAtualiza(dt) {
  const m = mini; m.t += dt;
  if (m.mec === 'timing') { m.pos += m.dir * m.vel * dt; if (m.pos > 1) { m.pos = 1; m.dir = -1; } if (m.pos < 0) { m.pos = 0; m.dir = 1; } }
  else if (m.mec === 'mash') m.prog = Math.max(0, m.prog - 0.3 * dt);
  else if (m.mec === 'segurar') { if (m.segurando) { m.carga = Math.min(1, m.carga + 0.45 * dt); if (m.carga >= 1) { m.carga = 0; m.segurando = false; m.msg = 'Passou do ponto! De novo.'; SOM.grr(); } } }
  else if (m.mec === 'memoria') { if (m.mostra > 0) { m.mostra -= dt; if (m.mostra <= 0) m.msg = 'Agora repete!'; } }
  dlcDesenha();
}
function dlcTecla(down) {
  const m = mini;
  if (m.mec === 'timing' && down) { if (Math.abs(m.pos - m.zona) < 0.07) { m.feitos++; m.zona = rnd(0.15, 0.85); m.msg = ['Boa!', 'Isso!', 'Mais uma!'][m.feitos % 3]; SOM.tap(); } else { m.msg = 'Errou! Olha a zona verde.'; SOM.grr(); } }
  else if (m.mec === 'mash' && down) { m.prog = Math.min(1, m.prog + 0.12); SOM.passo(true, false); if (m.prog >= 1) { m.feitos++; m.prog = 0; m.msg = 'Conseguiu! Mais ' + (m.precisa - m.feitos); SOM.coleta(); } }
  else if (m.mec === 'segurar') { if (down) m.segurando = true; else if (m.segurando) { m.segurando = false; if (m.carga > 0.62 && m.carga < 0.82) { m.feitos++; m.msg = 'Na medida!'; SOM.coleta(); } else if (m.carga >= 0.82) { m.msg = 'Forte demais!'; SOM.grr(); } else { m.msg = 'Fraco demais.'; SOM.grr(); } m.carga = 0; } }
  if (m.feitos >= m.precisa) return dlcVence();
  dlcDesenha();
}
function dlcSeta(k) {
  const m = mini; if (m.mec !== 'seq' && m.mec !== 'memoria') return; if (m.mec === 'memoria' && m.mostra > 0) return;
  if (k === m.seq[m.i]) { m.i++; SOM.tap(); if (m.i >= m.seq.length) { m.feitos++; m.i = 0; m.seq = novaSeq(); m.mostra = 2.5; m.msg = 'Certinho! 🎉'; SOM.coleta(); if (m.feitos >= m.precisa) return dlcVence(); } }
  else { m.i = 0; m.msg = 'Errou! ' + (m.mec === 'memoria' ? 'Olha de novo...' : 'Começa de novo.'); if (m.mec === 'memoria') m.mostra = 2.5; SOM.grr(); }
  dlcDesenha();
}
{ const _d = desenhaMini, _t = miniTecla, _s = miniSeta, _a = atualizaMini;
  desenhaMini = function () { if (mini && mini.tipo === 'dlc') return dlcDesenha(); return _d(); };
  miniTecla = function (down) { if (mini && mini.tipo === 'dlc') return dlcTecla(down); return _t(down); };
  miniSeta = function (k) { if (mini && mini.tipo === 'dlc') return dlcSeta(k); return _s(k); };
  atualizaMini = function (dt) { if (mini && mini.tipo === 'dlc') return dlcAtualiza(dt); return _a(dt); }; }
function atualizaMods(dt) {
  if (!DLC.ligado) return;
  atualizaBichos(dt);
  const t = dlcTarefaAtual();
  if (t && t.tipo === 'ir' && !cena && Math.hypot(estado.pos.x - t.x, estado.pos.z + t.y) < 10) dlcConclui();
}
function aplicaSkin(s) {
  if (!PERSONALIZACOES[s.perso]) return;
  personalizacao[s.perso] = Object.assign(padraoPerso(s.perso), s.valores);
  try { localStorage.setItem('escoteiros.personalizacao', JSON.stringify(personalizacao)); } catch (e) {}
  aplicaPersonalizacao(s.perso);
  if (s.perso === 'lara' || s.perso === 'caio') escolhePersonagem(s.perso);
  if (painelP.style.display === 'block') { personalizandoId = s.perso; desenhaPersonalizar(); }
  aviso('👕 Skin "' + s.nome + '" aplicada em ' + PERSONAGENS[s.perso].nome + '!', 2500);
}
// ---- painel ----
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function itemMod(m, meu) {
  const on = modAtivo(m);
  return '<div class="item"><span class="em">' + esc(m.emoji || '🧩') + '</span><div class="tx"><b>' + esc(m.nome) + '</b> <small>por ' + esc(m.autor || 'você') + ' · ' + esc(m.desc || '') + '</small></div>' +
    '<button data-liga="' + m.id + '" class="' + (on ? '' : 'off') + '">' + (on ? '✅ Instalado' : '⬇ Instalar') + '</button><button class="sec" data-baixa="' + m.id + '" title="salvar .json no computador">💾</button>' + (meu ? '<button class="sec" data-apaga="' + m.id + '">🗑</button>' : '') + '</div>';
}
function itemSkin(s) {
  return '<div class="item"><span class="em">' + esc(s.emoji || '👕') + '</span><div class="tx"><b>' + esc(s.nome) + '</b> <small>' + esc(PERSONAGENS[s.perso] ? PERSONAGENS[s.perso].nome : s.perso) + ' · ' + esc(s.desc || '') + '</small></div>' +
    '<button data-skin="' + s.id + '">👕 Usar</button><button class="sec" data-baixaSkin="' + s.id + '">💾</button>' + (modsSt.skins.some(x => x.id === s.id) ? '<button class="sec" data-apagaSkin="' + s.id + '">🗑</button>' : '') + '</div>';
}
function desenhaMods() {
  const abas = [['baixar', '⬇ Baixar mods'], ['criar', '🛠 Criar mod'], ['skins', '👕 Skins'], ['dlc', '📦 DLC']];
  let h = '<div class="abas">' + abas.map(([id, t]) => '<span class="' + (modsAba === id ? 'sel' : '') + '" data-aba="' + id + '">' + t + '</span>').join('') + '</div>';
  if (modsAba === 'baixar') {
    h += '<div><b>Loja de mods</b> — instala na hora, funciona no jogo e fica salvo. <button class="sec" data-importa="mod">📂 Instalar mod de arquivo .json</button></div>';
    h += MODS_CATALOGO.map(m => itemMod(m, false)).join('');
    if (modsSt.meus.length) h += '<div style="margin-top:8px"><b>Meus mods</b></div>' + modsSt.meus.map(m => itemMod(m, true)).join('');
  } else if (modsAba === 'criar') {
    h += '<div><b>Criar mod</b> — mexe nos controles, salva e ele aparece em "Meus mods" (dá pra baixar o .json e mandar pros amigos).</div>' +
      '<label>Emoji <input type="text" id="mdEmoji" value="🧩" size="2"></label><label>Nome <input type="text" id="mdNome" placeholder="Meu mod" size="18"></label><label>Autor <input type="text" id="mdAutor" placeholder="seu nome" size="12"></label><br>' +
      '<label>Descrição <input type="text" id="mdDesc" placeholder="o que ele faz" size="40"></label><br>' +
      [['vel', 'Velocidade', 0.3, 4], ['pulo', 'Pulo', 0.3, 3], ['grav', 'Gravidade', 0.1, 3], ['escala', 'Tamanho', 0.3, 3], ['sol', 'Luz do sol', 0.2, 1.5]].map(([k, l, a, b]) => '<label>' + l + ' <input type="range" data-aj="' + k + '" min="' + a + '" max="' + b + '" step="0.05" value="1"> <span id="v_' + k + '">1×</span></label>').join('') + '<br>' +
      '<label><input type="checkbox" id="mdCeuOn"> Cor do céu <input type="color" id="mdCeu" value="#9ecbff"></label><label><input type="checkbox" id="mdNebOn"> Neblina <input type="color" id="mdNeb" value="#bfdcff"> perto <input type="range" id="mdNebP" min="5" max="150" value="150"></label><br>' +
      '<label><input type="checkbox" id="mdPlacaOn"> Placa com texto <input type="text" id="mdPlaca" placeholder="Oi alcateia!" size="24"> em <select id="mdLugar">' + DESTINOS.map(([n, x, y]) => '<option value="' + x + ',' + y + '">' + esc(n) + '</option>').join('') + '</select></label><br>' +
      '<details><summary style="cursor:pointer">💻 Avançado: código JavaScript (roda uma vez ao instalar; recebe <code>jogo</code> com scene, THREE, jogador, estado, aviso, MOD, placaLivre, npc, SOM)</summary><textarea id="mdCodigo" rows="4" placeholder="jogo.aviso(\'Olá do meu mod!\', 3000);"></textarea></details>' +
      '<div style="margin-top:8px"><button id="mdSalvar">💾 Salvar e instalar</button> <button class="sec" id="mdBaixar">⬇ Baixar .json</button></div>';
  } else if (modsAba === 'skins') {
    h += '<div><b>Skins</b> — roupas prontas pra Lara, Caio, Dudu e Maria. <button class="sec" data-importa="skin">📂 Instalar skin de arquivo .json</button></div>' + SKINS_CATALOGO.map(itemSkin).join('');
    if (modsSt.dlc) h += '<div style="margin-top:8px"><b>🎒 Skins do DLC</b></div>' + DLC_INFO.skins.map(itemSkin).join('');
    h += '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.2);padding-top:8px"><b>Criar skin</b> — monta o visual no 🎨 Personalizar, depois dá um nome aqui e salva: <label>Emoji <input type="text" id="skEmoji" value="👕" size="2"></label><label>Nome <input type="text" id="skNome" placeholder="Minha skin" size="16"></label> <label>de <select id="skPerso">' + ['lara', 'caio', 'dudu', 'maria'].map(i => '<option value="' + i + '"' + (i === personagemId ? ' selected' : '') + '>' + PERSONAGENS[i].nome + '</option>').join('') + '</select></label> <button id="skSalvar">💾 Salvar skin</button> <button class="sec" id="skBaixar">⬇ Baixar .json</button></div>';
    if (modsSt.skins.length) h += '<div style="margin-top:8px"><b>Minhas skins</b></div>' + modsSt.skins.map(itemSkin).join('');
  } else {
    h += '<div class="item"><span class="em" style="font-size:40px">' + DLC_INFO.emoji + '</span><div class="tx"><b>' + DLC_INFO.nome + '</b> <small>' + DLC_INFO.desc + ' · ' + DLC_INFO.tam + ' · grátis</small><div class="prog" id="dlcProg" style="display:none"><div></div></div><small id="dlcTxt"></small></div>' +
      (modsSt.dlc ? '<button data-dlc="liga" class="' + (modsSt.dlcOn ? '' : 'off') + '">' + (modsSt.dlcOn ? '✅ Ligado' : '⏸ Desligado') + '</button><button class="sec" data-dlc="remove">🗑</button>' : '<button data-dlc="baixa">⬇ Baixar DLC</button>') + '</div>' +
      '<small style="opacity:.7">Depois de instalar, aparecem na tela inicial o seletor de capítulos 5–44 e a lista dos 55 minijogos. Os 12 bichos ficam soltos pelo camping (aperte E perto pra observar). Skins na aba 👕.</small>' + (modsSt.dlc ? '<div style="margin-top:6px">📖 Capítulos feitos: ' + Object.keys(modsSt.capsFeitos).length + '/40 · 🎮 Minijogos: ' + Object.keys(modsSt.minisFeitos).length + '/55 · 🐾 Bichos: ' + Object.keys(modsSt.bichosVistos).length + '/12</div>' : '');
  }
  modsEl.innerHTML = h;
  modsEl.querySelectorAll('[data-aba]').forEach(el => el.onclick = () => { modsAba = el.dataset.aba; desenhaMods(); });
  modsEl.querySelectorAll('[data-liga]').forEach(el => el.onclick = () => { const m = todosMods().find(x => x.id === el.dataset.liga); modsSt.instalados[m.id] = !modAtivo(m); salvaMods(); aplicaMods(); SOM.coleta(); desenhaMods(); });
  modsEl.querySelectorAll('[data-baixa]').forEach(el => el.onclick = () => { const m = todosMods().find(x => x.id === el.dataset.baixa); const { _rodou, ...o } = m; baixaArquivo('mod-' + m.id + '.json', o); });
  modsEl.querySelectorAll('[data-apaga]').forEach(el => el.onclick = () => { modsSt.meus = modsSt.meus.filter(x => x.id !== el.dataset.apaga); delete modsSt.instalados[el.dataset.apaga]; salvaMods(); aplicaMods(); desenhaMods(); });
  modsEl.querySelectorAll('[data-importa]').forEach(el => el.onclick = () => importaArquivo(o => {
    if (el.dataset.importa === 'mod') { if (!o.nome) return alert('Isso não parece um mod.'); o.id = 'meu_' + Date.now(); modsSt.meus.push(o); modsSt.instalados[o.id] = true; }
    else { if (!o.perso || !o.valores) return alert('Isso não parece uma skin.'); o.id = 'sk_' + Date.now(); modsSt.skins.push(o); }
    salvaMods(); aplicaMods(); desenhaMods(); aviso('📂 ' + o.nome + ' instalado!', 2500);
  }));
  modsEl.querySelectorAll('[data-skin]').forEach(el => el.onclick = () => { const s = SKINS_CATALOGO.concat(DLC_INFO.skins, modsSt.skins).find(x => x.id === el.dataset.skin); aplicaSkin(s); SOM.coleta(); });
  modsEl.querySelectorAll('[data-baixaSkin]').forEach(el => el.onclick = () => { const s = SKINS_CATALOGO.concat(DLC_INFO.skins, modsSt.skins).find(x => x.id === el.dataset.baixaskin); baixaArquivo('skin-' + s.id + '.json', s); });
  modsEl.querySelectorAll('[data-apagaSkin]').forEach(el => el.onclick = () => { modsSt.skins = modsSt.skins.filter(x => x.id !== el.dataset.apagaskin); salvaMods(); desenhaMods(); });
  modsEl.querySelectorAll('[data-aj]').forEach(el => el.oninput = () => document.getElementById('v_' + el.dataset.aj).textContent = (+el.value).toFixed(2).replace(/\.?0+$/, '') + '×');
  const montaMod = () => {
    const m = { id: 'meu_' + Date.now(), emoji: v('mdEmoji') || '🧩', nome: v('mdNome') || 'Meu mod', autor: v('mdAutor') || 'você', desc: v('mdDesc'), ajustes: {} };
    modsEl.querySelectorAll('[data-aj]').forEach(el => { if (+el.value !== 1) m.ajustes[el.dataset.aj] = +el.value; });
    if (document.getElementById('mdCeuOn').checked) m.ajustes.ceu = v('mdCeu');
    if (document.getElementById('mdNebOn').checked) { m.ajustes.neblina = v('mdNeb'); m.ajustes.nebPerto = +v('mdNebP'); m.ajustes.nebLonge = +v('mdNebP') * 4; }
    if (document.getElementById('mdPlacaOn').checked && v('mdPlaca')) { const [x, y] = v('mdLugar').split(','); m.placa = { texto: v('mdPlaca'), x: +x, y: +y }; }
    if (v('mdCodigo').trim()) m.codigo = v('mdCodigo');
    return m;
  };
  const v = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  const b1 = document.getElementById('mdSalvar'); if (b1) b1.onclick = () => { const m = montaMod(); modsSt.meus.push(m); modsSt.instalados[m.id] = true; salvaMods(); aplicaMods(); SOM.missao(); modsAba = 'baixar'; desenhaMods(); aviso('🧩 Mod "' + m.nome + '" criado e instalado!', 3000); };
  const b2 = document.getElementById('mdBaixar'); if (b2) b2.onclick = () => { const m = montaMod(); baixaArquivo('mod-' + m.nome.replace(/\W+/g, '_') + '.json', m); };
  const montaSkin = () => { const p = v('skPerso'); return { id: 'sk_' + Date.now(), emoji: v('skEmoji') || '👕', nome: v('skNome') || 'Minha skin', perso: p, desc: 'criada por você', valores: Object.assign({}, personalizacao[p]) }; };
  const s1 = document.getElementById('skSalvar'); if (s1) s1.onclick = () => { const s = montaSkin(); modsSt.skins.push(s); salvaMods(); SOM.missao(); desenhaMods(); aviso('👕 Skin "' + s.nome + '" salva!', 2500); };
  const s2 = document.getElementById('skBaixar'); if (s2) s2.onclick = () => { const s = montaSkin(); baixaArquivo('skin-' + s.nome.replace(/\W+/g, '_') + '.json', s); };
  modsEl.querySelectorAll('[data-dlc]').forEach(el => el.onclick = () => {
    const a = el.dataset.dlc;
    if (a === 'liga') { modsSt.dlcOn = !modsSt.dlcOn; salvaMods(); aplicaMods(); desenhaMods(); }
    else if (a === 'remove') { if (confirm('Remover o DLC?')) { modsSt.dlc = false; salvaMods(); aplicaMods(); desenhaMods(); } }
    else { el.disabled = true; el.textContent = '⏳ Baixando…'; const pr = document.getElementById('dlcProg'), tx = document.getElementById('dlcTxt'); pr.style.display = 'block'; let p = 0;
      const t = setInterval(() => { p = Math.min(100, p + rnd(4, 14)); pr.firstChild.style.width = p + '%'; tx.textContent = Math.round(p) + '% de ' + DLC_INFO.tam; if (p >= 100) { clearInterval(t); modsSt.dlc = true; modsSt.dlcOn = true; salvaMods(); aplicaMods(); SOM.missao(); desenhaMods(); aviso('🎒 DLC Mega Camping instalado! 40 capítulos, 55 minijogos e 12 bichos no camping.', 5000); } }, 180); }
  });
}
modsEl.addEventListener('click', e => e.stopPropagation());
modsEl.addEventListener('keydown', e => e.stopPropagation());
document.getElementById('btnMods').addEventListener('click', e => { e.stopPropagation(); const on = modsEl.style.display !== 'block'; modsEl.style.display = on ? 'block' : 'none'; if (on) desenhaMods(); });
aplicaMods();
