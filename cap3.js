// ---------- CAPÍTULO 3: mais um sábado ----------
// Enredo: dia de pipa. O Pai ensina a fazer pipa (varetas de bambu, papel de seda, linha e rabiola), a alcateia empina na
// Praia do Camping com o vento da lagoa, tem concurso de altura, a pipa enrosca na casinha do salva-vidas e a do Joaquim
// na árvore do lobinhos.com. De noite, um grito estranho vem do Iate Clube: era o Velejador testando a buzina de nevoeiro.
// 14 missões. Usa as funções de game.js e cap2.js (preparaSabado, balão, save...).

var CAP3 = { ativo: false, fase: null, noite: false, bambus: 0, etapa: 0, continuar: null, pipa: null, pipasNpc: [], gritoT: 0 };
const C3 = {
  bambus: [[-92, -46], [-106, -63], [-121, -84]],   // bambuzais na mata, atrás da cancha de bocha
  praia: [75, -32],                                  // onde a alcateia empina
  iate: [300, 150],                                  // sede do Iate Clube
  ETAPAS: [['serrar', 2, 'Cortar as varetas no tamanho certo'], ['amarrar', 2, 'Amarrar a armação (cruz e arco)'], ['amarrar', 1, 'Colar o papel e amarrar a rabiola']],
};
const C3_MISSOES = [
  ['c3_akela', 'Sábado de pipa! Falar com a Akelá na árvore do lobinhos.com'],
  ['c3_pai', 'Falar com o Pai na portaria — ele ensina a fazer pipa'],
  ['c3_bambu', 'Cortar 3 varetas de bambu na mata, atrás da cancha de bocha (0/3)'],
  ['c3_papel', 'Pegar papel de seda na cantina'],
  ['c3_linha', 'Pegar o carretel de linha na caixa de pioneiria, na frente da sede'],
  ['c3_montar', 'Montar a pipa com o Pai na portaria (0/3 etapas)'],
  ['c3_empinar', 'Empinar a pipa na Praia do Camping (chegar a 40 m)'],
  ['c3_concurso', 'Concurso de altura: passar as pipas do Dudu, da Maria e do Joaquim (80 m)'],
  ['c3_casinha', 'Soltar a pipa que enroscou na casinha do salva-vidas'],
  ['c3_joaquim', 'Pegar a pipa do Joaquim na árvore do lobinhos.com (subir pelo A de bambu)'],
  ['c3_grito', 'Um grito estranho vindo do Iate Clube! Falar com o Chefe Diego'],
  ['c3_iate', 'À noite: ir até o Iate Clube pela estrada da portaria, com a lanterna'],
  ['c3_velejador', 'Descobrir o que era o grito: falar com o Velejador'],
  ['c3_fogueira', 'Voltar pra Fogueira do Conselho, ao lado da sede do Grupo Escoteiro (🔥 no mapa), e contar pra alcateia'],
];
function c3Missao(id) { const m = C3_MISSOES.find(x => x[0] === id); if (m && !missoes.find(x => x.id === id)) { missoes.push({ id, txt: m[1], ok: false }); renderMissoes(); } }
function c3Txt(id, txt) { const m = missoes.find(x => x.id === id); if (m) { m.txt = txt; renderMissoes(); } }

// ---------- objetos ----------
const matPapel = new THREE.MeshLambertMaterial({ color: 0xe8402a, side: THREE.DoubleSide });
function criaPipa(cor) {
  const g = new THREE.Group();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.6, 0, 0.45, 0, 0, 0, -0.7, 0, -0.45, 0, 0]), 3));
  geo.setIndex([0, 1, 3, 1, 2, 3]); geo.computeVertexNormals();
  const papel = new THREE.Mesh(geo, cor ? new THREE.MeshLambertMaterial({ color: cor, side: THREE.DoubleSide }) : matPapel); g.add(papel);
  const v1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.3, 6), M.bambu); v1.position.set(0, -0.05, 0.01); g.add(v1);
  const v2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6), M.bambu); v2.rotation.z = Math.PI / 2; v2.position.set(0, 0, 0.01); g.add(v2);
  const rabo = [];
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xffffff : 0x2c5bb5, side: THREE.DoubleSide })); r.position.set(0, -0.85 - i * 0.22, 0); g.add(r); rabo.push(r); }
  g.scale.setScalar(1.8); scene.add(g); g.visible = false;
  return { mesh: g, rabo, papel };
}
function criaLinha() {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff })); l.visible = false; scene.add(l); return l;
}
function criaBambuzal(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, r = 0.5 + (i % 3) * 0.2, h = 4 + (i % 4) * 0.8; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 8), M.bambu); c.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); c.rotation.z = (i % 2 ? 1 : -1) * 0.06; c.castShadow = true; g.add(c); for (let k = 1; k < 4; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.08), new THREE.MeshLambertMaterial({ color: 0x6fae4a, side: THREE.DoubleSide })); f.position.set(Math.cos(a) * r + 0.25, h * k / 4, Math.sin(a) * r); f.rotation.y = a; g.add(f); } }
  scene.add(g); obstaculos.push({ x, z: -y, r: 0.9 });
  return g;
}

