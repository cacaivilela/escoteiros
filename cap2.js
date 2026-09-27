// ---------- CAPÍTULO 2: uma semana depois (o sábado seguinte) ----------
// Enredo: uma cobra levou a bandeira da árvore do lobinhos.com. A alcateia constrói um GAVIÃO GIGANTE de madeira,
// pilotado por dentro (asas, bico, olhos), pra espantar a cobra. Depois, passeio de barco a remo até o Iate Clube
// (o Alisson enjoa) e, à noite, a lenda do farol: a luz da casinha do salva-vidas guia os pescadores.
// Este arquivo usa as funções/variáveis globais de game.js (carregado antes).

var capituloEscolhido = 1;   // var: game.js pode rodar um frame antes deste arquivo carregar
const dbgEl = DEBUG ? Object.assign(document.body.appendChild(document.createElement('div')), { style: 'position:fixed;left:8px;bottom:60px;z-index:99;background:#300;color:#fff;font:13px monospace;padding:0 8px;white-space:pre;max-width:900px' }) : null;   // erros do capítulo em modo debug
function dbg(t) { if (dbgEl) dbgEl.textContent += t + '\n'; }
if (DEBUG) addEventListener('error', e => dbg('ERRO: ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
var CAP2 = { ativo: false, fase: null, noite: false, temBandeira: false, gav: null, barco: null, cobra: null, rastros: [], etapa: 0, falas: null };
const C2 = {
  canteiro: [-64, -22],          // onde o gavião é construído (osm)
  cobra: [-80, 0],               // pedra onde a cobra está enrolada na bandeira, no mato do arroio
  barco: [100, -30],             // barco a remo encostado na areia da Praia do Camping
  rota: [[100, -30], [150, -70], [220, -120], [285, -140], [340, -95], [385, -10], [398, 70], [385, 130], [350, 178], [336, 196]],   // remando até o trapiche do Iate Clube
};
const matCobra = new THREE.MeshPhongMaterial({ color: 0x6b7a2e, shininess: 30, specular: 0x333322 });
const matCobraBarriga = new THREE.MeshPhongMaterial({ color: 0xd8d0a0, shininess: 10 });

// ---------- menu: escolha do capítulo ----------
document.querySelectorAll('#inicio .cap').forEach(el => el.addEventListener('click', e => {
  e.stopPropagation();
  const c = el.dataset.cap; capituloEscolhido = c === '2b' ? 2 : c === '3b' ? 3 : +c; CAP2.continuar = c === '2b' ? (leSave() || {}).ponto : null; if (typeof CAP3 !== 'undefined') CAP3.continuar = c === '3b' ? (leSave() || {}).ponto : null;
  document.querySelectorAll('#inicio .cap').forEach(x => x.classList.toggle('sel', x === el));
}));
// save: gravado depois de hastear a bandeira no cap. 2; aparece no menu como "Continuar"
function leSave() { try { return JSON.parse(localStorage.getItem('escoteiros.save') || 'null'); } catch (e) { return null; } }
function salvaCap2(ponto, cap) { try { localStorage.setItem('escoteiros.save', JSON.stringify({ cap: cap || 2, ponto, personagem: personagemId, quando: Date.now() })); } catch (e) {} aviso('💾 Progresso salvo: dá pra continuar daqui pelo menu inicial.', 4000); mostraContinuar(); }
function mostraContinuar() { const s = leSave(); for (const [cap, sel] of []) { const el = document.querySelector('#inicio .cap[data-cap="' + sel + '"]'); if (el) el.style.display = s && s.cap === cap ? 'inline-block' : 'none'; } }
mostraContinuar();
const btnCap2 = document.getElementById('btnCap2');
let proximoCap = 2;
btnCap2.addEventListener('click', () => { btnCap2.style.display = 'none'; capituloEscolhido = proximoCap; CAP2.continuar = null; iniciaCapitulo(); travar(); });
// o botão aparece com o mouse preso no jogo: solta o mouse pra dar pra clicar (fica por cima do "Pausado")
function mostraBtnCap() { btnCap2.style.display = 'block'; if (document.pointerLockElement) document.exitPointerLock(); }
function mostraBotaoCap2() { proximoCap = 2; btnCap2.textContent = '▶ Capítulo 2 — uma semana depois'; if (!CAP2.ativo) mostraBtnCap(); }
function mostraBotaoCap3() { proximoCap = 3; btnCap2.textContent = '▶ Capítulo 3 — mais um sábado'; mostraBtnCap(); }
function mostraBotaoCap4() { proximoCap = 4; btnCap2.textContent = '▶ Capítulo 4 — o Distrital'; mostraBtnCap(); }

// ---------- objetos do capítulo ----------
function elipsoide(rx, ry, rz, mat, x, y, z) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), mat); m.scale.set(rx, ry, rz); m.position.set(x, y, z); m.castShadow = true; return m; }

// rastro sinuoso da cobra no chão (tubo fininho deitado)
function criaRastro(x, y, ang) {
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector3(t * 5, 0.04, Math.sin(t * Math.PI * 3) * 0.35)); }
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.06, 6, false), new THREE.MeshLambertMaterial({ color: 0x5a4020 }));
  tubo.position.set(x, altO(x, y) + 0.02, -y); tubo.rotation.y = ang; scene.add(tubo);
  return tubo;
}

// cobra enrolada numa pedra, com a bandeira embaixo
function criaCobra(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  const pedra = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), M.pedra); pedra.scale.set(1.4, 0.5, 1.2); pedra.position.y = 0.2; pedra.castShadow = true; g.add(pedra);
  // bandeira largada em cima da pedra
  const band = bandeira.clone(); band.position.set(-0.8, 0.82, 0.2); band.rotation.set(-Math.PI / 2, 0, 0.6); band.visible = true; g.add(band);
  // corpo: espiral do rabo (centro) até a cabeça (fora, levantada)
  const pts = [];
  for (let i = 0; i <= 70; i++) { const t = i / 70, a = t * Math.PI * 5.2, r = 0.2 + t * 1.15; pts.push(new THREE.Vector3(Math.cos(a) * r, 0.95 + t * 0.25 + (t > 0.86 ? (t - 0.86) * 5 : 0), Math.sin(a) * r)); }
  const curva = new THREE.CatmullRomCurve3(pts);
  const corpo = new THREE.Mesh(new THREE.TubeGeometry(curva, 160, 0.13, 12, false), matCobra); corpo.castShadow = true; g.add(corpo);
  const fim = pts[70], dir = fim.clone().sub(pts[68]).normalize();
  const cabeca = new THREE.Group(); cabeca.position.copy(fim); cabeca.lookAt(fim.clone().add(dir)); g.add(cabeca);
  cabeca.add(elipsoide(0.2, 0.14, 0.32, matCobra, 0, 0, 0.14));
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffcc22 })); o.position.set(sx * 0.11, 0.06, 0.3); cabeca.add(o); const p = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, 0.02), M.preto); p.position.set(sx * 0.11, 0.06, 0.34); cabeca.add(p); }
  const lingua = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.3), new THREE.MeshBasicMaterial({ color: 0xd8302a })); lingua.position.set(0, -0.02, 0.55); cabeca.add(lingua);
  g.scale.setScalar(1.5);
  g.userData.nome = 'Cobra'; g.userData.falandoAte = 0;
  scene.add(g); bonecos.push(g);
  obstaculos.push(g.userData.obst = { x, z: -y, r: 2.2 });
  return { mesh: g, cabeca, lingua, band, x, y, fase: 'enrolada', t: 0, base: cabeca.position.clone() };
}

