// ---------- ONLINE: amigos em outros computadores no mesmo camping ----------
// Quem cria a sala vira o "anfitrião"; os outros entram com o código (LOBO-7K2). Os computadores se ligam direto (WebRTC);
// o PeerJS (servidor gratuito 0.peerjs.com) só serve pra eles se acharem. O anfitrião repassa as mensagens de um pra todos.
// Não tem lista pública de salas: só entra quem recebeu o código. Também não tem bate-papo digitado (o jogo é pra crianças):
// só frases prontas (tecla T) e as caretas de sempre.
// Cada um continua com a própria história e tarefas; o que viaja é: quem é (personagem + personalização), onde está,
// pra onde olha, se está andando, a careta e as frases.
//
// Mensagens (JSON): { t: 'oi', nome, id, perso } · { t: 'pos', p: [x, y, z], yaw, mv, em, esc } · { t: 'frase', i } · { t: 'tchau' }
//                   o anfitrião acrescenta "de" (quem mandou) e manda { t: 'lista', jogadores: [...] } pra quem acabou de entrar.

const ONLINE = { peer: null, anfitriao: false, codigo: null, conexoes: new Map(), hostConn: null, remotos: new Map(), max: 6 };
const FRASES = ['Oi! 👋', 'Vem cá!', 'Bora pra bandeira! 🚩', 'Olha isso! 👀', 'Valeu! 💛', 'Espera aí!', 'Tchau! 👋'];
const PREFIXO_SALA = 'escoteiros-garibaldi-';

function carregaPeer() {
  if (window.Peer) return Promise.resolve();
  return new Promise((ok, falha) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'; s.onload = ok; s.onerror = () => falha(new Error('sem internet')); document.head.appendChild(s); });
}
function novoCodigo() { const L = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 3; i++) c += L[Math.floor(Math.random() * L.length)]; return 'LOBO-' + c; }
const limpaCodigo = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LOBO/, '').slice(0, 3);
const meuOi = () => ({ t: 'oi', nome: PERSONAGENS[personagemId].nome, id: personagemId, perso: personalizacao[personagemId] });

