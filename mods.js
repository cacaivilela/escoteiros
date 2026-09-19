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
  { id: 'duduAura', nome: 'Dudu Aura 67', emoji: '✨', perso: 'dudu', desc: 'Óculos quadrados, dourado e aura ligada.', valores: { oculosEstilo: 'quadrado', corOculos: '#ffd54a', corCamisa: '#ffd54a', corShort: '#222222', corTenis: '#ffd54a', aura: true } },
  { id: 'mariaRosa', nome: 'Maria Rosa-choque', emoji: '🎀', perso: 'maria', desc: 'Coque com laço rosa e tudo rosa.', valores: { estiloCabelo: 'coque', corLaco: '#ff4fa3', boneEstilo: 'tiara', corCamisa: '#ff4fa3', corShort: '#8a1f5a', corTenis: '#ffffff', pulseira: '#ff4fa3' } },
];
const DLC_INFO = { id: 'inverno', nome: 'DLC Inverno na Lagoa', emoji: '❄️', tam: '48 MB', desc: 'Neve caindo no camping, céu de inverno, 4 skins exclusivas de touca de lã e a placa da Fogueira de Inverno.',
  skins: [
    { id: 'laraInverno', nome: 'Lara de Inverno', emoji: '🧣', perso: 'lara', desc: 'Roupa escura, tênis branco e tiara azul-gelo. [DLC]', valores: { boneEstilo: 'tiara', corTiara: '#9fd8ff', corCamisa: '#1f3a5a', corShort: '#12233a', corTenis: '#ffffff', corBolsa: '#9fd8ff', pulseira: '#9fd8ff' } },
    { id: 'caioInverno', nome: 'Caio de Inverno', emoji: '🧤', perso: 'caio', desc: 'Bandana azul-gelo e roupa escura. [DLC]', valores: { boneEstilo: 'bandana', corBandana: '#9fd8ff', corCamisa: '#1f3a5a', corShort: '#12233a', corTenis: '#ffffff', corMochila: '#9fd8ff' } },
    { id: 'duduInverno', nome: 'Dudu de Inverno', emoji: '🧊', perso: 'dudu', desc: 'Tudo branco e azul-gelo. [DLC]', valores: { corCamisa: '#ffffff', corShort: '#1f3a5a', corTenis: '#9fd8ff', corMochila: '#ffffff' } },
    { id: 'mariaInverno', nome: 'Maria de Inverno', emoji: '⛄', perso: 'maria', desc: 'Tranças com laço branco. [DLC]', valores: { estiloCabelo: 'trancas', corLaco: '#ffffff', corCamisa: '#9fd8ff', corShort: '#1f3a5a', corTenis: '#ffffff' } },
  ] };