// gavião gigante de madeira, montado em 3 etapas (asas → corpo → bico e olhos)
function criaGaviao(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  const mad = M.madeira, tronco = M.tronco;
  const partes = { asas: [], corpo: [], bico: [] };
  // corpo, cabeça, cauda, pernas (etapa 2)
  const corpo = elipsoide(1.2, 1.0, 2.4, mad, 0, 1.9, 0); partes.corpo.push(corpo);
  const cabeca = elipsoide(0.8, 0.75, 0.85, mad, 0, 2.7, 2.0); partes.corpo.push(cabeca);
  const cauda = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 1.5), tronco); cauda.position.set(0, 1.9, -2.9); cauda.castShadow = true; partes.corpo.push(cauda);
  for (const sx of [-1, 1]) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.4, 10), tronco); perna.position.set(sx * 0.55, 0.7, 0.3); partes.corpo.push(perna);
    for (const a of [-0.5, 0, 0.5]) { const garra = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 6), M.preto); garra.rotation.x = Math.PI / 2; garra.rotation.z = a; garra.position.set(sx * 0.55 + Math.sin(a) * 0.2, 0.06, 0.5); partes.corpo.push(garra); }
  }
  const janela = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshBasicMaterial({ color: 0x1a1008 })); janela.position.set(0, 2.2, -2.42); janela.rotation.y = Math.PI; partes.corpo.push(janela);   // a portinha por onde os lobinhos entram
  // asas (etapa 1): pivô na raiz, batem girando em z
  const asas = [];
  for (const sx of [-1, 1]) {
    const asa = new THREE.Group(); asa.position.set(sx * 0.9, 2.3, 0.2);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.7), mad); base.position.x = sx * 1.7; base.castShadow = true; asa.add(base);
    for (let i = 0; i < 4; i++) { const pena = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.45), tronco); pena.position.set(sx * (3.4 + 0.5), 0, -0.6 + i * 0.4); pena.rotation.y = sx * (0.1 + i * 0.12); asa.add(pena); }
    asas.push(asa); partes.asas.push(asa);
  }
  // bico (etapa 3): parte de cima fixa, parte de baixo abre
  const bicoCima = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.0, 4), M.amarelo); bicoCima.rotation.x = Math.PI / 2; bicoCima.rotation.y = Math.PI / 4; bicoCima.position.set(0, 2.62, 3.2); partes.bico.push(bicoCima);
  const bicoBaixo = new THREE.Group(); bicoBaixo.position.set(0, 2.45, 2.75);
  const bb = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 4), M.amarelo); bb.rotation.x = Math.PI / 2; bb.rotation.y = Math.PI / 4; bb.position.z = 0.42; bicoBaixo.add(bb); partes.bico.push(bicoBaixo);
  const olhos = [], luzOlhos = new THREE.PointLight(0xffe066, 0, 12); luzOlhos.position.set(0, 2.9, 2.6); g.add(luzOlhos);
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), new THREE.MeshBasicMaterial({ color: 0x2a2018 })); o.position.set(sx * 0.4, 2.95, 2.62); olhos.push(o); partes.bico.push(o); }
  for (const k in partes) for (const p of partes[k]) { p.visible = false; g.add(p); }
  g.scale.setScalar(3);   // gigante mesmo: 30 m de envergadura
  luzOlhos.distance = 40;
  // canteiro: círculo de terra batida com estacas em volta
  const chao = new THREE.Mesh(new THREE.CircleGeometry(14, 32), M.terra); chao.rotation.x = -Math.PI / 2; chao.position.set(x, altO(x, y) + 0.03, -y); chao.receiveShadow = true; scene.add(chao);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const ex = x + Math.cos(a) * 14, ey = y - Math.sin(a) * 14, est = caixa(0.2, 1.2, 0.2, M.madeira, ex, altO(ex, ey) + 0.6, -ey); scene.add(est); }   // cada estaca no chão dela
  scene.add(g);
  return { mesh: g, partes, asas, bicoBaixo, olhos, luzOlhos, etapa: 0, chao };
}
function gaviaoEtapa(n) {   // mostra as partes já construídas
  const gv = CAP2.gav; gv.etapa = n;
  const ordem = ['asas', 'corpo', 'bico'];
  ordem.forEach((k, i) => { for (const p of gv.partes[k]) p.visible = i < n; });
  // enquanto o corpo não existe, as asas ficam deitadas no chão do lado
  gv.asas.forEach((a, i) => { if (n < 2) { a.position.y = 0.2; a.position.x = (i ? 1 : -1) * 2.6; a.rotation.z = 0; } else { a.position.y = 2.3; a.position.x = (i ? 1 : -1) * 0.9; } });
}

// barco a remo
function criaBarco(x, y) {
  const g = new THREE.Group(); g.position.set(x, 0.1, -y);
  const casco = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 3.8), M.madeira); casco.position.y = 0.3; casco.castShadow = true; g.add(casco);
  const proa = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 4), M.madeira); proa.rotation.x = Math.PI / 2; proa.rotation.y = Math.PI / 4; proa.scale.set(1, 0.7, 1); proa.position.set(0, 0.3, 2.55); g.add(proa);
  const fundo = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 3.5), M.tronco); fundo.position.y = 0.2; g.add(fundo);
  for (const z of [-0.9, 0.3, 1.3]) { const banco = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.35), M.tronco); banco.position.set(0, 0.55, z); g.add(banco); }
  const remos = [];
  for (const sx of [-1, 1]) { const r = new THREE.Group(); r.position.set(sx * 0.8, 0.6, 0.3); const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 8), M.bambu); cabo.rotation.z = sx * 1.1; cabo.position.x = sx * 1.1; r.add(cabo); const pa = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.06), M.madeira); pa.position.set(sx * 2.2, -0.6, 0); r.add(pa); g.add(r); remos.push(r); }
  const lampiao = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd070 })); lampiao.position.set(0, 1.3, 2.2); lampiao.visible = false; g.add(lampiao);
  const luz = new THREE.PointLight(0xffd070, 0, 16); luz.position.copy(lampiao.position); g.add(luz);
  scene.add(g);
  return { mesh: g, remos, lampiao, luz };
}

