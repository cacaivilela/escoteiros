// ---------- EXTRAS: distintivos no uniforme, álbum de fotos e dicas pra quem está começando ----------
// Usa as globais de game.js (carregado antes). Tudo fica salvo no navegador (localStorage):
//   escoteiros.distintivos  { id: quando ganhou }
//   escoteiros.fotos        [{ img (jpeg em dataURL), onde, quando }]   — as 30 mais novas
//   escoteiros.dicas        { off, vistas: { id: true } }

function leLS(k, padrao) { try { return JSON.parse(localStorage.getItem(k) || 'null') || padrao; } catch (e) { return padrao; } }
function gravaLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

// ---------- distintivos ----------
const DISTINTIVOS = DADOS.distintivos;
const meusDist = leLS('escoteiros.distintivos', {});
let versaoDist = 0;   // muda a cada distintivo novo: o uniforme é recosturado
function ganhaDistintivo(id) {
  const d = DISTINTIVOS.find(x => x.id === id);
  if (!d || meusDist[id]) return false;
  meusDist[id] = Date.now(); gravaLS('escoteiros.distintivos', meusDist); versaoDist++;
  setTimeout(() => { aviso('🎖️ Distintivo novo: ' + d.em + ' ' + d.nome + '! Já está costurado na manga.', 4500); SOM.coleta(); }, 1200);   // depois do aviso do minijogo
  if (painelDist.style.display === 'block') desenhaDistintivos();
  return true;
}
// missões que dão distintivo (o motor avisa quando qualquer missão termina, em qualquer capítulo)
Missoes.ao('concluida', id => { if (emAtalho) return; for (const d of DISTINTIVOS) if (d.missao === id) ganhaDistintivo(d.id); });

// distintivo de pano: círculo com borda colorida e o emoji no meio
const texDist = {};
function texturaDist(d) {
  if (texDist[d.id]) return texDist[d.id];
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = d.cor; x.beginPath(); x.arc(32, 32, 31, 0, 6.3); x.fill();
  x.fillStyle = '#fbf5e3'; x.beginPath(); x.arc(32, 32, 24, 0, 6.3); x.fill();
  x.font = '30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(d.em, 32, 34);
  return texDist[d.id] = new THREE.CanvasTexture(c);
}
// costura até 6 distintivos nas mangas (3 em cada, virados pra fora); os mais antigos primeiro
function costuraDistintivos(m) {
  const u = m.userData; if (!u.bracoE) return;
  for (const p of u.distPatches || []) p.parent.remove(p);
  u.distPatches = [];
  const ganhos = DISTINTIVOS.filter(d => meusDist[d.id]).sort((a, b) => meusDist[a.id] - meusDist[b.id]).slice(0, 6);
  ganhos.forEach((d, i) => {
    const braco = i < 3 ? u.bracoD : u.bracoE, sx = i < 3 ? 1 : -1, a = ((i % 3) - 1) * 0.95;   // -0,95 / 0 / 0,95 rad em volta do braço
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.046, 18), new THREE.MeshBasicMaterial({ map: texturaDist(d), transparent: true }));
    p.position.set(sx * Math.cos(a) * 0.09, -0.05, Math.sin(a) * 0.09);
    p.rotation.y = sx > 0 ? Math.PI / 2 - a : -Math.PI / 2 + a;
    braco.add(p); u.distPatches.push(p);
  });
}
let costurado = null, costuradoV = -1;
if (DEBUG && /[?&]distintivos\b/.test(location.search)) for (const d of DISTINTIVOS) meusDist[d.id] = meusDist[d.id] || Date.now();   // teste: ?debug&distintivos costura todos (sem salvar)