// marcador flutuante com emoji (sprite) em cima de um lugar
function criaEmoji(emoji, x, y, alt) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const cx = c.getContext('2d');
  cx.font = '96px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(emoji, 64, 70);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(2.2, 2.2, 1);
  s.position.set(x, altO(x, y) + (alt || 3.5), -y); s.visible = false; scene.add(s); return s;
}
// ---------- início ----------
function iniciaCap3() {
  if (CAP3.ativo) return;
  preparaSabado(); CAP2.ativo = false; CAP3.ativo = true;
  // sobras do cap. 2 que atrapalham
  if (CAP2.cobra) { CAP2.cobra.mesh.visible = false; CAP2.cobra.mesh.userData.obst.r = 0; }
  if (CAP2.rastros) for (const r of CAP2.rastros) r.visible = false;
  bandeira.visible = true; bandeiraAlt = bandeiraAlvo = 5.4;
  interativos.find(i => i.nome === 'Falar com Akelá').acao = c3Akela;
  interativos.find(i => i.nome === 'Falar com Chefe Diego').acao = c3Diego;
  interativos.find(i => i.nome === 'Falar com Pai').acao = c3Pai;
  interativos.find(i => i.nome === 'Falar com Lobinho Alisson').acao = () => aviso('Lobinho Alisson: "' + (CAP3.noite ? 'Aquele grito... eu vou ficar aqui perto do Fantasma, tá?' : 'Pipa? Eu nunca empinei. O vento da lagoa é forte demais pra mim, eu saio voando junto!') + '"', 4000);
  CAP3.bambuzais = C3.bambus.map(([x, y]) => criaBambuzal(x, y));
  CAP3.bambus = 0; CAP3.etapa = 0;
  CAP3.pipa = criaPipa(); CAP3.linha = criaLinha(); CAP3.carretel = CAP3.carretel || criaCarretel();
  // emojis marcando onde pegar cada material (aparecem depois que o Pai explica)
  CAP3.marcas = { bambu: C3.bambus.map(([x, y]) => criaEmoji('🎋', x, y, 6.5)), carretel: criaEmoji('🧵', C3_CARRETEL[0], C3_CARRETEL[1], 3), papel: criaEmoji('📄', MAPA.lanchonete.x, MAPA.lanchonete.y, 5.5) };
  CAP3.pipasNpc = [['Lobinho Dudu', 0x2fa84f, 60], ['Lobinha Maria', 0xf2c94c, 72], ['Lobinho Joaquim', 0x2c5bb5, 35]].map(([n, cor, alt]) => ({ nome: n, npc: npcs.find(x => x.nome === n), pipa: criaPipa(cor), linha: criaLinha(), alt }));
  missoes.splice(0, missoes.length); c3Missao('c3_akela');
  CAP3.fase = 'abre';
  cena = { cap2: true, cap3: true, tipo: 'abre', t: 0 };
  textoNoite.textContent = 'Mais um sábado no camping — dia de vento'; textoNoite.style.opacity = 1;
  if (CAP3.continuar === 'noite') retomaCap3Noite();
}
function retomaCap3Noite() {
  missoes.splice(0, missoes.length);
  for (const [id, txt] of C3_MISSOES.slice(0, 10)) missoes.push({ id, txt, ok: true });
  c3Txt('c3_bambu', 'Cortar 3 varetas de bambu na mata (3/3)'); c3Txt('c3_montar', 'Montar a pipa com o Pai na portaria (3/3 etapas)');
  CAP3.bambus = 3; CAP3.etapa = 3; CAP3.temPapel = CAP3.temLinha = CAP3.temPipa = true;
  CAP3.fase = 'grito'; c3Missao('c3_grito');
  textoNoite.textContent = 'Continuando: fim de tarde, depois das pipas';
  if (cena) cena.t = 1.5;
  setTimeout(() => { SOM.buzina(); aviso('😱 UUUUUÔÔÔÔ! Que grito foi esse?! Veio do lado do Iate Clube...', 4500); }, 3500);
}