// ---- criar / entrar / sair ----
async function criaSala(tentativa = 0) {
  saiDaSala(true); statusOnline('Criando a sala…');
  try { await carregaPeer(); } catch (e) { return statusOnline('❌ Sem internet: não deu pra criar a sala.'); }
  const codigo = novoCodigo(), peer = new Peer(PREFIXO_SALA + codigo);
  Object.assign(ONLINE, { peer, anfitriao: true, codigo });
  peer.on('open', () => { statusOnline(); aviso('🌐 Sala ' + codigo + ' criada! Passe o código pros amigos.', 4000); });
  peer.on('connection', c => {
    if (ONLINE.conexoes.size >= ONLINE.max - 1) { c.on('open', () => { c.send({ t: 'cheia' }); setTimeout(() => c.close(), 500); }); return; }
    c.on('open', () => {
      ONLINE.conexoes.set(c.peer, c);
      // quem chegou recebe: eu (anfitrião) e todo mundo que já estava
      const lista = [Object.assign(meuOi(), { de: peer.id })];
      for (const [id, r] of ONLINE.remotos) lista.push(Object.assign({}, r.oi, { de: id }));
      c.send({ t: 'lista', jogadores: lista });
    });
    c.on('data', m => { if (!m || typeof m !== 'object') return; m.de = c.peer; recebe(m); repassa(m, c.peer); });
    c.on('close', () => { ONLINE.conexoes.delete(c.peer); recebe({ t: 'tchau', de: c.peer }); repassa({ t: 'tchau', de: c.peer }, c.peer); });
  });
  peer.on('error', e => {
    if (e.type === 'unavailable-id' && tentativa < 5) return criaSala(tentativa + 1);   // código já usado por outra sala: sorteia outro
    statusOnline('❌ Erro: ' + (e.type || e.message));
  });
}
async function entraNaSala(codigoDigitado) {
  const c3 = limpaCodigo(codigoDigitado); if (c3.length !== 3) return statusOnline('Digite o código da sala (ex.: LOBO-7K2).');
  saiDaSala(true); statusOnline('Procurando a sala LOBO-' + c3 + '…');
  try { await carregaPeer(); } catch (e) { return statusOnline('❌ Sem internet: não deu pra entrar.'); }
  const peer = new Peer();
  Object.assign(ONLINE, { peer, anfitriao: false, codigo: 'LOBO-' + c3 });
  peer.on('open', () => {
    const c = peer.connect(PREFIXO_SALA + 'LOBO-' + c3, { serialization: 'json' });
    ONLINE.hostConn = c;
    c.on('open', () => { c.send(meuOi()); statusOnline(); aviso('🌐 Você entrou na sala ' + ONLINE.codigo + '!', 3500); SOM.entrou(); });
    c.on('data', m => {
      if (!m || typeof m !== 'object') return;
      if (m.t === 'cheia') { statusOnline('❌ A sala está cheia (' + ONLINE.max + ' jogadores).'); return saiDaSala(true); }
      if (m.t === 'lista') { for (const j of m.jogadores) recebe(j); return; }
      if (!m.de) m.de = c.peer; recebe(m);
    });
    c.on('close', () => { if (ONLINE.hostConn === c) { aviso('🌐 A sala fechou (o anfitrião saiu).', 4000); saiDaSala(true); statusOnline('A sala fechou.'); } });
  });
  peer.on('error', e => { statusOnline(e.type === 'peer-unavailable' ? '❌ Não achei a sala ' + ONLINE.codigo + '. Confere o código?' : '❌ Erro: ' + (e.type || e.message)); saiDaSala(true); });
}
function saiDaSala(quieto) {
  try { manda({ t: 'tchau' }); } catch (e) {}
  for (const id of [...ONLINE.remotos.keys()]) tiraRemoto(id);
  if (ONLINE.peer) { const p = ONLINE.peer; setTimeout(() => { try { p.destroy(); } catch (e) {} }, 200); }
  Object.assign(ONLINE, { peer: null, anfitriao: false, codigo: null, hostConn: null }); ONLINE.conexoes.clear();
  if (!quieto) statusOnline();
  atualizaHudOnline();
}
const naSala = () => !!(ONLINE.peer && (ONLINE.anfitriao ? ONLINE.peer.open : ONLINE.hostConn && ONLINE.hostConn.open));

// ---- mensagens ----
function manda(m) {
  if (ONLINE.anfitriao) { m.de = ONLINE.peer && ONLINE.peer.id; for (const c of ONLINE.conexoes.values()) if (c.open) c.send(m); }
  else if (ONLINE.hostConn && ONLINE.hostConn.open) ONLINE.hostConn.send(m);
}
function repassa(m, menos) { for (const [id, c] of ONLINE.conexoes) if (id !== menos && c.open) c.send(m); }
function recebe(m) {
  if (!m.de || (ONLINE.peer && m.de === ONLINE.peer.id)) return;
  if (m.t === 'oi') return criaRemoto(m.de, m);
  const r = ONLINE.remotos.get(m.de); if (!r) return;
  if (m.t === 'pos' && Array.isArray(m.p)) { r.alvo.set(+m.p[0] || 0, +m.p[1] || 0, +m.p[2] || 0); r.yawAlvo = +m.yaw || 0; r.mv = +m.mv || 0; r.esc = Array.isArray(m.esc) ? m.esc.map(Number) : [1, 1, 1]; if (m.em && m.em !== r.em) { r.em = m.em; aplicaEmote(r.mesh, m.em, 0); } if (!r.visto) { r.visto = true; r.mesh.position.copy(r.alvo); } }
  if (m.t === 'frase' && FRASES[m.i]) aviso(r.mesh.userData.nome + ': "' + FRASES[m.i] + '"', 3500);
  if (m.t === 'tchau') { aviso('🌐 ' + r.mesh.userData.nome.replace(' 🌐', '') + ' saiu da sala', 2500); tiraRemoto(m.de); }
}