// ---------- início do capítulo ----------
// começa um sábado novo no camping: limpa o estado do capítulo anterior, roda na árvore, Alisson, Pai e Trailblazer na portaria
function preparaSabado() {
  introFeita = true; jogoIniciado = true;
  btnCap2.style.display = 'none'; inicio.style.display = 'none';
  cena = null; mini = null; miniEl.style.display = 'none'; balao = null; balaoEl.style.opacity = 0;
  if (noite || noite2) { noite2 = false; ligaNoite(false, true); capituloNoite = null; }
  if (CAP2.noite) { ligaNoite(false, true); CAP2.noite = false; noite = false; lampiao.visible = false; }
  n2.fase = null; n2.seguidores = []; ajudantes.length = 0; obra = null; dia2 = true; mostraMadeira();
  fadeEl.style.opacity = 1; document.getElementById('hud').style.opacity = 0;
  jogador.visible = true; alissonFalou = true; mostraCachorros(); phantom.seguindo = false; phantom.estagio = 4;
  phantom.mesh.visible = true; phantom.mesh.position.set(ARV_BAND[0] + 5.4, ARV_BASE - 0.12, -ARV_BAND[1] + 1.2); phantom.mesh.rotation.set(-0.5, 2.6, 0);
  // roda da alcateia de volta na árvore (o dia 2 do cap. 1 leva eles pra fogueira)
  [['Lobinho Dudu', 0.9], ['Lobinha Maria', 2.1], ['Lobinho Davi', 3.3], ['Lobinha Larissa', 4.5], ['Lobinho Joaquim', 5.6]].forEach(([nome, a]) => {
    const n = npcs.find(x => x.nome === nome); if (!n) return;
    const px = ARV_BAND[0] + Math.cos(a) * 6, py = ARV_BAND[1] + Math.sin(a) * 6;
    n.mesh.position.set(px, altO(px, py), -py); n.mesh.rotation.y = Math.atan2(ARV_BAND[0] - px, -(ARV_BAND[1] - py)); n.mesh.visible = true;
    aplicaEmote(n.mesh, nome === 'Lobinho Joaquim' ? 'bravo' : 'feliz', 0);
    for (const o of obstaculos) if (o.npc === n.mesh) { o.x = px; o.z = -py; o.r = 0.5; }
    for (const i of interativos) if (i.npcMesh === n.mesh) { i.x = px; i.z = -py; i.r = 3; }
  });
  for (const n of npcs) if (n.mesh.userData.noite) { n.mesh.visible = false; for (const i of interativos) if (i.npcMesh === n.mesh) i.r = 0; }
  // Alisson de volta no lugar dele
  alisson.visible = true; alisson.position.set(ALISSON[0], altO(ALISSON[0], ALISSON[1]), -ALISSON[1]);
  for (const o of obstaculos) if (o.npc === alisson) { o.x = ALISSON[0]; o.z = -ALISSON[1]; o.r = 0.5; }
  for (const i of interativos) if (i.npcMesh === alisson) { i.x = ALISSON[0]; i.z = -ALISSON[1]; i.r = 3; }
  // a Trailblazer e o Pai na portaria (trouxe todo mundo de novo)
  const pc = CARRO_CAMINHO[CARRO_CAMINHO.length - 1]; carro.position.set(pc[0], altO(pc[0], pc[1]), -pc[1]); carro.rotation.y = Math.atan2(pc[0] - CARRO_CAMINHO[3][0], -pc[1] + CARRO_CAMINHO[3][1]) - Math.PI / 2; Object.assign(carroObst, { x: carro.position.x, z: carro.position.z, rot: carro.rotation.y });
  if (!pai) { pai = npc(pc[0] + 3, pc[1] + 2, 2.6, 'Pai', '', PAI_OPTS); aplicaEmote(pai, 'serio', 0); pai.userData.serio = true; daCelular(pai); }
  else { pai.visible = true; pai.position.set(pc[0] + 3, altO(pc[0] + 3, pc[1] + 2), -pc[1] - 2); for (const o of obstaculos) if (o.npc === pai) { o.x = pc[0] + 3; o.z = -pc[1] - 2; } }
  const ip = interativos.find(i => i.nome === 'Falar com Pai'); if (ip) { ip.x = pai.position.x; ip.z = pai.position.z; ip.r = 3; }
  // jogador na roda
  estado.pos.set(ARV_BAND[0] + 2, altO(ARV_BAND[0] + 2, ARV_BAND[1] - 9), -(ARV_BAND[1] - 9)); estado.yaw = 0; cam.yaw = 0; cam.pitch = 0.25;
  jogador.position.copy(estado.pos); camera.position.set(estado.pos.x, 3.2, estado.pos.z + 6);
  SOM.ambiente(true);
}
function iniciaCapitulo() { if (capituloEscolhido === 4 && typeof iniciaCap4 === 'function') iniciaCap4(); else if (capituloEscolhido === 3 && typeof iniciaCap3 === 'function') iniciaCap3(); else iniciaCap2(); }
function iniciaCap2() {
  if (CAP2.ativo) return;
  preparaSabado(); CAP2.ativo = true;
  interativos.find(i => i.nome === 'Falar com Pai').acao = () => aviso('Pai: "' + ['Semana que vem eu trago vocês de novo. Vai lá, a Akelá tá chamando.', 'Cobra? Não chega perto, hein. Deixa a Akelá resolver... ou o Claude.', 'Tô quase terminando esse código. Sério. Quase.'][Math.floor(Math.random() * 3)] + '"', 4500);
  // bandeira sumiu da árvore
  bandeira.visible = false; bandeiraAlt = bandeiraAlvo = 1.2; CAP2.temBandeira = false;
  // cobra, rastros e canteiro do gavião
  CAP2.cobra = criaCobra(C2.cobra[0], C2.cobra[1]);
  const R = [[-41, 0, 2.95], [-50, 1, 2.9], [-60, 2, 3.05], [-70, 2.5, 2.85]];
  CAP2.rastros = R.map(([x, y, a]) => criaRastro(x, y, a));
  CAP2.rastrosVistos = 0;
  CAP2.gav = criaGaviao(C2.canteiro[0], C2.canteiro[1]); gaviaoEtapa(0);
  CAP2.placaCanteiro = placaLivre('Canteiro do gavião', C2.canteiro[0] + 10, C2.canteiro[1] - 12, 4, 0.3, 1.6); CAP2.placaCanteiro.visible = false;
  CAP2.barco = criaBarco(C2.barco[0], C2.barco[1]);
  // diálogos dos NPCs neste capítulo
  interativos.find(i => i.nome === 'Falar com Akelá').acao = c2Akela;
  interativos.find(i => i.nome === 'Falar com Chefe Diego').acao = c2Diego;
  interativos.find(i => i.nome === 'Falar com Lobinho Alisson').acao = () => aviso('Lobinho Alisson: "' + (CAP2.fase === 'iate' ? 'Barco a remo? Eu... eu enjoo fácil, viu. Mas eu vou!' : CAP2.fase === 'farol' ? 'Aquela luz na casinha... será que é assombração de novo?' : 'O Fantasma tá dormindo debaixo da árvore. Ele não tem medo de cobra... mas eu tenho!') + '"', 4000);
  // missões do capítulo
  missoes.splice(0, missoes.length, { id: 'c2_akela', txt: 'Sábado de novo! Falar com a Akelá na árvore do lobinhos.com', ok: false }); renderMissoes();
  CAP2.fase = 'abre';
  cena = { cap2: true, tipo: 'abre', t: 0 };
  textoNoite.textContent = 'Uma semana depois — sábado, de novo no camping'; textoNoite.style.opacity = 1;
  if (CAP2.continuar === 'bandeira') retomaDepoisDaBandeira();
}
// continuar do save: cobra já fugiu, gavião pronto, bandeira hasteada; falta o passeio ao Iate Clube e a noite
function retomaDepoisDaBandeira() {
  CAP2.cobra.mesh.visible = false; CAP2.cobra.mesh.userData.obst.r = 0; CAP2.cobra.fase = 'foi';
  for (const r of CAP2.rastros) r.visible = false; CAP2.rastrosVistos = 4;
  CAP2.etapa = C2_ETAPAS.length; gaviaoEtapa(3); CAP2.placaCanteiro.visible = true;
  CAP2.temBandeira = true; bandeira.visible = true; bandeiraAlt = bandeiraAlvo = 5.4;
  missoes.splice(0, missoes.length,
    { id: 'c2_akela', txt: 'Falar com a Akelá na árvore do lobinhos.com', ok: true }, { id: 'c2_rastro', txt: 'Seguir o rastro pelo chão (4/4)', ok: true },
    { id: 'c2_cobra', txt: 'Chegar perto da pedra no mato do arroio', ok: true }, { id: 'c2_diego', txt: 'Falar com o Chefe Diego na portaria sobre a cobra', ok: true },
    { id: 'c2_gaviao', txt: 'Construir o gavião gigante (' + C2_ETAPAS.length + '/' + C2_ETAPAS.length + ' etapas)', ok: true }, { id: 'c2_pilotar', txt: 'Espantar a cobra com o gavião', ok: true },
    { id: 'c2_pegar', txt: 'Pegar a bandeira na pedra', ok: true }, { id: 'bandeira', txt: 'Hastear a bandeira de novo na árvore do lobinhos.com', ok: true },
    { id: 'c2_barco', txt: 'Passeio: entrar no barco a remo na Praia do Camping (a Akelá e o Alisson vão junto)', ok: false });
  renderMissoes();
  CAP2.fase = 'iate';
  textoNoite.textContent = 'Continuando: a bandeira já está de volta na árvore';
  if (cena) cena.t = 1.5;   // abertura mais curta
  setTimeout(c2Akela, 3500);
}