// ---------- diálogos ----------
function c3Akela() {
  const f = CAP3.fase;
  if (f === 'abre' || f === 'akela') {
    // Lara e Caio são filhos do Henrique; pra Maria e Dudu ele é o Tio Henrique
    const paiDe = (personagemId === 'lara' || personagemId === 'caio') ? 'o seu pai' : 'o Tio Henrique';
    aviso('Akelá: "' + PERSONAGENS[personagemId].nome + ', hoje o vento da lagoa tá perfeito: DIA DE PIPA! Da última vez que fizemos pipa quem se responsabilizou foi ' + paiDe + ', lembra? Vai lá na portaria pedir pra ele ensinar."', 7000);
    completa('c3_akela'); CAP3.fase = 'pai'; c3Missao('c3_pai');
  }
  else if (f === 'pai' || f === 'materiais' || f === 'montar') aviso('Akelá: "Faz a tua pipa com o Pai e depois vem pra praia. O Dudu, a Maria e o Joaquim já estão empinando as deles!"', 4500);
  else if (f === 'praia') aviso('Akelá: "Vai pra Praia do Camping, perto da casinha do salva-vidas. Lá o vento vem limpo da lagoa."', 4000);
  else if (f === 'casinha' || f === 'joaquim') aviso('Akelá: "Pipa enroscada faz parte. Vai lá soltar, com calma."', 3500);
  else if (f === 'grito') aviso('Akelá: "Esse grito veio do Iate Clube. Fala com o Chefe Diego, ele vai querer ir ver."', 4000);
  else if (f === 'iate' || f === 'velejador') aviso('Akelá: "Estamos todos no Iate Clube. Vai lá falar com o Velejador."', 3500);
  else if (f === 'fogueira') aviso('Akelá: "Vem pra fogueira da sede contar pra alcateia!"', 3500);
  else aviso('Akelá: "Que sábado! Semana que vem tem mais. Grande Uivo!"', 3500);
}
function c3Pai() {
  const f = CAP3.fase;
  if (f === 'pai') {
    cena = { cap2: true, cap3: true, tipo: 'falas', t: 0, i: -1, falas: [
      'Pai: "Pipa? Eu fazia pipa todo dia quando era guri. Precisa de 3 varetas de bambu, papel de seda, linha e um rabo de pano."',
      'Pai: "Bambu tem na mata, atrás da cancha de bocha. Papel de seda a cantina tem. Linha, tem um carretel lá na sede."',
      'Pai: "Traz tudo aqui que a gente monta juntos. E cuidado com a linha, que corta o dedo."',
    ], aoTerminar: () => { cena = null; completa('c3_pai'); CAP3.fase = 'materiais'; c3Missao('c3_bambu'); c3Missao('c3_papel'); c3Missao('c3_linha'); } };
    c2ProximaFala();
  } else if (f === 'materiais') {
    const falta = [CAP3.bambus < 3 ? 'as varetas de bambu' : null, !CAP3.temPapel ? 'o papel de seda' : null, !CAP3.temLinha ? 'a linha' : null].filter(Boolean);
    if (falta.length) aviso('Pai: "Ainda falta ' + falta.join(', ') + '. Vai buscar que eu espero aqui."', 4000);
    else { aviso('Pai: "Trouxe tudo! Então vamos montar. Primeiro a gente corta as varetas no tamanho certo."', 4500); completa('c3_bambu'); completa('c3_papel'); completa('c3_linha'); CAP3.fase = 'montar'; c3Missao('c3_montar'); }
  } else if (f === 'montar') { const e = C3.ETAPAS[CAP3.etapa]; estado.yaw = Math.atan2(pai.position.x - estado.pos.x, pai.position.z - estado.pos.z); abreMini(e[0], e); }
  else if (f === 'praia') aviso('Pai: "Vai empinar na praia. Solta linha quando o vento tá forte e dá um puxão quando ele fraqueja. E não deixa a pipa cair na água!"', 5000);
  else if (CAP3.noite) aviso('Pai: "Grito? Eu não ouvi nada, tava concentrado no código... Vai com o Chefe, mas leva a lanterna."', 4000);
  else aviso('Pai: "' + ['A minha pipa mais alta foi na praia do Laranjal, uns 100 metros. Um dia tu passa.', 'Cuidado com a linha perto dos cachorros.', 'Tô terminando esse bug aqui, já vou ver as pipas.'][Math.floor(Math.random() * 3)] + '"', 4000);
}
function c3Diego() {
  const f = CAP3.fase;
  if (f === 'grito') {
    aviso('Chefe Diego: "Eu também ouvi! Veio do lado do Iate Clube. Vamos lá ver, pela estrada da portaria. Lanterna ligada e ninguém sai do grupo, tá?"', 6000);
    completa('c3_grito'); CAP3.fase = 'iate'; c3Missao('c3_iate');
    setTimeout(iniciaNoiteCap3, 1500);
  } else if (f === 'iate') aviso('Chefe Diego: "Segue a estrada da portaria até o Iate Clube. Eu vou logo atrás com os outros."', 4000);
  else if (f === 'velejador') aviso('Chefe Diego: "Fala com o Velejador, ele tá ali na frente do clube."', 3500);
  else if (f === 'fogueira') aviso('Chefe Diego: "Buzina de nevoeiro! Essa vai pra história da alcateia. Bora pra fogueira."', 3500);
  else aviso('Chefe Diego: "Bom sábado! Dia de vento é dia de pipa. Vai lá."', 3500);
}
function cap3Etapa() {   // fim de um minigame de montar a pipa
  if (!CAP3 || !CAP3.ativo || CAP3.fase !== 'montar') return false;
  CAP3.etapa++; SOM.coleta();
  c3Txt('c3_montar', 'Montar a pipa com o Pai na portaria (' + CAP3.etapa + '/3 etapas)');
  if (CAP3.etapa >= 3) { completa('c3_montar'); CAP3.fase = 'praia'; CAP3.temPipa = true; c3Missao('c3_empinar'); aviso('Pai: "Ficou linda! Agora vai lá na Praia do Camping empinar. Eu vou ver de longe."', 5000); }
  else aviso('Pai: "' + ['Boa! Agora amarra a cruz e o arco bem firme, senão a pipa entorta no vento.', 'Agora o papel: cola nas varetas e amarra a rabiola de pano, que é ela que dá equilíbrio.'][CAP3.etapa - 1] + '" (aperte E de novo)', 5000);
  return true;
}
function cap3Tecla(e) {
  if (!CAP3 || !CAP3.ativo || !cena || !cena.cap3) return false;
  if (cena.falas) { if (e.code === 'KeyE' && !e.repeat) c2ProximaFala(); return true; }
  if (cena.tipo === 'pipa') { if ((e.code === 'KeyE' || e.code === 'Space') && !e.repeat) pipaPuxao(); return true; }
  return false;
}
function cap3PadExtra(j, inp) {
  if (!CAP3 || !CAP3.ativo || !cena || !cena.cap3 || !inp) return false;
  if (cena.tipo === 'pipa') { if (inp.interagir || inp.a) pipaPuxao(); if (inp.mx < -0.5) CAP3.pipa.soltaPad = true; else if (inp.mx > 0.5) CAP3.pipa.recolhePad = true; return true; }
  return !!cena.falas;
}