// ---- bonecos dos amigos ----
function optsDeOutro(id, perso) {
  if (!PERSONAGENS[id]) id = 'lara';
  const meu = personalizacao[id]; personalizacao[id] = Object.assign(padraoPerso(id), perso || {});
  try { return optsPersonagem(id); } finally { personalizacao[id] = meu; }
}
function etiqueta(texto, cor) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.roundRect ? x.roundRect(4, 8, 248, 48, 20) : x.rect(4, 8, 248, 48); x.fill();
  x.fillStyle = cor; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, 128, 33);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  s.scale.set(1.6, 0.4, 1); s.position.y = 2.45; s.renderOrder = 10; return s;
}
const CORES_ONLINE = ['#7ee0ff', '#ff8a5c', '#c59bff', '#8be78b', '#ffd54a'];
function criaRemoto(de, oi) {
  if (ONLINE.remotos.has(de)) tiraRemoto(de, true);
  const id = PERSONAGENS[oi.id] ? oi.id : 'lara', cor = CORES_ONLINE[ONLINE.remotos.size % CORES_ONLINE.length];
  const mesh = escoteiro(optsDeOutro(id, oi.perso));
  const nome = String(oi.nome || PERSONAGENS[id].nome).slice(0, 16);
  mesh.userData.nome = nome + ' 🌐';
  mesh.add(etiqueta('🌐 ' + nome, cor));
  mesh.position.copy(estado.pos); mesh.visible = true; scene.add(mesh);
  ONLINE.remotos.set(de, { mesh, oi: { t: 'oi', nome, id, perso: oi.perso }, alvo: mesh.position.clone(), yawAlvo: 0, mv: 0, fase: 0, esc: [1, 1, 1], em: 'feliz', cor, visto: false });
  if (!oi.silencioso) { aviso('🌐 ' + nome + ' entrou na sala!', 3000); SOM.entrou(); }
  atualizaHudOnline(); if (painelOnline.style.display === 'block') statusOnline();
}
function tiraRemoto(de) {
  const r = ONLINE.remotos.get(de); if (!r) return;
  scene.remove(r.mesh); const i = bonecos.indexOf(r.mesh); if (i >= 0) bonecos.splice(i, 1);
  ONLINE.remotos.delete(de); atualizaHudOnline(); if (painelOnline.style.display === 'block') statusOnline();
}

// ---- a cada quadro: anda os amigos suave até onde eles estão; 10 vezes por segundo manda onde eu estou ----
let ultimoEnvio = 0;
function atualizaOnline(dt) {
  for (const r of ONLINE.remotos.values()) {
    const m = r.mesh, k = Math.min(1, dt * 10);
    m.position.lerp(r.alvo, k);
    let d = r.yawAlvo - m.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); m.rotation.y += d * k;
    m.scale.set(r.esc[0] || 1, r.esc[1] || 1, r.esc[2] || 1);
    r.fase += r.mv * dt; const sw = Math.sin(r.fase) * (r.mv > 1 ? 0.6 : 0), u = m.userData;
    u.pernaE.rotation.x = sw; u.pernaD.rotation.x = -sw; u.bracoE.rotation.x = -sw; u.bracoD.rotation.x = sw;
  }
  if (!naSala() || performance.now() - ultimoEnvio < 100) return;
  ultimoEnvio = performance.now();
  const p = jogador.position, s = jogador.scale;
  manda({ t: 'pos', p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], yaw: +estado.yaw.toFixed(2), mv: +(estado.velAnim || 0).toFixed(1), em: jogador.userData.emote, esc: [+s.x.toFixed(2), +s.y.toFixed(2), +s.z.toFixed(2)] });
}
// amigos no minimapa (bolinha da cor da etiqueta)
function onlineMinimapa() { for (const r of ONLINE.remotos.values()) { const [a, b] = mmTx(r.mesh.position.x, -r.mesh.position.z); mctx.fillStyle = r.cor; mctx.strokeStyle = '#000'; mctx.beginPath(); mctx.arc(a, b, 3.5, 0, 6.3); mctx.fill(); mctx.stroke(); } }