// ---------- diálogos e interações ----------
function c2Missao(id, txt) { if (!missoes.find(m => m.id === id)) { missoes.push({ id, txt, ok: false }); renderMissoes(); } }
const akelaMesh = () => npcs.find(n => n.nome === 'Akelá').mesh;
function c2Akela() {
  const f = CAP2.fase;
  if (f === 'abre' || f === 'akela') {
    aviso('Akelá: "' + PERSONAGENS[personagemId].nome + ', que bom que chegou! A BANDEIRA SUMIU da árvore. E olha só esse rastro esquisito no chão... vai seguindo ele e vê pra onde vai."', 6000);
    completa('c2_akela'); CAP2.fase = 'rastro'; c2Missao('c2_rastro', 'Seguir o rastro pelo chão (0/4)');
  } else if (f === 'rastro') aviso('Akelá: "Segue o rastro! Ele passa por trás da cantina, rumo ao arroio."', 4000);
  else if (f === 'cobra') aviso('Akelá: "Uma COBRA enrolada na bandeira?! Ninguém chega perto. Vai lá falar com o Chefe Diego na portaria, ele sabe lidar com bicho."', 5000);
  else if (f === 'gaviao') aviso('Akelá: "Gavião gigante de madeira? Só o Chefe Diego mesmo... Vai lá construir no canteiro atrás da cantina, a alcateia ajuda!"', 5000);
  else if (f === 'pilotar') aviso('Akelá: "O gavião tá pronto! Entra nele e vai espantar a cobra. Bate as asas, estala o bico, acende os olhos!"', 5000);
  else if (f === 'bandeira') aviso('Akelá: "Pega a bandeira e hasteia de novo na árvore, ' + PERSONAGENS[personagemId].nome + '!"', 4000);
  else if (f === 'iate') aviso('Akelá: "Agora o passeio! O Iate Clube convidou a alcateia pra ver os veleiros. Vamos de barco a remo, saindo da Praia do Camping. Eu vou com você e o Alisson."', 6000);
  else if (f === 'farol') aviso('Akelá: "Fica na praia, perto da casinha do salva-vidas, e olha a luz. O velejador disse que hoje tem barco voltando."', 5000);
  else if (f === 'fim') aviso('Akelá: "Que sábado, hein! Semana que vem tem mais. Grande Uivo, alcateia!"', 4000);
}
function c2Diego() {
  const f = CAP2.fase;
  if (f === 'cobra') {
    aviso('Chefe Diego: "Cobra na bandeira? Cobra tem medo de GAVIÃO. Vamos construir um gavião GIGANTE de madeira e vocês pilotam ele por dentro: batem as asas, estalam o bico, acendem os olhos. A cobra vai fugir pra lagoa!"', 8000);
    completa('c2_diego'); CAP2.fase = 'gaviao'; CAP2.etapa = 0; CAP2.placaCanteiro.visible = true;
    c2Missao('c2_gaviao', 'Construir o gavião gigante no canteiro atrás da cantina (0/' + C2_ETAPAS.length + ' etapas)');
  } else if (f === 'gaviao') aviso('Chefe Diego: "Serra as asas, prega o corpo e amarra o bico. Vai ficar melhor possível!"', 4000);
  else if (f === 'pilotar') aviso('Chefe Diego: "Entra no gavião e vai! ← → batem as asas, E estala o bico, Q acende os olhos e grita."', 5000);
  else aviso('Chefe Diego: "Bom sábado, ' + PERSONAGENS[personagemId].nome + '! Vai lá com a Akelá."', 3500);
}
// 23 etapas: asas (1-7), corpo (8-16), bico e olhos (17-23). Cada uma é um minigame curto.
const C2_ETAPAS = [
  ['serrar', 2, 'Serrar a asa esquerda'], ['serrar', 2, 'Serrar a asa direita'], ['martelar', 3, 'Pregar as penas da asa esquerda'], ['martelar', 3, 'Pregar as penas da asa direita'],
  ['amarrar', 1, 'Amarrar a asa esquerda'], ['amarrar', 1, 'Amarrar a asa direita'], ['serrar', 2, 'Serrar as ripas de reforço das asas'],
  ['serrar', 2, 'Serrar as tábuas do corpo'], ['martelar', 3, 'Pregar o corpo'], ['martelar', 3, 'Pregar a cabeça'], ['serrar', 2, 'Serrar a cauda'], ['martelar', 3, 'Pregar a cauda'],
  ['serrar', 2, 'Serrar as pernas'], ['martelar', 3, 'Pregar as pernas'], ['amarrar', 2, 'Amarrar as garras'], ['martelar', 3, 'Pregar a portinha de entrar'],
  ['serrar', 2, 'Serrar o bico de cima'], ['serrar', 2, 'Serrar o bico de baixo'], ['martelar', 3, 'Pregar o bico'], ['amarrar', 2, 'Amarrar a dobradiça do bico'],
  ['martelar', 3, 'Pregar os olhos'], ['amarrar', 2, 'Amarrar as lanternas dos olhos'], ['amarrar', 2, 'Amarrar tudo e revisar o gavião'],
];
const C2_ETAPAS_PARTE = [7, 16, 23];   // em qual etapa cada parte fica pronta (asas, corpo, bico)
function cap2Etapa() {   // chamado por etapaConcluida() quando o minigame termina
  if (typeof cap4Etapa === 'function' && cap4Etapa()) return true;
  if (typeof cap3Etapa === 'function' && cap3Etapa()) return true;
  if (!CAP2 || !CAP2.ativo || CAP2.fase !== 'gaviao') return false;
  CAP2.etapa++; gaviaoEtapa(C2_ETAPAS_PARTE.filter(n => CAP2.etapa >= n).length); SOM.coleta();
  const m = missoes.find(x => x.id === 'c2_gaviao'); if (m) { m.txt = 'Construir o gavião gigante no canteiro atrás da cantina (' + CAP2.etapa + '/' + C2_ETAPAS.length + ' etapas)'; renderMissoes(); }
  if (CAP2.etapa >= C2_ETAPAS.length) { completa('c2_gaviao'); CAP2.fase = 'pilotar'; c2Missao('c2_pilotar', 'Entrar no gavião e espantar a cobra (← → asas · E bico · Q olhos e grito)'); aviso('🦅 O gavião gigante está pronto! Entre nele pela portinha atrás.', 5000); }
  else aviso('✅ Etapa pronta! Próxima: ' + C2_ETAPAS[CAP2.etapa][2] + ' (aperte E de novo)', 3500);
  return true;
}
function c2ProximaFala() {
  if (!cena || !cena.cap2 || !cena.falas) return;
  cena.i++;
  if (cena.i >= cena.falas.length) { const fim = cena.aoTerminar; cena.falas = null; if (fim) fim(); return; }
  aviso(cena.falas[cena.i] + '  (E pra continuar)', 20000);
}
function cap2Tecla(e) {   // teclas do capítulo (chamado no keydown de game.js); true = consumiu
  if (typeof cap4Tecla === 'function' && cap4Tecla(e)) return true;
  if (typeof cap3Tecla === 'function' && cap3Tecla(e)) return true;
  if (!CAP2 || !CAP2.ativo || !cena || !cena.cap2) return false;
  if (cena.falas) { if (e.code === 'KeyE' && !e.repeat) c2ProximaFala(); return true; }
  if (cena.tipo === 'gaviao' && !e.repeat) { gaviaoComando({ ArrowLeft: 'esq', KeyA: 'esq', ArrowRight: 'dir', KeyD: 'dir', KeyE: 'bico', KeyQ: 'olhos', Space: 'olhos' }[e.code]); return true; }
  if (cena.tipo === 'remar' && !e.repeat) { remada({ ArrowLeft: 'esq', KeyA: 'esq', ArrowRight: 'dir', KeyD: 'dir' }[e.code]); return true; }
  return false;
}
function cap2PadExtra(j, inp) {   // controles dos jogadores extras durante as cenas do capítulo
  if (typeof cap4PadExtra === 'function' && cap4PadExtra(j, inp)) return true;
  if (typeof cap3PadExtra === 'function' && cap3PadExtra(j, inp)) return true;
  if (!CAP2 || !CAP2.ativo || !cena || !cena.cap2 || !inp) return false;
  if (cena.tipo === 'gaviao') { if (inp.esq) gaviaoComando('esq'); if (inp.dir) gaviaoComando('dir'); if (inp.interagir) gaviaoComando('bico'); if (inp.habilidade || inp.a) gaviaoComando('olhos'); return true; }
  if (cena.tipo === 'remar') { if (inp.esq) remada('esq'); if (inp.dir) remada('dir'); return true; }
  return !!cena.falas;
}