// interações do capítulo
interativos.push({ x: 0, z: 0, r: 0, nome: 'Cortar vareta de bambu', cond: () => CAP3.ativo && CAP3.fase === 'materiais' && CAP3.bambus < 3, acao: () => {
  CAP3.bambus++; SOM.coleta(); c3Txt('c3_bambu', 'Cortar 3 varetas de bambu na mata, atrás da cancha de bocha (' + CAP3.bambus + '/3)');
  aviso(CAP3.bambus < 3 ? '🎋 Vareta de bambu cortada! (' + CAP3.bambus + '/3)' : '🎋 3 varetas! Agora o papel e a linha, e leva tudo pro Pai.', 3000);
} });
interativos.push({ x: MAPA.lanchonete.x, z: -MAPA.lanchonete.y, r: 9, nome: 'Pegar papel de seda na cantina', cond: () => CAP3.ativo && CAP3.fase === 'materiais' && !CAP3.temPapel, acao: () => { CAP3.temPapel = true; SOM.coleta(); aviso('📄 Papel de seda vermelho! A moça da cantina deu de presente.', 3000); c3Txt('c3_papel', 'Pegar papel de seda na cantina ✓'); } });
const C3_CARRETEL = [-201, -131];   // caixa de pioneiria na frente da sede
function criaCarretel() {
  const g = new THREE.Group(); const [x, y] = C3_CARRETEL; g.position.set(x, altO(x, y), -y);
  g.add(caixa(1.1, 0.5, 0.7, M.madeira, 0, 0.25, 0));                                   // caixa de pioneiria
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 16), M.branco); c.rotation.z = Math.PI / 2; c.position.set(0, 0.66, 0); g.add(c);   // carretel
  for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), M.madeira); b.rotation.z = Math.PI / 2; b.position.set(sx * 0.16, 0.66, 0); g.add(b); }
  scene.add(g); return g;
}
interativos.push({ x: C3_CARRETEL[0], z: -C3_CARRETEL[1], r: 6, nome: 'Pegar o carretel de linha', cond: () => CAP3.ativo && CAP3.fase === 'materiais' && !CAP3.temLinha, acao: () => { CAP3.temLinha = true; SOM.coleta(); if (CAP3.carretel) CAP3.carretel.children[1].visible = CAP3.carretel.children[2].visible = CAP3.carretel.children[3].visible = false; aviso('🧵 Carretel de linha 10! Tava na caixa de pioneiria, na frente da sede.', 3000); c3Txt('c3_linha', 'Pegar o carretel de linha na sede ✓'); } });
interativos.push({ x: C3.praia[0], z: -C3.praia[1], r: 12, nome: 'Empinar a pipa', cond: () => CAP3.ativo && CAP3.fase === 'praia' && !mini, acao: iniciaPipa });
interativos.push({ x: SALVA[0], z: -SALVA[1], r: 6, nome: 'Soltar a pipa da casinha', cond: () => CAP3.ativo && CAP3.fase === 'casinha', acao: () => {
  CAP3.pipa.mesh.visible = false; CAP3.linha.visible = false; SOM.coleta(); completa('c3_casinha');
  CAP3.fase = 'joaquim'; c3Missao('c3_joaquim');
  const jq = CAP3.pipasNpc[2]; jq.pipa.mesh.position.set(ARV_BAND[0] + 1.2, ARV_TOPO + 1.6, -ARV_BAND[1] - 0.8); jq.pipa.mesh.rotation.set(0.6, 0.4, 0.3); jq.linha.visible = false;
  const n = jq.npc.mesh; n.position.set(ARV_BAND[0] + 4, altO(ARV_BAND[0] + 4, ARV_BAND[1] - 5), -(ARV_BAND[1] - 5)); n.rotation.y = -0.6; aplicaEmote(n, 'triste', 0);
  for (const o of obstaculos) if (o.npc === n) { o.x = n.position.x; o.z = n.position.z; }
  for (const i of interativos) if (i.npcMesh === n) { i.x = n.position.x; i.z = n.position.z; }
  setTimeout(() => aviso('Lobinho Joaquim: "' + PERSONAGENS[personagemId].nome + '!!! Minha pipa enroscou na árvore do lobinhos.com e eu não alcanço! Sobe lá pra mim... por favor. Hmpf."', 5500), 3200);
} });
interativos.push({ x: ARV_BAND[0], z: -ARV_BAND[1], r: 4, nome: 'Pegar a pipa do Joaquim', cond: () => CAP3.ativo && CAP3.fase === 'joaquim' && naPlataforma(), acao: () => {
  const jq = CAP3.pipasNpc[2]; jq.pipa.mesh.visible = false; SOM.coleta(); completa('c3_joaquim'); aplicaEmote(jq.npc.mesh, 'feliz', 0);
  aviso('Lobinho Joaquim: "PEGOU! Valeu... tu é legal. Mas não conta pra ninguém que eu pedi ajuda."', 4500);
  CAP3.fase = 'grito';
  setTimeout(() => { SOM.buzina(); aviso('😱 UUUUUÔÔÔÔ! Que grito foi esse?! Veio do lado do Iate Clube...', 4500); c3Missao('c3_grito'); }, 7000);
} });
interativos.push({ x: -186, z: 136, r: 9, nome: 'Contar pra alcateia na fogueira', cond: () => CAP3.ativo && CAP3.fase === 'fogueira', acao: () => {
  cena = { cap2: true, cap3: true, tipo: 'falas', t: 0, i: -1, falas: [
    'Akelá: "Então o grito da noite era a buzina de nevoeiro do Velejador! Ninguém mais vai dormir com medo de fantasma de Iate Clube."',
    'Akelá: "E a pipa mais alta do sábado foi a do(a) ' + PERSONAGENS[personagemId].nome + '. O Pai ensinou bem! Grande Uivo, alcateia: AUUUUUU!"',
  ], aoTerminar: () => { cena = null; if (CAP3.marcaFogueira) CAP3.marcaFogueira.visible = false; completa('c3_fogueira'); CAP3.fase = 'fim'; SOM.uivo(); setTimeout(() => { aviso('🏕️ FIM DO CAPÍTULO 3 — obrigado por jogar! A pipa do Pai, o concurso na praia, a casinha, a árvore e a buzina do Iate Clube. Até o próximo sábado! 🐺', 12000); SOM.fim(); mostraBotaoCap4(); }, 1500); } };
  c2ProximaFala();
} });