// painel do menu: todos os distintivos (os que faltam ficam apagados, com o "como ganhar")
const painelDist = document.getElementById('painelDist');
function desenhaDistintivos() {
  const n = DISTINTIVOS.filter(d => meusDist[d.id]).length;
  painelDist.innerHTML = '<div class="tit">🎖️ ' + n + ' de ' + DISTINTIVOS.length + ' distintivos</div><div class="grade">' + DISTINTIVOS.map(d =>
    '<div class="dist' + (meusDist[d.id] ? '' : ' falta') + '" title="' + d.como + '"><span class="em" style="border-color:' + d.cor + '">' + d.em + '</span><b>' + d.nome + '</b><small>' +
    (meusDist[d.id] ? 'ganho em ' + new Date(meusDist[d.id]).toLocaleDateString('pt-BR') : d.como) + '</small></div>').join('') + '</div>';
}
document.getElementById('btnDistintivos').addEventListener('click', e => { e.stopPropagation(); const abre = painelDist.style.display !== 'block'; painelDist.style.display = abre ? 'block' : 'none'; if (abre) desenhaDistintivos(); });

// explorador: lugares diferentes por onde já passou (o nome que aparece no canto de baixo)
const lugaresVistos = leLS('escoteiros.lugares', {});
let ultimoLugar = '';
function contaLugar(nome) {
  if (nome === ultimoLugar) return; ultimoLugar = nome;
  if (!nome || nome === 'Camping Municipal' || lugaresVistos[nome] || !introFeita || cena) return;
  lugaresVistos[nome] = true; gravaLS('escoteiros.lugares', lugaresVistos);
  if (Object.keys(lugaresVistos).length >= 12) ganhaDistintivo('explorador');
}

// ---------- álbum de fotos ----------
const fotos = leLS('escoteiros.fotos', []);
const flashEl = document.getElementById('flash');
function tiraFoto() {
  if (!jogoIniciado && !DEBUG) return;
  renderTudo();   // desenha agora e lê na mesma hora: sem isso o canvas do WebGL já pode estar apagado
  const src = renderer.domElement, W = 480, H = 270, c = document.createElement('canvas'); c.width = W; c.height = H + 26;
  const x = c.getContext('2d'), k = Math.max(W / src.width, H / src.height), sw = W / k, sh = H / k;
  x.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, W, H);
  const onde = localEl.textContent.split(' | ')[0], quando = Date.now();
  x.fillStyle = '#fbf5e3'; x.fillRect(0, H, W, 26); x.fillStyle = '#5a3718'; x.font = 'bold 14px "Comic Neue", sans-serif'; x.textBaseline = 'middle';
  x.fillText('📷 ' + onde, 8, H + 13); x.textAlign = 'right'; x.fillText(new Date(quando).toLocaleDateString('pt-BR'), W - 8, H + 13);
  fotos.unshift({ img: c.toDataURL('image/jpeg', 0.8), onde, quando });
  while (fotos.length > 30) fotos.pop();
  while (!gravaLS('escoteiros.fotos', fotos) && fotos.length > 1) fotos.pop();   // navegador cheio: joga fora as mais velhas
  flashEl.style.transition = 'none'; flashEl.style.opacity = 0.85; requestAnimationFrame(() => { flashEl.style.transition = 'opacity .5s'; flashEl.style.opacity = 0; });
  SOM.tap(); aviso('📷 Foto guardada no Álbum (menu inicial)', 1800);
  if (fotos.length >= 5) ganhaDistintivo('fotografo');
  if (typeof phantom !== 'undefined' && phantom.mesh.visible && camera.position.distanceTo(phantom.mesh.position) < 12) {
    const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    if (fr.containsPoint(phantom.mesh.position)) ganhaDistintivo('fotoFantasma');
  }
  vistaDica('foto');
}
const painelAlbum = document.getElementById('painelAlbum');
function desenhaAlbum() {
  painelAlbum.innerHTML = fotos.length
    ? '<div class="tit">📷 ' + fotos.length + ' foto(s) — toque numa pra ver grande</div><div class="fotos">' + fotos.map((f, i) => '<img src="' + f.img + '" data-i="' + i + '" title="' + f.onde + '">').join('') + '</div>'
    : '<div class="tit">📷 Álbum vazio</div>Durante o jogo, aperte <b>P</b> (ou o botão 📷 no celular) pra tirar uma foto.';
  painelAlbum.querySelectorAll('img').forEach(im => im.addEventListener('click', e => { e.stopPropagation(); abreFoto(+im.dataset.i); }));
}
function abreFoto(i) {
  const f = fotos[i]; if (!f) return;
  const v = document.getElementById('fotoGrande');
  v.innerHTML = '<img src="' + f.img + '"><div><a download="escoteiros-' + new Date(f.quando).toISOString().slice(0, 10) + '-' + i + '.jpg" href="' + f.img + '">⬇ Baixar</a> <span class="apaga">🗑 Apagar</span> <span class="fecha">✖ Fechar</span></div>';
  v.style.display = 'flex';
  v.querySelector('.fecha').onclick = () => v.style.display = 'none';
  v.querySelector('.apaga').onclick = () => { fotos.splice(i, 1); gravaLS('escoteiros.fotos', fotos); v.style.display = 'none'; desenhaAlbum(); };
}
document.getElementById('fotoGrande').addEventListener('click', e => { e.stopPropagation(); if (e.target.id === 'fotoGrande') e.target.style.display = 'none'; });
document.getElementById('btnAlbum').addEventListener('click', e => { e.stopPropagation(); const abre = painelAlbum.style.display !== 'block'; painelAlbum.style.display = abre ? 'block' : 'none'; if (abre) desenhaAlbum(); });
addEventListener('keydown', e => { if (e.code === 'KeyP' && !e.repeat && !pausado() && !mini && inicio.style.display === 'none') tiraFoto(); });