// interações do capítulo (só aparecem quando CAP2.ativo)
interativos.push({ x: 0, z: 0, r: 0, nome: 'Olhar o rastro', cond: () => CAP2.ativo && CAP2.fase === 'rastro', acao: () => {
  const r = CAP2.rastros[CAP2.rastrosVistos]; if (!r) return;
  CAP2.rastrosVistos++;
  const m = missoes.find(x => x.id === 'c2_rastro'); if (m) { m.txt = 'Seguir o rastro pelo chão (' + CAP2.rastrosVistos + '/4)'; renderMissoes(); }
  aviso(['Um rastro ondulado na terra... não é de bicicleta, não é de pé. Parece uma linha em S.', 'O rastro continua, atrás da cantina, indo pro lado do arroio.', 'Tem escamas no chão! Isso é rastro de COBRA. E ela é grande.', 'O rastro acaba ali na frente, numa pedra no mato do arroio... e tem um pano verde lá!'][CAP2.rastrosVistos - 1], 4500); SOM.coleta();
  if (CAP2.rastrosVistos >= 4) { completa('c2_rastro'); CAP2.fase = 'cobra'; c2Missao('c2_cobra', 'Chegar perto da pedra no mato do arroio'); }
} });
interativos.push({ x: 0, z: 0, r: 15, nome: 'Construir o gavião', cond: () => CAP2.ativo && CAP2.fase === 'gaviao' && !mini, acao: () => {
  estado.yaw = Math.atan2(CAP2.gav.mesh.position.x - estado.pos.x, CAP2.gav.mesh.position.z - estado.pos.z);
  const e = C2_ETAPAS[CAP2.etapa]; abreMini(e[0], e);
} });
interativos.push({ x: 0, z: 0, r: 15, nome: 'Entrar no gavião e pilotar', cond: () => CAP2.ativo && CAP2.fase === 'pilotar' && !mini, acao: iniciaGaviao });
interativos.push({ x: 0, z: 0, r: 4, nome: 'Pegar a bandeira', cond: () => CAP2.ativo && CAP2.fase === 'bandeira' && !CAP2.temBandeira, acao: () => {
  CAP2.temBandeira = true; CAP2.cobra.band.visible = false; if (CAP2.cobra.bandChao) CAP2.cobra.bandChao.visible = false; SOM.coleta();
  bandeira.visible = true; bandeiraAlt = bandeiraAlvo = 1.2;
  completa('c2_pegar'); c2Missao('bandeira', 'Hastear a bandeira de novo na árvore do lobinhos.com');
  aviso('🏳️ Pegou a bandeira de volta! Leva pra árvore do lobinhos.com e hasteia com a alcateia.', 4500);
} });
interativos.push({ x: 0, z: 0, r: 10, nome: 'Entrar no barco a remo', cond: () => CAP2.ativo && CAP2.fase === 'iate' && !mini, acao: iniciaRemar });
interativos.push({ x: 0, z: 0, r: 9, nome: 'Esperar o barco dos pescadores', cond: () => CAP2.ativo && CAP2.fase === 'farol' && !mini, acao: iniciaPescador });

// ---------- GAVIÃO: pilotagem ----------
function iniciaGaviao() {
  const gv = CAP2.gav, cb = CAP2.cobra;
  gv.pos = gv.mesh.position.clone(); gv.yaw = Math.atan2(cb.mesh.position.x - gv.pos.x, cb.mesh.position.z - gv.pos.z); gv.v = 0; gv.altura = 0; gv.asaAlvo = 0; gv.asaFase = 0; gv.ultimo = null; gv.susto = 0; gv.bicoT = 0; gv.olhosT = 0; gv.gritoAte = 0; gv.aviso = 0; gv.chao = gv.mesh.position.y;
  cena = { cap2: true, tipo: 'gaviao', t: 0, fase: 'voa', carona: [{ mesh: akelaMesh() }] };
  jogador.visible = false; for (const j of jogadores) if (j.mesh) j.mesh.visible = false;
  miniEl.style.display = 'block'; desenhaGaviaoHud();
  aviso('🦅 Vocês estão dentro do gavião! ← → batem as asas (alternando) · E estala o bico · Q acende os olhos e grita', 5000);
}
function desenhaGaviaoHud() {
  const gv = CAP2.gav; const n = Math.round(gv.susto / 5);
  miniEl.innerHTML = '<b>🦅 Gavião gigante</b><div class="mmsg">← → asas · E bico · Q olhos e grito</div><div>Susto da cobra:</div><div class="prog">' + '🟥'.repeat(n) + '⬜'.repeat(20 - n) + '</div><small>Chegue perto da cobra e assuste ela!</small>';
}
function gaviaoComando(c) {
  const gv = CAP2.gav; if (!gv || !cena || cena.tipo !== 'gaviao' || cena.fase !== 'voa' || !c) return;
  const d = Math.hypot(gv.pos.x - CAP2.cobra.mesh.position.x, gv.pos.z - CAP2.cobra.mesh.position.z);
  if (c === 'esq' || c === 'dir') {
    const alterna = gv.ultimo && gv.ultimo !== c; gv.ultimo = c;
    gv.asaAlvo += Math.PI; gv.v = Math.min(14, gv.v + (alterna ? 3.6 : 1.8)); gv.altura = Math.min(10, gv.altura + 1.0);
    SOM.passo(true, false); if (d < 30) gv.susto += alterna ? 4 : 2;
  } else if (c === 'bico') { gv.bicoT = 0.45; SOM.tap(); if (d < 26) gv.susto += 7; }
  else if (c === 'olhos') { if (tempo < gv.gritoAte) return; gv.gritoAte = tempo + 2; gv.olhosT = 1.2; SOM.uivo(); if (d < 30) gv.susto += 13; }
  gv.susto = Math.min(100, gv.susto);
}
function atualizaGaviao(dt) {
  const gv = CAP2.gav, cb = CAP2.cobra, g = gv.mesh;
  cena.t += dt;
  if (cena.fase === 'voa') {
    const dx = cb.mesh.position.x - gv.pos.x, dz = cb.mesh.position.z - gv.pos.z, d = Math.hypot(dx, dz);
    const alvoYaw = Math.atan2(dx, dz); let dy = alvoYaw - gv.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); gv.yaw += dy * Math.min(1, dt * 1.5);
    if (d > 16) { gv.pos.x += Math.sin(gv.yaw) * gv.v * dt; gv.pos.z += Math.cos(gv.yaw) * gv.v * dt; } else gv.v = 0;
    gv.v *= Math.max(0, 1 - dt * 0.9);
    gv.altura = Math.max(0, gv.altura - dt * 1.2);
    gv.susto = Math.max(0, gv.susto - dt * 1.5);
    // a cobra reage
    const s = gv.susto;
    if (s > 30 && gv.aviso < 1) { gv.aviso = 1; aviso('Cobra: "Sssss...?"', 2500); cb.fase = 'alerta'; }
    if (s > 60 && gv.aviso < 2) { gv.aviso = 2; aviso('Cobra: "SSSSSS! Que bicho é esse?!"', 2500); SOM.grr(); }
    if (s >= 97) { cena.fase = 'foge'; cena.t = 0; cb.fase = 'foge'; aviso('Cobra: "SOCORRO, UM GAVIÃO GIGANTE!"', 3000); SOM.grr(); }
    if (Math.floor(cena.t * 8) !== Math.floor((cena.t - dt) * 8)) desenhaGaviaoHud();
  } else if (cena.fase === 'foge') {
    if (cena.t > 4.5) { cena.fase = 'pousa'; cena.t = 0; }
  } else if (cena.fase === 'pousa') {
    gv.altura = Math.max(0, gv.altura - dt * 2);
    if (cena.t > 1.6) {
      const px = gv.pos.x + Math.cos(gv.yaw) * 8, pz = gv.pos.z - Math.sin(gv.yaw) * 8;
      estado.pos.set(px, alt(px, pz), pz); jogador.position.copy(estado.pos); jogador.visible = true;
      jogadores.forEach((j, i) => { if (j.mesh) { j.pos.set(px + 1.2 * (i + 1), 0, pz + 0.6 * (i + 1)); j.pos.y = alt(j.pos.x, j.pos.z); j.mesh.position.copy(j.pos); j.mesh.visible = true; } });
      cena = null; miniEl.style.display = 'none';
      completa('c2_pilotar'); CAP2.fase = 'bandeira'; c2Missao('c2_pegar', 'Pegar a bandeira na pedra');
      aviso('🦅 A cobra fugiu pra lagoa! A bandeira ficou na pedra.', 4000); SOM.missao();
      return;
    }
  }
  // animação do gavião
  gv.asaFase += (gv.asaAlvo - gv.asaFase) * Math.min(1, dt * 9);
  const ang = Math.sin(gv.asaFase) * 0.75;
  gv.asas.forEach((a, i) => a.rotation.z = (i ? -1 : 1) * ang);
  g.position.set(gv.pos.x, gv.chao + gv.altura + Math.abs(ang) * 0.9, gv.pos.z); g.rotation.y = gv.yaw; g.rotation.x = -gv.v * 0.03;
  gv.bicoT = Math.max(0, gv.bicoT - dt); gv.bicoBaixo.rotation.x = gv.bicoT > 0 ? 0.6 : 0;
  gv.olhosT = Math.max(0, gv.olhosT - dt); const on = gv.olhosT > 0; gv.olhos.forEach(o => o.material.color.setHex(on ? 0xffe066 : 0x2a2018)); gv.luzOlhos.intensity = on ? 3 : 0;
}
function atualizaCobra(dt) {
  const cb = CAP2.cobra; if (!cb || !cb.mesh.visible) return;
  cb.t += dt;
  cb.lingua.visible = Math.sin(cb.t * 5) > 0.6;
  if (cb.fase === 'enrolada') cb.cabeca.position.y = cb.base.y + Math.sin(cb.t * 1.5) * 0.04;
  else if (cb.fase === 'alerta') cb.cabeca.position.y = cb.base.y + 0.25 + Math.sin(cb.t * 6) * 0.06;
  else if (cb.fase === 'foge') {
    // desliza serpenteando até a água do arroio e some
    const m = cb.mesh; const alvo = new THREE.Vector3(-100, m.position.y, -8);
    const dir = alvo.clone().sub(m.position); dir.y = 0; const d = dir.length();
    if (d > 0.5) { dir.normalize(); m.position.x += dir.x * 5 * dt; m.position.z += dir.z * 5 * dt; m.rotation.y = Math.atan2(dir.x, dir.z) + Math.sin(cb.t * 12) * 0.35; m.position.y -= dt * 0.15; }
    else { m.visible = false; cb.mesh.userData.obst.r = 0; }
    cb.band.visible = false;
    if (!cb.bandNoChao) { cb.bandNoChao = true; const b = bandeira.clone(); b.visible = true; b.position.set(C2.cobra[0] - 0.8, altO(C2.cobra[0], C2.cobra[1]) + 0.72, -C2.cobra[1] + 0.2); b.rotation.set(-Math.PI / 2, 0, 0.6); scene.add(b); cb.bandChao = b; cb.mesh.userData.obst.r = 0; }
  }
}