// ---------- PIPA: empinar na praia ----------
function iniciaPipa() {
  const p = CAP3.pipa;
  estado.pos.set(C3.praia[0], altO(C3.praia[0], C3.praia[1]), -C3.praia[1]); estado.yaw = 0;
  p.linha = 8; p.altura = 0; p.impulso = 0; p.vento = 0.6; p.t = 0; p.caiu = 0; p.venceuT = 0; p.fase = 'voa'; p.mesh.visible = true; CAP3.linha.visible = true;
  // Dudu, Maria e Joaquim ao lado, com as pipas deles no ar
  CAP3.pipasNpc.forEach((q, i) => { const n = q.npc.mesh; const x = C3.praia[0] - 5 - i * 5, y = C3.praia[1] + 1 + i * 1.5; n.position.set(x, altO(x, y), -y); n.rotation.y = 0; n.visible = true; q.pipa.mesh.visible = true; q.linha.visible = true; q.fase = Math.random() * 6; for (const o of obstaculos) if (o.npc === n) { o.x = x; o.z = -y; } for (const it of interativos) if (it.npcMesh === n) { it.x = x; it.z = -y; } });
  cena = { cap2: true, cap3: true, tipo: 'pipa', t: 0, carona: CAP3.pipasNpc.map(q => ({ mesh: q.npc.mesh })) };
  miniEl.style.display = 'block'; desenhaPipaHud();
  aviso('🪁 Segure ← pra soltar linha (quando o vento tá forte), → pra recolher, e E dá um puxão quando o vento fraqueja.', 6000);
}
function desenhaPipaHud() {
  const p = CAP3.pipa, v = Math.round(p.vento * 10), a = Math.round(p.altura);
  const meta = CAP3.fase === 'praia' ? 40 : 80;
  const outros = CAP3.fase === 'concurso' ? '<div>Dudu ' + Math.round(CAP3.pipasNpc[0].alt) + ' m · Maria ' + Math.round(CAP3.pipasNpc[1].alt) + ' m · Joaquim ' + Math.round(CAP3.pipasNpc[2].alt) + ' m</div>' : '';
  miniEl.innerHTML = '<b>🪁 Empinando na Praia do Camping</b><div class="mmsg">' + (p.vento > 0.55 ? '💨 Vento forte: solta linha (←)!' : p.vento > 0.35 ? '🌬️ Vento médio: segura (→) ou dá puxão (E)' : '😶 Vento fraco: puxão (E) e recolhe (→)') + '</div>' +
    '<div>Vento: ' + '🟩'.repeat(v) + '⬜'.repeat(10 - v) + '</div><div>Altura: <b>' + a + ' m</b> · linha ' + Math.round(p.linha) + ' m · meta ' + meta + ' m</div>' + outros;
}
function pipaPuxao() { const p = CAP3.pipa; if (!p || !cena || cena.tipo !== 'pipa' || p.fase !== 'voa') return; p.impulso = Math.min(30, p.impulso + 10); SOM.passo(false, false); }
function atualizaPipa(dt) {
  const p = CAP3.pipa; cena.t += dt; p.t += dt;
  const u = jogador.userData; u.bracoE.rotation.x = -2.2; u.bracoD.rotation.x = -2.0 + Math.sin(p.t * 3) * 0.1;
  if (p.fase === 'voa') {
    p.vento = Math.max(0.1, Math.min(1, 0.55 + 0.35 * Math.sin(p.t * 0.37) + 0.15 * Math.sin(p.t * 1.3 + 1)));
    const solta = teclas.ArrowLeft || teclas.KeyA || p.soltaPad, recolhe = teclas.ArrowRight || teclas.KeyD || p.recolhePad; p.soltaPad = p.recolhePad = false;
    if (solta) p.linha = Math.min(130, p.linha + 14 * dt);
    if (recolhe) p.linha = Math.max(5, p.linha - 12 * dt);
    const sust = Math.max(0, Math.min(1, (p.vento - 0.25) / 0.6));
    const alvo = p.linha * (0.3 + 0.7 * sust) + p.impulso;
    p.impulso = Math.max(0, p.impulso - dt * 6);
    p.altura += (alvo - p.altura) * Math.min(1, dt * (alvo > p.altura ? 1.1 : 0.7));
    if (p.altura > 5) p.subiu = true;
    if (p.subiu && p.altura < 1.5) { p.subiu = false; p.linha = 8; p.altura = 0; p.impulso = 0; aviso('🪁 A pipa caiu na areia! Solta linha de novo com o vento.', 3000); SOM.aww(); }
    // metas
    if (CAP3.fase === 'praia' && p.altura >= 40) { completa('c3_empinar'); CAP3.fase = 'concurso'; c3Missao('c3_concurso'); aviso('Akelá: "Olha a pipa do(a) ' + PERSONAGENS[personagemId].nome + '! Agora o concurso: quem passar dos 80 metros ganha!"', 5000); }
    if (CAP3.fase === 'concurso') { p.venceuT = p.altura >= 80 ? p.venceuT + dt : 0; if (p.venceuT > 1.5) { p.fase = 'rajada'; p.rt = 0; completa('c3_concurso'); aviso('Akelá: "80 METROS! A pipa mais alta é do(a) ' + PERSONAGENS[personagemId].nome + '!" ...opa, olha essa rajada!', 5000); SOM.missao(); } }
    if (Math.floor(p.t * 6) !== Math.floor((p.t - dt) * 6)) desenhaPipaHud();
  } else if (p.fase === 'rajada') {
    // rajada leva a pipa até a casinha do salva-vidas e ela enrosca lá
    p.rt += dt; p.vento = 1; if (!p.de) p.de = p.mesh.position.clone();
    if (p.rt > 3.2) { p.fase = 'enroscada'; p.mesh.position.set(SALVA[0] - 1.5, altO(SALVA[0], SALVA[1]) + 5.4, -SALVA[1] + 0.6); p.mesh.rotation.set(0.9, 0.3, 0.5); CAP3.linha.visible = false; cena = null; miniEl.style.display = 'none'; u.bracoE.rotation.x = u.bracoD.rotation.x = 0; CAP3.fase = 'casinha'; c3Missao('c3_casinha'); aviso('🪁 Enroscou na casinha do salva-vidas! Vai lá soltar.', 4000); SOM.grr(); return; }
  }
  // posição da pipa: na frente do jogador, sobre a lagoa (na rajada, vai parar em cima da casinha do salva-vidas)
  const oscX = Math.sin(p.t * 1.7) * (1 + p.altura * 0.04), dist = p.altura * 0.75 + 3;
  let px = estado.pos.x + oscX, py = estado.pos.y + 1 + p.altura, pz = estado.pos.z + dist;
  if (p.fase === 'rajada') { const k = Math.min(1, p.rt / 3.1), alvo = new THREE.Vector3(SALVA[0] - 1.5, altO(SALVA[0], SALVA[1]) + 5.4, -SALVA[1] + 0.6); px = p.de.x + (alvo.x - p.de.x) * k; py = p.de.y + (alvo.y - p.de.y) * k + Math.sin(k * Math.PI) * 6; pz = p.de.z + (alvo.z - p.de.z) * k; }
  p.mesh.position.set(px, py, pz); p.mesh.rotation.set(-0.35 - p.vento * 0.3, Math.sin(p.t * 1.1) * 0.25, Math.sin(p.t * 2.3) * 0.15);
  p.rabo.forEach((r, i) => { r.position.x = Math.sin(p.t * 5 - i * 0.7) * 0.08 * (i + 1); r.rotation.z = Math.sin(p.t * 6 - i) * 0.4; });
  const pos = CAP3.linha.geometry.attributes.position; pos.setXYZ(0, estado.pos.x, estado.pos.y + 1.35, estado.pos.z + 0.3); pos.setXYZ(1, px, p.mesh.position.y - 0.1, pz); pos.needsUpdate = true;
  // pipas dos outros
  CAP3.pipasNpc.forEach((q, i) => {
    q.fase += dt; const n = q.npc.mesh; const alt = q.alt + Math.sin(q.fase * 0.8) * 4;
    const x = n.position.x + Math.sin(q.fase * 1.3) * 2, z = n.position.z + alt * 0.75 + 3;
    q.pipa.mesh.position.set(x, n.position.y + 1 + alt, z); q.pipa.mesh.rotation.set(-0.5, Math.sin(q.fase) * 0.2, 0);
    q.pipa.rabo.forEach((r, k) => { r.rotation.z = Math.sin(q.fase * 6 - k) * 0.4; });
    const lp = q.linha.geometry.attributes.position; lp.setXYZ(0, n.position.x, n.position.y + 1.35, n.position.z + 0.3); lp.setXYZ(1, x, q.pipa.mesh.position.y - 0.1, z); lp.needsUpdate = true;
    const un = n.userData; un.bracoE.rotation.x = -2.2; un.bracoD.rotation.x = -2.0;
  });
}
function cameraPipa() {
  const p = CAP3.pipa, alvo = p.mesh.position;
  const cam2 = new THREE.Vector3(estado.pos.x - 3, estado.pos.y + 3 + p.altura * 0.12, estado.pos.z - 9 - p.altura * 0.08);
  camera.position.lerp(cam2, 0.08);
  camera.lookAt(estado.pos.x * 0.5 + alvo.x * 0.5, (estado.pos.y + 1.5) * 0.5 + alvo.y * 0.5, estado.pos.z * 0.5 + alvo.z * 0.5);
}