const modsEl = document.getElementById('mods');
let modsAba = 'baixar';
const modsSt = { instalados: {}, meus: [], skins: [], dlc: false, dlcOn: true };
try { Object.assign(modsSt, JSON.parse(localStorage.getItem('escoteiros.mods') || '{}')); } catch (e) {}
function salvaMods() { try { localStorage.setItem('escoteiros.mods', JSON.stringify(modsSt)); } catch (e) {} }
const todosMods = () => MODS_CATALOGO.concat(modsSt.meus);
const modAtivo = m => modsSt.instalados[m.id] === true;
function baixaArquivo(nome, obj) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })); a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
function importaArquivo(cb) { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { cb(JSON.parse(r.result)); } catch (e) { alert('Arquivo inválido: ' + e.message); } }; r.readAsText(f); }; i.click(); }
// ---- aplica os mods ativos no jogo ----
const modsPlacas = {};
let neve = null;
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
  if (modsSt.dlc && modsSt.dlcOn) { a.ceu = a.ceu || '#c9d6e2'; a.neblina = a.neblina || '#dfe6ea'; a.nebLonge = Math.min(a.nebLonge, 260); a.sol *= 0.75; if (!neve) criaNeve(); neve.visible = true; if (!modsPlacas.dlc) modsPlacas.dlc = placaLivre('Fogueira de Inverno ❄️', -186, -146, 4.5, 0.3); }
  else { if (neve) neve.visible = false; if (modsPlacas.dlc) { scene.remove(modsPlacas.dlc); delete modsPlacas.dlc; } }
  MOD.vel = a.vel; MOD.pulo = a.pulo; MOD.grav = a.grav; MOD.escala = a.escala;
  if (!noite) {
    scene.background = new THREE.Color(a.ceu || '#9ecbff'); renderer.setClearColor(a.ceu || '#9ecbff');
    scene.fog = new THREE.Fog(a.neblina || '#bfdcff', a.nebPerto, a.nebLonge);
    sol.intensity = 0.95 * a.sol; hemi.intensity = 0.55 * (0.5 + a.sol / 2);
  }
}
function criaNeve() {
  const n = 1500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-60, 60); pos[i * 3 + 1] = rnd(0, 40); pos[i * 3 + 2] = rnd(-60, 60); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  neve = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.9 })); scene.add(neve);
}
function atualizaMods(dt) {
  if (!neve || !neve.visible) return;
  neve.position.set(estado.pos.x, estado.pos.y, estado.pos.z);
  const p = neve.geometry.attributes.position.array;
  for (let i = 1; i < p.length; i += 3) { p[i] -= dt * 2.5; p[i - 1] += Math.sin(tempo + i) * dt * 0.3; if (p[i] < -2) p[i] = 40; }
  neve.geometry.attributes.position.needsUpdate = true;
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
    if (modsSt.dlc) h += '<div style="margin-top:8px"><b>❄️ Skins do DLC</b></div>' + DLC_INFO.skins.map(itemSkin).join('');
    h += '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.2);padding-top:8px"><b>Criar skin</b> — monta o visual no 🎨 Personalizar, depois dá um nome aqui e salva: <label>Emoji <input type="text" id="skEmoji" value="👕" size="2"></label><label>Nome <input type="text" id="skNome" placeholder="Minha skin" size="16"></label> <label>de <select id="skPerso">' + ['lara', 'caio', 'dudu', 'maria'].map(i => '<option value="' + i + '"' + (i === personagemId ? ' selected' : '') + '>' + PERSONAGENS[i].nome + '</option>').join('') + '</select></label> <button id="skSalvar">💾 Salvar skin</button> <button class="sec" id="skBaixar">⬇ Baixar .json</button></div>';
    if (modsSt.skins.length) h += '<div style="margin-top:8px"><b>Minhas skins</b></div>' + modsSt.skins.map(itemSkin).join('');
  } else {
    h += '<div class="item"><span class="em" style="font-size:40px">' + DLC_INFO.emoji + '</span><div class="tx"><b>' + DLC_INFO.nome + '</b> <small>' + DLC_INFO.desc + ' · ' + DLC_INFO.tam + ' · grátis</small><div class="prog" id="dlcProg" style="display:none"><div></div></div><small id="dlcTxt"></small></div>' +
      (modsSt.dlc ? '<button data-dlc="liga" class="' + (modsSt.dlcOn ? '' : 'off') + '">' + (modsSt.dlcOn ? '✅ Ligado' : '⏸ Desligado') + '</button><button class="sec" data-dlc="remove">🗑</button>' : '<button data-dlc="baixa">⬇ Baixar DLC</button>') + '</div>' +
      '<small style="opacity:.7">O DLC liga a neve e o céu de inverno em todos os capítulos (menos de noite) e libera 4 skins na aba 👕 Skins.</small>';
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
      const t = setInterval(() => { p = Math.min(100, p + rnd(4, 14)); pr.firstChild.style.width = p + '%'; tx.textContent = Math.round(p) + '% de ' + DLC_INFO.tam; if (p >= 100) { clearInterval(t); modsSt.dlc = true; modsSt.dlcOn = true; salvaMods(); aplicaMods(); SOM.missao(); desenhaMods(); aviso('❄️ DLC Inverno na Lagoa instalado! Tá nevando no camping.', 4000); } }, 180); }
  });
}
modsEl.addEventListener('click', e => e.stopPropagation());
modsEl.addEventListener('keydown', e => e.stopPropagation());
document.getElementById('btnMods').addEventListener('click', e => { e.stopPropagation(); const on = modsEl.style.display !== 'block'; modsEl.style.display = on ? 'block' : 'none'; if (on) desenhaMods(); });
aplicaMods();