// ---------- BARCO A REMO até o Iate Clube ----------
function iniciaRemar() {
  const b = CAP2.barco;
  b.curva = new THREE.CatmullRomCurve3(C2.rota.map(([x, y]) => new THREE.Vector3(x, 0.1, -y)));
  b.prog = 0; b.remo = 0; b.remoAlvo = 0; b.ultimo = null; b.enjoo = 0; b.enjoou = false; b.passou = false;
  cena = { cap2: true, tipo: 'remar', t: 0, carona: [{ mesh: alisson }, { mesh: akelaMesh() }] };
  for (const o of obstaculos) if (o.npc === alisson || o.npc === akelaMesh()) o.r = 0;
  miniEl.style.display = 'block'; desenhaRemarHud();
  aviso('🚣 Reme alternando ← e →. O Alisson vai na proa, a Akelá atrás.', 4500);
}
function desenhaRemarHud() {
  const b = CAP2.barco; const n = Math.round(b.prog * 20);
  miniEl.innerHTML = '<b>🚣 Remando pro Iate Clube</b><div class="mmsg">' + (b.enjoo > 0 ? '🤢 O Alisson enjoou! Para de remar um pouquinho...' : '← → alternando') + '</div><div class="prog">' + '🟦'.repeat(n) + '⬜'.repeat(20 - n) + '</div>';
}
function remada(c) {
  const b = CAP2.barco; if (!b || !cena || cena.tipo !== 'remar' || !c) return;
  if (b.enjoo > 0) { if (!b.reclamou) { b.reclamou = true; aviso('Lobinho Alisson: "PARAAA! Tô enjoado, para de balançar!"', 2500); } return; }
  const alterna = b.ultimo && b.ultimo !== c; b.ultimo = c;
  b.prog = Math.min(1, b.prog + (alterna ? 1 / 42 : 1 / 84)); b.remoAlvo += Math.PI; SOM.passo(false, true);
  desenhaRemarHud();
}
function atualizaRemar(dt) {
  const b = CAP2.barco, m = b.mesh;
  cena.t += dt;
  b.prog = Math.min(1, b.prog + dt * 0.003);
  if (b.prog > 0.48 && !b.enjoou) { b.enjoou = true; b.enjoo = 4; aviso('Lobinho Alisson: "Aaai... tá balançando demais... acho que eu vou vomitar... para um pouquinho, por favor!"', 4000); aplicaEmote(alisson, 'triste', 0); desenhaRemarHud(); }
  if (b.enjoo > 0) { b.enjoo -= dt; if (b.enjoo <= 0) { aviso('Lobinho Alisson: "Ufa... passou. Pode remar de novo. Devagar!"', 3000); aplicaEmote(alisson, 'feliz', 0); desenhaRemarHud(); } }
  const p = b.curva.getPointAt(b.prog), tg = b.curva.getTangentAt(Math.min(0.999, b.prog));
  m.position.set(p.x, 0.1 + Math.sin(cena.t * 1.6) * 0.06, p.z); m.rotation.y = Math.atan2(tg.x, tg.z); m.rotation.z = Math.sin(cena.t * 1.1) * 0.04;
  b.remo += (b.remoAlvo - b.remo) * Math.min(1, dt * 8); b.remos.forEach(r => r.rotation.x = Math.sin(b.remo) * 0.5);
  // tripulação: jogador rema no meio, Alisson na proa, Akelá na popa
  const yaw = m.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw);
  estado.pos.set(m.position.x + fx * 0.1, m.position.y + 0.25, m.position.z + fz * 0.1); estado.yaw = yaw; estado.vy = 0; estado.noChao = true; jogador.position.copy(estado.pos);
  const u = jogador.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = -1.3; u.bracoE.rotation.x = u.bracoD.rotation.x = -0.9 + Math.sin(b.remo) * 0.5;
  alisson.position.set(m.position.x + fx * 1.35, m.position.y + 0.25, m.position.z + fz * 1.35); alisson.rotation.y = yaw; const ua = alisson.userData; ua.pernaE.rotation.x = ua.pernaD.rotation.x = -1.3;
  const ak = akelaMesh(); ak.position.set(m.position.x - fx * 1.1, m.position.y + 0.25, m.position.z - fz * 1.1); ak.rotation.y = yaw; const uk = ak.userData; uk.pernaE.rotation.x = uk.pernaD.rotation.x = -1.3;
  if (b.prog >= 1 && !b.chegou) { b.chegou = true; fadeEl.style.opacity = 1; setTimeout(iniciaIate, 1300); }
}
function iniciaIate() {
  // todo mundo no trapiche do Iate Clube; o velejador apresenta os veleiros
  const desce = (m, x, y, rot) => { m.position.set(x, 0.45, -y); m.rotation.y = rot; const u = m.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; };
  estado.pos.set(320, 0.45, -176); estado.yaw = 1.2; jogador.position.copy(estado.pos); jogador.rotation.y = 1.2;
  desce(alisson, 321, 173, 1.0); desce(akelaMesh(), 319, 179, 1.4);
  if (!CAP2.velejador) { CAP2.velejador = npc(320, 184, 2.3, 'Velejador', '', { escala: 1.2, moletom: true, semChapeu: true, semBochecha: true, camisa: new THREE.MeshLambertMaterial({ color: 0xf4f4f4 }), calca: new THREE.MeshLambertMaterial({ color: 0x2c4a7a }), cabelo: new THREE.MeshLambertMaterial({ color: 0x777777 }) }); CAP2.velejador.position.y = 0.45; for (const i of interativos) if (i.npcMesh === CAP2.velejador) i.r = 0; }
  cena = { cap2: true, tipo: 'iate', t: 0, i: -1, carona: [{ mesh: alisson }, { mesh: akelaMesh() }, { mesh: CAP2.velejador }] };
  cena.falas = [
    'Velejador: "Bem-vindos ao Iate Clube, alcateia! Esses são os nossos veleiros. Quando o vento vem da lagoa, eles voam."',
    'Velejador: "Alisson, tá verdinho ainda? Remar na Lagoa dos Patos balança mesmo, hehe."',
    'Velejador: "Sabem a casinha do salva-vidas lá na Praia do Camping? De noite a luz dela fica acesa. É o farol dos pescadores: eles se guiam por ela pra voltar no escuro."',
    'Velejador: "Hoje à noite tem barco voltando. Se vocês ficarem na praia, vão ver."',
  ];
  cena.aoTerminar = () => { fadeEl.style.opacity = 1; setTimeout(iniciaNoiteCap2, 1300); };
  miniEl.style.display = 'none';
  camera.position.set(316, 3.2, -168); camera.lookAt(332, 1.2, -192);
  setTimeout(() => { fadeEl.style.opacity = 0; completa('c2_barco'); c2ProximaFala(); }, 300);
}
function iniciaNoiteCap2() {
  // de volta na praia; anoiteceu
  cena = null; c2Missao('c2_veleiros', 'Ver os veleiros do Iate Clube'); completa('c2_veleiros');
  for (const o of obstaculos) if (o.npc === alisson || o.npc === akelaMesh()) o.r = 0.5;
  estado.pos.set(98, altO(98, -22), 22); estado.yaw = Math.PI; jogador.position.copy(estado.pos);
  const ak = akelaMesh(); ak.position.set(94, altO(94, -21), 21); ak.rotation.y = 2.4; for (const o of obstaculos) if (o.npc === ak) { o.x = 94; o.z = 21; }
  for (const i of interativos) if (i.npcMesh === ak) { i.x = 94; i.z = 21; }
  alisson.position.set(101, altO(101, -20), 20); alisson.rotation.y = 3.4; for (const o of obstaculos) if (o.npc === alisson) { o.x = 101; o.z = 20; }
  for (const i of interativos) if (i.npcMesh === alisson) { i.x = 101; i.z = 20; }
  CAP2.barco.mesh.position.set(C2.barco[0], 0.1, -C2.barco[1]); CAP2.barco.mesh.rotation.set(0, 0, 0);
  ligaNoite(true); SOM.noite(false); SOM.noite(true, true); noite = false; CAP2.noite = true;
  lampiao.visible = true; luzPraia.intensity = 1.6;
  CAP2.fase = 'farol'; c2Missao('c2_farol', 'À noite: esperar na praia, perto da casinha do salva-vidas, e ver a luz');
  cam.yaw = Math.PI; cam.pitch = 0.2; camera.position.set(98, 3, 16);
  textoNoite.textContent = 'À noite, na Praia do Camping'; textoNoite.style.opacity = 1;
  setTimeout(() => { fadeEl.style.opacity = 0; }, 400);
  setTimeout(() => { textoNoite.style.opacity = 0; aviso('Akelá: "Olha a luz da casinha... e olha lá longe na lagoa! Uma lanterna vindo. Espera ele chegar."', 5000); }, 3200);
}
// ---------- A LENDA DO FAROL: o barco do pescador chega guiado pela luz ----------
function iniciaPescador() {
  const b = CAP2.barco;
  b.curva = new THREE.CatmullRomCurve3([[175, -135], [140, -95], [115, -55], [104, -36]].map(([x, y]) => new THREE.Vector3(x, 0.1, -y)));
  b.prog = 0; b.lampiao.visible = true; b.luz.intensity = 2.5;
  if (!CAP2.pescador) { CAP2.pescador = npc(105, -33, 0, 'Pescador', '', { escala: 1.2, moletom: true, semChapeu: true, semBochecha: true, camisa: new THREE.MeshLambertMaterial({ color: 0xd9a03a }), calca: new THREE.MeshLambertMaterial({ color: 0x3a4250 }), cabelo: new THREE.MeshLambertMaterial({ color: 0x2a2a2a }) }); for (const i of interativos) if (i.npcMesh === CAP2.pescador) i.r = 0; }
  CAP2.pescador.visible = true;
  cena = { cap2: true, tipo: 'pescador', t: 0, i: -1, carona: [{ mesh: alisson }, { mesh: akelaMesh() }, { mesh: CAP2.pescador }] };
  estado.yaw = 0; aviso('🔦 Um barco com lanterna vem da lagoa, guiado pela luz da casinha...', 4000);
}
function atualizaPescador(dt) {
  const b = CAP2.barco, m = b.mesh; cena.t += dt;
  if (!cena.falas) {
    b.prog = Math.min(1, b.prog + dt / 11);
    const p = b.curva.getPointAt(b.prog), tg = b.curva.getTangentAt(Math.min(0.999, b.prog));
    m.position.set(p.x, 0.1 + Math.sin(cena.t * 1.6) * 0.06, p.z); m.rotation.y = Math.atan2(tg.x, tg.z);
    b.remo += dt * 3; b.remos.forEach(r => r.rotation.x = Math.sin(b.remo) * 0.5);
    const pe = CAP2.pescador; pe.position.set(m.position.x, m.position.y + 0.25, m.position.z); pe.rotation.y = m.rotation.y; const u = pe.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = -1.3; u.bracoE.rotation.x = u.bracoD.rotation.x = -0.9 + Math.sin(b.remo) * 0.5;
    if (b.prog >= 1) {
      pe.position.set(102, altO(102, -30), 30); pe.rotation.y = 0.3; u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0;
      cena.falas = [
        'Pescador: "Boa noite, lobinhos! Viram? Sem a luz da casinha eu não achava a praia no escuro. Ela é o nosso farol."',
        'Pescador: "Na cidade contam que é uma luz assombrada... mas é só a lanterna do salva-vidas. Ele deixa acesa pra nós. Essa é a lenda do farol."',
        'Akelá: "Mistério resolvido, alcateia! A bandeira voltou, a cobra foi embora e o farol tem dono. Grande Uivo! AUUUUUU!"',
      ];
      cena.aoTerminar = () => {
        cena = null; completa('c2_farol'); CAP2.fase = 'fim'; SOM.uivo();
        setTimeout(() => { aviso('🏕️ FIM DO CAPÍTULO 2 — obrigado por jogar! A cobra, o gavião gigante, o Iate Clube e a lenda do farol. Até o próximo sábado! 🐺', 12000); SOM.fim(); mostraBotaoCap3(); }, 1500);
      };
      c2ProximaFala();
    }
  }
}