// ---------- NOITE: o grito do Iate Clube ----------
function iniciaNoiteCap3() {
  ligaNoite(true); SOM.noite(false); SOM.noite(true, true); noite = false; CAP3.noite = true;
  lampiao.visible = true; luzPraia.intensity = 1.6;
  textoNoite.textContent = 'Anoiteceu. O grito veio do Iate Clube...'; textoNoite.style.opacity = 1;
  setTimeout(() => { textoNoite.style.opacity = 0; }, 3000);
  CAP3.gritoT = 0;
  // as pipas dos outros descem
  for (const q of CAP3.pipasNpc) { q.pipa.mesh.visible = false; q.linha.visible = false; const un = q.npc.mesh.userData; un.bracoE.rotation.x = un.bracoD.rotation.x = 0; }
}
function chegaIateCap3() {
  CAP3.fase = 'velejador'; completa('c3_iate'); c3Missao('c3_velejador');
  // o Chefe, o Dudu e o Joaquim chegaram junto; o Velejador na frente do clube
  const pos = [[chefe, 302, 162, 0.6], [CAP3.pipasNpc[0].npc.mesh, 306, 160, 0.3], [CAP3.pipasNpc[2].npc.mesh, 309, 162, 0.2]];
  for (const [m, x, y, r] of pos) { m.position.set(x, altO(x, y), -y); m.rotation.y = r; m.visible = true; for (const o of obstaculos) if (o.npc === m) { o.x = x; o.z = -y; } for (const i of interativos) if (i.npcMesh === m) { i.x = x; i.z = -y; } }
  if (!CAP2.velejador) { CAP2.velejador = npc(306, 168, 3.0, 'Velejador', '', { escala: 1.2, moletom: true, semChapeu: true, semBochecha: true, camisa: new THREE.MeshLambertMaterial({ color: 0xf4f4f4 }), calca: new THREE.MeshLambertMaterial({ color: 0x2c4a7a }), cabelo: new THREE.MeshLambertMaterial({ color: 0x777777 }) }); }
  const v = CAP2.velejador; v.visible = true; v.position.set(306, altO(306, 168), -168); v.rotation.y = 3.0;
  for (const o of obstaculos) if (o.npc === v) { o.x = 306; o.z = -168; o.r = 0.5; }
  const iv = interativos.find(i => i.npcMesh === v); if (iv) { iv.x = 306; iv.z = -168; iv.r = 3; iv.acao = c3Velejador; }
  CAP3.marcaVelejador = criaEmoji('⛵', 306, 168, 3.6); CAP3.marcaVelejador.visible = true;
  aviso('Chefe Diego: "Chegamos. Olha o Velejador ali na frente do clube, onde tá o ⛵... vai perguntar pra ele."', 4500);
}
function c3Velejador() {
  if (CAP3.fase !== 'velejador') { aviso('Velejador: "Boa noite, lobinhos! Desculpa de novo pela buzina, hehe."', 3500); return; }
  cena = { cap2: true, cap3: true, tipo: 'falas', t: 0, i: -1, falas: [
    'Velejador: "O grito? Ih... era eu! Tava testando a BUZINA DE NEVOEIRO do clube, pros barcos acharem o trapiche quando a lagoa fecha de neblina."',
    'Velejador: "Desculpa o susto, alcateia. Quer ouvir de perto? Tapa o ouvido..."',
    'Lobinho Joaquim: "EU NÃO TIVE MEDO. Só pulei um pouquinho. O Dudu que gritou."',
    'Lobinho Dudu: "Gritei nada! Era o Alisson lá da praia, hehe. Chefe, isso vai pra história da alcateia, né?"',
  ], aoTerminar: () => { cena = null; if (CAP3.marcaVelejador) CAP3.marcaVelejador.visible = false; completa('c3_velejador'); CAP3.fase = 'fogueira'; c3Missao('c3_fogueira'); CAP3.marcaFogueira = criaEmoji('🔥', -186, -136, 6); CAP3.marcaFogueira.visible = true; sede.chamas.visible = true; aviso('Chefe Diego: "Mistério resolvido. Todo mundo pra fogueira da sede, que a Akelá tá esperando."', 4500); } };
  c2ProximaFala();
  setTimeout(() => { if (cena && cena.falas && cena.i >= 1) SOM.buzina(); }, 100);
  const buz = setInterval(() => { if (!cena || !cena.falas) return clearInterval(buz); if (cena.i === 1 && !cena.buzinou) { cena.buzinou = true; SOM.buzina(); aplicaEmote(CAP3.pipasNpc[2].npc.mesh, 'surpreso', 3); aplicaEmote(jogador, 'surpreso', 3); } }, 200);
}