// ---------- dicas (tutorial): aparecem uma vez, na hora em que a pessoa precisa ----------
const dicasSt = leLS('escoteiros.dicas', { off: false, vistas: {} });
const tutEl = document.getElementById('tutorial');
// o mesmo comando muda de nome no teclado, no controle e no celular
function modoEntrada() { return TOQUE.ativo ? 'toque' : (p1Pad !== null ? 'pad' : 'teclado'); }
const ROTULOS = {
  teclado: { mover: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> (ou as setas)', correr: '<kbd>Shift</kbd>', pular: '<kbd>Espaço</kbd>', camera: 'o <b>mouse</b> (a rodinha aproxima)', E: '<kbd>E</kbd>', Q: '<kbd>Q</kbd>', M: '<kbd>M</kbd>', P: '<kbd>P</kbd>', caras: '<kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd>' },
  pad: { mover: 'o <b>analógico esquerdo</b>', correr: '<kbd>RT</kbd>', pular: '<kbd>A</kbd>', camera: 'o <b>analógico direito</b>', E: '<kbd>X</kbd>', Q: '<kbd>LB</kbd>', M: '<kbd>Y</kbd>', P: '<kbd>R3</kbd> (apertar o analógico direito)', caras: 'o <b>D-pad</b>' },
  toque: { mover: 'o <b>joystick</b> (dedo no lado esquerdo da tela)', correr: '<kbd>🏃</kbd>', pular: '<kbd>⤒</kbd>', camera: '<b>arrastar o dedo</b> no lado direito', E: '<kbd>✋</kbd>', Q: '<kbd>⭐</kbd>', M: '<kbd>🗺️</kbd>', P: '<kbd>📷</kbd>', caras: '<kbd>😊</kbd>' },
};
// cada dica: quando aparece (quando), o texto e quando some (feita); a ordem importa: uma de cada vez
const DICAS = [
  { id: 'andar', quando: () => true, txt: r => 'Ande com ' + r.mover + '. Segure ' + r.correr + ' pra correr e ' + r.pular + ' pra pular.', feita: s => s.andou > 12 },
  { id: 'camera', quando: () => true, txt: r => 'Gire a câmera com ' + r.camera + '.', feita: s => s.girou > 1.2 || s.t > 10 },
  { id: 'interagir', quando: () => !!interativoProximo(), txt: r => 'Quando aparecer algo pra fazer perto de você, aperte ' + r.E + ': <b>' + ((interativoProximo() || {}).nome || '') + '</b>.', feita: s => s.e },
  { id: 'tarefas', quando: () => missoes.length > 0, txt: r => 'Suas tarefas ficam no caderno do canto de cima. A bandeirinha amarela no minimapa mostra pra onde ir; ' + r.M + ' abre o mapa grande.', feita: s => s.m || s.t > 12 },
  { id: 'habilidade', quando: s => s.jogando > 60 && !!HABILIDADES[personagemId], txt: r => 'Cada lobinho tem uma habilidade. A sua é <b>' + HABILIDADES[personagemId].nome + '</b>: aperte ' + r.Q + ' perto de uma árvore.', feita: s => s.q || s.t > 14 },
  { id: 'foto', quando: s => s.jogando > 120, txt: r => 'Achou um lugar bonito? ' + r.P + ' tira uma foto. Elas ficam no <b>📷 Álbum</b> do menu inicial.', feita: s => s.t > 12 },
  { id: 'caras', quando: s => s.jogando > 180, txt: r => r.caras + ' fazem caras: feliz, bravo, triste e surpreso.', feita: s => s.t > 10 },
];
const sDica = { t: 0, jogando: 0, andou: 0, girou: 0, e: false, m: false, q: false, ultPos: null, ultYaw: 0 };
let dicaAtual = null;
function vistaDica(id) { if (dicasSt.vistas[id]) return; dicasSt.vistas[id] = true; gravaLS('escoteiros.dicas', dicasSt); if (dicaAtual && dicaAtual.id === id) { dicaAtual = null; tutEl.style.opacity = 0; } }
addEventListener('keydown', e => { if (e.code === 'KeyE') sDica.e = true; if (e.code === 'KeyM') sDica.m = true; if (e.code === 'KeyQ') sDica.q = true; }, true);
function atualizaDicas(dt) {
  const jogando = (jogoIniciado || DEBUG) && introFeita && !cena && !mini && !pausado() && inicio.style.display === 'none';
  if (dicasSt.off || !jogando) { tutEl.style.opacity = 0; return; }
  sDica.jogando += dt;
  if (sDica.ultPos) sDica.andou += Math.hypot(estado.pos.x - sDica.ultPos.x, estado.pos.z - sDica.ultPos.z);
  sDica.ultPos = { x: estado.pos.x, z: estado.pos.z };
  sDica.girou += Math.abs(cam.yaw - sDica.ultYaw); sDica.ultYaw = cam.yaw;
  if (padJ1) { if (padJ1.interagir) sDica.e = true; if (padJ1.mapa) sDica.m = true; if (padJ1.habilidade) sDica.q = true; }
  if (!dicaAtual) {
    dicaAtual = DICAS.find(d => !dicasSt.vistas[d.id]) || null;
    if (!dicaAtual) return;
    sDica.t = 0; sDica.e = sDica.m = sDica.q = false; if (dicaAtual.id === 'andar') sDica.andou = 0; if (dicaAtual.id === 'camera') sDica.girou = 0;
  }
  if (!dicaAtual.quando(sDica)) { tutEl.style.opacity = 0; return; }
  sDica.t += dt;
  const html = '<b class="tt">🎓 Dica</b> ' + dicaAtual.txt(ROTULOS[modoEntrada()]);
  if (tutEl.dataset.html !== html) { tutEl.innerHTML = html; tutEl.dataset.html = html; }
  tutEl.style.opacity = 1;
  if (dicaAtual.feita(sDica)) { const id = dicaAtual.id; setTimeout(() => vistaDica(id), 600); dicaAtual = Object.assign({}, dicaAtual, { feita: () => false }); }
}
// botão do menu: liga/desliga e "ver de novo"
const btnDicas = document.getElementById('btnDicas');
function desenhaBtnDicas() { btnDicas.innerHTML = '🎓 Dicas pra quem está começando: <b>' + (dicasSt.off ? 'desligadas' : 'ligadas') + '</b> · <u class="rever">ver de novo</u>'; }
btnDicas.addEventListener('click', e => {
  e.stopPropagation();
  if (e.target.classList.contains('rever')) { dicasSt.vistas = {}; dicasSt.off = false; dicaAtual = null; aviso('🎓 As dicas vão aparecer de novo', 1800); }
  else dicasSt.off = !dicasSt.off;
  gravaLS('escoteiros.dicas', dicasSt); desenhaBtnDicas();
});
desenhaBtnDicas();

// ---------- a cada quadro (chamado no fim do animar() de game.js) ----------
function atualizaExtras(dt) {
  if (costurado !== jogador || costuradoV !== versaoDist) { costuraDistintivos(jogador); costurado = jogador; costuradoV = versaoDist; }
  contaLugar(localEl.textContent.split(' | ')[0]);
  atualizaDicas(dt);
  // controle: apertar o analógico direito (R3) tira foto
  if (padJ1 && padJ1.foto && !mini && !pausado()) tiraFoto();   // R3 no controle padrão
}

// ---------- progresso salvo (escoteiros.save) e o botão "Continuar" do menu ----------
// Capítulo 1 (o dia): salva o estado inteiro do motor de missões + onde o jogador está, a cada tarefa nova/concluída
// e de 20 em 20 s. A noite e o dia 2 ainda não usam o motor: continuar volta pro fim do dia, com tudo feito.
// Capítulos 2 e 3: as cenas dependem da fase da história, então o save guarda o último PONTO DE RETOMAR que o jogo já sabe
// montar (cap2.js retomaDepoisDaBandeira, cap3.js retomaCap3Noite), ou o começo do capítulo.
// O cap. 4 não tem "Continuar" : começa sempre pelo menu (o ?continuar=pedra do debug segue funcionando).
// Formato: { versao: 2, cap, ponto, personagem, quando, tarefa, missoes?: Missoes.exporta(), pos?: [x, y, yaw] }
const PONTOS = { c2_barco: [2, 'bandeira'], c3_grito: [3, 'noite'] };   // missão que fica ativa → ponto de retomar
const NOMES_CAP = { 1: 'O acampamento', 2: 'Uma semana depois', 3: 'Mais um sábado' };   // sem o 4: save do cap. 4 (de versão antiga) não mostra o botão
let continuarCap1 = null;   // save do cap. 1 esperando o jogo começar
function salvaProgresso(o) {
  if (DEBUG && !/[?&]salvar\b/.test(location.search)) return;   // testes no ?debug não apagam o save de verdade (?debug&salvar grava)
  const tarefa = (Missoes.ativas().map(id => Missoes.texto(id))[0] || '').replace(/\s*\(.*$/, '');
  gravaLS('escoteiros.save', Object.assign({ versao: 2, ponto: null, personagem: personagemId, quando: Date.now(), tarefa }, o));
  mostraContinuar();
}
const cap1Dia = () => capAtual() === 1 && introFeita && !noite && !dia2 && !noite2 && !(cena && cena.intro);
function salvaCap1() { if (cap1Dia() && Missoes.existe('chefe')) salvaProgresso({ cap: 1, missoes: Missoes.exporta(), pos: [+estado.pos.x.toFixed(1), +(-estado.pos.z).toFixed(1), +estado.yaw.toFixed(2)] }); }
Missoes.ao('ativa', id => { if (emAtalho) return; if (PONTOS[id]) salvaProgresso({ cap: PONTOS[id][0], ponto: PONTOS[id][1] }); else salvaCap1(); });
Missoes.ao('concluida', () => { if (!emAtalho) salvaCap1(); });
setInterval(() => { if (jogoIniciado && !pausado() && !mini && !cena) salvaCap1(); }, 20000);
// começo de capítulo e fim de capítulo (o botão "▶ Capítulo N" aparece) também salvam
for (const [n, nome] of [[2, 'iniciaCap2'], [3, 'iniciaCap3']]) {
  const orig = globalThis[nome]; if (typeof orig !== 'function') continue;
  globalThis[nome] = function () { const r = orig.apply(this, arguments); const c = { 2: CAP2, 3: typeof CAP3 !== 'undefined' && CAP3 }[n]; if (!(c && c.continuar)) salvaProgresso({ cap: n }); return r; };
}
for (const [n, nome] of [[2, 'mostraBotaoCap2'], [3, 'mostraBotaoCap3']]) {
  const orig = globalThis[nome]; if (typeof orig !== 'function') continue;
  globalThis[nome] = function () { salvaProgresso({ cap: n, tarefa: '' }); return orig.apply(this, arguments); };
}

// cap. 1: em vez da chegada na Trailblazer, volta pro ponto salvo (mesmo caminho do ?debug, que pula a intro)
const iniciaIntroOrig = iniciaIntro;
iniciaIntro = function () {
  const s = continuarCap1; continuarCap1 = null;
  if (!s) return iniciaIntroOrig();
  introFeita = true; document.getElementById('hud').style.opacity = 1;
  missoesSemAviso(() => {
    const probs = Missoes.importa(s.missoes || {});
    if (probs.length) { Missoes.carrega(DADOS.cap1Missoes); Missoes.da('chefe'); }   // save velho/quebrado: começa o dia do zero
  });
  // o que as missões feitas deixaram no mundo (igual ao atalhoMissoes)
  if (Missoes.concluida('pederneira')) { estado.temPederneira = true; Missoes.meta('lenha', 3); }
  if (Missoes.concluida('bandeira')) bandeiraAlvo = bandeiraAlt = 5.4;
  if (Missoes.concluida('fogueira')) sede.chamas.visible = true;
  if (Missoes.ativa('lenha')) espalhaLenha(20);
  if (Missoes.ativa('phantom') || Missoes.concluida('phantom')) { mostraCachorros(); alissonFalou = true; }
  if (Missoes.concluida('phantom')) { phantom.estagio = 4; VARS_DIALOGO.fantasma = 4; }
  if (s.pos) { const [x, y, yaw] = s.pos; estado.pos.set(x, altO(x, y), -y); estado.yaw = yaw || 0; jogador.position.copy(estado.pos); cam.yaw = estado.yaw; }
  setTimeout(() => aviso('💾 Continuando de onde você parou' + (s.tarefa ? ': ' + s.tarefa : ''), 4000), 600);
};

// botão "Continuar" no menu
const btnCont = document.getElementById('btnContinuar');
function mostraContinuar() {
  const s = leLS('escoteiros.save', null);
  if (!s || !s.cap || !NOMES_CAP[s.cap]) { btnCont.style.display = 'none'; return; }
  const quem = PERSONAGENS[s.personagem] ? PERSONAGENS[s.personagem].nome : '';
  btnCont.innerHTML = '▶ Continuar — Capítulo ' + s.cap + ': ' + NOMES_CAP[s.cap] + '<small>' + [quem, s.tarefa, s.quando && new Date(s.quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })].filter(Boolean).join(' · ') + '</small>';
  btnCont.style.display = 'block';
}
btnCont.addEventListener('click', e => {
  e.stopPropagation();
  const s = leLS('escoteiros.save', null); if (!s) return;
  if (PERSONAGENS[s.personagem] && s.personagem !== personagemId) escolhePersonagem(s.personagem);
  capituloEscolhido = s.cap;
  document.querySelectorAll('#inicio .cap').forEach(x => x.classList.toggle('sel', +x.dataset.cap === s.cap));
  CAP2.continuar = s.cap === 2 ? s.ponto : null;
  if (typeof CAP3 !== 'undefined') CAP3.continuar = s.cap === 3 ? s.ponto : null;
  if (typeof CAP4 !== 'undefined') CAP4.continuar = null;
  continuarCap1 = s.cap === 1 ? s : null;
  travar();
});
mostraContinuar();
if (DEBUG && /[?&]salvar\b/.test(location.search)) salvaCap1();   // teste: ?debug&salvar&missao=…&pos=… grava o save na hora

// ---------- menu: um painel aberto por vez (o menu crescia até o botão de começar sumir lá embaixo) ----------
const PAINEIS_MENU = { btnPersonalizar: 'personalizar', btnMods: 'mods', btnDistintivos: 'painelDist', btnAlbum: 'painelAlbum', btnControles: 'painelControles' };
document.getElementById('btnControles').addEventListener('click', e => { e.stopPropagation(); const p = document.getElementById('painelControles'); p.style.display = p.style.display === 'block' ? 'none' : 'block'; });
document.querySelector('#inicio .linhaBtns').addEventListener('click', e => {
  const b = e.target.closest('.btn2'); if (!b || !PAINEIS_MENU[b.id]) return;
  for (const [id, pid] of Object.entries(PAINEIS_MENU)) if (id !== b.id) document.getElementById(pid).style.display = 'none';   // antes do botão abrir o dele
  setTimeout(marcaPainelAberto);
}, true);
// fundo escuro + ✖ enquanto um painel está aberto; clicar fora, no ✖ ou Esc fecha
function marcaPainelAberto() {
  let algum = false;
  for (const [id, pid] of Object.entries(PAINEIS_MENU)) { const ab = document.getElementById(pid).style.display === 'block'; document.getElementById(id).classList.toggle('aberto', ab); algum = algum || ab; }
  document.getElementById('fundoPainel').style.display = document.getElementById('fechaPainel').style.display = algum ? 'block' : 'none';
}
function fechaPaineisMenu() { for (const pid of Object.values(PAINEIS_MENU)) document.getElementById(pid).style.display = 'none'; marcaPainelAberto(); }
for (const id of ['fundoPainel', 'fechaPainel']) document.getElementById(id).addEventListener('click', e => { e.stopPropagation(); fechaPaineisMenu(); });
addEventListener('keydown', e => { if (e.code === 'Escape' && document.getElementById('fundoPainel').style.display === 'block') fechaPaineisMenu(); });

// ---------- menu com o controle (TV + Recalbox, sem mouse): destaque amarelo que anda com ◀▶▲▼, A clica, B fecha painel, Start começa ----------
let focoMenu = null;
function itensMenu() {
  return [...inicio.querySelectorAll('.perso, #btnContinuar, .cap, .btn:not(#btnContinuar), .linhaBtns .btn2, .mg')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().width > 0);
}
function focaMenu(el) {
  if (focoMenu) focoMenu.classList.remove('foco');
  focoMenu = el; if (!el) return;
  el.classList.add('foco'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
// anda pro item mais perto naquela direção (o que está mais "na reta" ganha)
function moveFoco(dx, dy) {
  const itens = itensMenu(); if (!itens.length) return;
  if (!focoMenu || !itens.includes(focoMenu)) return focaMenu(inicio.querySelector('.btn:not(#btnContinuar)') || itens[0]);
  const r0 = focoMenu.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
  let melhor = null, nota = 1e9;
  for (const e of itens) {
    if (e === focoMenu) continue;
    const r = e.getBoundingClientRect(), vx = r.left + r.width / 2 - x0, vy = r.top + r.height / 2 - y0;
    const frente = vx * dx + vy * dy, lado = Math.abs(vx * dy - vy * dx);
    if (frente <= 4) continue;
    const n = frente + lado * 2.5; if (n < nota) { nota = n; melhor = e; }
  }
  if (melhor) focaMenu(melhor);
}
function menuControle(inp) {
  const painelAberto = document.getElementById('fundoPainel').style.display === 'block' || document.getElementById('fotoGrande').style.display === 'flex';
  if (inp.b || inp.voltar) { document.getElementById('fotoGrande').style.display = 'none'; fechaPaineisMenu(); return; }
  if (painelAberto) return;   // dentro dos painéis (Mods, Personalizar…) ainda é com o mouse; B fecha
  if (inp.esq) moveFoco(-1, 0); if (inp.dir) moveFoco(1, 0); if (inp.cima) moveFoco(0, -1); if (inp.baixo) moveFoco(0, 1);
  if (inp.start) { focaMenu(null); comecaPeloControle(); return; }
  if (inp.a) { if (!focoMenu) return moveFoco(0, 0); const el = focoMenu; if (el.matches('.btn, .mg')) focaMenu(null); comecaPeloControle(el); }
}
// "Configurar os controles de novo" (painel ❓ Controles): esquece os botões dos controles genéricos; na próxima apertada o jogo pergunta de novo
document.getElementById('resetaPads').addEventListener('click', e => { e.stopPropagation(); padsMapas = {}; try { localStorage.removeItem('escoteiros.controles'); } catch (er) {} const gps = navigator.getGamepads ? navigator.getGamepads() : []; if (p1Pad !== null && gps[p1Pad] && gps[p1Pad].mapping !== 'standard') p1Pad = null; for (const j of jogadores.slice()) if (gps[j.pad] && gps[j.pad].mapping !== 'standard') removeJogador(j); aviso('🎮 Pronto: aperte um botão no controle pra configurar de novo', 3500); });