// ---------- atualização por frame e câmera das cenas ----------
function atualizaCenaCap2(dt) {
  if (cena.cap4) return atualizaCenaCap4(dt);
  if (cena.cap3) return atualizaCenaCap3(dt);
  if (cena.tipo === 'abre') {
    cena.t += dt;
    if (cena.t > 1.0) fadeEl.style.opacity = 0;
    if (cena.t > 3.6) { textoNoite.style.opacity = 0; }
    if (cena.t > 4.2) { cena = null; document.getElementById('hud').style.opacity = 1; if (CAP2.fase === 'abre') { CAP2.fase = 'akela'; aviso('Akelá: "' + PERSONAGENS[personagemId].nome + '! Vem cá, rápido!"', 3000); } }
  } else if (cena.tipo === 'gaviao') atualizaGaviao(dt);
  else if (cena.tipo === 'remar') atualizaRemar(dt);
  else if (cena.tipo === 'pescador') atualizaPescador(dt);
  else if (cena.tipo === 'iate') { cena.t += dt; estado.pos.y = 0.45; estado.vy = 0; estado.noChao = true; }
}
function cameraCap2() {
  if (cena.cap4) return cameraCap4();
  if (cena.cap3) return cameraCap3();
  if (cena.tipo === 'gaviao') {
    const gv = CAP2.gav, p = gv.mesh.position, atras = new THREE.Vector3(-Math.sin(gv.yaw) * 30, 16, -Math.cos(gv.yaw) * 30);
    camera.position.lerp(p.clone().add(atras), 0.12); camera.lookAt(p.x, p.y + 6, p.z);
  } else if (cena.tipo === 'remar') {
    const m = CAP2.barco.mesh, ry = m.rotation.y, atras = new THREE.Vector3(-Math.sin(ry) * 8, 3.5, -Math.cos(ry) * 8);
    camera.position.lerp(m.position.clone().add(atras), 0.1); camera.lookAt(m.position.x, 1, m.position.z);
  } else if (cena.tipo === 'iate') {
    camera.position.set(316 + Math.sin(cena.t * 0.2) * 1.5, 3.2, -168); camera.lookAt(332, 1.2, -192);
  } else if (cena.tipo === 'pescador') {
    const m = CAP2.barco.mesh; camera.position.lerp(new THREE.Vector3(96, 3.5, 12), 0.05); camera.lookAt(cena.falas ? CAP2.pescador.position.x : m.position.x, 1, cena.falas ? CAP2.pescador.position.z : m.position.z);
  }
}
function atualizaCap2(dt) {
  if (typeof atualizaCap4 === 'function') atualizaCap4(dt);
  if (typeof atualizaCap3 === 'function') atualizaCap3(dt);
  if (!CAP2 || !CAP2.ativo) return;
  atualizaCobra(dt);
  // interativos móveis do capítulo
  const iR = interativos.find(i => i.nome === 'Olhar o rastro'); const r = CAP2.rastros[CAP2.rastrosVistos]; if (iR) { if (r && CAP2.fase === 'rastro') { iR.x = r.position.x + Math.cos(r.rotation.y) * 2.5; iR.z = r.position.z - Math.sin(r.rotation.y) * 2.5; iR.r = 4; } else iR.r = 0; }
  const gp = CAP2.gav.mesh.position; for (const n of ['Construir o gavião', 'Entrar no gavião e pilotar']) { const i = interativos.find(x => x.nome === n); if (i) { i.x = gp.x; i.z = gp.z; } }
  const iB = interativos.find(i => i.nome === 'Pegar a bandeira'); if (iB) { iB.x = C2.cobra[0]; iB.z = -C2.cobra[1]; }
  const iBa = interativos.find(i => i.nome === 'Entrar no barco a remo'); if (iBa) { iBa.x = CAP2.barco.mesh.position.x; iBa.z = CAP2.barco.mesh.position.z; }
  const iP = interativos.find(i => i.nome === 'Esperar o barco dos pescadores'); if (iP) { iP.x = SALVA[0]; iP.z = -SALVA[1]; }
  // chegar perto da cobra pela primeira vez: ela assusta
  if (CAP2.fase === 'cobra' && !cena) {
    const d = Math.hypot(estado.pos.x - CAP2.cobra.mesh.position.x, estado.pos.z - CAP2.cobra.mesh.position.z);
    if (d < 7 && !CAP2.cobraVista) { CAP2.cobraVista = true; SOM.grr(); aviso('Cobra: "SSSSSSSS!"', 2500); aplicaEmote(jogador, 'surpreso', 3); }
    if (d < 7 && CAP2.cobraVista && !CAP2.cobraAviso && tempo > 0) { CAP2.cobraAviso = true; setTimeout(() => { aviso('😱 Uma cobra ENORME enrolada na bandeira! Ninguém consegue chegar perto. Melhor falar com a Akelá e o Chefe Diego.', 5000); completa('c2_cobra'); c2Missao('c2_diego', 'Falar com o Chefe Diego na portaria sobre a cobra'); }, 2600); }
  }
  // a bandeira voltou pra árvore → passeio
  if (CAP2.fase === 'bandeira' && CAP2.temBandeira) { const m = missoes.find(x => x.id === 'bandeira'); if (m && m.ok) { CAP2.fase = 'iate'; if (CAP2.cobra.bandChao) CAP2.cobra.bandChao.visible = false; c2Missao('c2_barco', 'Passeio: entrar no barco a remo na Praia do Camping (a Akelá e o Alisson vão junto)'); setTimeout(c2Akela, 3000); } }
  // noite do capítulo: lampião e lanterna (o resto da noite do cap. 1 fica desligado)
  if (CAP2.noite) {
    lampiao.position.set(luzPraia.position.x, altO(SALVA[0], SALVA[1]) + 3.4 + Math.sin(tempo * 2) * 0.1, luzPraia.position.z + Math.sin(tempo * 1.7) * 0.4); luzPraia.position.z = lampiao.position.z; luzPraia.intensity = 1.3 + Math.sin(tempo * 9) * 0.3;
    lanterna.position.set(estado.pos.x, estado.pos.y + 1.4, estado.pos.z); lanterna.target.position.set(estado.pos.x + Math.sin(estado.yaw) * 8, estado.pos.y + 0.5, estado.pos.z + Math.cos(estado.yaw) * 8);
    lua.position.set(estado.pos.x - 120, 90, estado.pos.z - 160);
  }
}