// ---------- por frame ----------
function atualizaCenaCap3(dt) {
  if (cena.tipo === 'abre') {
    cena.t += dt;
    if (cena.t > 1.0) fadeEl.style.opacity = 0;
    if (cena.t > 3.6) textoNoite.style.opacity = 0;
    if (cena.t > 4.2) { cena = null; document.getElementById('hud').style.opacity = 1; if (CAP3.fase === 'abre') { CAP3.fase = 'akela'; aviso('Akelá: "' + PERSONAGENS[personagemId].nome + '! Sentiu o vento? Vem cá!"', 3000); } }
  } else if (cena.tipo === 'pipa') atualizaPipa(dt);
  else if (cena.tipo === 'falas') { cena.t += dt; estado.vy = 0; }
}
function cameraCap3() { if (cena.tipo === 'pipa') cameraPipa(); }
function atualizaCap3(dt) {
  if (!CAP3 || !CAP3.ativo) return;
  // marcadores de emoji dos materiais
  if (CAP3.marcas) {
    const mostra = CAP3.fase === 'materiais', bob = Math.sin(tempo * 2) * 0.25;
    CAP3.marcas.bambu.forEach((s, i) => { s.visible = mostra && i >= CAP3.bambus; s.position.y = altO(C3.bambus[i][0], C3.bambus[i][1]) + 6.5 + bob; });
    CAP3.marcas.carretel.visible = mostra && !CAP3.temLinha; CAP3.marcas.carretel.position.y = altO(C3_CARRETEL[0], C3_CARRETEL[1]) + 3 + bob;
    CAP3.marcas.papel.visible = mostra && !CAP3.temPapel; CAP3.marcas.papel.position.y = altO(MAPA.lanchonete.x, MAPA.lanchonete.y) + 5.5 + bob;
  }
  // bambuzais: interativo pula pro próximo que falta
  const ib = interativos.find(i => i.nome === 'Cortar vareta de bambu'); if (ib) { const b = C3.bambus[CAP3.bambus]; if (b && CAP3.fase === 'materiais') { ib.x = b[0]; ib.z = -b[1]; ib.r = 4; } else ib.r = 0; }
  // grito de vez em quando à noite, mais alto perto do Iate Clube
  if (CAP3.noite && CAP3.fase === 'iate') {
    CAP3.gritoT += dt; if (CAP3.gritoT > 18) { CAP3.gritoT = 0; SOM.buzina(); aviso('😱 De novo o grito! Tá vindo do Iate Clube mesmo...', 3000); }
    if (!cena && Math.hypot(estado.pos.x - C3.iate[0], estado.pos.z + C3.iate[1]) < 60) chegaIateCap3();
  }
  if (CAP3.noite) {
    lampiao.position.set(luzPraia.position.x, altO(SALVA[0], SALVA[1]) + 3.4 + Math.sin(tempo * 2) * 0.1, luzPraia.position.z + Math.sin(tempo * 1.7) * 0.4); luzPraia.position.z = lampiao.position.z; luzPraia.intensity = 1.3 + Math.sin(tempo * 9) * 0.3;
    lanterna.position.set(estado.pos.x, estado.pos.y + 1.4, estado.pos.z); lanterna.target.position.set(estado.pos.x + Math.sin(estado.yaw) * 8, estado.pos.y + 0.5, estado.pos.z + Math.cos(estado.yaw) * 8);
    lua.position.set(estado.pos.x - 120, 90, estado.pos.z - 160);
  }
}