// ---- frases prontas: T abre a lista, 1-7 manda ----
const frasesEl = document.getElementById('frasesOnline');
function mandaFrase(i) { manda({ t: 'frase', i }); aviso(PERSONAGENS[personagemId].nome + ': "' + FRASES[i] + '"', 3000); mostraFrases(false); }
function mostraFrases(on) {
  frasesEl.style.display = on ? 'block' : 'none'; if (!on) return;
  frasesEl.innerHTML = '<b>💬 Frases</b> ' + (TOQUE.ativo ? '(toque numa)' : '(aperte o número)') + '<br>' + FRASES.map((f, i) => '<div class="fr" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd> ' + f + '</div>').join('') + '<small>' + (TOQUE.ativo ? '💬 fecha' : 'T ou Esc fecha') + '</small>';
  frasesEl.querySelectorAll('.fr').forEach(el => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); mandaFrase(+el.dataset.i); }));
}
addEventListener('keydown', e => {
  if (!naSala() || inicio.style.display !== 'none' || mini) return;
  const aberto = frasesEl.style.display === 'block';
  if (e.code === 'KeyT' && !e.repeat) { mostraFrases(!aberto); e.stopImmediatePropagation(); return; }
  if (!aberto) return;
  const n = /^Digit([1-7])$/.exec(e.code);
  if (n) mandaFrase(+n[1] - 1);
  if (e.code === 'Escape') mostraFrases(false);
  e.stopImmediatePropagation();   // com a lista aberta, 1-4 não fazem careta
}, true);

// ---- painel do menu e etiqueta no HUD ----
const painelOnline = document.getElementById('painelOnline'), hudOnline = document.getElementById('hudOnline');
function statusOnline(msg) {
  const n = ONLINE.remotos.size + 1;
  let h = '<div class="tit">🌐 Jogar online</div>';
  if (naSala()) {
    h += '<div class="codigo">' + ONLINE.codigo + '</div>' + (ONLINE.anfitriao ? '<p>Passe esse código pros seus amigos. Eles abrem o jogo, vão em 🌐 Jogar online e digitam o código.</p>' : '<p>Você está na sala.</p>') +
      '<p>👥 ' + n + ' na sala: <b>' + PERSONAGENS[personagemId].nome + ' (você)</b>' + [...ONLINE.remotos.values()].map(r => ' · <span style="color:' + r.cor + '">' + r.oi.nome + '</span>').join('') + '</p>' +
      '<button id="olSai" class="sec">Sair da sala</button> <small>Feche este painel e clique em começar: os amigos aparecem no camping.</small>';
  } else {
    h += '<p>Jogue no mesmo camping com amigos em outros computadores ou celulares. Cada um faz as suas tarefas; vocês se veem andando, pulando, fazendo caretas e mandando frases (tecla <b>T</b> ou o botão 💬 no celular).</p>' +
      '<p><button id="olCria">🏕️ Criar uma sala</button> &nbsp; ou &nbsp; <input id="olCodigo" placeholder="LOBO-7K2" maxlength="8" size="9"> <button id="olEntra">Entrar</button></p>' +
      '<small>Só entra quem tiver o código. Não tem bate-papo: só frases prontas e caretas. Até ' + ONLINE.max + ' jogadores. Precisa de internet.</small>';
  }
  if (msg) h += '<p class="msg">' + msg + '</p>';
  painelOnline.innerHTML = h;
  const $ = id => painelOnline.querySelector('#' + id);
  if ($('olCria')) $('olCria').onclick = e => { e.stopPropagation(); criaSala(); };
  if ($('olEntra')) $('olEntra').onclick = e => { e.stopPropagation(); entraNaSala($('olCodigo').value); };
  if ($('olCodigo')) { $('olCodigo').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') entraNaSala(e.target.value); }; $('olCodigo').onclick = e => e.stopPropagation(); }
  if ($('olSai')) $('olSai').onclick = e => { e.stopPropagation(); saiDaSala(); aviso('🌐 Você saiu da sala', 2000); };
  atualizaHudOnline();
}
function atualizaHudOnline() {
  const on = naSala();
  hudOnline.style.display = on ? 'block' : 'none';
  if (on) hudOnline.textContent = '🌐 ' + ONLINE.codigo + ' · ' + (ONLINE.remotos.size + 1) + ' na sala · T = frases';
}
document.getElementById('btnOnline').addEventListener('click', e => { e.stopPropagation(); const abre = painelOnline.style.display !== 'block'; painelOnline.style.display = abre ? 'block' : 'none'; if (abre) statusOnline(); });
PAINEIS_MENU.btnOnline = 'painelOnline';
addEventListener('beforeunload', () => { if (naSala()) manda({ t: 'tchau' }); });
statusOnline();