// debug: ?debug&cap2[=gaviao|bandeira|iate|farol]
if (DEBUG && qs.has('cap2')) try {
  iniciaCap2(); cena = null; fadeEl.style.opacity = 0; textoNoite.style.opacity = 0; document.getElementById('hud').style.opacity = 1; CAP2.fase = 'akela';
  const f = qs.get('cap2');
  if (f === 'gaviao') { CAP2.fase = 'pilotar'; CAP2.etapa = C2_ETAPAS.length; gaviaoEtapa(3); estado.pos.set(C2.canteiro[0] + 3, altO(C2.canteiro[0] + 3, C2.canteiro[1]), -C2.canteiro[1]); }
  if (f === 'obra') { CAP2.fase = 'gaviao'; CAP2.placaCanteiro.visible = true; estado.pos.set(C2.canteiro[0] + 3, altO(C2.canteiro[0] + 3, C2.canteiro[1]), -C2.canteiro[1]); }
  if (f === 'bandeira') { CAP2.fase = 'bandeira'; CAP2.cobra.fase = 'foge'; estado.pos.set(C2.cobra[0] + 4, altO(C2.cobra[0] + 4, C2.cobra[1]), -C2.cobra[1]); }
  if (f === 'iate') { CAP2.fase = 'iate'; estado.pos.set(100, altO(100, -26), 26); }
  if (f === 'save') { CAP2.continuar = 'bandeira'; retomaDepoisDaBandeira(); cena = null; }
  if (f === 'farol') { iniciaNoiteCap2(); }
  if (qs.get('pos')) { const [x, y] = qs.get('pos').split(',').map(Number); estado.pos.set(x, altO(x, y), -y); }
} catch (e) { dbg('ERRO cap2 debug: ' + e.message + ' ' + (e.stack || '').split('\n')[0]); }