// debug: ?debug&cap3[=materiais|montar|pipa|casinha|noite]
if (DEBUG && qs.has('cap3')) try {
  capituloEscolhido = 3; iniciaCap3(); cena = null; fadeEl.style.transition = 'none'; fadeEl.style.opacity = 0; textoNoite.style.opacity = 0; document.getElementById('hud').style.opacity = 1; CAP3.fase = 'akela';
  const f = qs.get('cap3');
  const ok = ids => { for (const id of ids) { c3Missao(id); const m = missoes.find(x => x.id === id); if (m) m.ok = true; } renderMissoes(); };
  if (f === 'materiais') { ok(['c3_akela', 'c3_pai']); CAP3.fase = 'materiais'; c3Missao('c3_bambu'); c3Missao('c3_papel'); c3Missao('c3_linha'); }
  if (f === 'montar') { ok(['c3_akela', 'c3_pai', 'c3_bambu', 'c3_papel', 'c3_linha']); CAP3.bambus = 3; CAP3.temPapel = CAP3.temLinha = true; CAP3.fase = 'montar'; c3Missao('c3_montar'); estado.pos.set(pai.position.x + 2, pai.position.y, pai.position.z + 2); }
  if (f === 'pipa') { ok(['c3_akela', 'c3_pai', 'c3_bambu', 'c3_papel', 'c3_linha', 'c3_montar']); CAP3.fase = 'praia'; c3Missao('c3_empinar'); estado.pos.set(C3.praia[0], altO(C3.praia[0], C3.praia[1]), -C3.praia[1]); if (qs.get('alt')) { iniciaPipa(); CAP3.pipa.altura = +qs.get('alt'); CAP3.pipa.linha = +qs.get('alt') + 10; atualizaPipa(0.001); cameraPipa(); camera.position.set(estado.pos.x - 3, estado.pos.y + 3 + CAP3.pipa.altura * 0.12, estado.pos.z - 9 - CAP3.pipa.altura * 0.08); cameraPipa(); } }
  if (f === 'casinha') { ok(['c3_akela', 'c3_pai', 'c3_bambu', 'c3_papel', 'c3_linha', 'c3_montar', 'c3_empinar', 'c3_concurso']); CAP3.fase = 'casinha'; c3Missao('c3_casinha'); CAP3.pipa.mesh.visible = true; CAP3.pipa.mesh.position.set(SALVA[0] - 1.5, altO(SALVA[0], SALVA[1]) + 5.4, -SALVA[1] + 0.6); estado.pos.set(SALVA[0] + 4, altO(SALVA[0] + 4, SALVA[1] - 4), -SALVA[1] + 4); }
  if (f === 'noite') { CAP3.continuar = 'noite'; retomaCap3Noite(); CAP3.fase = 'iate'; ok(['c3_grito']); c3Missao('c3_iate'); iniciaNoiteCap3(); estado.pos.set(230, altO(230, 200), -200); }
  if (qs.get('pos')) { const [x, y] = qs.get('pos').split(',').map(Number); estado.pos.set(x, altO(x, y), -y); }
} catch (e) { dbg('ERRO cap3 debug: ' + e.message + ' ' + (e.stack || '').split('\n')[0]); }
