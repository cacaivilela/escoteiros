/* ESCOTEIROS — jogo 3D em terceira pessoa
   Mapa baseado no Camping Municipal da Lagoa dos Patos (São Lourenço do Sul, RS). */
(function () {
'use strict';

// ---------- utilidades ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const P = (x, y) => new THREE.Vector3(x, 0, -y);          // osm (x,y) -> mundo
function pontoNoPoligono(x, y, poly) {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function distEstradas(x, y) {
  let m = 1e9;
  for (const e of MAPA.estradas.concat(MAPA.ruas))
    for (let i = 0; i < e.length - 1; i++)
      m = Math.min(m, distSeg(x, y, e[i][0], e[i][1], e[i + 1][0], e[i + 1][1]));
  return m;
}
function shapeDe(poly) {
  const s = new THREE.Shape();
  poly.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]));
  return s;
}

// ---------- cena ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ecbff);
scene.fog = new THREE.Fog(0xbfdcff, 150, 650);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1500);

const hemi = new THREE.HemisphereLight(0xdfefff, 0x3b5d2a, 0.55);
scene.add(hemi);
const sol = new THREE.DirectionalLight(0xfff2d8, 0.95);
sol.position.set(-80, 140, 60);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
sol.shadow.camera.near = 10; sol.shadow.camera.far = 400;
sol.shadow.camera.left = -90; sol.shadow.camera.right = 90;
sol.shadow.camera.top = 90; sol.shadow.camera.bottom = -90;
sol.shadow.bias = -0.0015;
scene.add(sol); scene.add(sol.target);

// ---------- materiais ----------
const M = {
  grama: new THREE.MeshLambertMaterial({ color: 0x3f7a2c }),
  gramaClara: new THREE.MeshLambertMaterial({ color: 0x5a9440 }),
  areia: new THREE.MeshLambertMaterial({ color: 0xd6bf86 }),
  terra: new THREE.MeshLambertMaterial({ color: 0x9a7b52 }),
  agua: new THREE.MeshPhongMaterial({ color: 0x1e5f8f, specular: 0x223344, shininess: 40, transparent: true, opacity: 0.92 }),
  tronco: new THREE.MeshLambertMaterial({ color: 0x6b4a2b }),
  bambu: new THREE.MeshLambertMaterial({ color: 0xc8b96a }),
  corda: new THREE.MeshLambertMaterial({ color: 0x4a3a22 }),
  copa: new THREE.MeshLambertMaterial({ color: 0x2f6b2a }),
  copa2: new THREE.MeshLambertMaterial({ color: 0x3f8a33 }),
  palmeira: new THREE.MeshLambertMaterial({ color: 0x4f9a3a }),
  parede: new THREE.MeshLambertMaterial({ color: 0xf0e6c8 }),
  paredeVerde: new THREE.MeshLambertMaterial({ color: 0xd9e8c8 }),
  telhado: new THREE.MeshLambertMaterial({ color: 0xa6482e }),
  tijolo: new THREE.MeshLambertMaterial({ color: 0xb35a3a }),
  concreto: new THREE.MeshLambertMaterial({ color: 0xb9b9b0 }),
  madeira: new THREE.MeshLambertMaterial({ color: 0x8b5e34 }),
  metal: new THREE.MeshLambertMaterial({ color: 0x8a949c }),
  lona: new THREE.MeshLambertMaterial({ color: 0x2f7d5a }),
  lona2: new THREE.MeshLambertMaterial({ color: 0xd9822b }),
  lona3: new THREE.MeshLambertMaterial({ color: 0x3f6fbf }),
  pedra: new THREE.MeshLambertMaterial({ color: 0x777a78 }),
  vermelho: new THREE.MeshLambertMaterial({ color: 0xc8322b }),
  branco: new THREE.MeshLambertMaterial({ color: 0xf4f4f4 }),
  amarelo: new THREE.MeshLambertMaterial({ color: 0xf2c94c }),
  azul: new THREE.MeshLambertMaterial({ color: 0x2c5bb5 }),
  preto: new THREE.MeshLambertMaterial({ color: 0x222222 }),
  fogo: new THREE.MeshBasicMaterial({ color: 0xff7a1a }),
  pele: new THREE.MeshLambertMaterial({ color: 0xd9a77a }),
  camisa: new THREE.MeshLambertMaterial({ color: 0xbfa877 }),
  bermuda: new THREE.MeshLambertMaterial({ color: 0x3a4a5a }),
  lenco: new THREE.MeshLambertMaterial({ color: 0x1f8a4c }),
  lencoAzul: new THREE.MeshLambertMaterial({ color: 0x1e4fb5 }),
  sarja: new THREE.MeshLambertMaterial({ color: 0x1c3f8f }),   // short de sarja azul
  camisaLobinho: new THREE.MeshLambertMaterial({ color: 0x2f63c4 }),
  boneAzul: new THREE.MeshLambertMaterial({ color: 0x1e4fb5 }),
};

// obstáculos para colisão: {x,z,r} (círculos) e {x,z,hw,hd,rot} (caixas)
const obstaculos = [];
const interativos = [];   // {x,z,r,nome,acao}

// ---------- relevo (SRTM, suavizado) ----------
// Grade SRTM de 30 m (x: -340..410, y: -230..330), em metros acima da lagoa. Linhas de sul (y=-230) pra norte.
const SRTM = { x0: -340, y0: -230, passo: 30, nx: 26, ny: 19, v: [] };
(function () {
  const linhas = [
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0', '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0',
    '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0', '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0',
    '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0', '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0',
    '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0', '4 6 6 6 6 6 6 7 7 7 7 7 7 7 5 5 5 5 5 5 0 0 0 0 0 0',
    '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4', '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4',
    '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4', '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4',
    '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4', '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4',
    '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4', '6 3 3 3 3 3 3 3 3 3 3 3 3 3 8 8 8 8 8 8 4 4 4 4 4 4',
    '2 3 3 3 3 3 3 4 4 4 4 4 4 4 6 6 6 6 6 6 5 5 5 5 5 5'];
  let g = linhas.map(l => l.split(' ').map(Number));
  // dados brutos são em blocos: suaviza bastante (média 3x3, várias passadas)
  for (let k = 0; k < 4; k++) {
    const n = g.map(r => r.slice());
    for (let j = 0; j < SRTM.ny; j++) for (let i = 0; i < SRTM.nx; i++) { let sum = 0, c = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const jj = j + dj, ii = i + di; if (jj >= 0 && jj < SRTM.ny && ii >= 0 && ii < SRTM.nx) { sum += g[jj][ii]; c++; } } n[j][i] = sum / c; }
    g = n;
  }
  SRTM.v = g;
})();
function srtm(x, y) {   // bilinear, osm
  const fx = Math.max(0, Math.min(SRTM.nx - 1.001, (x - SRTM.x0) / SRTM.passo)), fy = Math.max(0, Math.min(SRTM.ny - 1.001, (y - SRTM.y0) / SRTM.passo));
  const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, v = SRTM.v;
  return (v[j][i] * (1 - tx) + v[j][i + 1] * tx) * (1 - ty) + (v[j + 1][i] * (1 - tx) + v[j + 1][i + 1] * tx) * ty;
}
// distância até a água (borda dos polígonos de terra) — para a margem descer suave
function distMargem(x, y) {
  let m = 1e9;
  for (const poly of [MAPA.camping, MAPA.iate]) for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) m = Math.min(m, distSeg(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]));
  // a fronteira camping/continente (nordeste) não é água: ignora borda perto da portaria
  return m;
}
// grade fina de alturas (2 m) — calculada uma vez
const REL = { x0: -330, y0: -220, x1: 420, y1: 330, passo: 2, h: null, nx: 0, ny: 0 };
(function () {
  REL.nx = Math.floor((REL.x1 - REL.x0) / REL.passo) + 1; REL.ny = Math.floor((REL.y1 - REL.y0) / REL.passo) + 1;
  REL.h = new Float32Array(REL.nx * REL.ny);
  for (let j = 0; j < REL.ny; j++) for (let i = 0; i < REL.nx; i++) {
    const x = REL.x0 + i * REL.passo, y = REL.y0 + j * REL.passo;
    const terra = pontoNoPoligono(x, y, MAPA.camping) || pontoNoPoligono(x, y, MAPA.iate) || pontoNoPoligono(x, y, MAPA.continente);
    if (!terra) { REL.h[j * REL.nx + i] = -1.3; continue; }
    let h = Math.max(0, srtm(x, y) - 3) * 0.55;             // 0 a ~2.7 m
    if (pontoNoPoligono(x, y, MAPA.praia)) h = Math.min(h, 0.25 + (1 - Math.min(1, distMargem(x, y) / 30)) * 0);  // praia baixa e plana
    const dm = distMargem(x, y); if (dm < 25) h = 0.25 + (h - 0.25) * (dm / 25);   // margem desce até ~25 cm
    REL.h[j * REL.nx + i] = h;
  }
})();
function altO(x, y) {   // altura do chão em coordenadas osm
  const fx = Math.max(0, Math.min(REL.nx - 1.001, (x - REL.x0) / REL.passo)), fy = Math.max(0, Math.min(REL.ny - 1.001, (y - REL.y0) / REL.passo));
  const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, h = REL.h, n = REL.nx;
  const v = (h[j * n + i] * (1 - tx) + h[j * n + i + 1] * tx) * (1 - ty) + (h[(j + 1) * n + i] * (1 - tx) + h[(j + 1) * n + i + 1] * tx) * ty;
  return Math.max(0, v);
}
const alt = (x, z) => altO(x, -z);   // altura do chão em coordenadas do mundo
function nivela(poly, h) { for (let j = 0; j < REL.ny; j++) for (let i = 0; i < REL.nx; i++) { const x = REL.x0 + i * REL.passo, y = REL.y0 + j * REL.passo; if (pontoNoPoligono(x, y, poly)) REL.h[j * REL.nx + i] = h; } }
function nivelaCirculo(cx, cy, r, h) { for (let j = 0; j < REL.ny; j++) for (let i = 0; i < REL.nx; i++) { const x = REL.x0 + i * REL.passo, y = REL.y0 + j * REL.passo; const d = Math.hypot(x - cx, y - cy); if (d < r) { const k = Math.min(1, (r - d) / 6); REL.h[j * REL.nx + i] = REL.h[j * REL.nx + i] * (1 - k) + h * k; } } }
// áreas planas: campo, quadras, construções, sede, cantina, portaria
nivela(MAPA.campo, altO(187, 64));
for (const [cx, cy, r] of [[-22, 8, 16], [-50, -8, 10], [-210, -138, 22], [-186, -136, 12], [-232, -136, 16], [190, 210, 16], [120, -2, 16], [-70, -70, 16], [0, -62, 12], [-40, 20, 8], [60, -6, 12], [-120, -128, 12], [-150, -150, 9], [-100, 5, 9], [300, 150, 16], [95, -17, 8], [-34, 2, 10]]) nivelaCirculo(cx, cy, r, altO(cx, cy));

// ---------- terreno ----------
function terreno() {
  // água (Lagoa dos Patos + Arroio)
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 1, 1), M.agua);
  agua.rotation.x = -Math.PI / 2; agua.position.y = -0.45;
  scene.add(agua);

  // continente distante (plano)
  const gc = new THREE.ExtrudeGeometry(shapeDe(MAPA.continente), { depth: 0.7, bevelEnabled: false });
  const mc = new THREE.Mesh(gc, M.grama); mc.rotation.x = -Math.PI / 2; mc.position.y = -0.75; mc.receiveShadow = true; scene.add(mc);

  // malha de relevo com cores por vértice: grama / terra das estradas / areia da praia / fundo da lagoa
  const W = REL.x1 - REL.x0, H = REL.y1 - REL.y0, nx = REL.nx - 1, ny = REL.ny - 1;
  const geo = new THREE.PlaneGeometry(W, H, nx, ny);
  const pos = geo.attributes.position, cores = new Float32Array(pos.count * 3);
  const cGrama = new THREE.Color(0x3f7a2c), cGrama2 = new THREE.Color(0x4a8a34), cTerra = new THREE.Color(0x9a7b52), cAreia = new THREE.Color(0xd6bf86), cFundo = new THREE.Color(0xb8a878), cCampo = new THREE.Color(0x5a9440), cBocha = new THREE.Color(0xd6bf86);
  const tmp = new THREE.Color();
  for (let k = 0; k < pos.count; k++) {
    // PlaneGeometry: x de -W/2..W/2, y de H/2..-H/2 (linhas de cima pra baixo)
    const px = pos.getX(k) + (REL.x0 + REL.x1) / 2, py = pos.getY(k) + (REL.y0 + REL.y1) / 2;   // osm
    const j = Math.round((py - REL.y0) / REL.passo), i = Math.round((px - REL.x0) / REL.passo);
    const h = REL.h[Math.max(0, Math.min(REL.ny - 1, j)) * REL.nx + Math.max(0, Math.min(REL.nx - 1, i))];
    pos.setZ(k, h);
    let c;
    if (h < 0) c = cFundo;
    else if (pontoNoPoligono(px, py, MAPA.praia)) c = cAreia;
    else if (pontoNoPoligono(px, py, MAPA.campo)) c = cCampo;
    else { const dr = distEstradas(px, py); c = dr < 2.6 ? cTerra : dr < 3.6 ? tmp.copy(cTerra).lerp(cGrama, (dr - 2.6)) : tmp.copy(cGrama).lerp(cGrama2, Math.min(1, h / 2.5)); }
    c = c.clone();
    cores[k * 3] = c.r; cores[k * 3 + 1] = c.g; cores[k * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  geo.computeVertexNormals();
  const terra = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  terra.rotation.x = -Math.PI / 2; terra.position.set((REL.x0 + REL.x1) / 2, 0, -(REL.y0 + REL.y1) / 2);
  terra.receiveShadow = true; scene.add(terra);

  // ruas do continente (concreto), fora da malha fina não importa: só pinta um plano baixo
  for (const e of MAPA.ruas) {
    for (let i = 0; i < e.length - 1; i++) {
      const a = P(e[i][0], e[i][1]), b = P(e[i + 1][0], e[i + 1][1]);
      const len = a.distanceTo(b), seg = new THREE.Mesh(new THREE.PlaneGeometry(len + 4, 7), M.concreto);
      seg.rotation.x = -Math.PI / 2; seg.position.copy(a).add(b).multiplyScalar(0.5); seg.position.y = alt(seg.position.x, seg.position.z) + 0.04; seg.rotation.z = -Math.atan2(b.z - a.z, b.x - a.x);
      scene.add(seg);
    }
  }
}

// ---------- vegetação (mata nativa) ----------
const arvores = [];
function vegetacao() {
  const zonasLivres = []; // (x,y,r) em osm onde não nascem árvores
  const bloqueia = (x, y, r) => zonasLivres.push([x, y, r]);
  const livre = (x, y) => !zonasLivres.some(z => Math.hypot(x - z[0], y - z[1]) < z[2]);

  // clareiras: construções, campo, praia, quadras, área de barracas
  bloqueia(MAPA.lanchonete.x, MAPA.lanchonete.y, 14);
  bloqueia(MAPA.banheiros.x, MAPA.banheiros.y, 10);
  bloqueia(187, 64, 30); bloqueia(188, 205, 12);          // campo / portaria
  bloqueia(-205, -135, 26);                              // sede escoteira
  bloqueia(60, -6, 12); bloqueia(-120, -128, 12);        // churrasqueiras coletivas
  bloqueia(120, -2, 16); bloqueia(95, -17, 8); bloqueia(-70, -70, 16); bloqueia(0, -62, 14); // vôlei, bocha, playground
  bloqueia(-150, -150, 9); bloqueia(-40, 20, 8);         // banheiro 2, tanques
  bloqueia(-100, -20, 26); bloqueia(40, 30, 20); bloqueia(-160, -90, 22); bloqueia(130, 130, 18); // áreas de acampamento
  bloqueia(-30, -110, 14); bloqueia(230, -100, 30);

  const tipos = [
    { n: 0, tronco: [0.35, 0.55, 5.5], copa: 'esfera', copaR: 6.5, copaY: 7.5, mat: M.copa, seq: [] },   // figueira
    { n: 1, tronco: [0.22, 0.32, 7.5], copa: 'cone', copaR: 2.6, copaY: 9.5, mat: M.copa2, seq: [] },   // corticeira/eucalipto
    { n: 2, tronco: [0.18, 0.25, 5], copa: 'palmeira', copaR: 2.4, copaY: 5.2, mat: M.palmeira, seq: [] }, // butiá
  ];
  const posicoes = [];
  const tenta = (poly, qtd, minDist, chanceTipo) => {
    const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    let n = 0, guard = 0;
    while (n < qtd && guard++ < qtd * 40) {
      const x = rnd(x0, x1), y = rnd(y0, y1);
      if (!pontoNoPoligono(x, y, poly)) continue;
      if (pontoNoPoligono(x, y, MAPA.praia) || pontoNoPoligono(x, y, MAPA.campo)) continue;
      if (distEstradas(x, y) < 5.5 || !livre(x, y)) continue;
      if (posicoes.some(p => Math.hypot(p.x - x, p.y - y) < minDist)) continue;
      const r = Math.random();
      const t = r < chanceTipo[0] ? 0 : r < chanceTipo[0] + chanceTipo[1] ? 1 : 2;
      posicoes.push({ x, y, t, s: rnd(0.75, 1.3), rot: rnd(0, 6.28) });
      n++;
    }
  };
  tenta(MAPA.camping, 520, 6.5, [0.45, 0.35, 0.2]);
  tenta(MAPA.iate, 60, 9, [0.5, 0.3, 0.2]);
  tenta(MAPA.continente, 900, 9, [0.5, 0.4, 0.1]);

  for (const tp of tipos) {
    const lista = posicoes.filter(p => p.t === tp.n);
    if (!lista.length) continue;
    const gT = new THREE.CylinderGeometry(tp.tronco[0], tp.tronco[1], tp.tronco[2], 7);
    gT.translate(0, tp.tronco[2] / 2, 0);
    let gC;
    if (tp.copa === 'esfera') { gC = new THREE.SphereGeometry(tp.copaR, 9, 7); gC.scale(1, 0.7, 1); }
    else if (tp.copa === 'cone') gC = new THREE.ConeGeometry(tp.copaR, 7, 8);
    else { gC = new THREE.SphereGeometry(tp.copaR, 6, 4); gC.scale(1.3, 0.35, 1.3); }
    gC.translate(0, tp.copaY, 0);
    const iT = new THREE.InstancedMesh(gT, M.tronco, lista.length);
    const iC = new THREE.InstancedMesh(gC, tp.mat, lista.length);
    iT.castShadow = iC.castShadow = true; iC.receiveShadow = true;
    const d = new THREE.Object3D();
    lista.forEach((p, i) => {
      d.position.set(p.x, altO(p.x, p.y) - 0.15, -p.y); d.rotation.set(0, p.rot, 0); d.scale.setScalar(p.s);
      d.updateMatrix();
      iT.setMatrixAt(i, d.matrix); iC.setMatrixAt(i, d.matrix);
      obstaculos.push({ x: p.x, z: -p.y, r: tp.tronco[1] * p.s + 0.25 });
      arvores.push({ x: p.x, y: p.y, h: tp.tronco[2] * p.s, r: tp.tronco[1] * p.s });
    });
    scene.add(iT); scene.add(iC);
  }

  // arbustos
  const gA = new THREE.SphereGeometry(1, 6, 5); gA.scale(1, 0.6, 1); gA.translate(0, 0.5, 0);
  const arb = new THREE.InstancedMesh(gA, M.copa2, 350);
  const d = new THREE.Object3D();
  let i = 0, guard = 0;
  while (i < 350 && guard++ < 20000) {
    const x = rnd(-300, 290), y = rnd(-200, 220);
    if (!pontoNoPoligono(x, y, MAPA.camping) || pontoNoPoligono(x, y, MAPA.praia) || distEstradas(x, y) < 4 || !livre(x, y)) continue;
    d.position.set(x, altO(x, y) - 0.1, -y); d.scale.setScalar(rnd(0.7, 1.8)); d.rotation.y = rnd(0, 6); d.updateMatrix();
    arb.setMatrixAt(i++, d.matrix);
  }
  arb.count = i;
  scene.add(arb);
}

// ---------- construções ----------
// prisma triangular deitado ao longo de X, vértice para cima (telhados e barracas)
function prisma(comp, larg, alt, mat) {
  const r = larg / Math.sqrt(3);
  const g = new THREE.CylinderGeometry(r, r, comp, 3);
  g.rotateY(Math.PI / 2); g.rotateZ(Math.PI / 2);
  g.translate(0, r / 2, 0);              // base no y=0
  g.scale(1, alt / (1.5 * r), 1);        // altura da cumeeira = alt
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true;
  return m;
}
function caixa(w, h, d, mat, x, y, z, rot) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); if (rot) m.rotation.y = rot;
  m.castShadow = m.receiveShadow = true;
  return m;
}
function bloqueiaCaixa(x, y, w, d, rot) { obstaculos.push({ x, z: -y, hw: w / 2, hd: d / 2, rot: rot || 0 }); }

function predio(ox, oy, w, d, h, rot, opts) {
  opts = opts || {};
  const g = new THREE.Group();
  g.position.set(ox, altO(ox, oy), -oy); g.rotation.y = rot || 0;
  g.add(caixa(w, h, d, opts.parede || M.parede, 0, h / 2, 0));
  // telhado duas águas
  const tel = prisma(w + 1, d + 1.4, (d + 1.4) * 0.32, opts.telhado || M.telhado);
  tel.position.y = h - 0.05;
  g.add(tel);
  // porta e janelas
  g.add(caixa(1.2, 2.2, 0.15, M.madeira, 0, 1.1, d / 2 + 0.05));
  for (let i = -1; i <= 1; i += 2) g.add(caixa(1.3, 1, 0.12, M.azul, i * w * 0.3, h * 0.6, d / 2 + 0.05));
  if (opts.placa) g.add(placa(opts.placa, 0, h + 0.3, d / 2 + 0.2, w * 0.8));
  scene.add(g);
  bloqueiaCaixa(ox, oy, w + 0.6, d + 0.6, rot);
  return g;
}
function placa(texto, x, y, z, larg) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2f5d2a'; ctx.fillRect(0, 0, 512, 96);
  ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 8; ctx.strokeRect(6, 6, 500, 84);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 50);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(larg, larg * 96 / 512), new THREE.MeshBasicMaterial({ map: t }));
  m.position.set(x, y, z);
  return m;
}
function placaLivre(texto, x, y, larg, rot, alt) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot || 0;
  if (alt === undefined) { g.add(caixa(0.15, 2.4, 0.15, M.madeira, -larg / 2 + 0.2, 1.2, 0)); g.add(caixa(0.15, 2.4, 0.15, M.madeira, larg / 2 - 0.2, 1.2, 0)); }
  g.add(placa(texto, 0, alt === undefined ? 2.2 : alt, 0.1, larg));
  scene.add(g);
  return g;
}
function churrasqueira(x, y, rot, coletiva) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot || 0;
  if (coletiva) {
    // galpão aberto com churrasqueira comprida
    for (const sx of [-6, 6]) for (const sz of [-3, 3]) g.add(caixa(0.3, 3.2, 0.3, M.madeira, sx, 1.6, sz));
    const tel = caixa(14, 0.25, 8, M.telhado, 0, 3.3, 0); g.add(tel);
    g.add(caixa(8, 1.1, 1.4, M.tijolo, 0, 0.55, -2));
    g.add(caixa(8, 0.15, 1.4, M.metal, 0, 1.15, -2));
    for (const sx of [-3.5, 0, 3.5]) { g.add(caixa(2.4, 0.1, 1, M.madeira, sx, 0.8, 1)); g.add(caixa(2.4, 0.1, 0.4, M.madeira, sx, 0.45, 1.8)); g.add(caixa(2.4, 0.1, 0.4, M.madeira, sx, 0.45, 0.2)); }
    bloqueiaCaixa(x, y, 9, 2, rot);
  } else {
    g.add(caixa(1.2, 1.1, 0.8, M.tijolo, 0, 0.55, 0));
    g.add(caixa(0.5, 1.4, 0.5, M.tijolo, 0, 1.8, -0.1));
    g.add(caixa(1.2, 0.08, 0.8, M.metal, 0, 1.12, 0));
    bloqueiaCaixa(x, y, 1.4, 1, rot);
  }
  scene.add(g);
}
function barraca(x, y, rot, mat, escala) {
  const s = escala || 1;
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot || 0; g.scale.setScalar(s);
  g.add(prisma(2.8, 2.4, 1.7, mat));
  g.add(caixa(0.05, 0.9, 0.7, M.preto, 1.41, 0.45, 0));
  scene.add(g);
  bloqueiaCaixa(x, y, 2.9 * s, 2.5 * s, rot);
  return g;
}
function mastro(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  g.add(caixa(1.4, 0.4, 1.4, M.concreto, 0, 0.2, 0));
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 9, 8), M.metal); m.position.y = 4.5; m.castShadow = true; g.add(m);
  const band = new THREE.Group(); band.position.y = 1.2;
  const b = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), new THREE.MeshLambertMaterial({ color: 0x1f9e4a, side: THREE.DoubleSide }));
  b.position.x = 1.05; band.add(b);
  const los = new THREE.Mesh(new THREE.CircleGeometry(0.35, 5), new THREE.MeshLambertMaterial({ color: 0xf2c94c, side: THREE.DoubleSide }));
  los.position.set(1.05, 0, 0.01); los.rotation.z = Math.PI / 2; band.add(los);
  const glob = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), new THREE.MeshLambertMaterial({ color: 0x2c5bb5, side: THREE.DoubleSide }));
  glob.position.set(1.05, 0, 0.02); band.add(glob);
  g.add(band);
  scene.add(g);
  obstaculos.push({ x, z: -y, r: 0.8 });
  return band;
}
// Árvore da Bandeira: figueira grande em frente à cantina onde a alcateia faz a cerimônia
function arvoreDaBandeira(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 7, 10), M.tronco); tronco.position.y = 3.5; tronco.castShadow = true; g.add(tronco);
  // raízes tabulares de figueira
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.25), M.tronco); r.position.set(Math.cos(i) * 1.2, 0.2, Math.sin(i) * 1.2); r.rotation.y = -i; g.add(r); }
  // copa larga e baixa, mas acima da cabeça de quem está nos galhos
  const c0 = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 9), M.copa); c0.scale.set(1, 0.65, 1); c0.position.y = 9.5; c0.castShadow = true; g.add(c0);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.283;
    const c = new THREE.Mesh(new THREE.SphereGeometry(3.6, 10, 8), i % 2 ? M.copa : M.copa2); c.scale.set(1, 0.7, 1);
    c.position.set(Math.cos(a) * 5.5, 9, Math.sin(a) * 5.5); c.castShadow = true; g.add(c);
    const galho = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.25, 5.5, 6), M.tronco);
    galho.position.set(Math.cos(a) * 2.4, 7.2, Math.sin(a) * 2.4); galho.lookAt(new THREE.Vector3(Math.cos(a) * 5.5, 9, Math.sin(a) * 5.5)); galho.rotateX(Math.PI / 2); g.add(galho);
  }
  // galhos grossos onde dá pra ficar em pé (forquilha a ~4 m)
  for (const a of ARV_GALHOS) {
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 4.4, 8), M.tronco);
    gl.position.set(Math.cos(a) * 2.4, ARV_TOPO - ARV_BASE - 0.35, Math.sin(a) * 2.4); gl.rotation.z = Math.PI / 2; gl.rotation.y = -a; gl.castShadow = true; g.add(gl);
  }
  // galho da bandeira, com a corda
  const galhoB = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 3.6, 7), M.tronco); galhoB.rotation.z = -1.2; galhoB.position.set(1.6, 5.9, 0); g.add(galhoB);
  const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 6, 4), M.branco); corda.position.set(3.2, 3.4, 0); g.add(corda);
  const band = new THREE.Group(); band.position.set(3.2, 1.2, 0);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), new THREE.MeshLambertMaterial({ color: 0x1f9e4a, side: THREE.DoubleSide })); b.position.x = 1.05; band.add(b);
  const los = new THREE.Mesh(new THREE.CircleGeometry(0.35, 5), new THREE.MeshLambertMaterial({ color: 0xf2c94c, side: THREE.DoubleSide })); los.position.set(1.05, 0, 0.01); los.rotation.z = Math.PI / 2; band.add(los);
  const glob = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), new THREE.MeshLambertMaterial({ color: 0x2c5bb5, side: THREE.DoubleSide })); glob.position.set(1.05, 0, 0.02); band.add(glob);
  g.add(band);
  // roda da alcateia: pedras marcando o círculo
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), M.branco); p.position.set(Math.cos(a) * 6, 0.15, Math.sin(a) * 6); g.add(p); }
  scene.add(g);
  obstaculos.push({ x, z: -y, r: 1.3 });
  return band;
}
// "A" de bambu (pioneiria): duas varas amarradas no topo e uma travessa só, encostado na árvore
function escadaBambu() {
  const g = new THREE.Group(); g.position.set(ARV_BAND[0], ARV_BASE, -ARV_BAND[1]); g.rotation.y = -ESC_ANG;
  const vara = (x0, z0, x1, z1, y0, y1, r) => {
    const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, a.distanceTo(b), 7), M.bambu);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    m.castShadow = true; g.add(m);
    const n = Math.floor(a.distanceTo(b) / 0.6);   // nós do bambu
    for (let i = 1; i < n; i++) { const k = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.015, 5, 10), M.tronco); k.position.copy(a).lerp(b, i / n); k.quaternion.copy(m.quaternion); k.rotateX(Math.PI / 2); g.add(k); }
  };
  // pernas do A (abertas embaixo, juntas em cima), encostadas no tronco
  vara(ESC_BASE, -0.7, ESC_TOPO, -0.06, 0, ESC_ALT + 0.4, 0.05);
  vara(ESC_BASE, 0.7, ESC_TOPO, 0.06, 0, ESC_ALT + 0.4, 0.05);
  // a travessa do A (um degrau só)
  const hT = 1.15, tT = hT / ESC_ALT, dT = ESC_BASE + (ESC_TOPO - ESC_BASE) * tT, wT = 0.7 + (0.06 - 0.7) * tT;
  vara(dT, -wT - 0.15, dT, wT + 0.15, hT, hT, 0.04);
  for (const sz of [-wT, wT]) { const am = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.028, 5, 8), M.corda); am.position.set(dT, hT, sz); am.rotation.y = Math.PI / 2; g.add(am); }
  // amarração do topo
  const topo = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 5, 10), M.corda); topo.position.set(ESC_TOPO, ESC_ALT + 0.3, 0); topo.rotation.x = Math.PI / 2; g.add(topo);
  scene.add(g);
}
function fogueira(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), M.pedra);
    p.position.set(Math.cos(i / 8 * 6.283) * 1.3, 0.2, Math.sin(i / 8 * 6.283) * 1.3); p.castShadow = true; g.add(p);
  }
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 6), M.madeira);
    t.rotation.z = Math.PI / 2 - 0.5; t.rotation.y = i * 0.8; t.position.y = 0.35; g.add(t);
  }
  // bancos de tronco ao redor
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * 6.283;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 7), M.madeira);
    b.rotation.z = Math.PI / 2; b.rotation.y = -a; b.position.set(Math.cos(a) * 3.2, 0.28, Math.sin(a) * 3.2); b.castShadow = true; g.add(b);
    obstaculos.push({ x: x + Math.cos(a) * 3.2, z: -y + Math.sin(a) * 3.2, r: 1 });
  }
  const chamas = new THREE.Group(); chamas.visible = false;
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 6), i % 2 ? M.fogo : M.amarelo);
    c.position.set(rnd(-0.4, 0.4), 0.9, rnd(-0.4, 0.4)); chamas.add(c);
  }
  const luz = new THREE.PointLight(0xff8830, 0, 18); luz.position.y = 1.5; chamas.add(luz);
  g.add(chamas);
  scene.add(g);
  obstaculos.push({ x, z: -y, r: 1.5 });
  return chamas;
}
function playground(x, y) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
  // balanço
  g.add(caixa(0.15, 2.6, 0.15, M.metal, -2, 1.3, -1)); g.add(caixa(0.15, 2.6, 0.15, M.metal, -2, 1.3, 1));
  g.add(caixa(0.15, 2.6, 0.15, M.metal, 2, 1.3, -1)); g.add(caixa(0.15, 2.6, 0.15, M.metal, 2, 1.3, 1));
  g.add(caixa(4.2, 0.15, 0.15, M.metal, 0, 2.6, 0));
  for (const sx of [-1, 1]) { g.add(caixa(0.05, 2, 0.05, M.preto, sx - 0.3, 1.6, 0)); g.add(caixa(0.05, 2, 0.05, M.preto, sx + 0.3, 1.6, 0)); g.add(caixa(0.8, 0.08, 0.3, M.vermelho, sx, 0.6, 0)); }
  // escorregador
  g.add(caixa(1.2, 2, 1.2, M.amarelo, 5, 1, -3));
  const ramp = caixa(1, 0.1, 3.4, M.vermelho, 5, 1.2, -0.4); ramp.rotation.x = -0.55; g.add(ramp);
  // gangorra
  const gang = caixa(3.6, 0.12, 0.35, M.azul, -5, 0.6, 3); gang.rotation.z = 0.2; g.add(gang);
  g.add(caixa(0.3, 0.6, 0.3, M.metal, -5, 0.3, 3));
  // areia
  const ar = new THREE.Mesh(new THREE.CircleGeometry(9, 20), M.areia); ar.rotation.x = -Math.PI / 2; ar.position.y = 0.04; g.add(ar);
  scene.add(g);
  bloqueiaCaixa(x, y, 4.4, 2.2, 0); bloqueiaCaixa(x + 5, y + 3, 1.4, 1.4, 0); bloqueiaCaixa(x - 5, y - 3, 3.6, 0.5, 0);
}
function quadraVolei(x, y, rot) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot || 0;
  const ar = new THREE.Mesh(new THREE.PlaneGeometry(20, 11), M.areia); ar.rotation.x = -Math.PI / 2; ar.position.y = 0.04; ar.receiveShadow = true; g.add(ar);
  g.add(caixa(0.12, 2.6, 0.12, M.metal, 0, 1.3, -5.2)); g.add(caixa(0.12, 2.6, 0.12, M.metal, 0, 1.3, 5.2));
  const rede = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 1), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  rede.rotation.y = Math.PI / 2; rede.position.y = 1.9; g.add(rede);
  scene.add(g);
  placaLivre('Quadra de Vôlei', x, y + 7, 5, rot);
}
function quadraBocha(x, y, rot) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot || 0;
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(24, 4), M.areia); piso.rotation.x = -Math.PI / 2; piso.position.y = 0.05; g.add(piso);
  g.add(caixa(24, 0.4, 0.2, M.madeira, 0, 0.2, 2.1)); g.add(caixa(24, 0.4, 0.2, M.madeira, 0, 0.2, -2.1));
  g.add(caixa(0.2, 0.4, 4.4, M.madeira, 12.1, 0.2, 0)); g.add(caixa(0.2, 0.4, 4.4, M.madeira, -12.1, 0.2, 0));
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), i % 2 ? M.vermelho : M.azul); b.position.set(rnd(-10, 10), 0.22, rnd(-1.5, 1.5)); g.add(b); }
  scene.add(g);
  placaLivre('Cancha de Bocha', x, y + 4.5, 5, rot);
  bloqueiaCaixa(x, y, 24.4, 0.3, rot);
}
function campoFutebol() {
  const c = MAPA.campo;
  const cx = (c[0][0] + c[2][0]) / 2, cy = (c[0][1] + c[2][1]) / 2;
  const rot = Math.atan2(c[0][1] - c[3][1], c[0][0] - c[3][0]);
  const L = Math.hypot(c[0][0] - c[3][0], c[0][1] - c[3][1]), W = Math.hypot(c[0][0] - c[1][0], c[0][1] - c[1][1]);
  const g = new THREE.Group(); g.position.set(cx, altO(cx, cy), -cy); g.rotation.y = rot;
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(L, W), M.gramaClara); piso.rotation.x = -Math.PI / 2; piso.position.y = 0.04; piso.receiveShadow = true; g.add(piso);
  const linha = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ln = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), linha); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); g.add(m); };
  ln(L, 0.2, 0, W / 2 - 0.5); ln(L, 0.2, 0, -W / 2 + 0.5); ln(0.2, W, L / 2 - 0.5, 0); ln(0.2, W, -L / 2 + 0.5, 0); ln(0.2, W, 0, 0);
  const circ = new THREE.Mesh(new THREE.RingGeometry(4.8, 5, 24), linha); circ.rotation.x = -Math.PI / 2; circ.position.y = 0.06; g.add(circ);
  for (const sx of [-1, 1]) {
    const gx = sx * (L / 2 - 0.5);
    g.add(caixa(0.12, 2.2, 0.12, M.branco, gx, 1.1, -3.5)); g.add(caixa(0.12, 2.2, 0.12, M.branco, gx, 1.1, 3.5));
    g.add(caixa(0.12, 0.12, 7.1, M.branco, gx, 2.2, 0));
    const wx = cx + Math.cos(rot) * gx, wy = cy + Math.sin(rot) * gx;
    obstaculos.push({ x: wx + Math.sin(rot) * 3.5, z: -(wy - Math.cos(rot) * 3.5), r: 0.2 });
    obstaculos.push({ x: wx - Math.sin(rot) * 3.5, z: -(wy + Math.cos(rot) * 3.5), r: 0.2 });
  }
  scene.add(g);
  placaLivre('Campo do Camping', cx - 24, cy + 5, 6, rot + Math.PI / 2);
}
function portaria() {
  const e = MAPA.portaoEntrada;
  predio(e.x + 7, e.y + 2, 6, 5, 3, -1.2, { placa: 'PORTARIA' });
  // arco de entrada
  const g = new THREE.Group(); g.position.set(e.x + 2, altO(e.x + 2, e.y + 20), -(e.y + 20)); g.rotation.y = -1.2;
  g.add(caixa(0.4, 5, 0.4, M.madeira, -4.5, 2.5, 0)); g.add(caixa(0.4, 5, 0.4, M.madeira, 4.5, 2.5, 0));
  g.add(caixa(9.4, 0.4, 0.4, M.madeira, 0, 5, 0));
  g.add(placa('CAMPING MUNICIPAL', 0, 4.3, 0.25, 8));
  g.add(placa('Lagoa dos Patos - São Lourenço do Sul', 0, 3.4, 0.25, 8));
  // cancela
  g.add(caixa(0.3, 1.1, 0.3, M.metal, -3.5, 0.55, 0.8));
  const cancela = caixa(6.5, 0.12, 0.12, M.vermelho, -0.4, 1.05, 0.8); g.add(cancela);
  scene.add(g);
  obstaculos.push({ x: e.x + 2 + Math.cos(-1.2) * -4.5, z: -(e.y + 20) + Math.sin(1.2) * -4.5, r: 0.5 });
  obstaculos.push({ x: e.x + 2 + Math.cos(-1.2) * 4.5, z: -(e.y + 20) + Math.sin(1.2) * 4.5, r: 0.5 });
}
// Casinha do salva-vidas na praia (torre de madeira sobre estacas) com baú da pederneira
function casinhaSalvaVidas(x, y, rot) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot || 0;
  for (const sx of [-1.4, 1.4]) for (const sz of [-1.4, 1.4]) g.add(caixa(0.22, 2.4, 0.22, M.madeira, sx, 1.2, sz));
  g.add(caixa(3.4, 0.15, 3.4, M.madeira, 0, 2.4, 0));                        // plataforma
  g.add(caixa(2.6, 2.1, 2.6, M.branco, 0, 3.5, -0.2));                       // cabine
  g.add(caixa(1.2, 1.1, 0.06, M.azul, 0, 3.7, 1.12));                        // janela da frente
  const tel = prisma(3.4, 3.2, 1, M.vermelho); tel.position.y = 4.55; g.add(tel);
  // guarda-corpo
  for (const sx of [-1.6, 1.6]) g.add(caixa(0.06, 0.9, 3.4, M.branco, sx, 2.9, 0));
  g.add(caixa(3.4, 0.06, 0.06, M.branco, 0, 3.3, 1.7));
  // escada
  const esc = caixa(0.9, 0.08, 3.2, M.madeira, 2.3, 1.25, 0); esc.rotation.x = 0; esc.rotation.z = -0.65; g.add(esc);
  for (let i = 0; i < 6; i++) g.add(caixa(0.9, 0.06, 0.2, M.madeira, 1.55 + i * 0.3, 0.4 + i * 0.4, 0));
  // boia salva-vidas na parede
  const boia = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.12, 8, 16), M.vermelho); boia.position.set(-1.32, 3.6, 0.4); boia.rotation.y = Math.PI / 2; g.add(boia);
  const boia2 = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.13, 8, 4), M.branco); boia2.position.copy(boia.position); boia2.rotation.y = Math.PI / 2; boia2.rotation.z = Math.PI / 4; g.add(boia2);
  // bandeira vermelha/amarela no topo
  g.add(caixa(0.05, 2, 0.05, M.metal, 1.2, 6, -1.2));
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.6), new THREE.MeshLambertMaterial({ color: 0xf2c94c, side: THREE.DoubleSide })); bd.position.set(1.7, 6.7, -1.2); g.add(bd);
  const bd2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.3), new THREE.MeshLambertMaterial({ color: 0xc8322b, side: THREE.DoubleSide })); bd2.position.set(1.7, 6.55, -1.19); g.add(bd2);
  g.add(placa('SALVA-VIDAS', 0, 4.9, 1.3, 2.6));
  // baú ao pé da escada
  const bau = new THREE.Group(); bau.position.set(3.4, 0, 0.9);
  bau.add(caixa(1.1, 0.6, 0.7, M.madeira, 0, 0.3, 0));
  const tampa = caixa(1.1, 0.18, 0.7, M.tronco, 0, 0.69, 0); bau.add(tampa);
  bau.add(caixa(0.12, 0.7, 0.72, M.metal, -0.3, 0.38, 0)); bau.add(caixa(0.12, 0.7, 0.72, M.metal, 0.3, 0.38, 0));
  const pederneira = caixa(0.25, 0.12, 0.12, M.pedra, 0, 0.5, 0); pederneira.visible = false; bau.add(pederneira);
  g.add(bau);
  scene.add(g);
  bloqueiaCaixa(x, y, 3.4, 3.4, rot);
  const c = Math.cos(rot || 0), sn = Math.sin(rot || 0);
  const bx = x + 3.4 * c + 0.9 * sn, by = y + 3.4 * sn - 0.9 * c;   // posição do baú em osm
  obstaculos.push({ x: bx, z: -by, r: 0.7 });
  return { tampa, pederneira, bauPos: [bx, by] };
}
function iateClube() {
  predio(300, 150, 22, 12, 4.5, 0.3, { placa: 'IATE CLUBE', parede: M.paredeVerde, telhado: M.azul });
  // trapiche
  const g = new THREE.Group(); g.position.set(320, 0, -190);
  g.add(caixa(3, 0.2, 40, M.madeira, 0, 0.3, 0));
  for (let i = -18; i <= 18; i += 6) { g.add(caixa(0.3, 1.5, 0.3, M.madeira, -1.4, 0, i)); g.add(caixa(0.3, 1.5, 0.3, M.madeira, 1.4, 0, i)); }
  scene.add(g);
  // barcos a vela
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Group(); b.position.set(326 + i * 5, -0.2, -(205 - i * 6)); b.rotation.y = rnd(0, 6);
    const casco = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.4, 5, 6), i % 2 ? M.branco : M.azul); casco.rotation.z = Math.PI / 2; casco.scale.set(1, 1, 0.6); casco.position.y = 0.4; b.add(casco);
    b.add(caixa(0.08, 6, 0.08, M.metal, 0, 3.3, 0));
    const vela = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.5), new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide })); vela.position.set(1.2, 3.5, 0); b.add(vela);
    scene.add(b);
  }
}
function sedeEscoteira() {
  const sx = -210, sy = -138;
  predio(sx, sy, 16, 9, 3.6, 0.15, { placa: 'GRUPO ESCOTEIRO GARIBALDI', parede: M.paredeVerde });
  const chamas = fogueira(sx + 24, sy + 2);
  placaLivre('Fogueira do Conselho', sx + 24, sy + 9, 5, 0);
  // círculo de barracas de patrulha
  const cores = [M.lona, M.lona2, M.lona3, M.lona, M.lona2];
  cores.forEach((c, i) => { const a = i / cores.length * 6.283; barraca(sx + 24 + Math.cos(a) * 11, sy + 2 + Math.sin(a) * 11, -a + Math.PI / 2, c, 1.2); });
  // totem de patrulha
  const tot = caixa(0.35, 3.2, 0.35, M.madeira, sx - 10, altO(sx - 10, sy + 6) + 1.6, -(sy + 6)); scene.add(tot);
  obstaculos.push({ x: sx - 10, z: -(sy + 6), r: 0.4 });
  return { chamas, fogueiraPos: [sx + 24, sy + 2] };
}
function mobiliario() {
  // churrasqueiras individuais espalhadas
  const pts = [[-90, -30], [-110, -10], [-75, -5], [-130, -40], [25, 40], [45, 22], [65, 40], [-150, -75], [-175, -95], [120, 140], [140, 120], [-40, -105], [-20, -95], [100, 100], [-190, -80]];
  for (const p of pts) { churrasqueira(p[0], p[1], rnd(0, 3), false); const m = mesaPiquenique(p[0] + 3, p[1] - 2, rnd(0, 3)); }
  churrasqueira(60, -6, 0.3, true); churrasqueira(-120, -128, -0.4, true);
  placaLivre('Churrasqueira Coletiva', 60, 0, 6, 0.3); placaLivre('Churrasqueira Coletiva', -120, -122, 6, -0.4);
  // barracas de campistas
  const tendas = [[-100, -22], [-95, -12], [-105, -35], [-120, -25], [35, 32], [50, 35], [30, 22], [-160, -88], [-168, -100], [125, 132], [138, 138], [-30, -112], [-15, -100], [95, 105], [110, 95]];
  tendas.forEach((t, i) => barraca(t[0], t[1], rnd(0, 6), [M.lona, M.lona2, M.lona3][i % 3], rnd(0.9, 1.3)));
  // chuveiros
  for (const p of [[32, -22], [-82, -100], [150, 20], [-60, -150]]) {
    const g = new THREE.Group(); g.position.set(p[0], 0, -p[1]);
    g.add(caixa(1.4, 0.15, 1.4, M.concreto, 0, 0.07, 0)); g.add(caixa(0.1, 2.6, 0.1, M.metal, 0, 1.3, 0)); g.add(caixa(0.4, 0.08, 0.4, M.metal, 0.2, 2.5, 0));
    scene.add(g); obstaculos.push({ x: p[0], z: -p[1], r: 0.2 });
    placaLivre('Chuveiro', p[0] + 2, p[1], 2.2, 0);
  }
  // tanques de lavar roupa
  const tq = new THREE.Group(); tq.position.set(-40, altO(-40, 20), -20);
  for (let i = 0; i < 4; i++) tq.add(caixa(1.2, 0.9, 0.7, M.concreto, i * 1.4 - 2.1, 0.45, 0));
  tq.add(caixa(6, 0.2, 2.5, M.telhado, 0, 2.6, 0)); tq.add(caixa(0.15, 2.6, 0.15, M.madeira, -2.8, 1.3, 1)); tq.add(caixa(0.15, 2.6, 0.15, M.madeira, 2.8, 1.3, 1)); tq.add(caixa(0.15, 2.6, 0.15, M.madeira, -2.8, 1.3, -1)); tq.add(caixa(0.15, 2.6, 0.15, M.madeira, 2.8, 1.3, -1));
  scene.add(tq); bloqueiaCaixa(-40, 20, 6, 1, 0);
  placaLivre('Tanques', -40, 23, 2.6, 0);
  // lixeiras
  for (const p of [[-20, 0], [-45, -15], [180, 190], [66, -28], [-200, -125]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), M.lenco); l.position.set(p[0], altO(p[0], p[1]) + 0.45, -p[1]); scene.add(l); obstaculos.push({ x: p[0], z: -p[1], r: 0.4 }); }
  // molhe de pedras na ponta leste
  for (let i = 0; i < 40; i++) {
    const t = i / 40, px = 250 + (243 - 250) * t + rnd(-2, 2), py = -95 + (-138 + 95) * t + rnd(-1.5, 1.5);
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(0.5, 1.2), 0), M.pedra); r.position.set(px, altO(px, py) + rnd(-0.1, 0.3), -py); r.rotation.set(rnd(0, 3), rnd(0, 3), 0); r.castShadow = true; scene.add(r);
  }
  placaLivre('Molhe', 252, -92, 3, 0.5);
  placaLivre('Praia do Camping', 70, -22, 5, 0.3);
  // guarda-sóis e cadeiras na praia
  for (let i = 0; i < 6; i++) {
    const x = rnd(0, 120), y = rnd(-30, -70);
    if (!pontoNoPoligono(x, y, MAPA.praia)) continue;
    const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
    g.add(caixa(0.06, 2.2, 0.06, M.metal, 0, 1.1, 0));
    const top = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.5, 8), [M.vermelho, M.amarelo, M.azul][i % 3]); top.position.y = 2.3; top.castShadow = true; g.add(top);
    scene.add(g); obstaculos.push({ x, z: -y, r: 0.15 });
  }
}
function mesaPiquenique(x, y, rot) {
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rot;
  g.add(caixa(1.8, 0.08, 0.8, M.madeira, 0, 0.75, 0));
  g.add(caixa(1.8, 0.06, 0.3, M.madeira, 0, 0.45, 0.7)); g.add(caixa(1.8, 0.06, 0.3, M.madeira, 0, 0.45, -0.7));
  g.add(caixa(0.1, 0.75, 1.6, M.madeira, -0.7, 0.37, 0)); g.add(caixa(0.1, 0.75, 1.6, M.madeira, 0.7, 0.37, 0));
  scene.add(g); bloqueiaCaixa(x, y, 1.8, 1.6, rot);
  return g;
}

// ---------- personagem ----------
const texLobo = (function () {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#1e4fb5'; x.fillRect(0, 0, 128, 128);
  // cabeça
  x.fillStyle = '#9a9a9a'; x.beginPath(); x.moveTo(64, 112); x.lineTo(20, 62); x.lineTo(30, 18); x.lineTo(52, 44); x.lineTo(76, 44); x.lineTo(98, 18); x.lineTo(108, 62); x.closePath(); x.fill();
  // orelhas internas
  x.fillStyle = '#e0c8b0'; x.beginPath(); x.moveTo(34, 28); x.lineTo(44, 48); x.lineTo(30, 52); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(94, 28); x.lineTo(84, 48); x.lineTo(98, 52); x.closePath(); x.fill();
  // focinho claro
  x.fillStyle = '#ddd'; x.beginPath(); x.moveTo(64, 108); x.lineTo(42, 72); x.lineTo(86, 72); x.closePath(); x.fill();
  // olhos e nariz
  x.fillStyle = '#f2c94c'; x.beginPath(); x.ellipse(48, 62, 7, 5, 0, 0, 6.3); x.fill(); x.beginPath(); x.ellipse(80, 62, 7, 5, 0, 0, 6.3); x.fill();
  x.fillStyle = '#111'; x.beginPath(); x.arc(48, 62, 3, 0, 6.3); x.fill(); x.beginPath(); x.arc(80, 62, 3, 0, 6.3); x.fill();
  x.beginPath(); x.moveTo(64, 100); x.lineTo(56, 90); x.lineTo(72, 90); x.closePath(); x.fill();
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
})();
const matLobo = new THREE.MeshLambertMaterial({ map: texLobo });
function corCabeloSob(opts) { return opts.cabelo || M.tronco; }
function escoteiro(opts) {
  // Personagem arredondado (proporções moderadas): cabeça um pouco maior que o normal, corpo e pernas normais
  opts = opts || {};
  const g = new THREE.Group();
  const s = opts.escala || 1;
  const lobinho = !!opts.bone;
  const camisa = opts.corCamisa ? new THREE.MeshLambertMaterial({ color: opts.corCamisa }) : (opts.camisa || (lobinho ? M.camisaLobinho : M.camisa));
  const corShortMat = opts.corShort ? new THREE.MeshLambertMaterial({ color: opts.corShort }) : null;
  const corTenisMat = opts.corTenis ? new THREE.MeshLambertMaterial({ color: opts.corTenis }) : M.branco;
  const corLenco = opts.lenco || (lobinho ? M.lencoAzul : M.lenco);
  const corMeia = lobinho ? M.lencoAzul : M.lenco;

  // pernas (pivô no quadril, y=0.62) com meia e tênis
  const perna = (sx) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.095, 0.56, 10), M.pele);
    p.geometry.translate(0, -0.28, 0); p.position.set(sx * 0.12, 0.62, 0);
    const meia = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 10), corMeia); meia.position.y = -0.46; p.add(meia);
    const tenis = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8), corTenisMat); tenis.scale.set(1, 0.6, 1.45); tenis.position.set(0, -0.58, 0.03); p.add(tenis);
    return p;
  };
  const pernaE = perna(-1), pernaD = perna(1);
  // short e tronco
  const bermuda = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.26, 0.28, 14), corShortMat || opts.calca || (lobinho ? M.sarja : M.bermuda)); bermuda.scale.z = 0.78; bermuda.position.y = 0.7;
  if (opts.calca) { pernaE.material = opts.calca; pernaD.material = opts.calca; }   // calça comprida
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.56, 14), camisa); tronco.scale.z = 0.8; tronco.position.y = 1.1;
  const ombros = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), camisa); ombros.scale.set(1, 0.45, 0.8); ombros.position.y = 1.38;
  // braços (pivô no ombro), manga curta + mão
  const braco = (sx) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.5, 8), M.pele);
    b.geometry.translate(0, -0.25, 0); b.position.set(sx * 0.31, 1.34, 0); b.rotation.z = -sx * 0.12;
    const manga = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.18, 8), camisa); manga.position.y = -0.08; b.add(manga);
    const mao = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), M.pele); mao.position.y = -0.5; b.add(mao);
    return b;
  };
  const bracoE = braco(-1), bracoD = braco(1);
  // lenço
  const rolo = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.045, 8, 16), corLenco); rolo.rotation.x = Math.PI / 2; rolo.position.y = 1.42;
  const lenco = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 3), corLenco); lenco.rotation.x = Math.PI; lenco.rotation.y = Math.PI / 6; lenco.position.set(0, 1.26, 0.19);
  if (opts.moletom) {   // moletom: sem lenço, capuz caído nas costas, bolso canguru, mangas compridas
    rolo.visible = lenco.visible = false;
    const capuz = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), camisa); capuz.position.set(0, 1.36, -0.2); capuz.rotation.x = -1.2; g.add(capuz);
    g.add(caixa(0.3, 0.14, 0.06, camisa, 0, 0.95, 0.22));
    for (const b of [bracoE, bracoD]) { const manga = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.42, 8), camisa); manga.position.y = -0.2; b.add(manga); }
  }
  if (lobinho) { const borda = new THREE.Mesh(new THREE.ConeGeometry(0.245, 0.42, 3), M.amarelo); borda.rotation.x = Math.PI; borda.rotation.y = Math.PI / 6; borda.position.set(0, 1.25, 0.17); g.add(borda); }
  // cabeça
  const R = 0.3;
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(R, 18, 14), M.pele); cabeca.scale.set(1, 0.96, 0.96); cabeca.position.y = 1.72;
  const olho = (sx) => {
    // olhos redondinhos, mais baixos (longe da aba do boné, pra não parecer franzido)
    const o = new THREE.Group(); o.position.set(sx * 0.115, 1.7, 0.285);
    const br = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), M.branco); br.scale.set(1, 1.4, 0.5); o.add(br);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), M.preto); pu.scale.set(1, 1.35, 0.5); pu.position.set(0, -0.004, 0.03); o.add(pu);
    const br2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), M.branco); br2.position.set(-sx * 0.014, 0.026, 0.055); o.add(br2);
    return o;
  };
  const olhoE = olho(-1), olhoD = olho(1);
  // sobrancelhas: arcos simétricos (∩), finos e bem acima dos olhos — nunca inclinados pra dentro
  const sobs = [-1, 1].map(sx => { const sob = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.005, 5, 10, Math.PI * 0.6), corCabeloSob(opts)); sob.rotation.z = Math.PI * 0.2; sob.position.set(sx * 0.115, 1.83, 0.29); g.add(sob); return sob; });
  // sorriso: arco virado pra cima
  const boca = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 6, 14, Math.PI), new THREE.MeshLambertMaterial({ color: 0x8a4a3a })); boca.rotation.z = Math.PI; boca.scale.set(1, 0.7, 1); boca.position.set(0, 1.61, 0.3);
  if (opts.oculos && opts.oculosEstilo !== 'nenhum') {
    const cor = opts.corOculos ? new THREE.MeshLambertMaterial({ color: opts.corOculos }) : M.preto;
    for (const sx of [-1, 1]) {
      const aro = opts.oculosEstilo === 'quadrado'
        ? (() => { const q = new THREE.Group(); for (const [w, h, x, y] of [[0.17, 0.012, 0, 0.075], [0.17, 0.012, 0, -0.075], [0.012, 0.16, 0.085, 0], [0.012, 0.16, -0.085, 0]]) q.add(caixa(w, h, 0.012, cor, x, y, 0)); return q; })()
        : new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), cor);
      aro.position.set(sx * 0.11, 1.74, 0.29); g.add(aro);
    }
    const ponte = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), cor); ponte.position.set(0, 1.75, 0.3); g.add(ponte);
    for (const sx of [-1, 1]) { const haste = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.26), cor); haste.position.set(sx * 0.2, 1.75, 0.16); g.add(haste); }
  }
  const bochecha = (sx) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf2a6a0 })); b.scale.set(1, 0.6, 0.35); b.position.set(sx * 0.2, 1.62, 0.215); return b; };
  const corCabelo = opts.corCabelo ? new THREE.MeshLambertMaterial({ color: opts.corCabelo }) : (opts.cabelo || M.tronco);
  const cabelo = new THREE.Group();
  const calota = new THREE.Mesh(new THREE.SphereGeometry(R + 0.01, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), corCabelo); calota.scale.set(1, 0.96, 0.97); calota.position.y = 1.75; calota.rotation.x = -0.05; cabelo.add(calota);
  if (opts.estiloCabelo === 'longo') {
    // cabelo comprido caindo nas costas e nos lados
    const costas = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 0.75, 14, 1, false, Math.PI * 0.55, Math.PI * 0.9), corCabelo); costas.position.set(0, 1.45, -0.02); cabelo.add(costas);
    for (const sx of [-1, 1]) { const mecha = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.62, 8), corCabelo); mecha.position.set(sx * 0.27, 1.5, 0.12); cabelo.add(mecha); }
    const franja = new THREE.Mesh(new THREE.SphereGeometry(R + 0.015, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.22), corCabelo); franja.position.y = 1.8; franja.rotation.x = 0.2; cabelo.add(franja);
  } else if (opts.estiloCabelo === 'rabo') {
    const rabo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.6, 8), corCabelo); rabo.position.set(0, 1.5, -0.3); rabo.rotation.x = 0.25; cabelo.add(rabo);
    const el = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 6, 10), new THREE.MeshLambertMaterial({ color: opts.corLaco || 0xffd54a })); el.position.set(0, 1.78, -0.27); el.rotation.x = 0.4; cabelo.add(el);
  } else if (opts.estiloCabelo === 'trancas') {
    for (const sx of [-1, 1]) { const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.7, 8), corCabelo); tr.position.set(sx * 0.26, 1.4, 0.05); cabelo.add(tr); for (let h = 0; h < 3; h++) { const an = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 6, 10), new THREE.MeshLambertMaterial({ color: opts.corLaco || 0xffd54a })); an.position.set(sx * 0.26, 1.6 - h * 0.2, 0.05); an.rotation.x = Math.PI / 2; cabelo.add(an); } }
  } else if (opts.estiloCabelo === 'coque') {
    const cq = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), corCabelo); cq.position.set(0, 1.98, -0.12); cabelo.add(cq);
  } else if (opts.estiloCabelo === 'cacheado') {
    // cachos curtos: bolinhas em volta do topo e da nuca
    // cachos curtos saindo por baixo do boné (laterais e nuca), nenhum atravessa o boné
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 6.283, r = R + 0.03;
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), corCabelo);
      c.position.set(Math.cos(a) * r * 0.95, 1.70 + (i % 2 ? 0.06 : 0), Math.sin(a) * r * 0.9 - 0.03);
      if (c.position.z > 0.12) continue;   // não cobre o rosto
      cabelo.add(c);
    }
  }
  if (opts.pulseira) { const pu = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 6, 12), new THREE.MeshLambertMaterial({ color: opts.pulseira })); pu.position.y = -0.44; bracoD.add(pu); for (let i = 0; i < 6; i++) { const mi = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshLambertMaterial({ color: [0xff5d5d, 0xffd54a, 0x5dd5ff, 0x8be78b][i % 4] })); const a = i / 6 * 6.283; mi.position.set(Math.cos(a) * 0.075, -0.44, Math.sin(a) * 0.075); bracoD.add(mi); } }
  if (opts.relogio) { const rl = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 6, 12), M.preto); rl.position.y = -0.42; bracoE.add(rl); const vis = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), new THREE.MeshLambertMaterial({ color: opts.relogio === true ? 0x2c5bb5 : opts.relogio })); vis.rotation.z = Math.PI / 2; vis.position.set(-0.075, -0.42, 0); bracoE.add(vis); }
  if (opts.biscoito) { const bi = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), new THREE.MeshLambertMaterial({ color: 0xc98a3a })); bi.position.set(0.03, -0.52, 0.06); bi.rotation.x = 1.2; bracoD.add(bi); for (let i = 0; i < 4; i++) { const ch = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 5), M.tronco); const a = i * 1.6; ch.position.set(0.03 + Math.cos(a) * 0.03, -0.51, 0.06 + Math.sin(a) * 0.03); bracoD.add(ch); } }
  if (opts.aura) { const au = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: 0.16, depthWrite: false })); au.scale.set(1, 1.35, 1); au.position.y = 1.05; g.add(au); const lz = new THREE.PointLight(0xffd54a, 0.8, 5); lz.position.y = 1.2; g.add(lz); g.userData.aura = au; }
  // baquetas (Caio): ficam escondidas até batucar
  if (opts.baquetas) {
    const baq = [bracoE, bracoD].map(b => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.42, 6), opts.corBaquetas ? new THREE.MeshLambertMaterial({ color: opts.corBaquetas }) : M.madeira); m.position.set(0, -0.5, 0.18); m.rotation.x = -1.2; m.visible = false; b.add(m); return m; });
    g.userData.baquetas = baq;
  }
  // sensor de glicose (Libre) no braço esquerdo
  if (opts.sensor) { const sen = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 12), M.branco); sen.rotation.z = Math.PI / 2; sen.position.set(-0.065, -0.2, -0.01); bracoE.add(sen); }
  // chapéu ou boné
  const chapeu = new THREE.Group();
  if (opts.boneEstilo === 'ash') {
    // boné estilo Ash: vermelho com a frente branca e o símbolo verde
    chapeu.position.y = 1.75;
    const verm = new THREE.MeshLambertMaterial({ color: 0xd8342a });
    const copa = new THREE.Mesh(new THREE.SphereGeometry(R + 0.03, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), verm); copa.scale.set(1, 0.9, 0.97); copa.position.y = 0.03; chapeu.add(copa);
    // painel branco na FRENTE (phi centrado em π/2 = +z), cobrindo só a metade de baixo da copa
    const frente = new THREE.Mesh(new THREE.SphereGeometry(R + 0.036, 18, 10, Math.PI * 0.14, Math.PI * 0.72, Math.PI * 0.16, Math.PI / 2.6 - Math.PI * 0.16), M.branco); frente.scale.set(1, 0.9, 0.97); frente.position.y = 0.03; chapeu.add(frente);
    const pala = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 16, 1, false, -Math.PI / 3.2, Math.PI / 1.6), verm); pala.position.set(0, 0.2, 0.08); pala.rotation.x = 0.12; chapeu.add(pala);
    const logo = new THREE.Mesh(new THREE.CircleGeometry(0.095, 14, Math.PI, Math.PI), new THREE.MeshLambertMaterial({ color: 0x2e9e4a, side: THREE.DoubleSide })); logo.position.set(0, 0.27, 0.325); logo.rotation.x = -0.45; chapeu.add(logo);
  } else if (opts.boneEstilo === 'tiara') {
    // arco de orelha a orelha por cima da cabeça (plano XY), levemente inclinado pra trás, com lacinho do lado
    const ti = new THREE.Mesh(new THREE.TorusGeometry(R + 0.03, 0.025, 8, 24, Math.PI), new THREE.MeshLambertMaterial({ color: opts.corTiara || 0xe84a8a })); ti.position.set(0, 1.72, 0.04); ti.rotation.x = 0.28; chapeu.add(ti);
    for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), ti.material); l.scale.set(1.3, 0.8, 0.6); l.position.set(0.2 + sx * 0.06, 1.98, -0.02); l.rotation.z = sx * 0.6; chapeu.add(l); }
    const no = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), ti.material); no.position.set(0.2, 1.98, -0.02); chapeu.add(no);
  } else if (opts.boneEstilo === 'bandana') {
    const cor = new THREE.MeshLambertMaterial({ color: opts.corBandana || 0xd8342a });
    const faixa = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.03, R + 0.035, 0.12, 18, 1, true), cor); faixa.position.y = 1.86; faixa.material.side = THREE.DoubleSide; chapeu.add(faixa);
    const no = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), cor); no.position.set(0, 1.86, -R - 0.02); chapeu.add(no);
    for (const sx of [-1, 1]) { const ponta = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.03), cor); ponta.position.set(sx * 0.05, 1.74, -R - 0.03); ponta.rotation.z = sx * 0.35; chapeu.add(ponta); }
  } else if (opts.boneEstilo === 'nenhum') {
    calota.scale.set(1.01, 0.98, 0.99);
  } else if (opts.boneEstilo === 'chapeu') {
    chapeu.position.y = 1.94;
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 18), M.madeira); chapeu.add(aba);
    const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.28, 14), M.madeira); copa.position.y = 0.15; chapeu.add(copa);
    const fita = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.06, 14), corLenco); fita.position.y = 0.05; chapeu.add(fita);
  } else if (opts.semChapeu) {
    // cabelo bem curtinho (raspado): só uma calota fininha
    calota.scale.set(1.005, 0.97, 0.98); calota.material = corCabelo;
  } else if (opts.bone) {
    chapeu.position.y = 1.75;
    const copa = new THREE.Mesh(new THREE.SphereGeometry(R + 0.03, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), M.boneAzul); copa.scale.set(1, 0.9, 0.97); copa.position.y = 0.03; chapeu.add(copa);
    const pala = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 16, 1, false, -Math.PI / 3.2, Math.PI / 1.6), M.boneAzul); pala.position.set(0, 0.2, 0.08); pala.rotation.x = 0.12; chapeu.add(pala);
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.19), matLobo); cara.position.set(0, 0.2, 0.27); cara.rotation.x = -0.55; chapeu.add(cara);
  } else if (opts.touca) {
    // touquinha militar preta, justa na cabeça, com a dobra na borda
    const oliva = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });   // touca preta
    chapeu.position.y = 1.72;
    const gorro = new THREE.Mesh(new THREE.SphereGeometry(R + 0.035, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), oliva); gorro.scale.set(1, 1.05, 0.97); chapeu.add(gorro);
    const dobra = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.05, R + 0.045, 0.12, 18), oliva); dobra.position.y = 0.06; dobra.scale.z = 0.97; chapeu.add(dobra);
  } else {
    chapeu.position.y = 1.94;
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 18), M.madeira); chapeu.add(aba);
    const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.28, 14), M.madeira); copa.position.y = 0.15; chapeu.add(copa);
    const fita = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.06, 14), corLenco); fita.position.y = 0.05; chapeu.add(fita);
  }
  const mochila = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.17), opts.corMochila ? new THREE.MeshLambertMaterial({ color: opts.corMochila }) : (opts.mochila || M.lona2)); mochila.position.set(0, 1.1, -0.28);
  const bolso = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.05), M.amarelo); bolso.position.set(0, 1.02, -0.39);
  if (opts.moletom) mochila.visible = bolso.visible = false;
  const bochechas = opts.semBochecha ? [] : [bochecha(-1), bochecha(1)];
  g.add(pernaE, pernaD, bermuda, tronco, ombros, bracoE, bracoD, rolo, lenco, cabeca, olhoE, olhoD, boca, ...bochechas, cabelo, chapeu, mochila, bolso);
  // bolsa transversal (alça do ombro esquerdo até o quadril direito)
  if (opts.bolsa) {
    const corBolsa = new THREE.MeshLambertMaterial({ color: opts.corBolsa || 0xf4f4f4 });
    const alca = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 6), corBolsa); alca.position.set(0.06, 1.12, 0.23); alca.rotation.z = 0.62; g.add(alca);
    const alca2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 6), corBolsa); alca2.position.set(0.06, 1.12, -0.23); alca2.rotation.z = 0.62; g.add(alca2);
    const bolsa = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.26), corBolsa); bolsa.position.set(0.32, 0.78, 0.02); g.add(bolsa);
    const tampa = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.27), new THREE.MeshLambertMaterial({ color: 0xe6e6e6 })); tampa.position.set(0.32, 0.84, 0.02); g.add(tampa);
    const fecho = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), M.amarelo); fecho.position.set(0.41, 0.8, 0.02); g.add(fecho);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  chapeu.traverse(o => { if (o.isMesh) o.castShadow = false; });
  cabelo.traverse(o => { if (o.isMesh) o.castShadow = false; });
  g.scale.setScalar(s);
  g.userData = Object.assign(g.userData || {}, { pernaE, pernaD, bracoE, bracoD, olhos: [olhoE, olhoD], sobs, boca, emote: 'feliz', emoteAte: 0 });
  return g;
}
// Emotes: mudam olhos (posição), sobrancelhas (inclinação) e boca
const EMOTES = {
  feliz:    { olhoX: 0.115, olhoY: 1.7,  sobZ: 0.2,   sobY: 1.83, bocaRot: Math.PI, bocaEsc: 0.7, bocaY: 1.61 },
  bravo:    { olhoX: 0.085, olhoY: 1.69, sobZ: -0.18, sobY: 1.79, bocaRot: 0,       bocaEsc: 0.6, bocaY: 1.58 },   // olhos pra dentro + sobrancelha em V
  triste:   { olhoX: 0.12,  olhoY: 1.68, sobZ: 0.55,  sobY: 1.81, bocaRot: 0,       bocaEsc: 0.5, bocaY: 1.58 },
  surpreso: { olhoX: 0.12,  olhoY: 1.72, sobZ: 0.2,   sobY: 1.87, bocaRot: 0,       bocaEsc: 1.6, bocaY: 1.6 },
  serio:    { olhoX: 0.115, olhoY: 1.7,  sobZ: 0.2,   sobY: 1.8,  bocaRot: 0,       bocaEsc: 0.12, bocaY: 1.6 },   // sobrancelha baixa, boca reta
  dormindo: { olhoX: 0.115, olhoY: 1.7,  sobZ: 0.2,   sobY: 1.82, bocaRot: Math.PI, bocaEsc: 0.4,  bocaY: 1.61 },
};
function aplicaEmote(mesh, nome, dur) {
  const u = mesh.userData, e = EMOTES[nome]; if (!u.olhos || !e) { if (typeof DEBUG !== 'undefined' && DEBUG) aviso('emote falhou: ' + nome + ' olhos=' + !!u.olhos, 3000); return; }
  u.emote = nome; u.emoteAte = dur ? tempo + dur : 0;
  u.olhos.forEach((o, i) => { const sx = i ? 1 : -1; o.position.x = sx * e.olhoX; o.position.y = e.olhoY; o.scale.y = nome === 'dormindo' ? 0.12 : 1; });
  u.sobs.forEach((sb, i) => { const sx = i ? 1 : -1; sb.rotation.z = Math.PI * 0.2 + (sx > 0 ? -1 : 1) * (e.sobZ - 0.2) * (nome === 'bravo' || nome === 'triste' ? 1 : 0); sb.position.y = e.sobY; sb.rotation.y = 0;
    if (nome === 'bravo') { sb.rotation.z = Math.PI * 0.2 + sx * 0.7; } else if (nome === 'triste') { sb.rotation.z = Math.PI * 0.2 - sx * 0.6; } else if (nome === 'serio') { sb.rotation.z = Math.PI * 0.2; sb.scale.set(1.3, 0.35, 1); } else sb.rotation.z = Math.PI * 0.2;
    if (nome !== 'serio') sb.scale.set(1, 1, 1); });
  u.boca.rotation.z = e.bocaRot; u.boca.scale.set(nome === 'surpreso' ? 0.8 : 1, e.bocaEsc, 1); u.boca.position.y = e.bocaY;
}

// ---------- carro: Trailblazer branca ----------
function trailblazer() {
  const g = new THREE.Group();
  const branco = new THREE.MeshLambertMaterial({ color: 0xf7f7f7 }), vidro = new THREE.MeshLambertMaterial({ color: 0x2a3a4a }), preto = M.preto, cromo = M.metal;
  const corpo = caixa(4.9, 0.75, 1.95, branco, 0, 0.75, 0); g.add(corpo);                       // carroceria baixa
  const cabine = caixa(3.1, 0.7, 1.85, branco, -0.35, 1.45, 0); g.add(cabine);                  // cabine alta (SUV)
  const capo = caixa(1.35, 0.12, 1.85, branco, 1.75, 1.15, 0); g.add(capo);
  g.add(caixa(3.0, 0.5, 1.87, vidro, -0.35, 1.5, 0));                                           // faixa de vidros
  const parabrisa = caixa(0.9, 0.55, 1.8, vidro, 1.25, 1.42, 0); parabrisa.rotation.z = 0.45; g.add(parabrisa);
  g.add(caixa(4.9, 0.12, 1.99, preto, 0, 0.4, 0));                                              // saia
  g.add(caixa(0.2, 0.35, 1.6, preto, 2.48, 0.75, 0)); g.add(caixa(0.05, 0.25, 1.2, cromo, 2.52, 0.78, 0));   // grade
  for (const sz of [-1, 1]) { g.add(caixa(0.1, 0.18, 0.4, M.amarelo, 2.5, 0.95, sz * 0.7)); g.add(caixa(0.1, 0.15, 0.3, M.vermelho, -2.5, 0.95, sz * 0.75)); }
  g.add(caixa(3.2, 0.06, 1.2, preto, -0.3, 1.83, 0));                                           // rack no teto
  for (const sx of [-1.55, 1.55]) for (const sz of [-1, 1]) {
    const roda = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 14), preto); roda.rotation.x = Math.PI / 2; roda.position.set(sx, 0.4, sz * 0.95); roda.castShadow = true; g.add(roda);
    const calota = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10), cromo); calota.rotation.x = Math.PI / 2; calota.position.copy(roda.position); g.add(calota);
  }
  for (const sz of [-1, 1]) { g.add(caixa(0.9, 0.04, 0.08, cromo, 0.1, 1.05, sz * 0.99)); g.add(caixa(0.9, 0.04, 0.08, cromo, -1.2, 1.05, sz * 0.99)); g.add(caixa(0.02, 0.4, 1.8, preto, -0.1, 1.15, sz * 0.02)); } // maçanetas
  g.add(caixa(0.4, 0.15, 0.7, M.branco, -2.52, 0.62, 0)); // placa
  scene.add(g);
  return g;
}

// ---------- cachorros ----------
const cachorros = [];
function cachorro(x, y, opts) {
  // opts: cima (material), baixo (material), galgo (corpo fino, pernas longas), escala, nome, fala
  const g = new THREE.Group(); g.position.set(x, altO(x, y), -y); g.rotation.y = rnd(0, 6.28);
  const galgo = !!opts.galgo, s = opts.escala || 1;
  const cima = opts.cima, baixo = opts.baixo || opts.cima;
  const compr = galgo ? 0.95 : 0.8, alt = galgo ? 0.34 : 0.4, larg = galgo ? 0.22 : 0.34, perna = galgo ? 0.5 : 0.32;
  const corpoC = caixa(larg, alt * 0.55, compr, cima, 0, perna + alt * 0.72, 0);
  const corpoB = caixa(larg * 0.95, alt * 0.5, compr * 0.95, baixo, 0, perna + alt * 0.25, 0);
  const pescoco = caixa(larg * 0.6, galgo ? 0.42 : 0.28, larg * 0.6, cima, 0, perna + alt + (galgo ? 0.12 : 0.05), compr * 0.42);
  pescoco.rotation.x = galgo ? -0.6 : -0.4;
  const cabeca = caixa(larg * 0.75, galgo ? 0.2 : 0.26, galgo ? 0.28 : 0.26, cima, 0, perna + alt + (galgo ? 0.42 : 0.28), compr * 0.55);
  const focinho = caixa(larg * 0.45, galgo ? 0.12 : 0.16, galgo ? 0.3 : 0.2, baixo, 0, perna + alt + (galgo ? 0.36 : 0.22), compr * 0.55 + (galgo ? 0.26 : 0.2));
  const orelhaE = caixa(0.06, 0.14, 0.1, cima, -larg * 0.35, perna + alt + (galgo ? 0.52 : 0.4), compr * 0.5); orelhaE.rotation.z = galgo ? 0.5 : 0;
  const orelhaD = orelhaE.clone(); orelhaD.position.x = larg * 0.35; orelhaD.rotation.z = galgo ? -0.5 : 0;
  const pernas = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pr = caixa(galgo ? 0.07 : 0.1, perna, galgo ? 0.08 : 0.11, sz > 0 ? cima : baixo, sx * larg * 0.36, perna / 2, sz * compr * 0.38);
    pr.geometry.translate(0, -perna / 2, 0); pr.position.y = perna; pernas.push(pr); g.add(pr);
  }
  const rabo = caixa(0.05, 0.05, galgo ? 0.45 : 0.3, cima, 0, perna + alt * 0.7, -compr * 0.5 - 0.15); rabo.rotation.x = galgo ? 0.5 : -0.6;
  const olhos = [-1, 1].map(sx => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), M.preto); o.position.set(sx * larg * 0.3, perna + alt + (galgo ? 0.46 : 0.32), compr * 0.55 + 0.1); return o; });
  g.add(corpoC, corpoB, pescoco, cabeca, focinho, orelhaE, orelhaD, rabo, ...olhos);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(s);
  scene.add(g);
  const c = { mesh: g, pernas, rabo, olhos, nome: opts.nome, fase: rnd(0, 6), seguindo: false, x, y, vel: 0 };
  cachorros.push(c);
  obstaculos.push(c.obst = { x, z: -y, r: 0.5 * s });
  return c;
}

// ---------- montagem do mundo ----------
terreno();
vegetacao();
predio(MAPA.lanchonete.x, MAPA.lanchonete.y, MAPA.lanchonete.w, MAPA.lanchonete.d, 3.2, MAPA.lanchonete.rot, { placa: 'CANTINA - LANCHONETE DO CAMPING' });
predio(MAPA.banheiros.x, MAPA.banheiros.y, MAPA.banheiros.w, MAPA.banheiros.d, 3, MAPA.banheiros.rot, { placa: 'BANHEIROS', parede: M.concreto });
predio(-150, -150, 8, 7, 3, 0.4, { placa: 'BANHEIROS', parede: M.concreto });
predio(-100, 5, 7, 5, 2.8, -0.5, { placa: 'ADMINISTRAÇÃO' });
portaria();
campoFutebol();
quadraVolei(120, -2, 0.3);
quadraBocha(-70, -70, 0.2);
playground(0, -62);
placaLivre('Playground', -10, -52, 3.5, 0);
const ARV_BAND = [-34, 2];   // em frente à cantina
const ARV_BASE = altO(-34, 2);
const ARV_TOPO = 4.1 + ARV_BASE;        // altura da forquilha dos galhos (absoluta)
const ARV_GALHOS = [0.4, 1.9, 3.1, 4.6];   // direção (rad) dos galhos grossos
const ESC_ANG = Math.PI / 2;               // lado da árvore onde a escada encosta (osm: sul, virada pra cantina)
const ESC_ALT = 2.6, ESC_BASE = 2.2, ESC_TOPO = 1.0;    // altura do A de bambu e distância do tronco na base/topo
function pontoEscada(h) {                  // posição (mundo) no caminho de subida para a altura h
  const t = Math.min(1, Math.max(0, h / ESC_ALT));
  const d = h <= ESC_ALT ? ESC_BASE + (ESC_TOPO - ESC_BASE) * t : ESC_TOPO + 0.9 * Math.min(1, (h - ESC_ALT) / 1.5);
  return { x: ARV_BAND[0] + Math.cos(ESC_ANG) * d, z: -ARV_BAND[1] + Math.sin(ESC_ANG) * d };
}
const sede = sedeEscoteira();

const bandeira = arvoreDaBandeira(ARV_BAND[0], ARV_BAND[1]);

placaLivre('Árvore do lobinhos.com', ARV_BAND[0] - 7, ARV_BAND[1] - 4, 5, 0.4);
placaLivre('batizada pela alcateia', ARV_BAND[0] - 7, ARV_BAND[1] - 4, 3.4, 0.4, 1.55);
escadaBambu();
mobiliario();
const SALVA = [95, -17];
const salva = casinhaSalvaVidas(SALVA[0], SALVA[1], Math.PI);
iateClube();

// ---------- jogador ----------
const PERSONAGENS = {
  lara: { nome: 'Lara', opts: { bone: true, escala: 0.84, estiloCabelo: 'longo', cabelo: new THREE.MeshLambertMaterial({ color: 0x141414 }), sensor: true, bolsa: true } },
  caio: { nome: 'Caio', opts: { bone: true, escala: 0.9, estiloCabelo: 'cacheado', cabelo: new THREE.MeshLambertMaterial({ color: 0x141414 }), baquetas: true } },
};
PERSONAGENS.dudu = { nome: 'Dudu', opts: { bone: true, escala: 0.85, cabelo: new THREE.MeshLambertMaterial({ color: 0xe8c95a }), oculos: true }, npc: 'Lobinho Dudu' };
PERSONAGENS.maria = { nome: 'Maria', opts: { bone: true, escala: 0.84, estiloCabelo: 'longo', cabelo: new THREE.MeshLambertMaterial({ color: 0x5a3a1e }) }, npc: 'Lobinha Maria' };
// personalização (boné, cores, óculos) por personagem — salva no navegador
const BONES = [['lobinho', 'Boné de lobinho 🐺'], ['ash', 'Boné do Ash ⚡'], ['chapeu', 'Chapéu escoteiro'], ['nenhum', 'Sem boné']];
const PERSONALIZACOES = {
  lara: [
    ['boneEstilo', 'Boné', 'select', BONES.concat([['tiara', 'Tiara com laço 🎀']])], ['corTiara', 'Cor da tiara', 'color', '#e84a8a'],
    ['estiloCabelo', 'Cabelo', 'select', [['longo', 'Solto e comprido'], ['rabo', 'Rabo de cavalo'], ['trancas', 'Tranças']]], ['corCabelo', 'Cor do cabelo', 'color', '#141414'],
    ['corBolsa', 'Cor da bolsa', 'color', '#f4f4f4'], ['corCamisa', 'Camisa', 'color', '#2f63c4'], ['corShort', 'Short', 'color', '#1c3f8f'], ['corTenis', 'Tênis', 'color', '#f4f4f4'],
    ['pulseira', 'Pulseira de miçanga', 'color', '#ff5d5d'], ['sensor', 'Sensor Libre no braço', 'check', true],
  ],
  caio: [
    ['boneEstilo', 'Boné', 'select', BONES.concat([['bandana', 'Bandana 🏴']])], ['corBandana', 'Cor da bandana', 'color', '#d8342a'],
    ['corCabelo', 'Cor do cabelo', 'color', '#141414'], ['corBaquetas', 'Cor das baquetas', 'color', '#8b5e34'], ['corMochila', 'Mochila', 'color', '#d9822b'],
    ['corCamisa', 'Camisa', 'color', '#2f63c4'], ['corShort', 'Short', 'color', '#1c3f8f'], ['corTenis', 'Tênis', 'color', '#f4f4f4'],
    ['relogio', 'Relógio no pulso', 'check', false], ['oculos', 'Óculos', 'check', false],
  ],
  dudu: [
    ['oculosEstilo', 'Óculos', 'select', [['redondo', 'Redondos'], ['quadrado', 'Quadrados'], ['nenhum', 'Sem óculos']]], ['corOculos', 'Cor da armação', 'color', '#222222'],
    ['boneEstilo', 'Boné', 'select', BONES], ['corCabelo', 'Cor do cabelo', 'color', '#e8c95a'], ['corMochila', 'Mochila', 'color', '#d9822b'],
    ['corCamisa', 'Camisa', 'color', '#2f63c4'], ['corShort', 'Short', 'color', '#1c3f8f'], ['corTenis', 'Tênis', 'color', '#f4f4f4'],
    ['aura', 'Aura 67 ✨ (brilho)', 'check', false],
  ],
  maria: [
    ['estiloCabelo', 'Cabelo', 'select', [['longo', 'Solto e comprido'], ['coque', 'Coque'], ['trancas', 'Tranças'], ['rabo', 'Rabo de cavalo']]], ['corCabelo', 'Cor do cabelo', 'color', '#5a3a1e'], ['corLaco', 'Cor do laço/elástico', 'color', '#ffd54a'],
    ['boneEstilo', 'Boné', 'select', BONES.concat([['tiara', 'Tiara com laço 🎀']])], ['pulseira', 'Pulseira de miçanga', 'color', '#8be78b'], ['biscoito', 'Biscoito na mão 🍪', 'check', true],
    ['corMochila', 'Mochila', 'color', '#d9822b'], ['corCamisa', 'Camisa', 'color', '#2f63c4'], ['corShort', 'Short', 'color', '#1c3f8f'], ['corTenis', 'Tênis', 'color', '#f4f4f4'],
  ],
};
function padraoPerso(id) { const o = {}; for (const [k, , tipo, def] of PERSONALIZACOES[id]) o[k] = tipo === 'select' ? def[0][0] : tipo === 'color' ? '' : def; return o; }
let personalizacao = { lara: padraoPerso('lara'), caio: padraoPerso('caio'), dudu: padraoPerso('dudu'), maria: padraoPerso('maria') };
try { const sv = JSON.parse(localStorage.getItem('escoteiros.personalizacao') || 'null'); if (sv) for (const k in sv) personalizacao[k] = Object.assign({}, personalizacao[k] || PADRAO_PERSO, sv[k]); } catch (e) {}
function optsPersonagem(id) {
  const base = Object.assign({}, PERSONAGENS[id].opts), pz = personalizacao[id] || padraoPerso(id), o = {};
  const cor = v => parseInt(String(v).replace('#', ''), 16);
  for (const [k, , tipo, def] of PERSONALIZACOES[id]) {
    const v = pz[k];
    if (tipo === 'select') { if (k === 'boneEstilo') { if (v && v !== 'lobinho') o.boneEstilo = v; } else if (k === 'oculosEstilo') { o.oculosEstilo = v; o.oculos = v !== 'nenhum'; } else o[k] = v; }
    else if (tipo === 'color') { if (v) { if (k === 'pulseira') o.pulseira = cor(v); else o[k] = cor(v); } else if (k === 'pulseira' && id === 'maria') o.pulseira = cor(def); }
    else if (tipo === 'check') { o[k] = !!v; if (k === 'relogio') o.relogio = !!v; }
  }
  if (id === 'dudu' && o.oculosEstilo === undefined) o.oculos = true;
  return Object.assign(base, o);
}
let personagemId = 'lara';
try { personagemId = localStorage.getItem('escoteiros.personagem') || 'lara'; } catch (e) {}
if (!PERSONAGENS[personagemId]) personagemId = 'lara';
let jogador = escoteiro(optsPersonagem(personagemId));
function atualizaPlacasBarraca() {
  if (typeof placasBarraca === 'undefined' || !placasBarraca) return;
  const eu = PERSONAGENS[personagemId].nome, g = personagemId === 'lara' ? 'Caio' : 'Lara';
  const troca = (grupo, txt) => { const old = grupo.children.find(c => c.geometry && c.geometry.type === 'PlaneGeometry'); if (old) { grupo.remove(old); grupo.add(placa(txt, 0, 1.3, 0.1, 2.6)); } };
  troca(placasBarraca[0], g); troca(placasBarraca[1], eu);
}
function escolhePersonagem(id) {
  if (!PERSONAGENS[id]) return;
  personagemId = id; try { localStorage.setItem('escoteiros.personagem', id); } catch (e) {}
  const pos = jogador.position.clone(), rot = jogador.rotation.y;
  scene.remove(jogador); jogador = escoteiro(optsPersonagem(id)); jogador.position.copy(pos); jogador.rotation.y = rot; scene.add(jogador);
  document.querySelectorAll('#inicio .perso').forEach(el => el.classList.toggle('sel', el.dataset.id === id));
  atualizaPlacasBarraca();
  if (painelP.style.display === 'block') { personalizandoId = id; desenhaPersonalizar(); }
}
// painel "Personalizar" do menu
const painelP = document.getElementById('personalizar');
let personalizandoId = null;
function desenhaPersonalizar() {
  personalizandoId = personalizandoId || personagemId;
  const id = personalizandoId, pz = personalizacao[id];
  let html = '<b>🎨 Personalizar</b> ' + ['lara', 'caio', 'dudu', 'maria'].map(i => '<span class="quem' + (i === id ? ' sel' : '') + '" data-id="' + i + '">' + PERSONAGENS[i].nome + '</span>').join(' ') + '<br>';
  for (const [k, label, tipo, def] of PERSONALIZACOES[id]) {
    if (tipo === 'select') html += '<label>' + label + ' <select data-k="' + k + '">' + def.map(([v, l]) => '<option value="' + v + '"' + (pz[k] === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>';
    else if (tipo === 'color') html += '<label>' + label + ' <input type="color" data-k="' + k + '" value="' + (pz[k] || def) + '"></label>';
    else html += '<label><input type="checkbox" data-k="' + k + '"' + (pz[k] ? ' checked' : '') + '> ' + label + '</label>';
  }
  html += '<span class="reset">↺ padrão</span>';
  painelP.innerHTML = html;
  painelP.querySelectorAll('.quem').forEach(el => el.addEventListener('click', () => { personalizandoId = el.dataset.id; desenhaPersonalizar(); if (PERSONAGENS[personalizandoId] && (personalizandoId === 'lara' || personalizandoId === 'caio')) escolhePersonagem(personalizandoId); }));
  painelP.querySelectorAll('[data-k]').forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.k; pz[k] = el.type === 'checkbox' ? el.checked : el.value;
    try { localStorage.setItem('escoteiros.personalizacao', JSON.stringify(personalizacao)); } catch (e) {}
    aplicaPersonalizacao(id);
  }));
  painelP.querySelector('.reset').addEventListener('click', () => { personalizacao[id] = padraoPerso(id); try { localStorage.setItem('escoteiros.personalizacao', JSON.stringify(personalizacao)); } catch (e) {} desenhaPersonalizar(); aplicaPersonalizacao(id); });
}
// aplica no jogador (se for o escolhido), nos jogadores extras e nos NPCs Dudu/Maria da roda
function aplicaPersonalizacao(id) {
  if (id === personagemId) escolhePersonagem(id);
  for (const j of jogadores) if (j.id === id && j.mesh) { const pos = j.mesh.position.clone(), rot = j.mesh.rotation.y; scene.remove(j.mesh); j.mesh = escoteiro(optsPersonagem(id)); j.mesh.position.copy(pos); j.mesh.rotation.y = rot; scene.add(j.mesh); }
  const P = PERSONAGENS[id]; if (P.npc) { const n = npcs.find(n => n.nome === P.npc); if (n) { const pos = n.mesh.position.clone(), rot = n.mesh.rotation.y, vis = n.mesh.visible; scene.remove(n.mesh); const novo = escoteiro(optsPersonagem(id)); novo.position.copy(pos); novo.rotation.y = rot; novo.visible = vis; novo.userData.nome = n.nome; novo.userData.doidinho = n.mesh.userData.doidinho; scene.add(novo); for (const o of obstaculos) if (o.npc === n.mesh) o.npc = novo; for (const i of interativos) if (i.npcMesh === n.mesh) i.npcMesh = novo; n.mesh = novo; } }
}
painelP.addEventListener('click', e => e.stopPropagation());
document.getElementById('btnPersonalizar').addEventListener('click', e => { e.stopPropagation(); painelP.style.display = painelP.style.display === 'block' ? 'none' : 'block'; personalizandoId = personagemId; desenhaPersonalizar(); });
document.querySelectorAll('#inicio .perso').forEach(el => {
  el.classList.toggle('sel', el.dataset.id === personagemId);
  el.addEventListener('click', e => { e.stopPropagation(); escolhePersonagem(el.dataset.id); });
});
scene.add(jogador);
const estado = {
  pos: new THREE.Vector3(MAPA.portaoEntrada.x + 4, altO(MAPA.portaoEntrada.x + 4, MAPA.portaoEntrada.y + 30), -(MAPA.portaoEntrada.y + 30)),
  yaw: 0, vy: 0, noChao: true, velAnim: 0, fase: 0, temPederneira: false, escalando: 0, macrame: null, poleiro: null,
};
jogador.position.copy(estado.pos);
const cam = { yaw: -2.2, pitch: 0.35, dist: 7 };

// ---------- NPCs ----------
const npcs = [];
function npc(x, y, rot, nome, fala, opts) {
  const m = escoteiro(opts); m.position.set(x, altO(x, y), -y); m.rotation.y = rot; scene.add(m); m.userData.nome = nome;
  obstaculos.push({ x, z: -y, r: 0.5, npc: m });
  npcs.push({ mesh: m, nome, fala });
  interativos.push({ x, z: -y, r: 3, nome: 'Falar com ' + nome, npcMesh: m, acao: () => { const a = (typeof amigosNoite !== 'undefined') && amigosNoite.find(a => a.mesh === m); if (a) falaAmigoNoite(a); else aviso(nome + ': "' + fala + '"', 4500); } });
  return m;
}
const chefe = npc(MAPA.portaoEntrada.x + 2, MAPA.portaoEntrada.y + 8, 2.4, 'Chefe Diego', 'Bem-vindo, lobinho! A Akelá está esperando a alcateia na árvore do lobinhos.com, em frente à cantina.', { escala: 1.15, camisa: M.lenco, lenco: M.amarelo, touca: true });
npc(-200, -128, 0.5, 'Escoteiro Pedro', 'A mata aqui é cheia de figueiras e butiás. Cuidado pra não se perder!');
npc(50, -30, 3, 'Escoteira Ana', 'A água da Lagoa dos Patos é doce e calminha, boa pra nadar!');
npc(185, 60, 1, 'Escoteiro Lucas', 'Depois do futebol vamos pro Iate Clube ver os barcos.');
// alcateia em roda ao redor da árvore da bandeira
npc(ARV_BAND[0] - 6, ARV_BAND[1] - 4, 0.6, 'Akelá', 'Lobinhos, em roda na árvore do lobinhos.com — o nome que a própria alcateia escolheu! O Henrique trouxe os gêmeos, então estamos completos. Aperte E perto dela para fazer a bandeira, e depois podem subir nos galhos pelo A de bambu que a gente amarrou.', { escala: 1.1, camisa: M.lenco, lenco: M.amarelo });
[
  ['Lobinho Dudu', 0.9, 'Melhor possível! Essa é a árvore do lobinhos.com — fomos nós, os lobinhos, que demos esse nome pra ela!', { cabelo: new THREE.MeshLambertMaterial({ color: 0xe8c95a }), oculos: true, doidinho: true }],
  ['Lobinha Maria', 2.1, 'Hoje tem jogo na mata depois da bandeira!', { estiloCabelo: 'longo', cabelo: new THREE.MeshLambertMaterial({ color: 0x5a3a1e }) }],
  ['Lobinho Davi', 3.3, 'Lá de cima da árvore do lobinhos.com dá pra ver a lagoa inteira! E a Trailblazer do Tio Henrique lá na portaria.'],
  ['Lobinha Larissa', 4.5, 'A pederneira fica no baú da casinha do salva-vidas, lá na praia! O pai da Lara que me contou.'],
  ['Lobinho Gui', 5.6, 'Vamos uivar bem alto no Grande Uivo! Auuuu! O Tio Henrique falou que ouve lá da Trailblazer.'],
].forEach(([n, a, fala, extra]) => {
  const px = ARV_BAND[0] + Math.cos(a) * 6, py = ARV_BAND[1] + Math.sin(a) * 6;
  const pid = n === 'Lobinho Dudu' ? 'dudu' : n === 'Lobinha Maria' ? 'maria' : null;
  const m = npc(px, py, Math.atan2(ARV_BAND[0] - px, -(ARV_BAND[1] - py)), n, fala, pid ? optsPersonagem(pid) : Object.assign({ bone: true, escala: 0.85 }, extra || {}));
  if (extra && extra.doidinho) npcs[npcs.length - 1].doidinho = true;
});
// Maria é a melhor amiga da Lara: fala diferente dependendo de quem está jogando
interativos.find(i => i.nome === 'Falar com Lobinha Maria').acao = () => {
  const falas = personagemId === 'lara'
    ? ['LARA! Minha melhor amiga chegou! Bora fazer a bandeira juntas e depois ir na praia?', 'Lara, trouxe pulseirinha de miçanga pra gente, uma pra cada uma. Amigas pra sempre!', 'Depois da bandeira a gente vai na cantina, tá? Eu pago o picolé, prometo!', 'Lara, o Dudu tá me enchendo o saco pra ir buscar o Caio. Deixa eles, vem cá!', 'O Tio Henrique trouxe vocês na Trailblazer? Que chique! Pede pra ele me dar carona na volta, hehe.']
    : ['Oi, Caio! Cadê a Lara? Ela é minha melhor amiga, avisa ela que eu tô aqui na roda!', 'Caio, fala pra Lara que eu guardei um lugar do lado do meu na roda, tá?', 'Vocês dois são igualzinhos, mas a Lara é mais legal. Brincadeira! ...ou não, hehe.'];
  aviso('Lobinha Maria: "' + falas[Math.floor(Math.random() * falas.length)] + '"', 5000);
};
// Dudu é doidinho e melhor amigo do Caio: fala diferente dependendo de quem está jogando
interativos.find(i => i.nome === 'Falar com Lobinho Dudu').acao = () => {
  const falas = personagemId === 'caio'
    ? ['CAIOOO! Meu parceiro! Bora subir na árvore do lobinhos.com de cabeça pra baixo? Zoeira... ou não, hein!', 'Caio, tua irmã gêmea é igualzinha a ti, só que com o cabelo comprido. Eu quase chamei ela de Caio, hehe!', 'Mano, eu falei pra alcateia inteira que a gente é a dupla mais doida do camping. Melhor possível, uhul!', 'Caio, aposto que chego na praia antes de ti. Vale correr? VALE! Já era, tô indo! ...brincadeira, tô com preguiça.', 'O Tio Henrique deixa a gente entrar na Trailblazer? Só pra buzinar uma vez, prometo!']
    : ['E aí! Eu sou o Dudu, o mais doidão da alcateia, hehe. Cê viu o Caio por aí? Ele é meu melhor amigo, o cara!', 'Lara, cê e o Caio são gêmeos mesmo, né? Igualzinhos! Se cê botar o boné do mesmo jeito eu não sei quem é quem, hehe.', 'Foi a gente que batizou a árvore de lobinhos.com, saca? Eu queria lobinhos.com.br, mas não coube na placa, que chato.', 'Se cê trombar com o Caio, fala que o Dudu tá aqui esperando pra jogar pega-pega, beleza?', 'Ó, dizem que eu sou doidinho. Eu prefiro "cheio de energia". Ou "muito doidinho" mesmo, tanto faz, hehe!'];
  const irmao = personagemId === 'caio' ? 'a Lara' : 'o Caio';
  falas.push('Tô fazendo 67 há tanto tempo que farmei 500 mil de aura! Eu sei que tu e ' + irmao + ' não gostam de 67... mas SEIS SETE! Hehe!');
  aviso('Lobinho Dudu: "' + falas[Math.floor(Math.random() * falas.length)] + '"', 5500);
};

// Alisson, o lobinho mais baixinho, quer achar o Phantom (Fantasma), o galgo do camping — sem dono
const ALISSON = [ARV_BAND[0] - 9, ARV_BAND[1] + 7];
const alisson = npc(ALISSON[0], ALISSON[1], 2.6, 'Lobinho Alisson', 'Você viu o Fantasma?', { bone: true, escala: 0.7 });
// Phantom (Fantasma) começa em cima da árvore do lobinhos.com; foge pro chuveiro, depois pra portaria, e só lá deixa ser pego
const PHANTOM_ARV = [ARV_BAND[0] + Math.cos(ARV_GALHOS[1]) * 2.2, ARV_BAND[1] - Math.sin(ARV_GALHOS[1]) * 2.2];
const CHUVEIRO_POS = [32, -22], PORTARIA_POS = [MAPA.portaoEntrada.x + 4, MAPA.portaoEntrada.y + 6];
const phantom = cachorro(PHANTOM_ARV[0], PHANTOM_ARV[1], { nome: 'Fantasma', galgo: true, cima: M.preto, baixo: M.branco, escala: 1.05 });
phantom.mesh.position.y = ARV_TOPO; phantom.mesh.rotation.y = 0.8; phantom.estagio = 0; phantom.obst.r = 0;
let alissonFalou = false;
interativos.find(i => i.nome === 'Falar com Lobinho Alisson').acao = () => {
  if (!alissonFalou) mostraCachorros();
  alissonFalou = true;
  aviso(phantom.estagio === 0 ? 'Alisson: "Ô ' + PERSONAGENS[personagemId].nome + ', cê viu o Fantasma? Aquele cachorro magrelo do camping, preto em cima e branco embaixo... ele nem tem dono, mas é meu amigo! Acho que o maluco subiu na árvore do lobinhos.com, vai lá dar uma olhada pra mim?"'
    : phantom.estagio === 1 ? 'Alisson: "Pô, ' + PERSONAGENS[personagemId].nome + ', o Fantasma vazou pro chuveiro da praia! Corre lá, vai!"'
    : phantom.estagio === 2 ? 'Alisson: "Caraca, ele disparou pra portaria, perto do Chefe de moletom cinza! Chama ele que ele vem, ele é de boa."'
    : 'Alisson: "Fantasma, seu doido! Fica aqui com a gente, vai... tem biscoito! O Chefe trouxe, aquele do moletom cinza, lá da Trailblazer."', 5500);
};
const outrosCachorros = [
  cachorro(35, 27, { nome: 'Caramelo', cima: new THREE.MeshLambertMaterial({ color: 0xc98a3a }), escala: 0.95, fala: 'Um vira-lata caramelo. Simpático, mas não é o Fantasma.' }),
  cachorro(-108, -28, { nome: 'Mel', cima: new THREE.MeshLambertMaterial({ color: 0xe0b860 }), baixo: new THREE.MeshLambertMaterial({ color: 0xf0dca0 }), escala: 1.1, fala: 'Uma golden peluda. Não é o Fantasma.' }),
  cachorro(62, -18, { nome: 'Pingo', cima: M.preto, baixo: M.branco, escala: 0.8, fala: 'Preto em cima e branco embaixo... mas é gordinho e de perna curta. Não é o Fantasma!' }),
  cachorro(-70, -62, { nome: 'Fumaça', galgo: true, cima: new THREE.MeshLambertMaterial({ color: 0x8a8a8a }), baixo: new THREE.MeshLambertMaterial({ color: 0xdddddd }), escala: 1.0, fala: 'Um cachorro magro cinza. Parecido, mas o Fantasma é preto em cima!' }),
  cachorro(-190, -125, { nome: 'Bolota', cima: new THREE.MeshLambertMaterial({ color: 0xffffff }), baixo: new THREE.MeshLambertMaterial({ color: 0xffffff }), escala: 0.75, fala: 'Um cachorrinho branco todo enroladinho. Não é o Fantasma.' }),
  cachorro(150, 125, { nome: 'Thor', cima: new THREE.MeshLambertMaterial({ color: 0x3a2a1a }), baixo: new THREE.MeshLambertMaterial({ color: 0xb08050 }), escala: 1.15, fala: 'Um rottweiler dormindo perto das barracas. Não é o Fantasma.' }),
];
// os cachorros só aparecem (e só bloqueiam o caminho) depois de falar com o Alisson
for (const c of cachorros) { c.mesh.visible = false; c.raioObst = c.obst.r; c.obst.r = 0; }
function mostraCachorros() { for (const c of cachorros) { c.mesh.visible = true; if (c !== phantom) c.obst.r = c.raioObst; } }
for (const c of outrosCachorros) interativos.push({ x: c.x, z: -c.y, r: 2.5, nome: 'Ver o cachorro ' + c.nome, cond: () => alissonFalou, acao: () => aviso(c.nome + ': ' + c.fala, 3500) });
outrosCachorros.forEach((c, i) => c.fala = outrosCachorros[i].fala || '');
[['Caramelo', 'Um vira-lata caramelo. Simpático, mas não é o Fantasma.'], ['Mel', 'Uma golden peluda. Não é o Fantasma.'], ['Pingo', 'Preto em cima e branco embaixo... mas é gordinho e de perna curta. Não é o Fantasma!'], ['Fumaça', 'Um cachorro magro cinza. Parecido, mas o Fantasma é preto em cima!'], ['Bolota', 'Um cachorrinho branco todo enroladinho. Não é o Fantasma.'], ['Thor', 'Um rottweiler dormindo perto das barracas. Não é o Fantasma.']].forEach(([n, f]) => { const c = outrosCachorros.find(c => c.nome === n); if (c) c.fala = f; });
interativos.push({ x: PORTARIA_POS[0], z: -PORTARIA_POS[1], r: 4, nome: 'Chamar o Fantasma', cond: () => phantom.estagio === 2 && !phantom.seguindo && !noite, acao: () => {
  phantom.seguindo = true; phantom.obst.r = 0; SOM.latido();
  aviso('🐕 É o Fantasma, o cachorro do camping! Ele abanou o rabo e vai te seguir. Leve ele até o Alisson, perto da árvore do lobinhos.com.', 5000);
  phantom.estagio = 3;
  const m = missoes.find(z => z.id === 'phantom'); m.txt = 'Levar o Fantasma até o Alisson'; renderMissoes();
} });

// ---------- cutscenes do Phantom fugindo ----------
let cena = null;
function correPor(caminho, vel, aoChegar, cortarDepois) {
  // o cachorro corre pelos pontos (osm); a câmera vai atrás dele. cortarDepois: segundos até cortar pro destino
  cena = { caminho, idx: 0, vel, t: 0, aoChegar, cortarDepois: cortarDepois || 0, fim: false };
  phantom.mesh.position.set(caminho[0][0], altO(caminho[0][0], caminho[0][1]), -caminho[0][1]);
}
function iniciaFuga(estagioNovo) {
  const m = missoes.find(z => z.id === 'phantom');
  if (estagioNovo === 1) {
    // pula da árvore e corre até o chuveiro
    phantom.pulo = { t: 0, de: phantom.mesh.position.clone(), para: new THREE.Vector3(ARV_BAND[0] + 3, altO(ARV_BAND[0] + 3, ARV_BAND[1] - 3), -ARV_BAND[1] + 3) };
    cena = { pulo: true, t: 0 };
    aviso('🐕 O Fantasma se assustou e pulou da árvore!', 3000); SOM.latido();
  } else {
    correPor([[CHUVEIRO_POS[0], CHUVEIRO_POS[1]], [17, 6], [46, 33], [72, 41], [117, 84], [142, 119], [161, 142], [176, 168], [188, 203], [PORTARIA_POS[0], PORTARIA_POS[1]]], 56, () => {
      phantom.estagio = 2; m.txt = 'O Fantasma correu pra portaria! Vá lá chamar ele'; renderMissoes(); aviso('🐕 O Fantasma disparou pela estrada até a portaria!', 4000);
    }, 3.5);
  }
}
function atualizaCena(dt) {
  if (cena.historia) return atualizaHistoria(dt);
  if (cena.noite2Intro) return atualizaNoite2Intro(dt);
  if (cena.estrelas) return atualizaEstrelas(dt);
  if (cena.amanhece2) return atualizaAmanhece2(dt);
  if (cena.aspira) return atualizaAspira(dt);
  if (cena.noiteIntro) return atualizaNoiteIntro(dt);
  if (cena.amanhece) return atualizaAmanhece(dt);
  if (cena.intro) return atualizaIntro(dt);
  if (cena.monta) return atualizaMonta(dt);
  if (cena.pulo) {
    cena.t += dt; const k = Math.min(1, cena.t / 0.7);
    const p = phantom.pulo;
    phantom.mesh.position.lerpVectors(p.de, p.para, k); phantom.mesh.position.y = p.de.y * (1 - k) + p.para.y * k + Math.sin(k * Math.PI) * 1.2;
    phantom.mesh.rotation.y = Math.atan2(p.para.x - p.de.x, p.para.z - p.de.z);
    if (k >= 1) {
      correPor([[ARV_BAND[0] + 3, ARV_BAND[1] - 3], [-15, -11], [17, 6], [25, -12], [CHUVEIRO_POS[0], CHUVEIRO_POS[1]]], 44, () => {
        phantom.estagio = 1; const m = missoes.find(z => z.id === 'phantom'); m.txt = 'O Fantasma fugiu pro chuveiro perto da praia! Vá atrás dele'; renderMissoes();
        aviso('🐕 O Fantasma parou perto do chuveiro da praia.', 4000);
      });
    }
    return;
  }
  cena.t += dt;
  const c = cena.caminho, pos = phantom.mesh.position;
  if (cena.cortarDepois && cena.t > cena.cortarDepois && !cena.cortou) {
    // corte: o cachorro "já chegou" e a câmera mostra o destino
    cena.cortou = true; cena.idx = c.length - 2; const a = c[c.length - 2], b = c[c.length - 1];
    pos.set(a[0] + (b[0] - a[0]) * 0.5, 0, -(a[1] + (b[1] - a[1]) * 0.5)); pos.y = alt(pos.x, pos.z);
  }
  if (cena.idx < c.length - 1) {
    const alvo = c[cena.idx + 1], dx = alvo[0] - pos.x, dz = -alvo[1] - pos.z, d = Math.hypot(dx, dz);
    const passo = cena.vel * dt;
    if (d <= passo) { pos.set(alvo[0], 0, -alvo[1]); cena.idx++; }
    else { pos.x += dx / d * passo; pos.z += dz / d * passo; }
    pos.y = alt(pos.x, pos.z);
    phantom.mesh.rotation.y = Math.atan2(dx, dz);
    phantom.vel = cena.vel; phantom.fase += dt * 8;
    phantom.pernas.forEach((p, i) => p.rotation.x = (i % 2 ? 1 : -1) * Math.sin(phantom.fase * 2.5) * 0.8);
  } else if (!cena.fim) {
    cena.fim = true; cena.espera = 1.2; phantom.vel = 0; phantom.pernas.forEach(p => p.rotation.x = 0);
  } else {
    cena.espera -= dt;
    if (cena.espera <= 0) { const cb = cena.aoChegar; cena = null; cb(); }
  }
}
// montar no Fantasma: ele sai correndo da tela, escurece, e os dois aparecem na bandeira
const fadeEl = document.getElementById('fade');
const montaInt = { x: 0, z: 0, r: 3, nome: 'Montar no Fantasma', cond: () => phantom.estagio >= 4 && phantom.estagio !== 9 && phantom.mesh.position.y < alt(phantom.mesh.position.x, phantom.mesh.position.z) + 1 && !cena && !escolhendoDestino, acao: () => {
  cena = { monta: true, t: 0, fase: 'sobe', camPos: camera.position.clone() }; SOM.latido();
  const dir = phantom.mesh.position.clone().sub(camera.position); dir.y = 0; dir.normalize();
  cena.dir = dir; phantom.mesh.rotation.x = 0; phantom.mesh.position.y = 0; phantom.mesh.rotation.y = Math.atan2(dir.x, dir.z);
} };
interativos.push(montaInt);
function atualizaMonta(dt) {
  cena.t += dt; const pos = phantom.mesh.position;
  estado.vy = 0; estado.noChao = true;
  if (cena.fase === 'sobe') {
    if (cena.t > 0.5) { cena.fase = 'corre'; cena.t = 0; }
  } else if (cena.fase === 'corre') {
    const v = Math.min(48, 16 + cena.t * 32);
    pos.x += cena.dir.x * v * dt; pos.z += cena.dir.z * v * dt; pos.y = alt(pos.x, pos.z);
    phantom.fase += dt * 9; phantom.pernas.forEach((p, i) => p.rotation.x = (i % 2 ? 1 : -1) * Math.sin(phantom.fase * 2.5) * 0.9);
    if (cena.t > 2.6) { cena.fase = 'preto'; cena.t = 0; fadeEl.style.opacity = 1; }
  } else if (cena.fase === 'preto') {
    if (cena.t > 0.9 && !cena.teleportou) {
      cena.teleportou = true;
      // Fantasma sentado ao lado da bandeira (ou do destino escolhido pela Maria); jogador ao lado
      const dx0 = cena.destino ? cena.destino[1] : ARV_BAND[0] + 5.4, dy0 = cena.destino ? cena.destino[2] : ARV_BAND[1] - 1.2;
      pos.set(dx0 + 1.4, altO(dx0 + 1.4, dy0) - 0.12, -dy0); phantom.mesh.rotation.set(-0.5, 2.6, 0); phantom.pernas.forEach(p => p.rotation.x = 0.5);
      estado.pos.set(dx0, altO(dx0, dy0 - 2.4), -dy0 + 2.4); estado.yaw = Math.PI; cam.yaw = 0; cam.pitch = 0.3;
      camera.position.set(estado.pos.x, 3.5, estado.pos.z + 7);
    }
    if (cena.t > 1.6) { cena.fase = 'volta'; cena.t = 0; fadeEl.style.opacity = 0; }
  } else if (cena.t > 0.7) { const dst = cena.destino; cena = null; aviso(dst ? '🐕 O Fantasma te trouxe até: ' + dst[0] : 'O Fantasma te trouxe até a bandeira e sentou do lado dela. 🐕', 3500); }
  // jogador montado enquanto ele corre
  if (cena && (cena.fase === 'sobe' || cena.fase === 'corre')) { estado.pos.set(pos.x, pos.y + 0.55, pos.z); estado.yaw = phantom.mesh.rotation.y; }
}
function cameraEstrelas() {   // de trás dos quatro, subindo devagar pro céu
  const k = Math.min(1, cena.t / 16);
  camera.position.set(estado.pos.x, altO(estado.pos.x, -estado.pos.z) + 2.5 + k * 2, estado.pos.z + 7 - k * 3);
  camera.lookAt(estado.pos.x, 2 + k * 40, estado.pos.z - 60);
}
function cameraDaCena() {
  if (cena.historia) return cameraHistoria();
  if (cena.estrelas) return cameraEstrelas();
  if (cena.noite2Intro || cena.amanhece2) return;
  if (cena.aspira) return cameraAspira();
  if (cena.noiteIntro || cena.amanhece) return;
  if (cena.intro) return cameraIntro();
  if (cena.monta) {
    if (cena.fase === 'sobe' || cena.fase === 'corre') { camera.position.copy(cena.camPos); camera.lookAt(phantom.mesh.position.x, 0.8, phantom.mesh.position.z); }
    return;
  }
  const pos = phantom.mesh.position, ry = phantom.mesh.rotation.y;
  const atras = new THREE.Vector3(-Math.sin(ry) * 5, 2.4, -Math.cos(ry) * 5);
  camera.position.lerp(pos.clone().add(atras), 0.25);
  camera.lookAt(pos.x, pos.y + 0.6, pos.z);
}

// ---------- missões ----------
const missoes = [
  { id: 'chefe', txt: 'Voltar à portaria e se apresentar ao Chefe Diego', ok: false },
  { id: 'bandeira', txt: 'Fazer a bandeira com a alcateia na árvore do lobinhos.com, em frente à cantina', ok: false },
  { id: 'pederneira', txt: 'Pegar a pederneira no baú da casinha do salva-vidas', ok: false },
  { id: 'lenha', txt: 'Juntar lenha na mata (0/6) — com a pederneira bastam 3', ok: false, n: 0 },
  { id: 'fogueira', txt: 'Acender a fogueira do conselho', ok: false },
  { id: 'phantom', txt: 'Achar o Fantasma, o cachorro do camping (preto em cima, branco embaixo), pro Alisson', ok: false },
  { id: 'praia', txt: 'Ir até a Praia do Camping', ok: false },
  { id: 'molhe', txt: 'Chegar ao molhe na ponta do camping', ok: false },
];
const lista = document.getElementById('lista');
function renderMissoes() {
  lista.innerHTML = missoes.map(m => `<li class="${m.ok ? 'ok' : ''}">${m.txt}</li>`).join('');
}
function completa(id) {
  const m = missoes.find(x => x.id === id); if (!m || m.ok) return;
  m.ok = true; renderMissoes(); aviso('✔ ' + m.txt, 3000); SOM.missao();
  if (!dia2 && !noite && !noite2 && missoes.every(x => x.ok)) setTimeout(() => { aviso('🐺 Tarefas do dia concluídas! Agora vá dormir na barraca da sede... se conseguir.', 8000); SOM.fim(); }, 3200);
}
renderMissoes();

// Chefe
interativos.find(i => i.nome === 'Falar com Chefe Diego').acao = () => {
  const irmao = personagemId === 'caio' ? 'a Lara, sua irmã gêmea,' : 'o Caio, seu irmão gêmeo,';
  aviso('Chefe Diego: "Bem-vindo ao Camping Municipal, ' + PERSONAGENS[personagemId].nome + '! Vi que ' + irmao + ' chegou junto com o Henrique na Trailblazer. Siga a estrada até a cantina: a alcateia está em roda na árvore do lobinhos.com."', 6000);
  completa('chefe');
};
// bandeira
let bandeiraAlt = 1.2, bandeiraAlvo = 1.2;
interativos.push({ x: ARV_BAND[0], z: -ARV_BAND[1], r: 8, nome: 'Fazer a bandeira', cond: () => { const m = missoes.find(x => x.id === 'bandeira'); return !!m && !m.ok; }, acao: () => { estado.yaw = Math.atan2(ARV_BAND[0] - estado.pos.x, -ARV_BAND[1] - estado.pos.z); abreMini('bandeira'); } });
// barracas da alcateia: o Pai monta na sede (já aparecem montadas)
const spotsBarraca = [[-232, -150], [-236, -136], [-230, -122]];
// a do meio é a do jogador (azul), as outras são do gêmeo e do Pai
spotsBarraca.forEach((sp, i) => barraca(sp[0], sp[1], 0.3 * i, i === 1 ? M.lona3 : M.lona));
placaLivre('Barracas da família', -240, -136, 5, Math.PI / 2 + 0.2);
const placasBarraca = [placaLivre('Gêmeo(a)', -230, -154, 2.4, 0, 1.3), placaLivre('Minha barraca', -234, -140, 2.6, 0, 1.3), placaLivre('Pai', -228, -126, 2, 0, 1.3)];
atualizaPlacasBarraca();
// lenha espalhada
const lenhas = [];
(function () {
  let n = 0, guard = 0;
  while (n < 6 && guard++ < 5000) {
    const x = rnd(-270, 200), y = rnd(-180, 150);
    if (!pontoNoPoligono(x, y, MAPA.camping) || pontoNoPoligono(x, y, MAPA.praia) || distEstradas(x, y) > 40 || distEstradas(x, y) < 4) continue;
    if (Math.hypot(x - 190, y - 200) < 40) continue;
    const g = new THREE.Group(); g.position.set(x, altO(x, y), -y);
    for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 6), M.madeira); t.rotation.z = Math.PI / 2; t.rotation.y = rnd(0, 3); t.position.set(rnd(-0.2, 0.2), 0.1 + i * 0.12, rnd(-0.2, 0.2)); g.add(t); }
    const brilho = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 16), new THREE.MeshBasicMaterial({ color: 0xffe08a, side: THREE.DoubleSide })); brilho.rotation.x = -Math.PI / 2; brilho.position.y = 0.05; g.add(brilho);
    scene.add(g); lenhas.push(g);
    interativos.push({ x, z: -y, r: 2.2, nome: 'Pegar lenha', acao: function () { scene.remove(g); this.r = 0; ganhaLenha(1); } });
    n++;
  }
})();
let madeira = 0;   // estoque de madeira (dia 2: construções)
const madeiraEl = document.getElementById('madeira');
function mostraMadeira() { madeiraEl.style.display = 'none'; }
function ganhaLenha(q) {
  SOM.coleta();
  if (dia2) { madeira += q; mostraMadeira(); return; }
  const m = missoes.find(z => z.id === 'lenha'); if (!m) return;
  m.n += q; m.txt = `Juntar lenha na mata (${m.n}/6) — com a pederneira bastam 3`; renderMissoes();
  if (!m.ok && (m.n >= 6 || (estado.temPederneira && m.n >= 3))) completa('lenha');
}
let galhos = 0;
function ganhaGalho() {
  galhos++; SOM.coleta();
  if (galhos >= 2) { galhos -= 2; ganhaLenha(1); aviso('🪵 2 galhos viraram 1 madeira!', 2500); }
  else aviso('🌿 Galho! (1/2 pra fazer uma madeira)', 2500);
}
// item que cai da árvore (galho ou madeira) e pode ser pego
function caiItem(x, z, tipo) {
  const g = new THREE.Group(); g.position.set(x, alt(x, z) + 6, z); g.userData.chao = alt(x, z);
  if (tipo === 'madeira') { for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 6), M.madeira); t.rotation.z = Math.PI / 2; t.rotation.y = rnd(0, 3); t.position.set(rnd(-0.2, 0.2), 0.1 + i * 0.12, rnd(-0.2, 0.2)); g.add(t); } }
  else { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.1, 5), M.tronco); t.rotation.z = Math.PI / 2 + 0.3; t.rotation.y = rnd(0, 3); t.position.y = 0.08; g.add(t); const f = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), M.copa2); f.scale.set(1.4, 0.5, 1); f.position.set(0.5, 0.1, 0); g.add(f); }
  const brilho = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.85, 16), new THREE.MeshBasicMaterial({ color: tipo === 'madeira' ? 0xffe08a : 0xb6ff8a, side: THREE.DoubleSide })); brilho.rotation.x = -Math.PI / 2; brilho.position.y = 0.05; g.add(brilho);
  scene.add(g); itensCaindo.push(g);
  interativos.push({ x, z, r: 2.2, nome: tipo === 'madeira' ? 'Pegar madeira' : 'Pegar galho', item: g, acao: function () { scene.remove(g); this.r = 0; if (tipo === 'madeira') ganhaLenha(1); else ganhaGalho(); } });
}
const itensCaindo = [];
// fogueira
interativos.push({ x: sede.fogueiraPos[0], z: -sede.fogueiraPos[1], r: 4.5, nome: 'Acender a fogueira', cond: () => !sede.chamas.visible && !!missoes.find(z => z.id === 'lenha'), acao: () => {
  const m = missoes.find(z => z.id === 'lenha'); if (!m) return;
  const precisa = estado.temPederneira ? 3 : 6;
  if (m.n < precisa) {
    aviso(estado.temPederneira ? `Com a pederneira bastam 3 lenhas (${m.n}/3)` : `Ainda falta lenha! (${m.n}/6) — ou pegue a pederneira na casinha do salva-vidas`, 3500);
    return;
  }
  if (!m.ok) completa('lenha');
  estado.yaw = Math.atan2(sede.fogueiraPos[0] - estado.pos.x, -sede.fogueiraPos[1] - estado.pos.z);
  abreMini('fogo');
} });
// subir / descer da árvore do lobinhos.com
function sobreGalho(px, pz) {
  const dx = px - ARV_BAND[0], dz = pz + ARV_BAND[1];
  if (Math.hypot(dx, dz) < 2.1) return true;                       // forquilha junto ao tronco
  for (const a of ARV_GALHOS) {                                      // galho: segmento de 0.3 a 4.8 m do tronco
    const ux = Math.cos(a), uz = Math.sin(a), t = dx * ux + dz * uz;
    if (t > 0.3 && t < 4.8 && Math.hypot(dx - ux * t, dz - uz * t) < 0.55) return true;
  }
  return false;
}
const naPlataforma = () => estado.pos.y > ARV_TOPO - 1.5 && (sobreGalho(estado.pos.x, estado.pos.z) || (casaNaArvore && Math.hypot(estado.pos.x - ARV_BAND[0], estado.pos.z + ARV_BAND[1]) < 3.1));
const escBase = pontoEscada(0);
interativos.push({ x: escBase.x, z: escBase.z, r: 2, nome: 'Subir pelo A de bambu', cond: () => !estado.escalando && estado.pos.y < ARV_BASE + 1, acao: () => { estado.escalando = 1; estado.vy = 0; } });
interativos.push({ x: ARV_BAND[0], z: -ARV_BAND[1], r: 3.2, nome: 'Descer pelo A de bambu', cond: () => !estado.escalando && naPlataforma() && Math.hypot(estado.pos.x - ARV_BAND[0], estado.pos.z + ARV_BAND[1]) < 3, acao: () => { estado.escalando = -1; estado.vy = 0; } });
// baú da pederneira
interativos.push({ x: salva.bauPos[0], z: -salva.bauPos[1], r: 3, nome: 'Abrir o baú', acao: function () {
  salva.tampa.rotation.x = -1.6; salva.tampa.position.z -= 0.35; salva.tampa.position.y += 0.3; salva.pederneira.visible = true; SOM.bau();
  estado.temPederneira = true; this.r = 0;
  aviso('Você achou uma pederneira no baú do salva-vidas! Agora a fogueira acende com só 3 lenhas.', 4500);
  completa('pederneira');
  const m = missoes.find(z => z.id === 'lenha'); if (m && !m.ok && m.n >= 3) completa('lenha');
} });
// bússola de locais (nome no HUD)
const locais = [
  { nome: 'Portaria', x: 190, y: 210, r: 30 }, { nome: 'Campo do Camping', x: 187, y: 64, r: 30 },
  { nome: 'Árvore do lobinhos.com', x: -34, y: 2, r: 9 }, { nome: 'Cantina (Lanchonete do Camping)', x: -22, y: 8, r: 22 }, { nome: 'Banheiros', x: -50, y: -8, r: 12 },
  { nome: 'Praia do Camping', poly: MAPA.praia }, { nome: 'Playground', x: 0, y: -62, r: 12 },
  { nome: 'Quadra de Vôlei', x: 120, y: -2, r: 14 }, { nome: 'Casinha do Salva-vidas', x: 95, y: -17, r: 7 }, { nome: 'Cancha de Bocha', x: -70, y: -70, r: 14 },
  { nome: 'Fogueira do Conselho', x: -186, y: -136, r: 7 }, { nome: 'Barracas da família', x: -233, y: -136, r: 10 }, { nome: 'Sede do Grupo Escoteiro Garibaldi', x: -205, y: -135, r: 35 }, { nome: 'Churrasqueira Coletiva', x: 60, y: -6, r: 10 },
  { nome: 'Churrasqueira Coletiva', x: -120, y: -128, r: 10 }, { nome: 'Molhe', x: 247, y: -115, r: 28 },
  { nome: 'Iate Clube', poly: MAPA.iate }, { nome: 'Lagoa dos Patos', agua: true },
  { nome: 'Área de acampamento', x: -100, y: -20, r: 30 }, { nome: 'Área de acampamento', x: 40, y: 30, r: 22 },
  { nome: 'Área de acampamento', x: -160, y: -90, r: 22 }, { nome: 'Área de acampamento', x: 130, y: 130, r: 20 },
  { nome: 'Mata nativa', poly: MAPA.camping }, { nome: 'Alameda Mano Serpa', poly: MAPA.continente },
];

// ---------- cutscene inicial: chegada na Trailblazer ----------
const carro = trailblazer();
const CARRO_CAMINHO = [[150, 270], [189, 255], [200, 249], [196, 236], [193, 226]];   // Alameda Mano Serpa até a portaria
carro.position.set(193, altO(193, 226), -226); carro.rotation.y = Math.atan2(-3, 10) - Math.PI / 2;
obstaculos.push({ x: 193, z: -226, hw: 2.6, hd: 1.1, rot: 0 });
let introFeita = false, outroLobinho = null, pai = null;
// Pai (Henrique): adulto de moletom cinza claro e cabelo bem curtinho
// celular preto com a tela do Claude: fica na mão do Pai, que passa o tempo programando
function daCelular(m) {
  const u = m.userData;
  const cel = new THREE.Group();
  cel.add(caixa(0.16, 0.3, 0.02, M.preto, 0, 0, 0));
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#1b1b1f'; x.fillRect(0, 0, 64, 128); x.fillStyle = '#d97757'; x.font = 'bold 13px sans-serif'; x.fillText('Claude', 8, 20);
  x.fillStyle = '#9be59b'; x.font = '9px monospace'; ['> fix bug', '  ok ✓', '> add', '  feature', '> commit', '  done ✓'].forEach((l, i) => x.fillText(l, 6, 40 + i * 13));
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.27), new THREE.MeshBasicMaterial({ map: t })); tela.position.z = 0.012; cel.add(tela);
  cel.position.set(0, -0.52, 0.08); cel.rotation.x = -0.9; u.bracoD.add(cel);
  u.celular = cel;
}
const PAI_OPTS = { escala: 1.25, moletom: true, semChapeu: true, semBochecha: true, camisa: new THREE.MeshLambertMaterial({ color: 0xc9c9c9 }), calca: new THREE.MeshLambertMaterial({ color: 0x3a4250 }), cabelo: new THREE.MeshLambertMaterial({ color: 0x2a2a2a }) };
function iniciaIntro() {
  if (introFeita) return; introFeita = true;
  jogador.visible = false;
  carro.position.set(CARRO_CAMINHO[0][0], altO(CARRO_CAMINHO[0][0], CARRO_CAMINHO[0][1]), -CARRO_CAMINHO[0][1]);
  cena = { intro: true, idx: 0, t: 0, fase: 'dirige' }; SOM.motor(true);
  document.getElementById('hud').style.opacity = 0;
}
function atualizaIntro(dt) {
  cena.t += dt;
  const pos = carro.position;
  if (cena.fase === 'dirige') {
    const c = CARRO_CAMINHO;
    if (cena.idx < c.length - 1) {
      const alvo = c[cena.idx + 1], dx = alvo[0] - pos.x, dz = -alvo[1] - pos.z, d = Math.hypot(dx, dz);
      const v = cena.idx >= c.length - 2 ? Math.max(2, d * 1.2) : 9, passo = v * dt;
      if (d <= passo) { pos.set(alvo[0], 0, -alvo[1]); cena.idx++; }
      else { pos.x += dx / d * passo; pos.z += dz / d * passo; }
      pos.y = alt(pos.x, pos.z);
      carro.rotation.y = Math.atan2(dx, dz);
      carro.rotation.y += Math.PI / 2 * 0 ; // frente do modelo é +x local
      carro.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
    } else { cena.fase = 'para'; cena.t = 0; SOM.motor(false); }
  } else if (cena.fase === 'para') {
    if (cena.t > 0.8) {
      // os dois saem do carro: jogador pelo lado direito, o outro lobinho pelo esquerdo
      const ry = carro.rotation.y, lado = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry)).multiplyScalar(-1); // eixo z local -> mundo
      const lat = new THREE.Vector3(-Math.sin(ry) * 0, 0, 0);
      const dir = new THREE.Vector3(Math.sin(ry + Math.PI / 2), 0, Math.cos(ry + Math.PI / 2)); // frente do carro
      const perp = new THREE.Vector3(dir.z, 0, -dir.x);
      const pj = pos.clone().add(perp.clone().multiplyScalar(1.7)).add(dir.clone().multiplyScalar(-0.3));
      const po = pos.clone().add(perp.clone().multiplyScalar(-1.7)).add(dir.clone().multiplyScalar(-1.0));
      const pp = pos.clone().add(perp.clone().multiplyScalar(-1.9)).add(dir.clone().multiplyScalar(0.9));   // motorista
      pai = npc(pp.x, -pp.z, Math.atan2(-perp.x, -perp.z), 'Pai', '', PAI_OPTS);
      aplicaEmote(pai, 'serio', 0); pai.userData.serio = true; daCelular(pai);
      interativos.find(i => i.nome === 'Falar com Pai').acao = () => {
        const f = ['Vai lá, ' + (personagemId === 'lara' ? 'filha' : 'filho') + '. As barracas da alcateia já estão montadas na sede.',
                   'Cuidado na árvore do lobinhos.com.',
                   'Não dá comida pro Fantasma.',
                   'Qualquer coisa, estou aqui. Só vou terminar esse código com o Claude.',
                   '...só um minuto, o Claude tá quase acertando esse bug.'];
        aviso('Pai: "' + f[Math.floor(Math.random() * f.length)] + '"', 5000);
      };
      estado.pos.set(pj.x, alt(pj.x, pj.z), pj.z); estado.yaw = Math.atan2(perp.x, perp.z); jogador.position.copy(estado.pos); jogador.rotation.y = estado.yaw; jogador.visible = true;
      const outroId = personagemId === 'lara' ? 'caio' : 'lara';
      const jGemeo = jogadores.find(j => j.id === outroId);
      if (jGemeo) { outroLobinho = jGemeo.mesh; jGemeo.pos.set(po.x, 0, po.z); jGemeo.yaw = Math.atan2(-perp.x, -perp.z); outroLobinho.position.copy(jGemeo.pos); outroLobinho.rotation.y = jGemeo.yaw; }
      else outroLobinho = npc(po.x, -po.z, Math.atan2(-perp.x, -perp.z), PERSONAGENS[outroId].nome, '', PERSONAGENS[outroId].opts);
      if (!jGemeo) interativos.find(i => i.nome === 'Falar com ' + PERSONAGENS[outroId].nome).acao = () => aviso(PERSONAGENS[outroId].nome + ': "' + (outroId === 'caio' ? 'Vou lá na roda ver o Dudu, mana. Te encontro na árvore do lobinhos.com! E não conta pra ninguém que eu sou 3 minutos mais velho... ah, todo mundo já sabe.' : 'Vou lá na roda ver a Maria, mano. Te encontro na árvore do lobinhos.com! Gêmeos têm que ficar juntos, né?') + '"', 4500);
      cena.fase = 'sai'; cena.t = 0;
      aviso('Pai: "Chegamos! Podem descer."', 3000);
    }
  } else if (cena.fase === 'sai') {
    if (cena.t > 2.6) {
      cena.fase = 'anda'; cena.t = 0; cena.idx = 0; cena.andando = true; cena.px = carro.position.x; cena.pz = carro.position.z + 3;
      aviso('Pai: "Vem, vamos até a árvore do lobinhos.com, a alcateia tá esperando vocês pra bandeira."', 4000);
    }
  } else if (cena.fase === 'anda') {
    // o Pai vai na frente pela estrada, os gêmeos um de cada lado
    const c = INTRO_CAMINHO, v = 4.2;
    if (cena.idx < c.length - 1) {
      const alvo = c[cena.idx + 1], dx = alvo[0] - cena.px, dz = -alvo[1] - cena.pz, d = Math.hypot(dx, dz), passo = v * dt;
      if (d <= passo) { cena.px = alvo[0]; cena.pz = -alvo[1]; cena.idx++; }
      else { cena.px += dx / d * passo; cena.pz += dz / d * passo; }
      const yaw = Math.atan2(dx, dz), perp = { x: Math.cos(yaw), z: -Math.sin(yaw) };
      pai.position.set(cena.px, alt(cena.px, cena.pz), cena.pz); pai.rotation.y = yaw;
      estado.pos.set(cena.px + perp.x * 1.1 - Math.sin(yaw) * 1.2, 0, cena.pz + perp.z * 1.1 - Math.cos(yaw) * 1.2); estado.pos.y = alt(estado.pos.x, estado.pos.z); estado.yaw = yaw;
      outroLobinho.position.set(cena.px - perp.x * 1.1 - Math.sin(yaw) * 1.2, 0, cena.pz - perp.z * 1.1 - Math.cos(yaw) * 1.2); outroLobinho.position.y = alt(outroLobinho.position.x, outroLobinho.position.z); outroLobinho.rotation.y = yaw;
      cena.fase2 = (cena.fase2 || 0) + dt * 9;
      for (const m of [pai, outroLobinho]) { const u = m.userData, sw = Math.sin(cena.fase2) * 0.6; u.pernaE.rotation.x = sw; u.pernaD.rotation.x = -sw; u.bracoE.rotation.x = -sw; u.bracoD.rotation.x = sw; }
    }
    if (cena.t > 5.5 && !cena.escureceu) { cena.escureceu = true; fadeEl.style.opacity = 1; }
    if (cena.t > 6.6) {
      // chegada na árvore do lobinhos.com
      cena.fase = 'chega'; cena.t = 0; cena.andando = false;
      const ax = ARV_BAND[0], ay = ARV_BAND[1];
      estado.pos.set(ax + 2, altO(ax + 2, ay - 9), -(ay - 9)); estado.yaw = 0; cam.yaw = 0; cam.pitch = 0.25;
      pai.position.set(ax + 9, altO(ax + 9, ay - 8), -(ay - 8)); pai.rotation.y = -0.9;
      const a = 5.9; outroLobinho.position.set(ax + Math.cos(a) * 6, altO(ax + Math.cos(a) * 6, ay + Math.sin(a) * 6), -(ay + Math.sin(a) * 6)); outroLobinho.rotation.y = Math.atan2(ax - outroLobinho.position.x, -ay - outroLobinho.position.z);
      for (const m of [pai, outroLobinho]) { const u = m.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; }
      const jG = jogadores.find(j => j.mesh === outroLobinho); if (jG) { jG.pos.copy(outroLobinho.position); jG.yaw = outroLobinho.rotation.y; }
      // atualiza os pontos de interação dos dois
      const ip = interativos.find(i => i.nome === 'Falar com Pai'); ip.x = pai.position.x; ip.z = pai.position.z;
      const io = interativos.find(i => i.nome === 'Falar com ' + outroLobinho.userData.nome); if (io) { io.x = outroLobinho.position.x; io.z = outroLobinho.position.z; }
      for (const o of obstaculos) { if (o.npc === pai) { o.x = pai.position.x; o.z = pai.position.z; } if (o.npc === outroLobinho) { o.x = outroLobinho.position.x; o.z = outroLobinho.position.z; } }
      camera.position.set(estado.pos.x, 3.2, estado.pos.z + 6);
    }
  } else if (cena.fase === 'chega') {
    if (cena.t > 0.6 && !cena.clareou) { cena.clareou = true; fadeEl.style.opacity = 0; aviso('Pai: "Chegamos. Vai lá pra roda, ' + PERSONAGENS[personagemId].nome + '. As barracas eu já montei na sede, pode deixar comigo."', 4500); }
    if (cena.t > 2.2) { cena = null; document.getElementById('hud').style.opacity = 1; }
  }
}
const INTRO_CAMINHO = [[193, 222], [188, 203], [176, 168], [161, 142], [142, 119], [124, 95], [117, 84], [97, 52], [72, 41], [46, 33], [17, 6], [-15, -11], [-31, -18], [-34, -6]];
function cameraIntro() {
  const pos = carro.position;
  if (cena.fase === 'dirige') { const p = P(MAPA.portaoEntrada.x + 10, MAPA.portaoEntrada.y + 26); camera.position.set(p.x, 3.2, p.z); camera.lookAt(pos.x, 1, pos.z); }
  else if (cena.fase === 'anda') { const p = pai.position, ry = pai.rotation.y; const c = new THREE.Vector3(p.x - Math.sin(ry) * 7, 3, p.z - Math.cos(ry) * 7); camera.position.lerp(c, 0.1); camera.lookAt(p.x, 1.2, p.z); }
  else if (cena.fase === 'chega') { return; }
  else { const ry = carro.rotation.y, dir = new THREE.Vector3(Math.sin(ry + Math.PI / 2), 0, Math.cos(ry + Math.PI / 2)); const c = pos.clone().add(dir.clone().multiplyScalar(-8)); c.y = 2.6; camera.position.lerp(c, 0.08); camera.lookAt(pos.x, 1.2, pos.z); }
}

// ---------- multijogador local (2 a 4 jogadores, controles Xbox / Recalbox) ----------
const jogadores = [];            // jogadores extras: { n, pad, pos, yaw, vy, noChao, fase, velAnim, mesh, cam, camera, id, hud }
let p1Pad = null;                // índice do controle do jogador 1 (opcional)
const padsAntes = {};            // estado anterior dos botões, por índice de controle
const ZM = 0.2;
const dz = v => Math.abs(v) < ZM ? 0 : (v - Math.sign(v) * ZM) / (1 - ZM);
function lerPad(idx) {
  const gp = navigator.getGamepads && navigator.getGamepads()[idx];
  if (!gp) return null;
  const b = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5));
  const antes = padsAntes[idx] || {};
  const edge = i => b(i) && !antes[i];
  const r = { mx: dz(gp.axes[0] || 0), mz: dz(gp.axes[1] || 0), cx: dz(gp.axes[2] || 0), cy: dz(gp.axes[3] || 0),
    pular: b(0), correr: b(7) || b(1) || b(10), interagir: edge(2), mapa: edge(3), start: edge(9), voltar: edge(8), habilidade: edge(4),
    emote: edge(12) ? 'feliz' : edge(13) ? 'triste' : edge(14) ? 'bravo' : edge(15) ? 'surpreso' : null,
    esq: edge(14) || (dz(gp.axes[0] || 0) < -0.6 && !(antes.stickEsq)), dir: edge(15) || (dz(gp.axes[0] || 0) > 0.6 && !(antes.stickDir)), a: edge(0) };
  const novo = {}; for (let i = 0; i < 16; i++) novo[i] = b(i);
  novo.stickEsq = dz(gp.axes[0] || 0) < -0.6; novo.stickDir = dz(gp.axes[0] || 0) > 0.6;
  padsAntes[idx] = novo;
  return r;
}
const OPCOES_PERSONAGEM = ['lara', 'caio', 'dudu', 'maria'];
function personagensLivres() {
  const usados = [personagemId].concat(jogadores.map(j => j.id));
  return OPCOES_PERSONAGEM.filter(id => !usados.includes(id));
}
const escolhaEl = document.getElementById('escolhaPad');
function novoJogador(padIdx) {
  if (jogadores.length >= 3) { aviso('Máximo de 4 jogadores', 2000); return; }
  const livres = personagensLivres(); if (!livres.length) return;
  const j = { n: jogadores.length + 2, pad: padIdx, escolhendo: true, opcao: 0, livres, pos: new THREE.Vector3(), yaw: 0, vy: 0, noChao: true, fase: 0, velAnim: 0,
    cam: { yaw: 0, pitch: 0.35, dist: 7 }, camera: new THREE.PerspectiveCamera(60, 1, 0.1, 1500), mesh: null, id: null, cor: ['#ff8a5c', '#7ee0ff', '#c59bff'][jogadores.length] };
  jogadores.push(j);
  j.hud = document.createElement('div'); j.hud.className = 'hudJ'; document.getElementById('hud').appendChild(j.hud);
  mostraEscolha(j);
}
function mostraEscolha(j) {
  escolhaEl.style.display = 'block';
  escolhaEl.innerHTML = '<b>Jogador ' + j.n + '</b><br>◀ &nbsp; <span class="nomeP">' + PERSONAGENS[j.livres[j.opcao]].nome + '</span> &nbsp; ▶<br><small>◀ ▶ escolhe · A confirma · Back sai</small>';
}
function confirmaJogador(j) {
  j.id = j.livres[j.opcao]; j.escolhendo = false; escolhaEl.style.display = 'none';
  const P = PERSONAGENS[j.id];
  j.mesh = escoteiro(optsPersonagem(j.id)); scene.add(j.mesh);
  const off = (jogadores.indexOf(j) + 1) * 1.6;
  j.pos.set(estado.pos.x + off, alt(estado.pos.x + off, estado.pos.z + 1), estado.pos.z + 1); j.yaw = estado.yaw; j.cam.yaw = cam.yaw;
  j.mesh.position.copy(j.pos); j.camera.position.set(j.pos.x, j.pos.y + 3, j.pos.z + 6); j.camera.lookAt(j.pos);
  // se o personagem existia como NPC (Dudu, Maria ou o gêmeo), ele some da roda: agora é um jogador
  const nomeNpc = P.npc || null;
  const tira = m => { m.visible = false; for (const o of obstaculos) if (o.npc === m) o.r = 0; for (const i of interativos) if (i.nome === 'Falar com ' + m.userData.nome) i.r = 0; };
  if (nomeNpc) { const n = npcs.find(n => n.nome === nomeNpc); if (n) tira(n.mesh); }
  if (outroLobinho && outroLobinho.userData && outroLobinho.userData.nome === P.nome) tira(outroLobinho);
  j.hud.textContent = 'J' + j.n + ' · ' + P.nome; j.hud.style.borderColor = j.cor;
  aviso('Jogador ' + j.n + ' entrou como ' + P.nome + '! 🎮', 3000); SOM.entrou();
  atualizaLayout();
}
function removeJogador(j) {
  jogadores.splice(jogadores.indexOf(j), 1);
  if (j.mesh) scene.remove(j.mesh); if (j.hud) j.hud.remove(); escolhaEl.style.display = 'none';
  jogadores.forEach((x, i) => x.n = i + 2);
  atualizaLayout();
}
function atualizaLayout() { /* os viewports são calculados a cada frame em renderTudo */ }
function interativoProximoEm(x, z, extra) {
  let melhor = null, md = 1e9;
  for (const i of interativos) {
    if (i.r <= 0 || (i.cond && !i.cond())) continue;
    if (extra && /^(Subir|Descer|Montar no Fantasma)/.test(i.nome)) continue;   // essas usam o corpo do jogador 1
    const d = Math.hypot(i.x - x, i.z - z);
    if (d < i.r && d / i.r < md) { md = d / i.r; melhor = i; }
  }
  return melhor;
}
function atualizaExtra(j, dt) {
  const inp = lerPad(j.pad); if (!inp) return;
  if (j.escolhendo) {
    if (inp.esq) { j.opcao = (j.opcao + j.livres.length - 1) % j.livres.length; mostraEscolha(j); }
    if (inp.dir) { j.opcao = (j.opcao + 1) % j.livres.length; mostraEscolha(j); }
    if (inp.a || inp.start) confirmaJogador(j);
    if (inp.voltar) removeJogador(j);
    return;
  }
  if (inp.voltar) { removeJogador(j); return; }
  if (cena) return;   // durante cutscenes os extras ficam parados
  j.cam.yaw -= inp.cx * 2.2 * dt; j.cam.pitch = Math.max(-0.2, Math.min(1.2, j.cam.pitch + inp.cy * 1.6 * dt));
  const mx = inp.mx, mz = inp.mz, movendo = !!(mx || mz);
  const nadando = naAguaRasa(j.pos.x, j.pos.z) && !emTerra(j.pos.x, j.pos.z);
  const vel = (nadando ? 2.2 : inp.correr ? 8.5 : 4.5) * (j.mesh.userData.turboAte > tempo ? 2 : 1);
  if (movendo) {
    const l = Math.min(1, Math.hypot(mx, mz)), fx = Math.sin(j.cam.yaw), fz = Math.cos(j.cam.yaw);
    const dx = (fx * mz + fz * mx) / Math.max(1e-6, Math.hypot(mx, mz)) * l, dzv = (fz * mz - fx * mx) / Math.max(1e-6, Math.hypot(mx, mz)) * l;
    const alvo = Math.atan2(dx, dzv); let d = alvo - j.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); j.yaw += d * Math.min(1, dt * 12);
    const nx = j.pos.x + dx * vel * dt, nz = j.pos.z + dzv * vel * dt;
    if (emTerra(nx, nz) || naAguaRasa(nx, nz)) { j.pos.x = nx; j.pos.z = nz; }
    else if (emTerra(nx, j.pos.z) || naAguaRasa(nx, j.pos.z)) j.pos.x = nx;
    else if (emTerra(j.pos.x, nz) || naAguaRasa(j.pos.x, nz)) j.pos.z = nz;
  }
  resolveColisoes(j.pos);
  if (inp.pular && j.noChao && !nadando) { j.vy = 6; j.noChao = false; SOM.pulo(); }
  const chao = nadando ? -0.9 : alt(j.pos.x, j.pos.z);
  j.vy -= 18 * dt; j.pos.y += j.vy * dt;
  if (j.pos.y <= chao) { j.pos.y = chao; j.vy = 0; j.noChao = true; }
  j.mesh.position.copy(j.pos); j.mesh.rotation.y = j.yaw;
  j.velAnim += ((movendo ? (vel > 5 ? 14 : 9) : 0) - j.velAnim) * Math.min(1, dt * 8); const fA = j.fase; j.fase += j.velAnim * dt;
  if (movendo && j.noChao && Math.floor(fA / Math.PI) !== Math.floor(j.fase / Math.PI)) SOM.passo(vel > 5, nadando);
  const sw = Math.sin(j.fase) * (movendo ? 0.6 : 0), u = j.mesh.userData;
  u.pernaE.rotation.x = sw; u.pernaD.rotation.x = -sw; u.bracoE.rotation.x = -sw; u.bracoD.rotation.x = sw;
  animaBatucada(j.mesh);
  if (inp.emote) { aplicaEmote(j.mesh, inp.emote, inp.emote === 'feliz' ? 0 : 4); ({ bravo: SOM.grr, triste: SOM.aww, surpreso: SOM.uau }[inp.emote] || (() => {}))(); }
  if (u.emoteAte && tempo > u.emoteAte) aplicaEmote(j.mesh, 'feliz', 0);
  const it = interativoProximoEm(j.pos.x, j.pos.z, true);
  if (inp.interagir && it) it.acao();
  if (inp.habilidade) usaHabilidade({ id: j.id, pos: j.pos, mesh: j.mesh, p1: false });
  j.hud.textContent = 'J' + j.n + ' · ' + PERSONAGENS[j.id].nome + (it ? ' · X — ' + it.nome : '');
  j.hud.style.borderColor = j.cor;
  // câmera
  const alvoCam = j.pos.clone().add(new THREE.Vector3(0, 1.5, 0));
  const off = new THREE.Vector3(Math.sin(j.cam.yaw) * Math.cos(j.cam.pitch), Math.sin(j.cam.pitch), Math.cos(j.cam.yaw) * Math.cos(j.cam.pitch)).multiplyScalar(j.cam.dist);
  const pc = alvoCam.clone().add(off); { const ac = alt(pc.x, pc.z) + 0.6; if (pc.y < ac) pc.y = ac; }
  j.camera.position.lerp(pc, Math.min(1, dt * 16)); j.camera.lookAt(alvoCam);
}
function procuraNovosPads() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let i = 0; i < gps.length; i++) {
    const gp = gps[i]; if (!gp) continue;
    if (i === p1Pad || jogadores.some(j => j.pad === i)) continue;
    const inp = lerPad(i); if (!inp) continue;
    if (inp.start || inp.a) {
      ligaSom();
      if (p1Pad === null && !inicio.style.display.match(/none/) ) { p1Pad = i; aviso('🎮 Controle ligado ao Jogador 1', 2500); if (!travado) { inicio.style.display = 'none'; travado = true; if (!introFeita) iniciaIntro(); } }
      else if (p1Pad === null) { p1Pad = i; aviso('🎮 Controle ligado ao Jogador 1', 2500); }
      else novoJogador(i);
    }
  }
}
window.addEventListener('gamepadconnected', e => aviso('🎮 Controle conectado: aperte Start para entrar', 3500));
function renderTudo() {
  const ativos = jogadores.filter(j => !j.escolhendo);
  const W = innerWidth, H = innerHeight;
  if (!ativos.length) { renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.render(scene, camera); return; }
  const n = ativos.length + 1;
  const rects = n === 2 ? [[0, 0, W / 2, H], [W / 2, 0, W / 2, H]] : [[0, H / 2, W / 2, H / 2], [W / 2, H / 2, W / 2, H / 2], [0, 0, W / 2, H / 2], [W / 2, 0, W / 2, H / 2]];
  renderer.setScissorTest(true);
  const cams = [camera].concat(ativos.map(j => j.camera));
  cams.forEach((c, i) => {
    const r = rects[i]; renderer.setViewport(r[0], r[1], r[2], r[3]); renderer.setScissor(r[0], r[1], r[2], r[3]);
    c.aspect = r[2] / r[3]; c.updateProjectionMatrix(); renderer.render(scene, c);
    if (i > 0) { const j = ativos[i - 1]; j.hud.style.left = (r[0] + 14) + 'px'; j.hud.style.top = (H - r[1] - 14 - 30) + 'px'; }
  });
  if (n === 3) { const r = rects[3]; renderer.setViewport(r[0], r[1], r[2], r[3]); renderer.setScissor(r[0], r[1], r[2], r[3]); renderer.setClearColor(0x0b1a10); renderer.clear(); renderer.setClearColor(0x9ecbff); }
}

// ---------- capítulo da noite: "Você não consegue dormir..." ----------
let noite = false, capituloNoite = null, dia2 = false;
const lua = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6d5 })); lua.visible = false; scene.add(lua);
const luzArvore = new THREE.PointLight(0x9fb8ff, 0, 14); luzArvore.position.set(ARV_BAND[0], ARV_TOPO + 1.5, -ARV_BAND[1]); scene.add(luzArvore);
const lanterna = new THREE.SpotLight(0xfff2c0, 0, 40, 0.5, 0.5, 1); lanterna.castShadow = false; scene.add(lanterna); scene.add(lanterna.target);
// vagalumes na mata
const vagalumes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 6, 5), new THREE.MeshBasicMaterial({ color: 0xd9ff5a }), 220);
const vagaPos = []; { const d = new THREE.Object3D(); let i = 0, guard = 0; while (i < 220 && guard++ < 20000) { const x = rnd(-280, 270), y = rnd(-190, 200); if (!pontoNoPoligono(x, y, MAPA.camping) || pontoNoPoligono(x, y, MAPA.praia)) continue; vagaPos.push({ x, z: -y, a: altO(x, y), h: rnd(0.6, 2.5), f: rnd(0, 6.28), v: rnd(0.5, 1.5) }); d.position.set(x, 1, -y); d.updateMatrix(); vagalumes.setMatrixAt(i++, d.matrix); } }
vagalumes.visible = false; scene.add(vagalumes);
// fantasma de lençol (é o Alisson de lençol)
const lencol = new THREE.Group();
{ const corpo = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.7, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0xf4f4ff, side: THREE.DoubleSide, emissive: 0x333344 })); corpo.position.y = 0.85; lencol.add(corpo);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), corpo.material); cab.position.y = 1.6; lencol.add(cab);
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), M.preto); o.position.set(sx * 0.15, 1.65, 0.38); lencol.add(o); }
  lencol.visible = false; scene.add(lencol); }
// coruja na mata perto da cancha de bocha
const coruja = new THREE.Group();
{ const c = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), M.tronco); c.scale.set(1, 1.3, 1); coruja.add(c);
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe066 })); o.position.set(sx * 0.11, 0.12, 0.24); coruja.add(o); }
  const bico = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 6), M.amarelo); bico.rotation.x = Math.PI / 2; bico.position.set(0, 0.02, 0.3); coruja.add(bico);
  coruja.position.set(-58, altO(-58, -78) + 5.2, 78); coruja.visible = false; scene.add(coruja); }
// lanterna balançando na casinha do salva-vidas
const luzPraia = new THREE.PointLight(0xffd070, 0, 22); luzPraia.position.set(SALVA[0] - 1.3, altO(SALVA[0], SALVA[1]) + 3.6, -SALVA[1] + 0.4); scene.add(luzPraia);
const lampiao = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd070 })); lampiao.visible = false; scene.add(lampiao);
// céu estrelado (noites)
const estrelas = (function () { const n = 900, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, e = 0.08 + Math.random() * 1.4, r = 700; pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false })); m.visible = false; scene.add(m); return m; })();
const estrelaCadente = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); estrelaCadente.visible = false; scene.add(estrelaCadente);
let noite2 = false;
const amigosNoite = [];
// aspirador de pó que sai da mochila na hora de pegar o fantasma
const aspirador = new THREE.Group();
{ const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.4, 12), new THREE.MeshLambertMaterial({ color: 0xd8342a })); corpo.rotation.z = Math.PI / 2; aspirador.add(corpo);
  const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 12), M.preto); tampa.rotation.z = Math.PI / 2; tampa.position.x = 0.22; aspirador.add(tampa);
  const cano = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), M.metal); cano.rotation.x = Math.PI / 2; cano.position.set(0, 0.05, 0.5); aspirador.add(cano);
  const bocal = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.12, 10), M.preto); bocal.rotation.x = Math.PI / 2; bocal.position.set(0, 0.05, 0.9); aspirador.add(bocal);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12, Math.PI), M.preto); alca.position.y = 0.16; aspirador.add(alca);
  aspirador.visible = false; scene.add(aspirador); }
function cutsceneAspirador() {
  cena = { aspira: true, t: 0, fase: 'saca', alvo: lencol.position.clone(), escala0: 1 };
  estado.yaw = Math.atan2(lencol.position.x - estado.pos.x, lencol.position.z - estado.pos.z); jogador.rotation.y = estado.yaw;
  document.getElementById('hud').style.opacity = 0;
  SOM.bau();
}
function atualizaAspira(dt) {
  cena.t += dt; const u = jogador.userData;
  const frente = new THREE.Vector3(Math.sin(estado.yaw), 0, Math.cos(estado.yaw));
  if (cena.fase === 'saca') {
    // braço vai pras costas e volta com o aspirador na mão
    const k = Math.min(1, cena.t / 0.9);
    u.bracoD.rotation.x = k < 0.5 ? -2.6 * (k * 2) : -2.6 + (k - 0.5) * 2 * 1.4; u.bracoD.rotation.z = k < 0.5 ? -0.9 : -0.9 + (k - 0.5) * 2 * 0.7;
    if (k >= 0.5 && !aspirador.visible) { aspirador.visible = true; SOM.pop(); }
    if (k >= 1) { cena.fase = 'suga'; cena.t = 0; SOM.aspirador(true); aplicaEmote(jogador, 'bravo', 0); }
  } else if (cena.fase === 'suga') {
    u.bracoD.rotation.x = -1.2 + Math.sin(tempo * 25) * 0.05; u.bracoD.rotation.z = -0.2;
    const k = Math.min(1, cena.t / 2.4);
    // o lençol é puxado pro bocal, girando e encolhendo
    const bocal = estado.pos.clone().add(frente.clone().multiplyScalar(1.3)).add(new THREE.Vector3(0, 1.0, 0));
    lencol.position.lerpVectors(cena.alvo, bocal, k * k); lencol.position.y += Math.sin(tempo * 12) * 0.2 * (1 - k);
    lencol.rotation.y += dt * (2 + k * 25); lencol.scale.setScalar(Math.max(0.02, 1 - k * k));
    if (k >= 1) {
      lencol.visible = false; lencol.scale.setScalar(1); lencol.rotation.y = 0; SOM.aspirador(false); SOM.pop();
      cena.fase = 'revela'; cena.t = 0; aplicaEmote(jogador, 'surpreso', 0);
      // aparece o Alisson, sem lençol, no lugar do fantasma
      const m = npc(cena.alvo.x, -cena.alvo.z, estado.yaw + Math.PI, 'Alisson', '', { bone: true, escala: 0.7 }); m.userData.noite = true; aplicaEmote(m, 'surpreso', 0);
      interativos.find(i => i.nome === 'Falar com Alisson').acao = () => aviso('Alisson: "Hehehe, era eu com o lençol! Eu também não conseguia dormir, ' + PERSONAGENS[personagemId].nome + '... aí resolvi assombrar o camping. Foi mal!"', 6000);
      aviso('Alisson: "EI! Meu lençol! ...hehehe, era EU! Cê caiu direitinho!"', 5000); SOM.risada();
      setTimeout(() => aplicaEmote(m, 'feliz', 0), 2500);
    }
  } else if (cena.fase === 'revela') {
    if (cena.t > 2.8) { aspirador.visible = false; u.bracoD.rotation.z = 0; aplicaEmote(jogador, 'feliz', 0); cena = null; document.getElementById('hud').style.opacity = 1; completa('lencol'); }
  }
  // aspirador na mão direita
  if (aspirador.visible) { const mao = estado.pos.clone().add(frente.clone().multiplyScalar(0.45)).add(new THREE.Vector3(Math.cos(estado.yaw) * 0.3, 0.95, -Math.sin(estado.yaw) * 0.3)); aspirador.position.copy(mao); aspirador.rotation.y = estado.yaw; }
}
function cameraAspira() {
  const meio = estado.pos.clone().lerp(cena.alvo, 0.45); const lado = new THREE.Vector3(Math.cos(estado.yaw), 0, -Math.sin(estado.yaw));
  const c = meio.clone().add(lado.multiplyScalar(4.5)); c.y = 2; camera.position.lerp(c, 0.12); camera.lookAt(meio.x, 1, meio.z);
}
function ligaNoite(on) {
  noite = on;
  scene.background = new THREE.Color(on ? 0x070c1c : 0x9ecbff);
  scene.fog = on ? new THREE.Fog(0x070c1c, 25, 160) : new THREE.Fog(0xbfdcff, 150, 650);
  sol.intensity = on ? 0.18 : 0.95; sol.color.setHex(on ? 0x8fa8ff : 0xfff2d8);
  hemi.intensity = on ? 0.12 : 0.55; hemi.color.setHex(on ? 0x223355 : 0xdfefff);
  renderer.setClearColor(on ? 0x070c1c : 0x9ecbff);
  M.agua.color.setHex(on ? 0x0a1a30 : 0x1e5f8f);
  lua.visible = on; vagalumes.visible = on; lanterna.intensity = on ? 2.2 : 0;
  luzPraia.intensity = on ? 1.6 : 0; lampiao.visible = on && !noite2; coruja.visible = on && !noite2; estrelas.visible = on;
  // olhos do Fantasma brilham no escuro
  phantom.olhos.forEach(o => { o.material = on ? new THREE.MeshBasicMaterial({ color: 0xccff66 }) : M.preto; o.scale.setScalar(on ? 2.2 : 1); });
  luzArvore.intensity = on ? 1.4 : 0;
  if (sede.chamas.visible) sede.chamas.children.forEach(c => { if (c.isPointLight) c.distance = on ? 30 : 18; });
  SOM.noite(on, noite2); SOM.ambiente(!on);
}
function iniciaNoite() {
  if (capituloNoite) return;
  capituloNoite = { fase: 'preto', t: 0, lencolProx: 8, revelado: false, tapT: 0, uivoT: 0 };
  fadeEl.style.opacity = 1; cena = { noiteIntro: true, t: 0 };
  document.getElementById('hud').style.opacity = 0;
}
const textoNoite = document.getElementById('textoNoite');
function atualizaNoiteIntro(dt) {
  cena.t += dt;
  if (cena.t > 0.9 && !cena.texto) { cena.texto = true; textoNoite.textContent = 'Você não consegue dormir...'; textoNoite.style.opacity = 1; }
  if (cena.t > 4.2 && !cena.pronto) {
    cena.pronto = true; textoNoite.style.opacity = 0;
    ligaNoite(true);
    // o jogador sai da barraca; os amigos estão acordados na fogueira
    const sp = spotsBarraca[1]; estado.pos.set(sp[0] + 4.5, altO(sp[0] + 4.5, sp[1]), -sp[1]); estado.yaw = Math.PI / 2; cam.yaw = estado.yaw + Math.PI; cam.pitch = 0.3; camera.position.set(estado.pos.x - 6, 3, estado.pos.z);
    // NPCs do dia somem (todo mundo "dormindo"), menos o Fantasma
    for (const n of npcs) { n.mesh.visible = false; for (const o of obstaculos) if (o.npc === n.mesh) o.r = 0; for (const i of interativos) if (i.nome === 'Falar com ' + n.nome) i.r = 0; }
    carro.visible = true;
    const fx = sede.fogueiraPos[0], fy = sede.fogueiraPos[1];
    const gemeoId = personagemId === 'lara' ? 'caio' : 'lara';
    const amigos = [[gemeoId, 0.9], ['maria', 2.4], ['dudu', 4.0]].filter(([id]) => !jogadores.some(j => j.id === id));
    amigos.forEach(([id, a]) => {
      const P = PERSONAGENS[id], px = fx + Math.cos(a) * 4.5, py = fy + Math.sin(a) * 4.5;
      const m = npc(px, py, Math.atan2(fx - px, -(fy - py)), P.nome, '', P.opts); m.userData.noite = true; amigosNoite.push({ id, nome: P.nome, mesh: m, falou: false });
      aplicaEmote(m, 'triste', 0);
    });
    // se o Fantasma já foi encontrado, ele sobe de novo na árvore e uiva pra lua
    phantom.seguindo = false; phantom.estagio = 9; phantom.mesh.visible = true; phantom.mesh.position.set(PHANTOM_ARV[0], ARV_TOPO, -PHANTOM_ARV[1]); phantom.mesh.rotation.set(0, 0.8, 0);
    missoes.splice(0, missoes.length,
      { id: 'amigos', txt: 'Falar com os amigos acordados na fogueira (0/' + amigos.length + ')', ok: false, n: 0, total: amigos.length },
      { id: 'risada', txt: 'Investigar a risada na mata perto da cancha de bocha', ok: false },
      { id: 'luz', txt: 'Investigar a luz flutuando na praia', ok: false },
      { id: 'batidas', txt: 'Investigar as batidas e o uivo na árvore do lobinhos.com', ok: false },
      { id: 'lencol', txt: 'Pegar o "fantasma" que aparece na mata', ok: false },
      { id: 'dormir', txt: 'Voltar pra barraca e dormir', ok: false });
    renderMissoes();
    if (!amigos.length) completa('amigos');
    aviso('🌙 O camping está ASSOMBRADO esta noite. Descubra por que ninguém consegue dormir.', 6000);
    // fantasma de lençol começa a aparecer
    lencolAparece();
  }
  if (cena.t > 5.0) { fadeEl.style.opacity = 0; }
  if (cena.t > 5.8) { cena = null; document.getElementById('hud').style.opacity = 1; }
}
function lencolAparece() {
  if (!noite || capituloNoite.revelado) return;
  let x, y, guard = 0;
  do { const a = rnd(0, 6.28), d = rnd(22, 34); x = estado.pos.x + Math.cos(a) * d; y = -estado.pos.z + Math.sin(a) * d; } while (guard++ < 50 && (!pontoNoPoligono(x, y, MAPA.camping) || pontoNoPoligono(x, y, MAPA.praia)));
  lencol.position.set(x, altO(x, y), -y); lencol.visible = true; lencol.userData.t = 0; SOM.risada();
}
// interações da noite (só na noite assombrada)
const pend = id => { const m = missoes.find(x => x.id === id); return !!m && !m.ok; };
interativos.push({ x: -58, z: 78, r: 6, nome: 'Olhar a risada na árvore', cond: () => noite && !noite2 && pend('risada'), acao: () => { SOM.coruja(); aviso('Era uma CORUJA! A "risada" era o piado dela. Ufa... 🦉', 4500); completa('risada'); } });
interativos.push({ x: SALVA[0] - 1.3, z: -SALVA[1] + 0.4, r: 6, nome: 'Olhar a luz flutuante', cond: () => noite && !noite2 && pend('luz'), acao: () => { aviso('É só a lanterna do salva-vidas balançando no vento, pendurada na boia. Nada de fantasma. 🔦', 4500); completa('luz'); } });
interativos.push({ x: ARV_BAND[0], z: -ARV_BAND[1], r: 7, nome: 'Investigar as batidas', cond: () => noite && !noite2 && pend('batidas'), acao: () => { SOM.uivo(); aviso('As batidas são a corda da bandeira batendo no tronco com o vento... e o uivo é o FANTASMA, o cachorro, em cima da árvore uivando pra lua! 🐕🌙', 6000); completa('batidas'); } });
interativos.push({ x: 0, z: 0, r: 3.5, nome: 'Pegar o fantasma!', cond: () => noite && !noite2 && lencol.visible && capituloNoite && !capituloNoite.revelado && ['risada', 'luz', 'batidas'].every(id => { const m = missoes.find(x => x.id === id); return m && m.ok; }), acao: () => {
  capituloNoite.revelado = true; cutsceneAspirador();
} });
interativos.push({ x: spotsBarraca[1][0], z: -spotsBarraca[1][1], r: 3.5, nome: 'Dormir na barraca', cond: () => !noite && !capituloNoite && missoes.find(m => m.id === 'fogueira') && missoes.find(m => m.id === 'fogueira').ok, acao: () => iniciaNoite() });
interativos.push({ x: spotsBarraca[1][0], z: -spotsBarraca[1][1], r: 3.5, nome: 'Dormir na barraca', cond: () => noite2 && n2.historiaContada && !n2.fase && !cena, acao: () => iniciaNoite2() });
interativos.push({ x: spotsBarraca[1][0], z: -spotsBarraca[1][1], r: 3.5, nome: 'Dormir', cond: () => noite2 && n2.fase === 'voltar', acao: () => {
  cena = { amanhece2: true, t: 0 }; fadeEl.style.opacity = 1; document.getElementById('hud').style.opacity = 0;
} });
function atualizaAmanhece2(dt) {
  cena.t += dt;
  if (cena.t > 1.2 && !cena.texto) { cena.texto = true; textoNoite.textContent = 'Zzz... 🌅 Bom dia!'; textoNoite.style.opacity = 1; SOM.galo(); }
  if (cena.t > 4 && !cena.pronto) {
    cena.pronto = true; textoNoite.style.opacity = 0; noite2 = false; ligaNoite(false); capituloNoite = null;
    for (const a of ajudantes) { a.estado = 'descansa'; aplicaEmote(a.mesh, 'feliz', 0); }
    for (const m of n2.rodaFogo) { m.visible = true; const u = m.userData; if (u.pernaE) { u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; } for (const o of obstaculos) if (o.npc === m) o.r = 0.5; }
    phantom.mesh.visible = true; phantom.mesh.position.set(ARV_BAND[0] + 5.4, ARV_BASE - 0.12, -ARV_BAND[1] + 1.2); phantom.mesh.rotation.set(-0.5, 2.6, 0); phantom.estagio = 4;
    for (const i of interativos) if (i.npcMesh && !i.npcMesh.userData.noite && i.npcMesh.visible) i.r = 3;
    for (const m of n2.seguidores) for (const o of obstaculos) if (o.npc === m) o.r = 0.5;
    n2.seguidores = []; n2.fase = null;
    completa('n2dormir');
    setTimeout(() => { aviso('🏕️ FIM DO ACAMPAMENTO — obrigado por jogar! Bandeira, fogueira, o Fantasma, a noite assombrada, o sonho, as obras e as estrelas. Melhor possível! 🐺', 12000); SOM.fim(); }, 1500);
  }
  if (cena.t > 4.8) fadeEl.style.opacity = 0;
  if (cena.t > 5.6) { cena = null; document.getElementById('hud').style.opacity = 1; }
}
interativos.push({ x: spotsBarraca[1][0], z: -spotsBarraca[1][1], r: 3.5, nome: 'Dormir (agora dá!)', cond: () => noite && !noite2 && ['amigos', 'risada', 'luz', 'batidas', 'lencol'].every(id => { const m = missoes.find(x => x.id === id); return m && m.ok; }), acao: () => {
  cena = { amanhece: true, t: 0 }; fadeEl.style.opacity = 1; document.getElementById('hud').style.opacity = 0;
} });
const sonho = { grupos: [], amigos: [], idx: -1, t: 0, ativo: false };
function iniciaSonho() {
  sonho.ativo = true; sonho.idx = -1; sonho.t = 0; sonho.grupos = []; sonho.amigos = [];
  for (const p of PROJETOS) { const g = construirMesh(p, true); if (g) sonho.grupos.push(g); }
  // os 4 lobinhos aparecem juntos olhando cada obra
  for (const id of ['lara', 'caio', 'dudu', 'maria']) { if (id === personagemId) continue; const m = escoteiro(PERSONAGENS[id].opts); scene.add(m); sonho.amigos.push(m); aplicaEmote(m, 'surpreso', 0); }
  scene.background = new THREE.Color(0xfff1d6); scene.fog = new THREE.Fog(0xfff1d6, 20, 90);
  sol.intensity = 0.6; hemi.intensity = 1.1; hemi.color.setHex(0xffe9c0); renderer.setClearColor(0xfff1d6);
  fadeEl.style.background = '#fff1d6'; fadeEl.style.opacity = 0.35;
  textoNoite.textContent = '✨ O sonho ✨'; textoNoite.style.opacity = 1; setTimeout(() => textoNoite.style.opacity = 0, 2500);
  SOM.sonho();
}
function atualizaSonho(dt) {
  sonho.t += dt;
  const dur = 4.2;
  const i = Math.min(PROJETOS.length - 1, Math.floor(sonho.t / dur));
  const p = PROJETOS[i], k = (sonho.t - i * dur) / dur;
  if (i !== sonho.idx) {
    sonho.idx = i;
    // lobinhos em fila olhando pra obra
    const bx = p.vx, by = p.vy;
    estado.pos.set(bx, altO(bx, by), -by); estado.yaw = Math.atan2(p.x - bx, -(p.y - by)); jogador.visible = true;
    sonho.amigos.forEach((m, j) => { const ax = bx + (j + 1) * 1.3, ay = by + (j + 1) * 0.3; m.position.set(ax, altO(ax, ay), -ay); m.rotation.y = Math.atan2(p.x - ax, -(p.y - ay)); });
    aviso('💭 ' + p.nome, 3000);
  }
  // câmera circulando devagar em volta da obra, mais alta na casa da árvore
  const ang = -0.9 + k * 1.6, r = p.id === 'casa' ? 14 : 12, hh = altO(p.x, p.y) + (p.id === 'casa' ? 7 : 3.5);
  camera.position.set(p.x + Math.sin(ang) * r, hh + 2, -p.y + Math.cos(ang) * r); camera.lookAt(p.x, hh - 1 + (p.id === 'casa' ? 2 : 0), -p.y);
  // lobinhos flutuando de leve (é sonho)
  sonho.amigos.forEach((m, j) => m.position.y += Math.sin(tempo * 2 + j) * 0.004);
  if (sonho.t > dur * PROJETOS.length) terminaSonho();
}
function terminaSonho() {
  sonho.ativo = false;
  for (const g of sonho.grupos) scene.remove(g); for (const m of sonho.amigos) scene.remove(m);
  sonho.grupos = []; sonho.amigos = [];
  fadeEl.style.background = '#000'; fadeEl.style.opacity = 1;
  sol.intensity = 0.95; hemi.intensity = 0.55; hemi.color.setHex(0xdfefff);
}
function atualizaAmanhece(dt) {
  cena.t += dt;
  if (cena.t > 1.2 && !cena.texto) { cena.texto = true; textoNoite.textContent = 'Zzz...'; textoNoite.style.opacity = 1; }
  if (cena.t > 3.0 && !cena.sonhou) { cena.sonhou = true; textoNoite.style.opacity = 0; ligaNoite(false); iniciaSonho(); }
  if (sonho.ativo) { atualizaSonho(dt); return; }
  if (cena.sonhou && !cena.acordou) { cena.acordou = true; cena.t = 2.4; setTimeout(() => { textoNoite.textContent = '🌅 Bom dia!'; textoNoite.style.opacity = 1; SOM.galo(); }, 600); }
  if (cena.t > 4 && !cena.pronto) {
    cena.pronto = true; textoNoite.style.opacity = 0; ligaNoite(false); lencol.visible = false;
    for (const a of amigosNoite) { a.mesh.visible = false; for (const o of obstaculos) if (o.npc === a.mesh) o.r = 0; for (const i of interativos) if (i.nome === 'Falar com ' + a.nome) i.r = 0; }
    for (const n of npcs) if (!n.mesh.userData.noite) { n.mesh.visible = true; for (const o of obstaculos) if (o.npc === n.mesh) o.r = 0.5; for (const i of interativos) if (i.nome === 'Falar com ' + n.nome) i.r = 3; }
    phantom.mesh.position.set(ARV_BAND[0] + 5.4, ARV_BASE - 0.12, -ARV_BAND[1] + 1.2); phantom.mesh.rotation.set(-0.5, 2.6, 0); phantom.estagio = 4;
    completa('dormir');
    setTimeout(iniciaDia2, 600);
  }
  if (cena.t > 4.8) fadeEl.style.opacity = 0;
  if (cena.t > 5.6) { cena = null; document.getElementById('hud').style.opacity = 1; }
}
// ---------- NOITE 2: calma. O gêmeo acorda o jogador; o jogador acorda o amigo; os quatro vão ver as estrelas ----------
const n2 = { fase: null, gemeo: null, amigo: null, amigoGemeo: null, seguidores: [], destino: null, historiaContada: false, rodaFogo: [] };
const HISTORIA = [
  'Sentem, lobinhos. Hoje eu vou contar a história do Fantasma.',
  'Muitos anos atrás, numa noite de tempestade, apareceu aqui no camping um cachorro magro, preto em cima e branco embaixo. Ninguém sabia de onde ele veio.',
  'Os campistas procuraram o dono por toda a cidade. Nada. Ele dormia debaixo da árvore em frente à cantina — que naquela época nem tinha nome.',
  'Uma noite, um lobinho se perdeu na mata. Todo mundo procurando, lanterna pra todo lado, o pai dele desesperado...',
  'E quem achou o menino? O cachorro. Levou ele de volta até esta fogueira, abanando o rabo, como se nada tivesse acontecido.',
  'Desde então ele é o guardião do camping. Aparece e some quando quer, ninguém manda nele. Por isso o nome: Fantasma.',
  'Então, se vocês ouvirem um uivo no meio da noite... não é assombração. É o Fantasma cuidando de vocês.',
  'Agora todo mundo pra barraca! Amanhã tem mais camping. Boa noite, alcateia!',
];
function sentaNaFogueira(m, ang, r) {
  const fx = sede.fogueiraPos[0], fy = sede.fogueiraPos[1], px = fx + Math.cos(ang) * r, py = fy + Math.sin(ang) * r;
  m.visible = true; m.position.set(px, altO(px, py) + 0.15, -py); m.rotation.y = Math.atan2(fx - px, -(fy - py));
  const u = m.userData; if (u.pernaE) { u.pernaE.rotation.x = u.pernaD.rotation.x = -1.4; u.bracoE.rotation.x = u.bracoD.rotation.x = -0.4; }
  for (const o of obstaculos) if (o.npc === m) { o.x = px; o.z = -py; o.r = 0; }
  n2.rodaFogo.push(m);
}
function iniciaAnoitecer() {
  if (noite2 || noite) return;
  noite2 = true; capituloNoite = { n2: true, tapT: 1e9, uivoT: 1e9, revelado: true };
  fadeEl.style.opacity = 1;
  setTimeout(() => {
    ligaNoite(true); sede.chamas.visible = true; SOM.fogueira(true);
    // todo mundo em volta da fogueira: Chefe Diego, Akelá, alcateia, Pai e o Fantasma
    n2.rodaFogo = [];
    const todos = npcs.filter(n => !n.mesh.userData.noite && n.nome !== 'Alisson');
    let k = 0;
    for (const n of todos) { if (n.nome === 'Chefe Diego') continue; sentaNaFogueira(n.mesh, 0.5 + k * (5.3 / Math.max(1, todos.length - 1)), 4.2 + (k % 2) * 0.6); k++; }
    const diego = npcs.find(n => n.nome === 'Chefe Diego'); if (diego) { sentaNaFogueira(diego.mesh, -Math.PI / 2, 3.2); const u = diego.mesh.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = 0; diego.mesh.position.y -= 0.15; }
    phantom.mesh.visible = true; phantom.mesh.position.set(sede.fogueiraPos[0] - 2.2, altO(sede.fogueiraPos[0] - 2.2, sede.fogueiraPos[1] - 3) - 0.12, -(sede.fogueiraPos[1] - 3)); phantom.mesh.rotation.set(-0.5, 0.8, 0); phantom.estagio = 9;
    for (const a of ajudantes) a.estado = 'n2';
    for (const i of interativos) if (i.npcMesh) i.r = 0;
    const sp = spotsBarraca[1]; estado.pos.set(sp[0] + 4.5, altO(sp[0] + 4.5, sp[1]), -sp[1]); estado.yaw = Math.PI / 2; cam.yaw = estado.yaw + Math.PI;
    missoes.splice(0, missoes.length, { id: 'historias', txt: 'Anoiteceu! Ir até a Fogueira do Conselho ouvir as histórias do Chefe Diego', ok: false }); renderMissoes();
    const ih = interativos.find(i => i.nome === 'Ouvir as histórias do Chefe'); ih.x = sede.fogueiraPos[0]; ih.z = -sede.fogueiraPos[1] + 4.5; ih.r = 9;
    fadeEl.style.opacity = 0;
    aviso('🌙 Anoiteceu no camping. O Chefe Diego chamou todo mundo pra fogueira: hora de histórias!', 6000);
  }, 900);
}
interativos.push({ x: 0, z: 0, r: 0, nome: 'Ouvir as histórias do Chefe', cond: () => noite2 && !n2.historiaContada && !cena, acao: () => {
  // o jogador senta na roda e a história começa (E avança as falas)
  const fx = sede.fogueiraPos[0], fy = sede.fogueiraPos[1], px = fx + Math.cos(-0.2) * 4.6, py = fy + Math.sin(-0.2) * 4.6;
  estado.pos.set(px, altO(px, py) + 0.15, -py); estado.yaw = Math.atan2(fx - px, -(fy - py));
  cena = { historia: true, i: -1, t: 0 }; document.getElementById('hud').style.opacity = 1;
  proximaFala();
} });
function proximaFala() {
  if (!cena || !cena.historia) return;
  cena.i++; cena.t = 0;
  if (cena.i >= HISTORIA.length) {
    cena = null; n2.historiaContada = true; completa('historias');
    missoes.push({ id: 'n2cama', txt: 'Ir dormir na barraca', ok: false }); renderMissoes();
    const u = jogador.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0;
    for (const m of n2.rodaFogo) { m.visible = false; }   // todo mundo foi pra barraca
    phantom.mesh.visible = false;
    return;
  }
  aviso('Chefe Diego: "' + HISTORIA[cena.i] + '"  (E pra continuar)', 20000);
  if (cena.i === 4) SOM.latido(); if (cena.i === 6) SOM.uivo();
}
function atualizaHistoria(dt) {
  cena.t += dt; if (cena.t > 9) proximaFala();
  const u = jogador.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = -1.4; u.bracoE.rotation.x = u.bracoD.rotation.x = -0.4;
}
function cameraHistoria() {   // girando devagar em volta da fogueira
  const fx = sede.fogueiraPos[0], fz = -sede.fogueiraPos[1], a = tempo * 0.12;
  camera.position.set(fx + Math.sin(a) * 9, altO(fx, -fz) + 3.2, fz + Math.cos(a) * 9); camera.lookAt(fx, altO(fx, -fz) + 1, fz);
}
function iniciaNoite2() {
  if (n2.fase) return;
  noite2 = true; capituloNoite = capituloNoite || { n2: true, tapT: 1e9, uivoT: 1e9, revelado: true };
  fadeEl.style.opacity = 1; cena = { noite2Intro: true, t: 0 }; document.getElementById('hud').style.opacity = 0;
}
function atualizaNoite2Intro(dt) {
  cena.t += dt;
  const eu = PERSONAGENS[personagemId].nome, gemeoId = personagemId === 'lara' ? 'caio' : 'lara', gemeo = PERSONAGENS[gemeoId].nome;
  if (cena.t > 0.9 && !cena.texto) { cena.texto = true; textoNoite.textContent = 'Zzz...'; textoNoite.style.opacity = 1; }
  if (cena.t > 3.5 && !cena.psiu) { cena.psiu = true; textoNoite.textContent = gemeo + ': "Psiu, ' + eu + '! Acorda!"'; SOM.sussurro(); }
  if (cena.t > 6.5 && !cena.pronto) {
    cena.pronto = true; textoNoite.style.opacity = 0;
    ligaNoite(true);
    // todo mundo dormindo; o jogador sai da barraca com o gêmeo do lado
    for (const n of npcs) { for (const i of interativos) if (i.npcMesh === n.mesh) i.r = 0; }
    for (const m of n2.rodaFogo) { m.visible = false; const u = m.userData; if (u.pernaE) { u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; } }
    const sp = spotsBarraca[1]; estado.pos.set(sp[0] + 4.5, altO(sp[0] + 4.5, sp[1]), -sp[1]); estado.yaw = Math.PI / 2; cam.yaw = estado.yaw + Math.PI; cam.pitch = 0.25;
    const meshDe = id => { const a = ajudantes.find(a => a.id === id); return a ? a.mesh : null; };
    n2.gemeo = meshDe(gemeoId); n2.amigo = meshDe(personagemId === 'caio' ? 'dudu' : 'maria'); n2.amigoGemeo = meshDe(personagemId === 'caio' ? 'maria' : 'dudu');
    for (const a of ajudantes) a.estado = 'n2';
    // o gêmeo já está de pé do seu lado; os outros dois dormem nas barracas da roda, perto da fogueira
    if (n2.gemeo) { n2.gemeo.visible = true; n2.gemeo.position.set(sp[0] + 6.5, altO(sp[0] + 6.5, sp[1] + 1.5), -(sp[1] + 1.5)); n2.gemeo.rotation.y = -Math.PI / 2; aplicaEmote(n2.gemeo, 'feliz', 0); }
    const fx = sede.fogueiraPos[0], fy = sede.fogueiraPos[1];
    const dorme = (m, ang) => { if (!m) return; m.visible = true; const px = fx + Math.cos(ang) * 9, py = fy + Math.sin(ang) * 9; m.position.set(px, altO(px, py), -py); m.rotation.y = Math.atan2(fx - px, -(fy - py)); aplicaEmote(m, 'dormindo', 0); for (const o of obstaculos) if (o.npc === m) { o.x = px; o.z = -py; } };
    dorme(n2.amigo, 1.257); dorme(n2.amigoGemeo, 2.513);
    n2.destino = projetos.feitos.includes('mirante') ? { nome: 'Mirante do molhe', x: 240, y: -100 } : { nome: 'Praia do Camping', x: 70, y: -40 };
    const amigoN = PERSONAGENS[personagemId === 'caio' ? 'dudu' : 'maria'].nome;
    missoes.splice(0, missoes.length,
      { id: 'n2acorda', txt: 'Acordar ' + (amigoN === 'Maria' ? 'a ' : 'o ') + amigoN + ' na barraca da roda (o ' + gemeo + ' acorda ' + (personagemId === 'caio' ? 'a Maria' : 'o Dudu') + ')', ok: false },
      { id: 'n2ir', txt: 'Ir com os três até: ' + n2.destino.nome, ok: false },
      { id: 'n2estrelas', txt: 'Ver as estrelas juntos', ok: false },
      { id: 'n2dormir', txt: 'Voltar pra barraca e dormir', ok: false });
    renderMissoes();
    aviso(gemeo + ': "Vem, ' + eu + '! Acorda ' + (amigoN === 'Maria' ? 'a ' : 'o ') + amigoN + ' que eu acordo ' + (personagemId === 'caio' ? 'a Maria' : 'o Dudu') + '. A noite tá LINDA lá fora."', 6000);
    n2.fase = 'acordar';
    const ia = interativos.find(i => i.nome === 'Acordar o amigo');
    if (n2.amigo) { ia.x = n2.amigo.position.x; ia.z = n2.amigo.position.z; ia.r = 3.5; }
    else { ia.r = 0; setTimeout(() => ia.acao(), 1500); }
    const ie = interativos.find(i => i.nome === 'Ver as estrelas'); ie.x = n2.destino.x; ie.z = -n2.destino.y; ie.r = 30;
  }
  if (cena.t > 7.2) fadeEl.style.opacity = 0;
  if (cena.t > 8) { cena = null; document.getElementById('hud').style.opacity = 1; }
}
interativos.push({ x: 0, z: 0, r: 0, nome: 'Acordar o amigo', cond: () => noite2 && n2.fase === 'acordar', acao: () => {
  const amigoN = PERSONAGENS[personagemId === 'caio' ? 'dudu' : 'maria'].nome;
  if (n2.amigo) aplicaEmote(n2.amigo, 'surpreso', 3);
  aviso(amigoN + ': "Hmm... quê? Ah, é você, ' + PERSONAGENS[personagemId].nome + '! Ver as estrelas? BORA!"', 5000); SOM.pop();
  n2.fase = 'ir'; completa('n2acorda');
  // o gêmeo acorda o outro e os três passam a seguir o jogador
  if (n2.amigoGemeo) aplicaEmote(n2.amigoGemeo, 'feliz', 0);
  n2.seguidores = [n2.gemeo, n2.amigo, n2.amigoGemeo].filter(Boolean);
  aviso(PERSONAGENS[personagemId === 'lara' ? 'caio' : 'lara'].nome + ' acordou ' + (personagemId === 'caio' ? 'a Maria' : 'o Dudu') + '. Vamos: ' + n2.destino.nome + '!', 4000);
} });
interativos.push({ x: 0, z: 0, r: 0, nome: 'Ver as estrelas', cond: () => noite2 && n2.fase === 'ir', acao: () => {
  n2.fase = 'estrelas'; completa('n2ir');
  cena = { estrelas: true, t: 0, cam0: camera.position.clone() }; document.getElementById('hud').style.opacity = 0;
  // os quatro sentados lado a lado olhando a lagoa, sempre em terra firme
  const base = pontoEmTerra(n2.destino.x, n2.destino.y);
  const cx = base[0], cy = base[1];
  n2.voltaPara = [cx, cy];
  const lugares = [[-2.2, 0], [-0.7, 0], [0.8, 0], [2.3, 0]];
  const todos = [jogador].concat(n2.seguidores);
  todos.forEach((m, i) => {
    let px = cx + lugares[i][0], py = cy;
    if (!emTerra(px, -py) && !sobrePonte(px, -py)) { px = cx; py = cy; }
    if (m === jogador) { estado.pos.set(px, altO(px, py), -py); estado.yaw = 0; } else { m.position.set(px, altO(px, py), -py); m.rotation.y = 0; }
    const u = m.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = -1.4; u.bracoE.rotation.x = u.bracoD.rotation.x = -0.4;
  });
} });
function pontoEmTerra(x, y) {
  if (emTerra(x, -y)) return [x, y];
  for (let r = 3; r <= 40; r += 3) for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (emTerra(px, -py)) return [px, py]; }
  return [MAPA.portaoEntrada.x + 4, MAPA.portaoEntrada.y + 6];
}
function atualizaEstrelas(dt) {
  cena.t += dt;
  const falas = [
    [2, PERSONAGENS[personagemId === 'lara' ? 'caio' : 'lara'].nome + ': "Olha quanta estrela... Não dá pra ver assim na cidade."'],
    [6, (personagemId === 'caio' ? 'Dudu' : 'Maria') + ': "' + (personagemId === 'caio' ? 'Mano, aquela ali é a maior. Aposto que tem 900 mil de aura.' : 'A gente devia vir aqui toda noite de acampamento, Lara.') + '"'],
    [10, (personagemId === 'caio' ? 'Maria' : 'Dudu') + ': "' + (personagemId === 'caio' ? 'Olha! Uma estrela cadente! Faz um pedido!' : 'OLHA! Estrela cadente! Pedi pra ter 1 milhão de aura!') + '"'],
    [14, PERSONAGENS[personagemId].nome + ': "Melhor acampamento de todos."'],
  ];
  for (const [t, f] of falas) if (cena.t > t && !cena['f' + t]) { cena['f' + t] = true; aviso(f, 3800); }
  if (cena.t > 9.5 && cena.t < 12) { estrelaCadente.visible = true; const k = (cena.t - 9.5) / 2.5; estrelaCadente.position.set(estado.pos.x + 60 - k * 160, 90 - k * 40, estado.pos.z - 150); }
  else estrelaCadente.visible = false;
  if (cena.t > 18) {
    cena = null; document.getElementById('hud').style.opacity = 1; completa('n2estrelas'); n2.fase = 'voltar';
    if (!emTerra(estado.pos.x, estado.pos.z)) { const [sx, sy] = pontoEmTerra(-estado.pos.z * 0 + estado.pos.x, -estado.pos.z); estado.pos.set(sx, altO(sx, sy), -sy); }
    const todos = [jogador].concat(n2.seguidores); todos.forEach(m => { const u = m.userData; u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; });
    aviso('🌙 Hora de voltar pra barraca e dormir de verdade.', 4000);
  }
}
function atualizaSeguidores(dt) {
  if (!noite2 || cena || !n2.seguidores.length) return;
  n2.seguidores.forEach((m, i) => {
    const alvoM = i === 0 ? jogador : n2.seguidores[i - 1];
    const dx = alvoM.position.x - m.position.x, dz = alvoM.position.z - m.position.z, d = Math.hypot(dx, dz);
    const u = m.userData;
    if (d > 2.6) { const v = Math.min(d * 1.5, 6.5) * dt, nx = m.position.x + dx / d * v, nz = m.position.z + dz / d * v; if (emTerra(nx, nz) || sobrePonte(nx, nz)) { m.position.x = nx; m.position.z = nz; } m.position.y = alt(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz); u.fase = (u.fase || 0) + dt * 9; const sw = Math.sin(u.fase) * 0.6; u.pernaE.rotation.x = sw; u.pernaD.rotation.x = -sw; u.bracoE.rotation.x = -sw; u.bracoD.rotation.x = sw; }
    else { u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; }
    for (const o of obstaculos) if (o.npc === m) { o.r = 0; }
  });
}
function atualizaNoite(dt) {
  if (!noite) return;
  const c = capituloNoite;
  if (noite2) {   // noite calma: só lua, lanterna e vagalumes
    lua.position.set(estado.pos.x - 120, 90, estado.pos.z - 160);
    lanterna.position.set(estado.pos.x, estado.pos.y + 1.4, estado.pos.z); lanterna.target.position.set(estado.pos.x + Math.sin(estado.yaw) * 8, estado.pos.y + 0.5, estado.pos.z + Math.cos(estado.yaw) * 8);
    const d = new THREE.Object3D();
    for (let i = 0; i < vagaPos.length; i++) { const v = vagaPos[i]; const on = Math.sin(tempo * v.v * 2 + v.f) > 0.3; d.position.set(v.x + Math.sin(tempo * 0.7 + v.f) * 0.8, on ? v.a + v.h + Math.sin(tempo + v.f) * 0.3 : -5, v.z + Math.cos(tempo * 0.5 + v.f) * 0.8); d.updateMatrix(); vagalumes.setMatrixAt(i, d.matrix); }
    vagalumes.instanceMatrix.needsUpdate = true;
    return;
  }
  // lua e lanterna do jogador
  lua.position.set(estado.pos.x - 120, 90, estado.pos.z - 160);
  lanterna.position.set(estado.pos.x, estado.pos.y + 1.4, estado.pos.z);
  lanterna.target.position.set(estado.pos.x + Math.sin(estado.yaw) * 8, estado.pos.y + 0.5, estado.pos.z + Math.cos(estado.yaw) * 8);
  // vagalumes piscando
  const d = new THREE.Object3D();
  for (let i = 0; i < vagaPos.length; i++) { const v = vagaPos[i]; const on = Math.sin(tempo * v.v * 2 + v.f) > 0.3; d.position.set(v.x + Math.sin(tempo * 0.7 + v.f) * 0.8, on ? v.a + v.h + Math.sin(tempo + v.f) * 0.3 : -5, v.z + Math.cos(tempo * 0.5 + v.f) * 0.8); d.updateMatrix(); vagalumes.setMatrixAt(i, d.matrix); }
  vagalumes.instanceMatrix.needsUpdate = true;
  // lampião balançando
  lampiao.position.set(luzPraia.position.x, altO(SALVA[0], SALVA[1]) + 3.4 + Math.sin(tempo * 2) * 0.1, luzPraia.position.z + Math.sin(tempo * 1.7) * 0.4); luzPraia.position.z = lampiao.position.z; luzPraia.intensity = 1.3 + Math.sin(tempo * 9) * 0.3;
  // batidas e uivo na árvore
  const dArv = Math.hypot(estado.pos.x - ARV_BAND[0], estado.pos.z + ARV_BAND[1]);
  c.tapT -= dt; if (c.tapT <= 0) { c.tapT = 1.6 + Math.random(); if (dArv < 45) SOM.tap(); }
  c.uivoT -= dt; if (c.uivoT <= 0) { c.uivoT = 9 + Math.random() * 6; if (dArv < 80) SOM.uivo(); c.uivando = tempo + 1.2; }
  phantom.mesh.rotation.x = c.uivando > tempo ? -0.45 : 0;
  // fantasma de lençol flutuando; some quando você chega perto (até o mistério estar resolvido)
  if (lencol.visible && !(cena && cena.aspira)) {
    lencol.userData.t += dt; lencol.position.y = alt(lencol.position.x, lencol.position.z) + 0.3 + Math.sin(tempo * 2.5) * 0.25; lencol.rotation.y = Math.atan2(estado.pos.x - lencol.position.x, estado.pos.z - lencol.position.z);
    const dl = Math.hypot(estado.pos.x - lencol.position.x, estado.pos.z - lencol.position.z);
    const podePegar = ['risada', 'luz', 'batidas'].every(id => missoes.find(m => m.id === id).ok);
    const it = interativos.find(i => i.nome === 'Pegar o fantasma!'); it.x = lencol.position.x; it.z = lencol.position.z;
    if (!podePegar && dl < 7) { lencol.visible = false; SOM.risada(); aviso('O fantasma sumiu na mata! "hehehe..."', 2500); setTimeout(lencolAparece, 6000 + Math.random() * 6000); }
    else if (lencol.userData.t > 18 && !podePegar) { lencol.visible = false; setTimeout(lencolAparece, 4000); }
  } else if (!c.revelado && !c.proxAgendado) { c.proxAgendado = true; setTimeout(() => { c.proxAgendado = false; lencolAparece(); }, 8000); }
  // amigos na fogueira olham pro jogador e as barracas balançam de leve
  for (const a of amigosNoite) { const dd = Math.hypot(estado.pos.x - a.mesh.position.x, estado.pos.z - a.mesh.position.z); if (dd < 8) a.mesh.rotation.y = Math.atan2(estado.pos.x - a.mesh.position.x, estado.pos.z - a.mesh.position.z); }
}
// falas dos amigos acordados (pistas)
function falaAmigoNoite(a) {
  const nome = PERSONAGENS[personagemId].nome;
  const pistas = {
    maria: 'Maria: "' + nome + ', você também não consegue dormir? Eu ouvi uma RISADA vindo da mata, perto da cancha de bocha... tô morrendo de medo."',
    dudu: 'Dudu: "Mano, eu vi uma LUZ BRANCA flutuando lá na praia! Sério! Isso aqui tá assombrado, eu falei que tinha 500 mil de aura mas agora tô com 2."',
    caio: 'Caio: "Mana, tem alguma coisa batendo TAP, TAP na árvore do lobinhos.com. E um UIVO horrível. Ninguém dorme assim."',
    lara: 'Lara: "Mano, tem alguma coisa batendo TAP, TAP na árvore do lobinhos.com. E um UIVO horrível. Ninguém dorme assim."',
  };
  aviso(pistas[a.id], 6500);
  if (!a.falou) { a.falou = true; const m = missoes.find(x => x.id === 'amigos'); m.n++; m.txt = 'Falar com os amigos acordados na fogueira (' + m.n + '/' + m.total + ')'; renderMissoes(); if (m.n >= m.total) completa('amigos'); }
}

// ---------- habilidades (Q / LB) ----------
const HABILIDADES = {
  caio: { nome: 'Batucada', desc: 'Batuca com 2 baquetas numa árvore: pode cair um galho ou uma madeira (2 galhos = 1 madeira)' },
  lara: { nome: 'Macramê', desc: 'Tece uma corda de macramê numa árvore e sobe por ela até a copa (Q de novo pra descer)' },
  dudu: { nome: 'Doidera', desc: 'Corre 2x mais rápido por 6 segundos' },
  maria: { nome: 'Biscoito de cachorro', desc: 'O Fantasma vem até ela e leva ela pra onde ela escolher' },
};
const arvoresBatucadas = new Set();
let madeirasArvoreLobinhos = 0;
function arvoreProxima(x, z) {
  let melhor = null, md = 3.2;
  for (const a of arvores) { const d = Math.hypot(a.x - x, -a.y - z); if (d < md) { md = d; melhor = { x: a.x, z: -a.y, id: a.x + ',' + a.y }; } }
  const dB = Math.hypot(ARV_BAND[0] - x, -ARV_BAND[1] - z); if (dB < 4.5) melhor = { x: ARV_BAND[0], z: -ARV_BAND[1], id: 'bandeira' };
  return melhor;
}
// pl: { id, pos, mesh, p1 } — funciona pro jogador 1 e pros extras
function animaBatucada(mesh) {
  const u = mesh.userData; if (!u.batucando) return;
  if (u.batucando > tempo) { const k = Math.sin(tempo * 28); u.bracoE.rotation.x = -1.6 + k * 0.5; u.bracoD.rotation.x = -1.6 - k * 0.5; }
  else { u.batucando = 0; if (u.baquetas) u.baquetas.forEach(b => b.visible = false); }
}
function usaHabilidade(pl) {
  const id = pl.id, u = pl.mesh.userData;
  if (cena) return;
  if (id === 'caio') {
    const a = arvoreProxima(pl.pos.x, pl.pos.z);
    if (!a) { aviso('Chega perto de uma árvore pra batucar 🥁', 2000); return; }
    if (u.batucando) return;
    u.batucando = tempo + 1.3; if (u.baquetas) u.baquetas.forEach(b => b.visible = true);
    pl.mesh.rotation.y = Math.atan2(a.x - pl.pos.x, a.z - pl.pos.z); if (pl.p1) estado.yaw = pl.mesh.rotation.y;
    for (let i = 0; i < 6; i++) setTimeout(() => SOM.tap(), i * 200);
    setTimeout(() => {
      const r = Math.random();
      const ang = rnd(0, 6.28), px = a.x + Math.cos(ang) * 2.2, pz = a.z + Math.sin(ang) * 2.2;
      if (a.id === 'bandeira') {
        // a árvore do lobinhos.com é especial: dá até 5 madeiras (sempre cai alguma coisa)
        madeirasArvoreLobinhos = madeirasArvoreLobinhos || 0;
        if (madeirasArvoreLobinhos >= 5) { aviso('A árvore do lobinhos.com já deu as 5 madeiras dela 🌳', 2500); return; }
        madeirasArvoreLobinhos++; caiItem(px, pz, 'madeira'); aviso('🪵 A árvore do lobinhos.com soltou uma madeira! (' + madeirasArvoreLobinhos + '/5)', 2500);
        return;
      }
      const ja = arvoresBatucadas.has(a.id);
      if (ja || r < 0.4) aviso(ja ? 'Essa árvore já deu o que tinha 🌳' : 'Só caíram folhas... 🍃', 2200);
      else if (r < 0.78) { caiItem(px, pz, 'galho'); aviso('🌿 Caiu um galho!', 2200); arvoresBatucadas.add(a.id); }
      else { caiItem(px, pz, 'madeira'); aviso('🪵 Caiu uma madeira!', 2200); arvoresBatucadas.add(a.id); }
    }, 1200);
  } else if (id === 'lara') {
    if (!pl.p1) { aviso('🪢 Só o jogador 1 escala com o macramê por enquanto', 2000); return; }
    if (estado.macrame) return;
    if (estado.poleiro) { estado.macrame = { fase: 'desce', ...estado.poleiro }; aviso('🪢 Descendo pelo macramê...', 1500); return; }
    const a = arvoreProxima(pl.pos.x, pl.pos.z);
    if (!a || a.id === 'bandeira') { aviso(a ? 'Nessa árvore usa o A de bambu! Tenta em outra.' : 'Chega perto de uma árvore pra tecer o macramê 🪢', 2200); return; }
    const arv = arvores.find(t => t.x + ',' + t.y === a.id); if (!arv) return;
    const base = altO(arv.x, arv.y), topo = base + Math.max(3, arv.h - 0.6), rr = arv.r + 0.5;
    // corda de macramê: cordão com nós, pendurada da copa até o chão, do lado do jogador
    const dx = pl.pos.x - a.x, dz = pl.pos.z - a.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
    const corda = new THREE.Group(); corda.position.set(a.x + ux * (rr + 0.15), base, a.z + uz * (rr + 0.15));
    const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, topo - base, 6), new THREE.MeshLambertMaterial({ color: 0xe8dcc0 })); fio.position.y = (topo - base) / 2; corda.add(fio);
    for (let h = 0.35; h < topo - base; h += 0.45) { const no = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.03, 6, 10), new THREE.MeshLambertMaterial({ color: h % 0.9 < 0.45 ? 0xd9c7a0 : 0xb89a6a })); no.position.y = h; no.rotation.x = Math.PI / 2; corda.add(no); const no2 = no.clone(); no2.rotation.y = Math.PI / 2; no2.rotation.x = 0; corda.add(no2); }
    scene.add(corda);
    u.bracoE.rotation.x = u.bracoD.rotation.x = -1.4;
    aviso('🪢 Lara teceu um macramê e vai subir na árvore!', 2500); SOM.coleta();
    estado.macrame = { fase: 'tece', t: 0, x: a.x, z: a.z, base, topo, r: rr, ux, uz, corda };
  } else if (id === 'dudu') {
    u.turboAte = tempo + 6; aplicaEmote(pl.mesh, 'surpreso', 6); SOM.risada(); aviso('⚡ DOIDERA! Dudu correndo 2x mais rápido por 6 s!', 2500);
  } else if (id === 'maria') {
    if (phantom.estagio < 2 && !noite) { aviso('🍪 O Fantasma ainda tá longe demais pra sentir o cheiro do biscoito...', 2500); return; }
    SOM.latido(); aviso('🍪 Maria jogou um biscoito de cachorro! O Fantasma vem correndo!', 2500);
    phantom.mesh.visible = true; phantom.seguindo = true; phantom.obst.r = 0; if (phantom.estagio < 4) phantom.estagio = 3;
    if (phantom.estagio === 2) { const m = missoes.find(z => z.id === 'phantom'); if (m && !m.ok) { m.txt = 'Levar o Fantasma até o Alisson'; renderMissoes(); } }
    phantom.alvoSeguir = pl.mesh;
    if (pl.p1) { setTimeout(() => { if (!cena) abreDestinos(); }, 1500); }
  }
}
// menu de destinos da Maria
const DESTINOS = [['Portaria', 190, 218], ['Árvore do lobinhos.com', -34, -8], ['Praia do Camping', 60, -40], ['Casinha do salva-vidas', 95, -24], ['Sede do Grupo Escoteiro', -200, -138], ['Molhe', 247, -110], ['Campo do Camping', 187, 60], ['Cancha de bocha', -70, -62]];
const destinosEl = document.getElementById('destinos');
let destinoIdx = 0, escolhendoDestino = false;
function abreDestinos() {
  escolhendoDestino = true; destinoIdx = 0; desenhaDestinos();
}
function desenhaDestinos() {
  destinosEl.style.display = 'block';
  destinosEl.innerHTML = '<b>🍪 Pra onde o Fantasma te leva?</b><br>' + DESTINOS.map((d, i) => '<div class="dest' + (i === destinoIdx ? ' sel' : '') + '">' + (i + 1) + '. ' + d[0] + '</div>').join('') + '<small>↑↓ ou 1-8 escolhe · E/Enter confirma · Esc cancela</small>';
}
function fechaDestinos() { escolhendoDestino = false; destinosEl.style.display = 'none'; }
function confirmaDestino() {
  const d = DESTINOS[destinoIdx]; fechaDestinos();
  const jaPerto = Math.hypot(phantom.mesh.position.x - estado.pos.x, phantom.mesh.position.z - estado.pos.z) < 6;
  const vai = () => { cena = { monta: true, t: 0, fase: 'sobe', camPos: camera.position.clone(), destino: d }; const dir = phantom.mesh.position.clone().sub(camera.position); dir.y = 0; dir.normalize(); cena.dir = dir; phantom.mesh.rotation.x = 0; phantom.mesh.position.y = alt(phantom.mesh.position.x, phantom.mesh.position.z); phantom.mesh.rotation.y = Math.atan2(dir.x, dir.z); phantom.seguindo = false; SOM.latido(); };
  if (jaPerto) vai(); else { aviso('Esperando o Fantasma chegar...', 2000); const w = setInterval(() => { if (Math.hypot(phantom.mesh.position.x - estado.pos.x, phantom.mesh.position.z - estado.pos.z) < 6) { clearInterval(w); vai(); } }, 200); }
}
addEventListener('keydown', e => {
  if (!escolhendoDestino) return;
  if (e.code === 'ArrowUp' || e.code === 'KeyW') { destinoIdx = (destinoIdx + DESTINOS.length - 1) % DESTINOS.length; desenhaDestinos(); }
  if (e.code === 'ArrowDown' || e.code === 'KeyS') { destinoIdx = (destinoIdx + 1) % DESTINOS.length; desenhaDestinos(); }
  const n = parseInt(e.key); if (n >= 1 && n <= DESTINOS.length) { destinoIdx = n - 1; desenhaDestinos(); }
  if (e.code === 'Enter' || e.code === 'KeyE') confirmaDestino();
  if (e.code === 'Escape') fechaDestinos();
  e.stopImmediatePropagation();
}, true);

// ---------- DIA 2: o sonho de melhorar o camping, projetos de construção e a IA da alcateia ----------
const PROJETOS = [
  { id: 'casa', nome: 'Casa na árvore do lobinhos.com', x: -34, y: 2, vx: -28, vy: -9, desc: 'Plataforma com guarda-corpo e telhadinho na forquilha', etapas: [['serrar', 3, 'Serrar as tábuas'], ['amarrar', 2, 'Amarrar a plataforma na árvore'], ['martelar', 4, 'Pregar o guarda-corpo']] },
  { id: 'sede', nome: 'Reforma da sede', x: -210, y: -138, vx: -204, vy: -126, desc: 'Varanda coberta, bancos e pintura nova', etapas: [['martelar', 8, 'Martelar os pregos das tábuas']] },
  { id: 'ponte', nome: 'Pontezinha de bambu no arroio', x: -76, y: 4, vx: -70, vy: -4, desc: 'Passarela na margem do arroio, perto da cantina', etapas: [['amarrar', 4, 'Amarrar os bambus'], ['serrar', 2, 'Serrar as estacas']] },
  { id: 'mirante', nome: 'Mirante do molhe', x: 240, y: -100, vx: 238, vy: -90, desc: 'Deck de madeira na ponta pra ver a lagoa', etapas: [['serrar', 3, 'Serrar o deck'], ['martelar', 6, 'Pregar o deck e o guarda-corpo']] },
  { id: 'totem', nome: 'Totem da alcateia', x: -186, y: -148, vx: -180, vy: -140, desc: 'Totem esculpido ao lado da fogueira', etapas: [['martelar', 5, 'Esculpir com o formão'], ['amarrar', 1, 'Amarrar as asas do totem']] },
];
let obra = null;   // { p, etapa, feitos }
const projetos = { atual: null, feitos: [], entregue: 0 };
const ajudantes = [];   // IA: { id, nome, mesh, estado, alvo, carga, t }
const canteiro = new THREE.Group(); scene.add(canteiro);
function iniciaDia2() {
  dia2 = true; mostraMadeira();
  madeira = 0; mostraMadeira();
  missoes.splice(0, missoes.length, { id: 'diego2', txt: 'Bom dia! Falar com o Chefe Diego na portaria', ok: false });
  renderMissoes();
  // amigos voltam pra roda; Alisson volta a ser NPC do dia
  for (const n of npcs) if (n.nome === 'Alisson' || n.nome === 'Lobinho Alisson') { n.mesh.visible = false; for (const i of interativos) if (i.npcMesh === n.mesh) i.r = 0; for (const o of obstaculos) if (o.npc === n.mesh) o.r = 0; }
  aviso('🌅 Dia 2 no camping. Que sonho estranho... Os amigos estão acordando aí na fogueira. Vá falar com o Chefe Diego.', 6000);
  const iDiego = interativos.find(i => i.nome === 'Falar com Chefe Diego');
  iDiego.acao = () => {
    const d2 = missoes.find(m => m.id === 'diego2');
    if (d2 && !d2.ok) {
      aviso('Chefe Diego: "Bom dia, ' + PERSONAGENS[personagemId].nome + '! Dormiu bem no fim? Os outros lobinhos acordaram falando de um SONHO... vai lá ouvir o que eles têm a dizer."', 6000);
      completa('diego2');
      missoes.push({ id: 'sonho', txt: 'Falar com os 3 amigos sobre o sonho (0/3)', ok: false, n: 0, falados: [] }); renderMissoes();
      return;
    }
    const so = missoes.find(m => m.id === 'sonho');
    if (so && !so.ok) { aviso('Chefe Diego: "Fala com os três primeiro: ' + nomesAmigos().join(', ') + '."', 4000); return; }
    const d3 = missoes.find(m => m.id === 'diego3');
    if (!d3) { aviso(noite2 ? 'Chefe Diego: "Senta aí, lobinho. Hoje tem história."' : 'Chefe Diego: "Foi o melhor acampamento que essa alcateia já teve, ' + PERSONAGENS[personagemId].nome + '. Melhor possível!"', 4000); return; }
    if (!d3.ok) {
      aviso('Chefe Diego: "Todos tiveram o MESMO sonho? Melhorar o camping... Então tá decidido: hoje a alcateia constrói! Vá ao canteiro que eu vou marcar e mãos à obra — serrar, amarrar, martelar."', 7000);
      completa('diego3'); proximoProjeto();
      return;
    }
    if (projetos.atual) aviso('Chefe Diego: "Projeto atual: ' + projetos.atual.nome + '. Vá ao canteiro e aperte E — a alcateia tá lá ajudando!"', 4500);
    else aviso('Chefe Diego: "O camping ficou novinho. Melhor possível, alcateia!"', 4000);
  };
  // ajudantes (os jogáveis que não são jogadores) — acordam perto da fogueira, onde passaram a noite
  const fx = sede.fogueiraPos[0], fy = sede.fogueiraPos[1];
  let k = 0;
  for (const id of ['lara', 'caio', 'dudu', 'maria']) {
    if (id === personagemId || jogadores.some(j => j.id === id)) continue;
    const P = PERSONAGENS[id];
    let n = npcs.find(n => n.nome === (P.npc || P.nome) && !n.mesh.userData.noite);
    if (!n) { const m = npc(fx, fy, 0, P.nome, 'Bom dia!', P.opts); n = npcs[npcs.length - 1]; }   // (sem intro: cria)
    const mesh = n.mesh; mesh.visible = true; aplicaEmote(mesh, 'feliz', 0);
    const a = 0.9 + k * 1.5, px = fx + Math.cos(a) * 4.5, py = fy + Math.sin(a) * 4.5; k++;
    mesh.position.set(px, altO(px, py), -py); mesh.rotation.y = Math.atan2(fx - px, -(fy - py));
    for (const o of obstaculos) if (o.npc === mesh) { o.x = px; o.z = -py; o.r = 0.5; }
    const it = interativos.find(i => i.nome === 'Falar com ' + n.nome); if (it) { it.x = px; it.z = -py; it.r = 3; }
    ajudantes.push({ id, nome: P.nome, mesh, npc: n, estado: 'espera', alvo: null, carga: 0, t: rnd(0, 3), vel: 3.2 + rnd(0, 0.8) });
  }
  // o Pai também acorda perto das barracas
  if (pai) { const px = spotsBarraca[2][0] + 3, py = spotsBarraca[2][1]; pai.position.set(px, altO(px, py), -py); pai.rotation.y = 1.2; for (const o of obstaculos) if (o.npc === pai) { o.x = px; o.z = -py; } const ip = interativos.find(i => i.nome === 'Falar com Pai'); if (ip) { ip.x = px; ip.z = -py; } }
  // falas do sonho
  for (const id of ['lara', 'caio', 'dudu', 'maria']) {
    if (id === personagemId) continue;
    const aj = ajudantes.find(a => a.id === id); if (!aj) continue;
    const inter = interativos.find(i => i.npcMesh === aj.mesh);
    if (!inter) continue;
    inter.r = 3; inter.cond = null;
    inter.acao = () => {
      const m = missoes.find(x => x.id === 'sonho');
      const falas = {
        lara: 'Lara: "Mano, eu sonhei que a gente construía uma casa na árvore do lobinhos.com! Com telhadinho e tudo. Foi tão real..."',
        caio: 'Caio: "Mana, sonhei que a alcateia inteira tava martelando... a gente reformava a sede e fazia um mirante no molhe. Esquisito, né?"',
        dudu: 'Dudu: "MANO. Eu sonhei que a gente fazia uma CASA NA ÁRVORE e um totem GIGANTE. Acordei com 800 mil de aura. Foi um sinal!"',
        maria: 'Maria: "Eu sonhei que o camping ficava lindo, com uma pontezinha de bambu e a sede pintada. Aposto que vocês sonharam também..."',
      };
      aviso(falas[id], 6500);
      if (m && !m.ok && !m.falados.includes(id)) { m.falados.push(id); m.n++; m.txt = 'Falar com os 3 amigos sobre o sonho (' + m.n + '/3)'; renderMissoes(); if (m.n >= 3) { completa('sonho'); missoes.push({ id: 'diego3', txt: 'Contar pro Chefe Diego que todos tiveram o mesmo sonho', ok: false }); renderMissoes(); } }
    };
  }
}
function nomesAmigos() { return ['lara', 'caio', 'dudu', 'maria'].filter(id => id !== personagemId).map(id => PERSONAGENS[id].nome); }
function proximoProjeto() {
  const prox = PROJETOS.find(p => !projetos.feitos.includes(p.id));
  projetos.atual = prox || null; projetos.entregue = 0;
  for (const m of missoes.slice()) if (m.id.startsWith('proj')) missoes.splice(missoes.indexOf(m), 1);
  if (!prox) { renderMissoes(); aviso('🏕️ Todos os projetos prontos! O camping ficou incrível. Melhor possível!', 8000); SOM.fim(); setTimeout(iniciaAnoitecer, 6000); return; }
  missoes.push({ id: 'proj_' + prox.id, txt: prox.nome + ' — construir no canteiro (0/' + prox.etapas.length + ' etapas)', ok: false }); renderMissoes();
  obra = { p: prox, etapa: 0 };
  // marca o canteiro: estacas com fita
  canteiro.clear();
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.4; const e = caixa(0.14, 1.2, 0.14, M.madeira, prox.x + Math.cos(a) * 8.75, altO(prox.x, prox.y) + 0.6, -(prox.y + Math.sin(a) * 8.75)); canteiro.add(e); }
  const fita = new THREE.Mesh(new THREE.TorusGeometry(8.75, 0.05, 4, 40), M.amarelo); fita.rotation.x = Math.PI / 2; fita.position.set(prox.x, altO(prox.x, prox.y) + 1, -prox.y); canteiro.add(fita);
  const pl = placa('CANTEIRO: ' + prox.nome.toUpperCase(), prox.x, altO(prox.x, prox.y) + 2.4, -prox.y + 9, 8); canteiro.add(pl);
  aviso('🔨 Novo projeto: ' + prox.nome + '. ' + prox.desc + '. Vá ao canteiro e aperte E pra construir!', 6000);
  const inter = interativos.find(i => i.nome === 'Construir no canteiro');
  inter.x = prox.x; inter.z = -prox.y; inter.r = 15;
  for (const a of ajudantes) a.estado = 'vaiObra';
}
interativos.push({ x: 0, z: 0, r: 0, nome: 'Construir no canteiro', cond: () => dia2 && !!obra && !mini, acao: () => { estado.yaw = Math.atan2(obra.p.x - estado.pos.x, -obra.p.y - estado.pos.z); abreMini(obra.p.etapas[obra.etapa][0], obra.p.etapas[obra.etapa]); } });
function etapaConcluida() {
  if (!obra) return;
  const p = obra.p; obra.etapa++;
  const m = missoes.find(x => x.id === 'proj_' + p.id); if (m) { m.txt = p.nome + ' — construir no canteiro (' + obra.etapa + '/' + p.etapas.length + ' etapas)'; renderMissoes(); }
  if (obra.etapa >= p.etapas.length) { obra = null; constroi(p); }
  else { const e = p.etapas[obra.etapa]; aviso('✅ Etapa pronta! Próxima: ' + e[2] + ' (aperte E de novo)', 3500); SOM.coleta(); }
}
function constroi(p) {
  projetos.feitos.push(p.id); canteiro.clear();
  const m = missoes.find(x => x.id === 'proj_' + p.id); if (m) completa('proj_' + p.id);
  const grupo = construirMesh(p, false);
  for (const a of ajudantes) a.estado = 'descansa';
  if (p.id === 'casa') casaNaArvore = true;
  if (p.id === 'ponte' && grupo.userData.ponte) pontes.push(grupo.userData.ponte);
  SOM.missao(); aviso('🔨 Pronto: ' + p.nome + '! A alcateia construiu junto.', 5000);
  setTimeout(proximoProjeto, 2500);
}
// cria a construção (real, ou "de sonho" = translúcida e brilhante) e devolve o grupo
function construirMesh(p, sonho) {
  const h = altO(p.x, p.y);
  const scene_add = scene.add.bind(scene); let grupo = null;
  scene.add = g => { grupo = g; scene_add(g); };
  if (p.id === 'casa') {
    const g = new THREE.Group(); g.position.set(ARV_BAND[0], ARV_BASE, -ARV_BAND[1]);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.2, 14), M.madeira); plat.position.y = 4.0; plat.castShadow = plat.receiveShadow = true; g.add(plat);
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; g.add(caixa(0.08, 1, 0.08, M.madeira, Math.cos(a) * 3.05, 4.6, Math.sin(a) * 3.05)); }
    const grade = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.04, 6, 28), M.madeira); grade.rotation.x = Math.PI / 2; grade.position.y = 5.1; g.add(grade);
    for (const a of [0.6, 2.7, 4.8]) g.add(caixa(0.14, 2.6, 0.14, M.madeira, Math.cos(a) * 2.6, 5.4, Math.sin(a) * 2.6));
    const tel = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.4, 8), M.telhado); tel.position.y = 7.3; tel.castShadow = true; g.add(tel);
    g.add(placa('CASA DO LOBINHOS.COM', 0, 5.6, 3.1, 3));
    scene.add(g);
  } else if (p.id === 'sede') {
    const sx = -210, sy = -138, g = new THREE.Group(); g.position.set(sx, h, -sy); g.rotation.y = 0.15;
    g.add(caixa(16, 0.2, 4, M.madeira, 0, 0.1, 6.5));                                            // deck da varanda
    for (const x of [-7.5, -2.5, 2.5, 7.5]) g.add(caixa(0.2, 3, 0.2, M.madeira, x, 1.6, 8.3));
    const tel = prisma(17, 5, 1.2, M.telhado); tel.position.set(0, 3.1, 6.6); g.add(tel);
    for (const x of [-5, 0, 5]) { g.add(caixa(2.4, 0.1, 0.5, M.madeira, x, 0.7, 7.6)); g.add(caixa(0.1, 0.5, 0.5, M.madeira, x - 1, 0.45, 7.6)); g.add(caixa(0.1, 0.5, 0.5, M.madeira, x + 1, 0.45, 7.6)); }
    const pint = caixa(16.05, 3.62, 9.05, new THREE.MeshLambertMaterial({ color: 0xf2d16b }), 0, 1.81, 0); g.add(pint);   // pintura nova (amarela)
    for (const sx2 of [-1, 1]) g.add(caixa(1.3, 1, 0.12, M.azul, sx2 * 4.8, 2.2, 4.58));
    g.add(caixa(1.2, 2.2, 0.15, M.madeira, 0, 1.1, 4.58));
    g.add(placa('GRUPO ESCOTEIRO GARIBALDI', 0, 3.9, 4.75, 12.8));
    scene.add(g);
  } else if (p.id === 'ponte') {
    // a ponte sai da margem e avança sobre a água do arroio (perpendicular à margem)
    const ry = -2.65, cx = p.x + Math.sin(ry) * 4.5, cy = p.y - Math.cos(ry) * 4.5;
    const g = new THREE.Group(); g.position.set(cx, altO(p.x, p.y), -cy); g.rotation.y = ry;
    g.add(caixa(1.6, 0.12, 12, M.bambu, 0, 0.5, 0));
    for (let z = -5.5; z <= 5.5; z += 1) { g.add(caixa(0.08, 1, 0.08, M.bambu, -0.75, 1, z)); g.add(caixa(0.08, 1, 0.08, M.bambu, 0.75, 1, z)); }
    g.add(caixa(0.06, 0.06, 12, M.bambu, -0.75, 1.5, 0)); g.add(caixa(0.06, 0.06, 12, M.bambu, 0.75, 1.5, 0));
    for (let z = -5; z <= 5; z += 2.5) { g.add(caixa(0.2, 0.6, 0.2, M.madeira, -0.6, 0.2, z)); g.add(caixa(0.2, 0.6, 0.2, M.madeira, 0.6, 0.2, z)); }
    g.userData.ponte = { x: cx, z: -cy, ry, comp: 6, larg: 0.9, alt: altO(p.x, p.y) + 0.56 };
    scene.add(g);
  } else if (p.id === 'mirante') {
    const g = new THREE.Group(); g.position.set(p.x, h, -p.y); g.rotation.y = 0.5;
    g.add(caixa(6, 0.2, 6, M.madeira, 0, 1.2, 0));
    for (const [x, z] of [[-2.8, -2.8], [2.8, -2.8], [-2.8, 2.8], [2.8, 2.8]]) { g.add(caixa(0.2, 1.2, 0.2, M.madeira, x, 0.6, z)); g.add(caixa(0.08, 1, 0.08, M.madeira, x, 1.8, z)); }
    for (const [w, d, x, z] of [[6, 0.06, 0, -2.8], [6, 0.06, 0, 2.8], [0.06, 6, -2.8, 0], [0.06, 6, 2.8, 0]]) g.add(caixa(w, 0.06, d, M.madeira, x, 2.3, z));
    g.add(caixa(2, 0.08, 0.8, M.madeira, 0, 1.7, 1.5)); g.add(caixa(0.1, 0.4, 0.8, M.madeira, -0.9, 1.5, 1.5)); g.add(caixa(0.1, 0.4, 0.8, M.madeira, 0.9, 1.5, 1.5));
    const esc = caixa(1, 0.08, 2.6, M.madeira, 0, 0.6, -3.9); esc.rotation.x = -0.5; g.add(esc);
    g.add(placa('MIRANTE DA LAGOA', 0, 2.8, 2.9, 3.5));
    scene.add(g);
  } else if (p.id === 'totem') {
    const g = new THREE.Group(); g.position.set(p.x, h, -p.y);
    g.add(caixa(0.9, 5, 0.9, M.madeira, 0, 2.5, 0));
    for (let i = 0; i < 4; i++) { const cara = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), matLobo); cara.position.set(0, 1 + i * 1.15, 0.46); g.add(cara); }
    for (const sx of [-1, 1]) { const asa = caixa(1.6, 0.4, 0.2, M.amarelo, sx * 1.2, 4.6, 0); asa.rotation.z = sx * 0.3; g.add(asa); }
    g.add(caixa(1.2, 0.3, 1.2, M.pedra, 0, 0.15, 0));
    scene.add(g);
  }
  scene.add = scene_add;
  if (sonho && grupo) {
    const matSonho = new THREE.MeshLambertMaterial({ color: 0xfff6c8, emissive: 0x6a5a20, transparent: true, opacity: 0.55 });
    grupo.traverse(o => { if (o.isMesh) { o.material = matSonho; o.castShadow = false; } });
  }
  return grupo;
}
let casaNaArvore = false;
const pontes = [];   // passarelas construídas onde dá pra andar sobre a água
function sobrePonte(x, z) { for (const b of pontes) { const dx = x - b.x, dz = z - b.z, lx = dx * Math.cos(b.ry) - dz * Math.sin(b.ry), lz = dx * Math.sin(b.ry) + dz * Math.cos(b.ry); if (Math.abs(lx) < b.larg && Math.abs(lz) < b.comp) return b; } return null; }
// ---- IA dos ajudantes: buscam madeira nas árvores e levam pro canteiro ----
function atualizaAjudantes(dt) {
  if (!dia2 || cena) return;
  for (const a of ajudantes) {
    const m = a.mesh, u = m.userData; a.t += dt;
    const anda = (tx, tz) => {
      const dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < 0.5) return true;
      const passo = Math.min(d, a.vel * dt), nx = m.position.x + dx / d * passo, nz = m.position.z + dz / d * passo;
      if (emTerra(nx, nz)) { m.position.x = nx; m.position.z = nz; }
      m.position.y = alt(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz);
      const sw = Math.sin(a.t * 9) * 0.6; u.pernaE.rotation.x = sw; u.pernaD.rotation.x = -sw; u.bracoE.rotation.x = -sw; u.bracoD.rotation.x = sw;
      return false;
    };
    const parado = () => { u.pernaE.rotation.x = u.pernaD.rotation.x = u.bracoE.rotation.x = u.bracoD.rotation.x = 0; };
    if (a.estado === 'vaiObra' && projetos.atual) {
      const p = projetos.atual, k = ajudantes.indexOf(a), ang = 1.2 + k * 1.6;
      if (anda(p.x + Math.cos(ang) * 5, -p.y + Math.sin(ang) * 5)) { a.estado = 'trabalha'; parado(); m.rotation.y = Math.atan2(p.x - m.position.x, -p.y - m.position.z); }
    } else if (a.estado === 'trabalha') {
      // martelando/serrando junto (mais forte enquanto o jogador está no minigame)
      const f = mini ? 16 : 6;
      u.bracoD.rotation.x = -1.4 + Math.sin(a.t * f) * 0.7; u.bracoE.rotation.x = -0.5;
      if (mini && Math.random() < dt * 1.5) SOM.tap();
      if (!projetos.atual) a.estado = 'descansa';
    } else if (a.estado === 'descansa') {
      parado(); if (projetos.atual && obra) a.estado = 'vaiObra';
    } else if (a.estado === 'n2') { continue; }
    for (const o of obstaculos) if (o.npc === m) { o.x = m.position.x; o.z = m.position.z; }
    const it = interativos.find(i => i.npcMesh === m); if (it) { it.x = m.position.x; it.z = m.position.z; }
  }
}

// ---------- minijogos: hastear a bandeira e acender a fogueira ----------
const miniEl = document.getElementById('minijogo');
let mini = null;   // { tipo:'bandeira'|'fogo', ... }
function abreMini(tipo, etapa) {
  if (mini || cena) return;
  if (tipo === 'martelar') mini = { tipo, t: 0, pos: 0, dir: 1, vel: 1.1, prego: rnd(0.15, 0.85), feitos: 0, precisa: etapa[1], titulo: etapa[2], msg: 'Aperte E quando o martelo estiver em cima do prego!' };
  else if (tipo === 'serrar') mini = { tipo, t: 0, prog: 0, feitos: 0, precisa: etapa[1], titulo: etapa[2], msg: 'Aperte E bem rápido pra serrar!' };
  else if (tipo === 'amarrar') mini = { tipo, t: 0, seq: novaSeq(), i: 0, feitos: 0, precisa: etapa[1], titulo: etapa[2], msg: 'Aperte as setas na ordem pra dar o nó!' };
  else if (tipo === 'pesca') mini = { tipo, t: 0, fase: 'lancar', espera: 0, tensao: 0, puxando: false, progresso: 0, peixes: 0, precisa: (etapa && etapa[1]) || 3, titulo: 'Pesca na Lagoa dos Patos', msg: 'Aperte E pra lançar a linha' };
  else if (tipo === 'bocha') mini = { tipo, t: 0, pos: 0, dir: 1, vel: 1.3, jogadas: 0, precisa: 3, melhor: 99, titulo: 'Cancha de bocha', msg: 'Aperte E na força certa pra chegar perto do bolim (alvo: 8 m)' };
  else if (tipo === 'futebol') mini = { tipo, t: 0, pos: 0, dir: 1, vel: 1.4, goleiro: 0.5, gdir: 1, chutes: 0, gols: 0, precisa: 5, titulo: 'Chute a gol no Campo do Camping', msg: 'Aperte E pra chutar onde o goleiro NÃO está' };
  else if (tipo === 'bandeira') mini = { tipo, t: 0, pos: 0, dir: 1, vel: 0.6, acertos: 0, precisa: 4, msg: 'Puxe a corda quando o marcador estiver no verde!' };
  else mini = { tipo, t: 0, carga: 0, segurando: false, faiscas: 0, precisa: estado.temPederneira ? 2 : 3, msg: estado.temPederneira ? 'Com a pederneira: segure E e solte na zona laranja (2 faíscas)!' : 'Segure E pra riscar e solte na zona laranja (3 faíscas)!' };
  miniEl.style.display = 'block'; desenhaMini();
}
function fechaMini() { mini = null; miniEl.style.display = 'none'; if (typeof vara !== 'undefined') { vara.visible = false; boia.visible = false; } }
const SETAS = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
function novaSeq() { const ks = Object.keys(SETAS), n = 4 + Math.floor(Math.random() * 3); return Array.from({ length: n }, () => ks[Math.floor(Math.random() * 4)]); }
function desenhaMini() {
  if (!mini) return;
  const prog = (a, b) => '<div class="prog">' + '▮'.repeat(a) + '▯'.repeat(Math.max(0, b - a)) + '</div>';
  if (mini.tipo === 'martelar') {
    miniEl.innerHTML = '<b>🔨 ' + mini.titulo + '</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="barra tabua"><div class="prego" style="left:' + (mini.prego * 100).toFixed(1) + '%"></div><div class="marc martelo" style="left:' + (mini.pos * 100).toFixed(1) + '%">🔨</div></div>' + prog(mini.feitos, mini.precisa) + '<small>E — bater no prego · Esc sai</small>';
  } else if (mini.tipo === 'serrar') {
    miniEl.innerHTML = '<b>🪚 ' + mini.titulo + '</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="barra"><div class="fill serra" style="width:' + (mini.prog * 100).toFixed(1) + '%"></div></div>' + prog(mini.feitos, mini.precisa) + '<small>E repetidas vezes — a serra volta se parar · Esc sai</small>';
  } else if (mini.tipo === 'amarrar') {
    miniEl.innerHTML = '<b>🪢 ' + mini.titulo + '</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="seq">' + mini.seq.map((k, j) => '<span class="' + (j < mini.i ? 'ok' : j === mini.i ? 'atual' : '') + '">' + SETAS[k] + '</span>').join('') + '</div>' + prog(mini.feitos, mini.precisa) + '<small>Setas do teclado (ou WASD / D-pad) · Esc sai</small>';
  } else if (mini.tipo === 'pesca') {
    let corpo = '';
    if (mini.fase === 'lancar') corpo = '<div class="mmsg">🎣 Aperte E pra lançar a linha</div>';
    else if (mini.fase === 'esperando') corpo = '<div class="mmsg">Esperando o peixe morder... (a boia vai afundar)</div><div class="boia">' + (Math.sin(mini.t * 3) > 0 ? '🔴' : '⚪') + '</div>';
    else if (mini.fase === 'fisgar') corpo = '<div class="mmsg fisga">❗ MORDEU! Aperte E AGORA!</div>';
    else if (mini.fase === 'puxar') corpo = '<div class="mmsg">Segure E pra puxar; solte quando a linha esticar demais!</div><div class="barra"><div class="zona" style="left:35%;width:35%"></div><div class="zona ruim" style="left:88%;width:12%"></div><div class="fill serra" style="width:' + (mini.tensao * 100).toFixed(1) + '%"></div></div><div class="prog">Puxando: ' + '▮'.repeat(Math.floor(mini.progresso * 10)) + '▯'.repeat(10 - Math.floor(mini.progresso * 10)) + '</div>';
    miniEl.innerHTML = '<b>🎣 ' + mini.titulo + '</b>' + corpo + '<div class="prog">🐟 ' + mini.peixes + '/' + mini.precisa + '</div><small>Esc sai</small>';
  } else if (mini.tipo === 'bocha') {
    miniEl.innerHTML = '<b>🎯 ' + mini.titulo + '</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="barra"><div class="zona" style="left:58%;width:14%"></div><div class="marc" style="left:' + (mini.pos * 100).toFixed(1) + '%"></div></div>' +
      '<div class="prog">Jogadas: ' + mini.jogadas + '/' + mini.precisa + (mini.melhor < 99 ? ' · melhor: ' + mini.melhor.toFixed(1) + ' m do bolim' : '') + '</div><small>E — jogar a bola · Esc sai</small>';
  } else if (mini.tipo === 'futebol') {
    miniEl.innerHTML = '<b>⚽ ' + mini.titulo + '</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="barra gol"><div class="goleiro" style="left:' + (mini.goleiro * 100).toFixed(1) + '%">🧤</div><div class="marc" style="left:' + (mini.pos * 100).toFixed(1) + '%">⚽</div></div>' +
      '<div class="prog">Gols: ' + mini.gols + ' · chutes ' + mini.chutes + '/' + mini.precisa + '</div><small>E — chutar · Esc sai</small>';
  } else if (mini.tipo === 'bandeira') {
    miniEl.innerHTML = '<b>🚩 Hastear a bandeira</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="barra"><div class="zona" style="left:20%;width:60%"></div><div class="marc" style="left:' + (mini.pos * 100).toFixed(1) + '%"></div></div>' +
      '<div class="prog">' + '▮'.repeat(mini.acertos) + '▯'.repeat(mini.precisa - mini.acertos) + '</div><small>E — puxar quando o marcador estiver no verde · Esc sai</small>';
  } else {
    miniEl.innerHTML = '<b>🔥 Acender a fogueira</b><div class="mmsg">' + mini.msg + '</div>' +
      '<div class="barra"><div class="zona fogo" style="left:62%;width:20%"></div><div class="zona ruim" style="left:82%;width:18%"></div><div class="fill" style="width:' + (mini.carga * 100).toFixed(1) + '%"></div></div>' +
      '<div class="prog">' + '✨'.repeat(mini.faiscas) + '·'.repeat(mini.precisa - mini.faiscas) + '</div><small>Segure E pra carregar, solte na zona laranja · no vermelho apaga tudo · Esc sai</small>';
  }
}
function miniSeta(k) {
  if (!mini || mini.tipo !== 'amarrar') return;
  if (k === mini.seq[mini.i]) { mini.i++; SOM.tap(); if (mini.i >= mini.seq.length) { mini.feitos++; mini.i = 0; mini.seq = novaSeq(); mini.msg = 'Nó firme! 🪢'; SOM.coleta(); if (mini.feitos >= mini.precisa) { const l = mini.livre; fechaMini(); if (l) fimLivre(); else etapaConcluida(); return; } } }
  else { mini.i = 0; mini.msg = 'Escapou a corda! Começa o nó de novo.'; SOM.grr(); }
  desenhaMini();
}
const PEIXES = [['lambari', 0.45], ['jundiá', 0.25], ['traíra', 0.15], ['tainha', 0.1], ['corvina', 0.05]];
let peixesTotal = 0;
function miniTecla(down) {
  if (!mini) return;
  if (mini.tipo === 'pesca') {
    if (mini.fase === 'lancar' && down) { mini.fase = 'esperando'; mini.t = 0; mini.espera = 2 + Math.random() * 5; SOM.pop(); }
    else if (mini.fase === 'esperando' && down) { mini.msg = 'Calma... espera a boia afundar!'; }
    else if (mini.fase === 'fisgar' && down) { mini.fase = 'puxar'; mini.t = 0; mini.tensao = 0.3; mini.progresso = 0; mini.forca = 0.5; SOM.coleta(); }
    else if (mini.fase === 'puxar') { mini.puxando = down; }
    desenhaMini(); return;
  }
  if (mini.tipo === 'bocha') {
    if (!down) return;
    const dist = Math.abs(mini.pos - 0.65) * 30;   // 0 no centro da zona
    mini.jogadas++; mini.melhor = Math.min(mini.melhor, dist);
    mini.msg = dist < 1 ? 'ENCOSTOU no bolim! 🎯' : dist < 3 ? 'Boa, ' + dist.toFixed(1) + ' m do bolim' : mini.pos < 0.65 ? 'Curta demais (' + dist.toFixed(1) + ' m)' : 'Passou longe (' + dist.toFixed(1) + ' m)';
    SOM.tap(); bolaBocha(mini.pos);
    if (mini.jogadas >= mini.precisa) { const l = mini.livre, ok = mini.melhor < 3; fechaMini(); aviso(ok ? '🎯 Bocha: melhor jogada a ' + mini.melhor.toFixed(1) + ' m do bolim. Mandou bem!' : '🎯 Bocha: melhor jogada a ' + mini.melhor.toFixed(1) + ' m. Treina mais!', 4000); if (l) fimLivre(); else if (ok) SOM.missao(); return; }
    desenhaMini(); return;
  }
  if (mini.tipo === 'futebol') {
    if (!down) return;
    mini.chutes++;
    const defendeu = Math.abs(mini.pos - mini.goleiro) < 0.13;
    if (defendeu) { mini.msg = 'DEFENDEU! O goleiro pegou.'; SOM.grr(); } else { mini.gols++; mini.msg = 'GOOOL! ⚽'; SOM.coleta(); }
    bolaFutebol(mini.pos, !defendeu);
    if (mini.chutes >= mini.precisa) { const l = mini.livre, g = mini.gols; fechaMini(); aviso('⚽ ' + g + ' gol(s) em 5 chutes!' + (g >= 3 ? ' Artilheiro da alcateia!' : ''), 4000); if (l) fimLivre(); else if (g >= 3) SOM.missao(); return; }
    desenhaMini(); return;
  }
  if (mini.tipo === 'martelar') {
    if (!down) return;
    if (Math.abs(mini.pos - mini.prego) < 0.075) { mini.feitos++; mini.prego = rnd(0.12, 0.88); mini.msg = ['Pregou!', 'Bem no meio!', 'Mais um!', 'Tá ficando firme!'][mini.feitos % 4]; SOM.tap(); const u = jogador.userData; u.bracoD.rotation.x = -0.3; }
    else { mini.msg = 'Errou o prego! Quase no dedo...'; SOM.grr(); }
    if (mini.feitos >= mini.precisa) { const l = mini.livre; fechaMini(); if (l) fimLivre(); else etapaConcluida(); return; }
    desenhaMini(); return;
  }
  if (mini.tipo === 'serrar') {
    if (!down) return;
    mini.prog = Math.min(1, mini.prog + 0.11); SOM.passo(true, false);
    if (mini.prog >= 1) { mini.feitos++; mini.prog = 0; mini.msg = 'Tábua cortada! 🪵'; SOM.coleta(); if (mini.feitos >= mini.precisa) { const l = mini.livre; fechaMini(); if (l) fimLivre(); else etapaConcluida(); return; } }
    desenhaMini(); return;
  }
  if (mini.tipo === 'amarrar') return;
  if (mini.tipo === 'bandeira') {
    if (!down) return;
    const ok = mini.pos > 0.2 && mini.pos < 0.8;
    if (ok) { mini.acertos++; mini.msg = ['Boa!', 'Isso!', 'Mais uma!', 'Quase lá!'][Math.min(3, mini.acertos - 1)]; SOM.coleta(); }
    else { mini.msg = 'Escorregou a corda! Tenta de novo no verde.'; SOM.grr(); }
    bandeiraAlvo = 1.2 + (5.4 - 1.2) * (mini.acertos / mini.precisa);
    if (mini.acertos >= mini.precisa) { const l = mini.livre; fechaMini(); bandeiraAlvo = 5.4; SOM.uivo(); if (l) fimLivre(); else { aviso('🐺 Alcateia: "Melhor possível!" — a bandeira sobe na árvore do lobinhos.com.', 4000); completa('bandeira'); } }
    else desenhaMini();
  } else {
    if (down) { mini.segurando = true; }
    else {
      if (!mini.segurando) return; mini.segurando = false;
      const c = mini.carga;
      if (c >= 0.62 && c < 0.82) { mini.faiscas++; mini.msg = ['Uma faísca!', 'Tá pegando!', 'Acendeu!'][mini.faiscas - 1] || 'Faísca!'; SOM.faisca(); }
      else if (c >= 0.82) { mini.faiscas = 0; mini.msg = 'Forte demais! Espalhou a lenha, começa de novo.'; SOM.grr(); }
      else { mini.msg = 'Fraco demais, não saiu faísca.'; }
      mini.carga = 0;
      if (mini.faiscas >= mini.precisa) { const l = mini.livre; fechaMini(); sede.chamas.visible = true; SOM.faisca(); SOM.fogueira(true); if (l) fimLivre(); else { aviso('🔥 A fogueira do conselho está acesa!', 3500); completa('fogueira'); } }
      else desenhaMini();
    }
  }
}
function atualizaMini(dt) {
  if (!mini) return;
  mini.t += dt;
  const u = jogador.userData;
  if (mini.tipo === 'pesca') {
    vara.visible = true; vara.position.copy(estado.pos); vara.rotation.y = estado.yaw; vara.position.y += 0;
    u.bracoD.rotation.x = mini.fase === 'puxar' ? -1.5 + Math.sin(mini.t * 12) * 0.2 : -1.1; u.bracoE.rotation.x = -0.8;
    const fr = new THREE.Vector3(Math.sin(estado.yaw), 0, Math.cos(estado.yaw));
    if (mini.fase === 'esperando') { boia.visible = true; boia.position.copy(estado.pos).add(fr.multiplyScalar(6)); boia.position.y = -0.4 + Math.sin(mini.t * 3) * 0.06; if (mini.t > mini.espera) { mini.fase = 'fisgar'; mini.t = 0; SOM.pop(); } }
    else if (mini.fase === 'fisgar') { boia.position.y = -0.75; if (mini.t > 0.9) { mini.fase = 'lancar'; mini.msg = 'Escapou! Lança de novo.'; boia.visible = false; SOM.grr(); } }
    else if (mini.fase === 'puxar') {
      boia.position.copy(estado.pos).add(fr.multiplyScalar(6 - mini.progresso * 4)); boia.position.y = -0.5 + Math.sin(mini.t * 10) * 0.1;
      if (Math.random() < dt * 0.8) mini.forca = 0.3 + Math.random() * 0.7;   // o peixe muda de força
      mini.tensao += ((mini.puxando ? 0.55 : -0.5) + (mini.forca - 0.5) * 0.4) * dt;
      mini.tensao = Math.max(0, Math.min(1, mini.tensao));
      if (mini.tensao > 0.35 && mini.tensao < 0.7) mini.progresso = Math.min(1, mini.progresso + dt * 0.28);
      if (mini.tensao >= 0.88) { mini.fase = 'lancar'; mini.msg = 'A linha arrebentou! Lança de novo.'; boia.visible = false; SOM.grr(); }
      if (mini.progresso >= 1) {
        let r = Math.random(), nome = 'lambari'; for (const [n, pr] of PEIXES) { if (r < pr) { nome = n; break; } r -= pr; }
        mini.peixes++; peixesTotal++; mini.fase = 'lancar'; mini.msg = 'Pegou um ' + nome + '! 🐟'; boia.visible = false; SOM.coleta(); aviso('🐟 Pegou um ' + nome + '! (total: ' + peixesTotal + ')', 2500);
        if (mini.peixes >= mini.precisa) { const l = mini.livre; fechaMini(); vara.visible = false; aviso('🎣 ' + mini.precisa + ' peixes! Pescador da alcateia.', 4000); SOM.missao(); if (l) fimLivre(); return; }
      }
    } else boia.visible = false;
  } else if (mini.tipo === 'bocha') {
    mini.pos += mini.dir * mini.vel * dt; if (mini.pos >= 1) { mini.pos = 1; mini.dir = -1; } if (mini.pos <= 0) { mini.pos = 0; mini.dir = 1; }
    u.bracoD.rotation.x = -0.6 - mini.pos * 1.4;
  } else if (mini.tipo === 'futebol') {
    mini.pos += mini.dir * mini.vel * dt; if (mini.pos >= 1) { mini.pos = 1; mini.dir = -1; } if (mini.pos <= 0) { mini.pos = 0; mini.dir = 1; }
    mini.goleiro += mini.gdir * 0.45 * dt; if (mini.goleiro > 0.85) mini.gdir = -1; if (mini.goleiro < 0.15) mini.gdir = 1;
    u.pernaD.rotation.x = Math.sin(mini.t * 2) * 0.2;
  } else if (mini.tipo === 'martelar') {
    mini.pos += mini.dir * mini.vel * dt; if (mini.pos >= 1) { mini.pos = 1; mini.dir = -1; } if (mini.pos <= 0) { mini.pos = 0; mini.dir = 1; }
    u.bracoD.rotation.x = -1.3 + Math.sin(mini.t * 6) * 0.3; u.bracoE.rotation.x = -0.4;
  } else if (mini.tipo === 'serrar') {
    mini.prog = Math.max(0, mini.prog - dt * 0.22);
    u.bracoD.rotation.x = -0.9 + Math.sin(mini.t * 14) * 0.35; u.bracoE.rotation.x = -0.9;
  } else if (mini.tipo === 'amarrar') {
    u.bracoE.rotation.x = -1.2 + Math.sin(mini.t * 3) * 0.2; u.bracoD.rotation.x = -1.2 - Math.sin(mini.t * 3) * 0.2;
  } else if (mini.tipo === 'bandeira') {
    mini.pos += mini.dir * mini.vel * dt;
    if (mini.pos >= 1) { mini.pos = 1; mini.dir = -1; } if (mini.pos <= 0) { mini.pos = 0; mini.dir = 1; }
    u.bracoE.rotation.x = -2.2 + Math.sin(mini.t * 4) * 0.4; u.bracoD.rotation.x = -2.2 - Math.sin(mini.t * 4) * 0.4;
  } else {
    if (mini.segurando) { mini.carga = Math.min(1, mini.carga + dt * 0.55); if (mini.carga >= 1) { mini.segurando = false; mini.faiscas = 0; mini.carga = 0; mini.msg = 'Forte demais! Espalhou a lenha, começa de novo.'; SOM.grr(); } }
    u.bracoD.rotation.x = -0.8 + (mini.segurando ? Math.sin(mini.t * 30) * 0.25 : 0); u.bracoE.rotation.x = -0.6;
    if (mini.segurando && Math.random() < dt * 8) SOM.tap();
  }
  desenhaMini();
}
// vara de pescar, boia e bolas (bocha / futebol)
const vara = new THREE.Group();
{ const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 2.4, 6), M.madeira); cabo.position.set(0.32, 1.6, 0.9); cabo.rotation.x = -0.9; vara.add(cabo);
  const linha = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 5.2, 3), M.branco); linha.position.set(0.32, 1.3, 3.8); linha.rotation.x = -1.25; vara.add(linha);
  vara.visible = false; scene.add(vara); }
const boia = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshLambertMaterial({ color: 0xff3030 })); boia.visible = false; scene.add(boia);
const bolas = [];
function bolaBocha(pos) {
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mini && mini.jogadas % 2 ? M.vermelho : M.azul); scene.add(b);
  const fr = new THREE.Vector3(Math.sin(estado.yaw), 0, Math.cos(estado.yaw)); const de = estado.pos.clone(); de.y += 0.3; const ate = estado.pos.clone().add(fr.multiplyScalar(2 + pos * 12));
  bolas.push({ m: b, de, ate, t: 0, dur: 1.4, rola: true });
}
function bolaFutebol(pos, gol) {
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.branco); scene.add(b);
  const fr = new THREE.Vector3(Math.sin(estado.yaw), 0, Math.cos(estado.yaw)), lado = new THREE.Vector3(fr.z, 0, -fr.x);
  const de = estado.pos.clone(); de.y += 0.25; const ate = estado.pos.clone().add(fr.multiplyScalar(gol ? 12 : 8)).add(lado.multiplyScalar((pos - 0.5) * 6)); ate.y = gol ? 1.2 : 0.3;
  bolas.push({ m: b, de, ate, t: 0, dur: 0.9, arco: 2 });
}
function atualizaBolas(dt) {
  for (const b of bolas.slice()) {
    b.t += dt; const k = Math.min(1, b.t / b.dur), e = b.rola ? 1 - (1 - k) * (1 - k) : k;
    b.m.position.lerpVectors(b.de, b.ate, e); b.m.position.y = Math.max(alt(b.m.position.x, b.m.position.z) + 0.2, b.m.position.y + (b.arco ? Math.sin(k * Math.PI) * b.arco : 0));
    if (b.rola) b.m.rotation.x += dt * 8 * (1 - k);
    if (b.t > b.dur + 4) { scene.remove(b.m); bolas.splice(bolas.indexOf(b), 1); }
  }
}
// bolim da bocha (fixo) — aparece quando o minigame começa
// interações dos novos minigames no mapa (fora de cutscenes e da noite assombrada)
const podeMini = () => !mini && !cena && !(noite && !noite2);
interativos.push({ x: 240, z: 100, r: 14, nome: 'Pescar no mirante', cond: () => podeMini() && projetos.feitos.includes('mirante'), acao: () => { estado.yaw = Math.atan2(20, 30); abreMini('pesca', ['pesca', 3]); } });
interativos.push({ x: 320, z: -195, r: 8, nome: 'Pescar no trapiche', cond: () => podeMini(), acao: () => { estado.yaw = 0; abreMini('pesca', ['pesca', 3]); } });
interativos.push({ x: 250, z: 118, r: 9, nome: 'Pescar no molhe', cond: () => podeMini() && !projetos.feitos.includes('mirante'), acao: () => { estado.yaw = 0.6; abreMini('pesca', ['pesca', 3]); } });
interativos.push({ x: -70, z: 70, r: 13, nome: 'Jogar bocha', cond: () => podeMini(), acao: () => { estado.yaw = Math.PI / 2 + 0.2; abreMini('bocha'); } });
interativos.push({ x: 187, z: -64, r: 24, nome: 'Chutar a gol', cond: () => podeMini(), acao: () => { estado.yaw = Math.atan2(202 - 187, -86 + 64) + 0; abreMini('futebol'); } });

// ---- minigames direto do menu (modo livre: sem efeito nas missões) ----
const LUGAR_MINI = { bandeira: [-34, -9, 0], fogo: [-186, -142, 0], martelar: [-204, -126, 0.3], serrar: [-30, -10, 0.4], amarrar: [-70, -2, 0.2], pesca: [320, 195, 0], bocha: [-80, -70, Math.PI / 2 + 0.2], futebol: [172, 58, 0.6] };
function miniLivre(tipo) {
  if (mini) fechaMini();
  const [x, y, yaw] = LUGAR_MINI[tipo]; estado.pos.set(x, altO(x, y), -y); cam.yaw = yaw; cam.pitch = 0.25; cam.dist = 6;
  camera.position.set(x + Math.sin(yaw) * 6, altO(x, y) + 3, -y + Math.cos(yaw) * 6);
  inicio.style.display = 'none'; SOM.liga(); SOM.menu(false); SOM.ambiente(true);
  const etapa = { martelar: ['martelar', 6, 'Martelar os pregos'], serrar: ['serrar', 3, 'Serrar as tábuas'], amarrar: ['amarrar', 3, 'Dar os nós'], pesca: ['pesca', 3] }[tipo];
  abreMini(tipo, etapa); if (mini) mini.livre = true;
}
function fimLivre() {
  aviso('🏆 Minigame concluído! Voltando ao menu...', 2500); SOM.missao();
  setTimeout(() => { if (document.pointerLockElement) document.exitPointerLock(); inicio.style.display = 'flex'; SOM.ambiente(false); SOM.menu(true); }, 2500);
}
document.querySelectorAll('#inicio .mg').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); miniLivre(b.dataset.mini); }));
addEventListener('keydown', e => { if (!mini) return; if (e.code === 'KeyE' && !e.repeat) miniTecla(true); if (e.code === 'Escape') { const livre = mini.livre; fechaMini(); if (livre) { inicio.style.display = 'flex'; SOM.ambiente(false); SOM.menu(true); } }
  const map = { ArrowUp: 'ArrowUp', KeyW: 'ArrowUp', ArrowDown: 'ArrowDown', KeyS: 'ArrowDown', ArrowLeft: 'ArrowLeft', KeyA: 'ArrowLeft', ArrowRight: 'ArrowRight', KeyD: 'ArrowRight' };
  if (map[e.code] && !e.repeat) miniSeta(map[e.code]);
  e.stopImmediatePropagation(); }, true);
addEventListener('keyup', e => { if (!mini) return; if (e.code === 'KeyE') miniTecla(false); e.stopImmediatePropagation(); }, true);

// ---------- HUD ----------
const avisoEl = document.getElementById('aviso');
let avisoTimer;
function aviso(t, ms) { avisoEl.textContent = t; avisoEl.style.opacity = 1; clearTimeout(avisoTimer); avisoTimer = setTimeout(() => avisoEl.style.opacity = 0, Math.max(ms || 2500, 1500 + t.length * 45)); if (/^[^:]{2,24}: "/.test(t)) SOM.fala(Math.floor(t.length / 6)); }
const localEl = document.getElementById('local'), dicaEl = document.getElementById('dica');

// minimapa
const mm = document.getElementById('minimapa'), mctx = mm.getContext('2d');
let mapaGrande = false;
const mmBase = document.createElement('canvas');
function desenhaBase(W, H) {
  mmBase.width = W; mmBase.height = H;
  const c = mmBase.getContext('2d');
  const bx0 = -320, bx1 = 400, by0 = -230, by1 = 300;
  const sx = W / (bx1 - bx0), sy = H / (by1 - by0);
  const tx = (x, y) => [(x - bx0) * sx, (by1 - y) * sy];
  c.fillStyle = '#3f8fbf'; c.fillRect(0, 0, W, H);
  const poly = (p, fill) => { c.beginPath(); p.forEach((q, i) => { const [a, b] = tx(q[0], q[1]); i ? c.lineTo(a, b) : c.moveTo(a, b); }); c.closePath(); c.fillStyle = fill; c.fill(); };
  poly(MAPA.continente, '#4e8a3a'); poly(MAPA.iate, '#4e8a3a'); poly(MAPA.camping, '#3e7a30'); poly(MAPA.praia, '#e6d4a3'); poly(MAPA.campo, '#6aa04a');
  c.lineWidth = Math.max(1, 1.2 * sx); c.strokeStyle = '#9a7b52';
  for (const e of MAPA.estradas.concat(MAPA.ruas)) { c.beginPath(); e.forEach((q, i) => { const [a, b] = tx(q[0], q[1]); i ? c.lineTo(a, b) : c.moveTo(a, b); }); c.stroke(); }
  c.fillStyle = '#f0e6c8';
  for (const b of [[-22, 8], [-50, -8], [-150, -150], [-210, -138], [190, 205], [300, 150], [-100, 5]]) { const [a, d] = tx(b[0], b[1]); c.fillRect(a - 2, d - 2, 4, 4); }
  { const [ca, cb] = tx(-22, 8); c.fillStyle = '#ffd54a'; c.beginPath(); c.arc(ca, cb, W > 300 ? 5 : 3.5, 0, 6.3); c.fill();
    c.fillStyle = '#222'; c.font = (W > 300 ? 'bold 12px' : 'bold 9px') + ' sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('C', ca, cb + 0.5); c.textAlign = 'start'; c.textBaseline = 'alphabetic'; }
  c.fillStyle = '#ff3030'; const [fa, fb] = tx(95, -17); c.beginPath(); c.arc(fa, fb, 2.5, 0, 6.3); c.fill();
  { const [ga, gb] = tx(-186, -136); c.font = (W > 300 ? '18px' : '12px') + ' sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🔥', ga, gb); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
    if (W > 300) { c.fillStyle = '#fff'; c.font = '11px sans-serif'; c.fillText('Fogueira do Conselho', ga + 12, gb - 8); } }
  { const [ba, bb] = tx(-234, -136); c.font = (W > 300 ? '18px' : '12px') + ' sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⛺', ba, bb); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
    if (W > 300) { c.fillStyle = '#fff'; c.font = '11px sans-serif'; c.fillText('Barracas da família', ba - 60, bb + 16); } }
  { const [ma, mb] = tx(246, -128); c.font = (W > 300 ? '18px' : '12px') + ' sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🪨', ma, mb); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
    if (W > 300) { c.fillStyle = '#fff'; c.font = '11px sans-serif'; c.fillText('Molhe', ma + 12, mb + 4); } }
  if (W > 300) {
    c.fillStyle = '#fff'; c.font = '11px sans-serif'; c.shadowColor = '#000'; c.shadowBlur = 3;
    for (const l of locais) if (l.x !== undefined) { const [a, b] = tx(l.x, l.y); c.fillText(l.nome, a + 4, b - 3); }
    const [pa, pb] = tx(60, -70); c.fillText('Praia do Camping', pa, pb); const [ia, ib] = tx(260, 120); c.fillText('Iate Clube', ia, ib);
    const [la, lb] = tx(100, -190); c.fillText('LAGOA DOS PATOS', la, lb); const [aa, ab] = tx(-200, 120); c.fillText('Arroio São Lourenço', aa, ab);
  }
  return tx;
}
let mmTx = desenhaBase(200, 200);
function desenhaMinimapa() {
  mctx.drawImage(mmBase, 0, 0);
  const [px, py] = mmTx(estado.pos.x, -estado.pos.z);
  mctx.save(); mctx.translate(px, py); mctx.rotate(-estado.yaw + Math.PI / 2);
  mctx.fillStyle = '#ffd54a'; mctx.beginPath(); mctx.moveTo(6, 0); mctx.lineTo(-4, -4); mctx.lineTo(-4, 4); mctx.closePath(); mctx.fill(); mctx.restore();
  for (const j of jogadores) if (j.mesh) { const [a, b] = mmTx(j.pos.x, -j.pos.z); mctx.fillStyle = j.cor; mctx.beginPath(); mctx.arc(a, b, 3, 0, 6.3); mctx.fill(); }
  // objetivos pendentes
  mctx.fillStyle = '#ff5d5d';
  for (const i of interativos) if (i.r > 0 && /Lenha/i.test(i.nome)) { const [a, b] = mmTx(i.x, -i.z); mctx.beginPath(); mctx.arc(a, b, 2.5, 0, 6.3); mctx.fill(); }
}
function alternaMapa() {
  mapaGrande = !mapaGrande;
  const s = mapaGrande ? Math.min(innerWidth, innerHeight) - 40 : 200;
  mm.width = mm.height = s; mmTx = desenhaBase(s, s);
  mm.style.position = 'absolute';
  if (mapaGrande) { mm.style.top = '50%'; mm.style.left = '50%'; mm.style.right = ''; mm.style.transform = 'translate(-50%,-50%)'; }
  else { mm.style.top = '14px'; mm.style.right = '14px'; mm.style.left = ''; mm.style.transform = ''; }
}

// ---------- controles ----------
const teclas = {};
function ligaSom() { SOM.liga(); if (inicio.style.display !== 'none') SOM.menu(true); }
addEventListener('pointerdown', ligaSom); addEventListener('keydown', ligaSom, { once: false });
addEventListener('keydown', e => {
  teclas[e.code] = true;
  if (e.code === 'KeyN') aviso(SOM.mudo() ? '🔇 Som desligado' : '🔊 Som ligado', 1500);
  if (e.code === 'KeyM') alternaMapa();
  if (e.code === 'KeyE') { if (cena && cena.historia) proximaFala(); else interagir(); }
  if (e.code === 'KeyQ') usaHabilidade({ id: personagemId, pos: estado.pos, mesh: jogador, p1: true });
  const em = { Digit1: 'feliz', Digit2: 'bravo', Digit3: 'triste', Digit4: 'surpreso' }[e.code];
  if (em) { aplicaEmote(jogador, em, em === 'feliz' ? 0 : 4); aviso({ feliz: '😊', bravo: '😠 Grrr!', triste: '😢', surpreso: '😲 Uau!' }[em], 1500); ({ bravo: SOM.grr, triste: SOM.aww, surpreso: SOM.uau }[em] || (() => {}))(); }
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => teclas[e.code] = false);
const inicio = document.getElementById('inicio');
let travado = false, jogoIniciado = false;
const pausaEl = document.getElementById('pausa');
pausaEl.addEventListener('click', () => renderer.domElement.requestPointerLock());
inicio.addEventListener('click', () => { renderer.domElement.requestPointerLock(); });
renderer.domElement.addEventListener('click', () => { if (!travado) renderer.domElement.requestPointerLock(); });
document.addEventListener('pointerlockchange', () => {
  travado = document.pointerLockElement === renderer.domElement;
  if (travado) jogoIniciado = true;
  if (travado) { SOM.menu(false); SOM.ambiente(true); pausaEl.style.display = 'none'; }
  else if (jogoIniciado) { pausaEl.style.display = 'flex'; }
  else { SOM.ambiente(false); SOM.menu(true); }
  if (travado && !introFeita) iniciaIntro();
  inicio.style.display = (travado || DEBUG || jogoIniciado) ? 'none' : 'flex';
});
addEventListener('mousemove', e => {
  if (!travado) return;
  cam.yaw -= e.movementX * 0.0025;
  cam.pitch = Math.max(-0.2, Math.min(1.2, cam.pitch + e.movementY * 0.0025));
});
addEventListener('wheel', e => { cam.dist = Math.max(3, Math.min(14, cam.dist + Math.sign(e.deltaY))); });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

function interativoProximo() {
  let melhor = null, md = 1e9;
  for (const i of interativos) {
    if (i.r <= 0 || (i.cond && !i.cond())) continue;
    const d = Math.hypot(i.x - estado.pos.x, i.z - estado.pos.z);
    if (d < i.r && d / i.r < md) { md = d / i.r; melhor = i; }   // o mais "específico" (raio menor) ganha
  }
  return melhor;
}
function interagir() { const i = interativoProximo(); if (i) { try { i.acao(); } catch (e) { console.error(e); if (DEBUG) aviso('ERRO em "' + i.nome + '": ' + e.message, 4000); } } }

// ---------- física simples ----------
function emTerra(x, z) {
  const y = -z;
  return pontoNoPoligono(x, y, MAPA.camping) || pontoNoPoligono(x, y, MAPA.iate) || pontoNoPoligono(x, y, MAPA.continente) || (typeof sobrePonte === 'function' && !!sobrePonte(x, z));
}
function naAguaRasa(x, z) { return pontoNoPoligono(x, -z, MAPA.raso); }
function resolveColisoes(p) {
  const R = 0.45;
  for (const o of obstaculos) {
    if (Math.abs(o.x - p.x) > 30 || Math.abs(o.z - p.z) > 30) continue;
    if (o.r !== undefined) {
      const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), min = o.r + R;
      if (d < min && d > 1e-4) { p.x += dx / d * (min - d); p.z += dz / d * (min - d); }
    } else {
      // caixa rotacionada: leva o ponto pro espaço local
      const c = Math.cos(o.rot), s = Math.sin(o.rot);
      const dx = p.x - o.x, dz = p.z - o.z;
      const lx = dx * c - dz * s, lz = dx * s + dz * c;
      const px = Math.max(-o.hw, Math.min(o.hw, lx)), pz = Math.max(-o.hd, Math.min(o.hd, lz));
      const ex = lx - px, ez = lz - pz, d = Math.hypot(ex, ez);
      if (d < R) {
        let nx, nz, pen;
        if (d > 1e-4) { nx = ex / d; nz = ez / d; pen = R - d; }
        else { // dentro da caixa: empurra pelo lado mais próximo
          const ox = o.hw - Math.abs(lx), oz = o.hd - Math.abs(lz);
          if (ox < oz) { nx = Math.sign(lx) || 1; nz = 0; pen = ox + R; } else { nx = 0; nz = Math.sign(lz) || 1; pen = oz + R; }
        }
        const wx = nx * c + nz * s, wz = -nx * s + nz * c;
        p.x += wx * pen; p.z += wz * pen;
      }
    }
  }
}

// ---------- loop ----------
const relogio = new THREE.Clock();
let tempo = 0;
let padJ1 = null;
// modo debug: ?debug&pos=x,y&yaw=r&pitch=r&dist=n&top
const qs = new URLSearchParams(location.search);
const DEBUG = qs.has('debug');
if (DEBUG) {
  inicio.style.display = 'none';
  addEventListener('error', e => { avisoEl.textContent = 'ERRO: ' + e.message + ' @' + e.lineno; avisoEl.style.opacity = 1; textoNoite.textContent = 'ERRO: ' + e.message + ' @' + e.lineno; textoNoite.style.opacity = 1; if (qs.has('teste')) { document.body.style.background = '#f00'; renderer.domElement.style.display = 'none'; } });
  if (qs.get('pos')) { const [x, y] = qs.get('pos').split(',').map(Number); estado.pos.set(x, altO(x, y), -y); }
  if (qs.get('yaw')) cam.yaw = +qs.get('yaw');
  if (qs.get('y')) estado.pos.y = +qs.get('y');
  if (qs.get('perso')) escolhePersonagem(qs.get('perso'));
  if (qs.get('pz')) { try { Object.assign(personalizacao[personagemId], JSON.parse(qs.get('pz'))); } catch (e) {} escolhePersonagem(personagemId); }
  if (qs.get('bone')) { personalizacao[personagemId].boneEstilo = qs.get('bone'); if (qs.get('mochila')) personalizacao[personagemId].corMochila = '#' + qs.get('mochila'); escolhePersonagem(personagemId); }
  if (qs.get('emote')) aplicaEmote(jogador, qs.get('emote'), 0);
  if (qs.has('intro')) iniciaIntro(); else introFeita = true;
  if (qs.has('dia2')) { for (const m of missoes) m.ok = true; estado.temPederneira = true; sede.chamas.visible = true; mostraCachorros(); alissonFalou = true; phantom.estagio = 4; iniciaDia2(); if (qs.get('dia2') === 'obras') { completa('diego2'); missoes.push({ id: 'sonho', ok: true, txt: 'Falar com os 3 amigos sobre o sonho (3/3)', n: 3, falados: [] }); missoes.push({ id: 'diego3', ok: true, txt: 'Contar pro Chefe Diego que todos tiveram o mesmo sonho' }); proximoProjeto(); } }
  if (qs.has('noite2')) { for (const m of missoes) m.ok = true; estado.temPederneira = true; sede.chamas.visible = true; mostraCachorros(); alissonFalou = true; phantom.estagio = 4; iniciaDia2(); completa('diego2'); for (const id of ['mirante', 'casa', 'sede']) { const pr = PROJETOS.find(x => x.id === id); projetos.atual = pr; constroi(pr); } projetos.atual = null; PROJETOS.forEach(p => { if (!projetos.feitos.includes(p.id)) projetos.feitos.push(p.id); }); if (qs.get('noite2') === 'psiu') { iniciaAnoitecer(); setTimeout(() => { n2.historiaContada = true; iniciaNoite2(); }, 1500); } else iniciaAnoitecer(); }
  if (qs.has('sonho')) { for (const m of missoes) m.ok = true; estado.temPederneira = true; sede.chamas.visible = true; mostraCachorros(); alissonFalou = true; phantom.estagio = 4; cena = { amanhece: true, t: 2.9 }; fadeEl.style.opacity = 1; document.getElementById('hud').style.opacity = 0; }
  if (qs.has('hab')) usaHabilidade({ id: personagemId, pos: estado.pos, mesh: jogador, p1: true });
  if (qs.get('constroi')) { for (const id of qs.get('constroi').split(',')) { const pr = PROJETOS.find(x => x.id === id); if (pr) { projetos.atual = pr; constroi(pr); } } }
  if (qs.get('mini')) setTimeout(() => { abreMini(qs.get('mini'), [qs.get('mini'), 4, 'Teste']); }, 1500);
  if (qs.has('aspira')) setTimeout(() => { for (const id of ['risada', 'luz', 'batidas']) { const m = missoes.find(x => x.id === id); if (m) m.ok = true; } lencol.position.set(estado.pos.x + 4, 0.3, estado.pos.z); lencol.visible = true; capituloNoite.revelado = true; cutsceneAspirador(); }, 300);
  if (qs.has('noite')) {
    // dia já concluído: missões marcadas, pederneira, fogueira acesa, Fantasma encontrado, bandeira hasteada
    for (const m of missoes) m.ok = true; renderMissoes(); estado.temPederneira = true; sede.chamas.visible = true; bandeiraAlvo = 5.4; bandeiraAlt = 5.4;
    mostraCachorros(); alissonFalou = true; phantom.estagio = 4; phantom.mesh.position.set(ALISSON[0] + 1.5, altO(ALISSON[0] + 1.5, ALISSON[1] - 1), -ALISSON[1] + 1);
    iniciaNoite(); if (qs.get('noite') !== 'cena') { cena.t = 5.9; atualizaNoiteIntro(0.01); if (qs.get('pos')) { const [x, y] = qs.get('pos').split(',').map(Number); estado.pos.set(x, 0, -y); } }
  }
  (qs.get('extras') || '').split(',').filter(Boolean).forEach(id => { novoJogador(-1 - jogadores.length); const j = jogadores[jogadores.length - 1]; j.opcao = Math.max(0, j.livres.indexOf(id)); confirmaJogador(j); j.camera.position.set(j.pos.x + 4, 3, j.pos.z + 6); j.camera.lookAt(j.pos); });
  if (qs.has('monta')) { alissonFalou = true; mostraCachorros(); phantom.estagio = 4; phantom.mesh.position.set(estado.pos.x + 2, alt(estado.pos.x + 2, estado.pos.z), estado.pos.z); setTimeout(() => montaInt.acao(), 300); }
  if (qs.has('fuga')) { alissonFalou = true; mostraCachorros(); phantom.estagio = +qs.get('fuga') - 1; if (phantom.estagio === 1) phantom.mesh.position.set(CHUVEIRO_POS[0], altO(CHUVEIRO_POS[0], CHUVEIRO_POS[1]), -CHUVEIRO_POS[1]); }
  if (qs.get('pitch')) cam.pitch = +qs.get('pitch');
  if (qs.get('dist')) cam.dist = +qs.get('dist');
  if (qs.has('top')) scene.fog = null;
  if (qs.get('tecla')) qs.get('tecla').split(',').forEach(k => teclas[k] = true);
  if (qs.has('mostrapos')) setInterval(() => { document.title = `pos ${estado.pos.x.toFixed(1)},${(-estado.pos.z).toFixed(1)}`; localEl.textContent += ` | ${estado.pos.x.toFixed(1)}, ${(-estado.pos.z).toFixed(1)}`; }, 200);
}
function animar() {
  requestAnimationFrame(animar);
  const dt = Math.min(relogio.getDelta(), 0.05);
  tempo += dt;
  procuraNovosPads();
  for (const j of jogadores.slice()) atualizaExtra(j, dt);
  // controle do jogador 1 (opcional, junto com o teclado)
  padJ1 = p1Pad !== null ? lerPad(p1Pad) : null;
  if (padJ1) {
    cam.yaw -= padJ1.cx * 2.2 * dt; cam.pitch = Math.max(-0.2, Math.min(1.2, cam.pitch + padJ1.cy * 1.6 * dt));
    if (cena && cena.historia && padJ1.interagir) proximaFala();
    if (mini) { const gp = navigator.getGamepads()[p1Pad]; const xDown = !!(gp && gp.buttons[2] && gp.buttons[2].pressed); if (xDown && !mini.padX) miniTecla(true); if (!xDown && mini.padX) miniTecla(false); mini.padX = xDown;
      if (padJ1.emote) miniSeta({ feliz: 'ArrowUp', triste: 'ArrowDown', bravo: 'ArrowLeft', surpreso: 'ArrowRight' }[padJ1.emote]); }
    else if (padJ1.interagir) interagir();
    if (padJ1.habilidade) usaHabilidade({ id: personagemId, pos: estado.pos, mesh: jogador, p1: true });
    if (padJ1.mapa) alternaMapa();
    if (padJ1.emote && !mini) { aplicaEmote(jogador, padJ1.emote, padJ1.emote === 'feliz' ? 0 : 4); }
  }

  // movimento relativo à câmera
  let mx = 0, mz = 0;
  if (teclas.KeyW || teclas.ArrowUp) mz -= 1;
  if (teclas.KeyS || teclas.ArrowDown) mz += 1;
  if (teclas.KeyA || teclas.ArrowLeft) mx -= 1;
  if (teclas.KeyD || teclas.ArrowRight) mx += 1;
  if (padJ1) { mx += padJ1.mx; mz += padJ1.mz; }
  // gatilhos da fuga do Phantom
  if (!cena && !mini && alissonFalou) {
    const dTree = Math.hypot(estado.pos.x - ARV_BAND[0], estado.pos.z + ARV_BAND[1]);
    const dChuv = Math.hypot(estado.pos.x - CHUVEIRO_POS[0], estado.pos.z + CHUVEIRO_POS[1]);
    if (phantom.estagio === 0 && (dTree < 5 || estado.escalando)) iniciaFuga(1);
    else if (phantom.estagio === 1 && dChuv < 7) iniciaFuga(2);
  }
  montaInt.x = phantom.mesh.position.x; montaInt.z = phantom.mesh.position.z;
  if (cena) atualizaCena(dt);
  atualizaMini(dt); atualizaBolas(dt);
  const movendo = !!(mx || mz) && (travado || DEBUG || padJ1) && !estado.escalando && !estado.macrame && !cena && !(jogador.userData.batucando > tempo) && !escolhendoDestino && !mini;
  const nadando = naAguaRasa(estado.pos.x, estado.pos.z) && !emTerra(estado.pos.x, estado.pos.z);
  const vel = (nadando ? 2.2 : (teclas.ShiftLeft || teclas.ShiftRight || (padJ1 && padJ1.correr)) ? 8.5 : 4.5) * (jogador.userData.turboAte > tempo ? 2 : 1);
  if (movendo) {
    const l = Math.hypot(mx, mz); mx /= l; mz /= l;
    const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw);
    const dx = fx * mz + fz * mx, dz = fz * mz - fx * mx;
    const alvo = Math.atan2(dx, dz);
    let d = alvo - estado.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    estado.yaw += d * Math.min(1, dt * 12);
    // cada passo empurra o jogador pra frente: a velocidade pulsa com o ciclo das pernas
    const impulso = nadando ? 1 : 0.93 + 0.14 * Math.abs(Math.sin(estado.fase));
    const nova = estado.pos.clone(); nova.x += dx * vel * impulso * dt; nova.z += dz * vel * impulso * dt;
    if (emTerra(nova.x, nova.z) || naAguaRasa(nova.x, nova.z)) { estado.pos.x = nova.x; estado.pos.z = nova.z; }
    else if (emTerra(nova.x, estado.pos.z) || naAguaRasa(nova.x, estado.pos.z)) estado.pos.x = nova.x;
    else if (emTerra(estado.pos.x, nova.z) || naAguaRasa(estado.pos.x, nova.z)) estado.pos.z = nova.z;
  }
  if (!cena) resolveColisoes(estado.pos);
  // segurança: se acabar fora de terra (sem estar nadando/escalando/na ponte), volta pro ponto de terra mais próximo
  if (!cena && !estado.escalando && !estado.macrame && !estado.poleiro && !naAguaRasa(estado.pos.x, estado.pos.z) && !emTerra(estado.pos.x, estado.pos.z)) {
    const [sx, sy] = pontoEmTerra(estado.pos.x, -estado.pos.z); estado.pos.set(sx, altO(sx, sy), -sy); estado.vy = 0;
    aviso('Você voltou pra terra firme 🏝️', 2000);
  }
  if (estado.macrame) {
    const mc = estado.macrame;
    if (mc.fase === 'tece') { mc.t += dt; if (mc.t > 1.2) mc.fase = 'sobe'; }
    else {
      // gruda na corda (lado da árvore) e sobe/desce
      estado.pos.x = mc.x + mc.ux * (mc.r + 0.35); estado.pos.z = mc.z + mc.uz * (mc.r + 0.35);
      estado.yaw = Math.atan2(mc.x - estado.pos.x, mc.z - estado.pos.z);
      estado.pos.y += (mc.fase === 'sobe' ? 2.2 : -2.6) * dt;
      estado.fase += dt * 8;
      if (mc.fase === 'sobe' && estado.pos.y >= mc.topo) { estado.pos.y = mc.topo; estado.poleiro = { x: mc.x, z: mc.z, h: mc.topo, r: mc.r + 1.6, corda: mc.corda }; estado.macrame = null; aviso('🪢 Lara chegou na copa! Q pra descer.', 2500); }
      if (mc.fase === 'desce' && estado.pos.y <= mc.base) { estado.pos.y = mc.base; if (mc.corda) scene.remove(mc.corda); estado.poleiro = null; estado.macrame = null; }
    }
    estado.vy = 0; estado.noChao = true;
  } else if (estado.escalando) {
    // gruda no tronco e sobe/desce pela escada de tábuas
    estado.pos.y += estado.escalando * 2.2 * dt;
    const pe = pontoEscada(estado.pos.y - ARV_BASE);
    estado.pos.x = pe.x; estado.pos.z = pe.z;
    estado.yaw = Math.atan2(ARV_BAND[0] - pe.x, -ARV_BAND[1] - pe.z);   // de frente pro tronco
    if (estado.escalando > 0 && estado.pos.y >= ARV_TOPO) { estado.pos.y = ARV_TOPO; estado.escalando = 0; aviso('Você subiu na árvore do lobinhos.com! Cuidado pra não escorregar dos galhos.', 3000); }
    if (estado.escalando < 0 && estado.pos.y <= ARV_BASE) { estado.pos.y = ARV_BASE; estado.escalando = 0; }
    estado.vy = 0; estado.noChao = true;
  } else {
    // pulo
    if ((teclas.Space || (padJ1 && padJ1.pular)) && estado.noChao && !nadando) { estado.vy = 6; estado.noChao = false; SOM.pulo(); }
    const pb = sobrePonte(estado.pos.x, estado.pos.z);
    const pol = estado.poleiro && Math.hypot(estado.pos.x - estado.poleiro.x, estado.pos.z - estado.poleiro.z) < estado.poleiro.r && estado.pos.y > estado.poleiro.h - 1.5 ? estado.poleiro.h : null;
    const chao = pol !== null ? pol : pb ? pb.alt : nadando ? -0.9 : (naPlataforma() ? ARV_TOPO : alt(estado.pos.x, estado.pos.z));
    if (estado.poleiro && pol === null && estado.pos.y < estado.poleiro.h - 2) { if (estado.poleiro.corda) scene.remove(estado.poleiro.corda); estado.poleiro = null; }   // caiu/desceu da copa
    estado.vy -= 18 * dt; estado.pos.y += estado.vy * dt;
    if (estado.pos.y <= chao) { estado.pos.y = chao; estado.vy = 0; estado.noChao = true; }
    else if (estado.pos.y > chao + 0.05) estado.noChao = false;
  }
  jogador.position.copy(estado.pos); jogador.rotation.y = estado.yaw;
  if (movendo && estado.noChao && !nadando) jogador.position.y += Math.abs(Math.sin(estado.fase)) * 0.03; // balanço suave do passo

  // animação de pernas/braços
  estado.velAnim += (movendo ? (vel > 5 ? 14 : 9) : 0 - estado.velAnim) * Math.min(1, dt * 8);
  const faseAntes = estado.fase;
  estado.fase += estado.velAnim * dt;
  if (movendo && estado.noChao && Math.floor(faseAntes / Math.PI) !== Math.floor(estado.fase / Math.PI)) SOM.passo(vel > 5, nadando);
  if (estado.escalando) estado.fase += dt * 8;
  const amp0 = estado.macrame && estado.macrame.fase !== 'tece' ? 0.6 : 0;
  const andandoCena = !!(cena && cena.andando); if (andandoCena) estado.fase += dt * 9;
  const amp = (movendo || estado.escalando || andandoCena) ? 0.6 : amp0, sw = Math.sin(estado.fase) * amp;
  const u = jogador.userData;
  u.pernaE.rotation.x = sw; u.pernaD.rotation.x = -sw; u.bracoE.rotation.x = -sw; u.bracoD.rotation.x = sw;
  animaBatucada(jogador);
  for (const it of itensCaindo.slice()) { if (it.position.y > it.userData.chao) { it.position.y = Math.max(it.userData.chao, it.position.y - 12 * dt); } else itensCaindo.splice(itensCaindo.indexOf(it), 1); }
  if (estado.macrame) { if (estado.macrame.fase === 'tece') { u.bracoE.rotation.x = -1.3 + Math.sin(tempo * 14) * 0.3; u.bracoD.rotation.x = -1.3 - Math.sin(tempo * 14) * 0.3; u.pernaE.rotation.x = u.pernaD.rotation.x = 0; } else { u.bracoE.rotation.x = -2.6 + sw * 0.5; u.bracoD.rotation.x = -2.6 - sw * 0.5; } }
  else if (mini) { u.pernaE.rotation.x = u.pernaD.rotation.x = 0; }
  else if (cena && cena.aspira) { u.pernaE.rotation.x = u.pernaD.rotation.x = 0; u.bracoE.rotation.x = 0; }
  else if (cena && cena.monta && cena.fase !== 'volta') { u.pernaE.rotation.x = u.pernaD.rotation.x = -1.3; u.bracoE.rotation.x = u.bracoD.rotation.x = -0.9; }
  else if (u.batucando > tempo) {}
  else if (estado.escalando) { u.bracoE.rotation.x = -2.6 + sw * 0.5; u.bracoD.rotation.x = -2.6 - sw * 0.5; }
  else if (!movendo && !andandoCena) { u.pernaE.rotation.x *= 0.9; u.pernaD.rotation.x *= 0.9; u.bracoE.rotation.x = Math.sin(tempo * 2) * 0.05; u.bracoD.rotation.x = -u.bracoE.rotation.x; }

  // câmera
  if (naPlataforma() || estado.escalando || estado.poleiro || estado.macrame) cam.pitch = Math.min(cam.pitch, 0.15);
  const alvoCam = estado.pos.clone().add(new THREE.Vector3(0, 1.5, 0));
  const off = new THREE.Vector3(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)).multiplyScalar(cam.dist);
  // câmera não atravessa troncos/paredes: encurta a distância se algo estiver no caminho
  let distCam = cam.dist;
  for (const o of obstaculos) {
    if (o.r === undefined || Math.abs(o.x - alvoCam.x) > 16 || Math.abs(o.z - alvoCam.z) > 16) continue;
    const dx = off.x / cam.dist, dz = off.z / cam.dist, hl = Math.hypot(dx, dz);
    if (hl < 1e-3) continue;
    const t = ((o.x - alvoCam.x) * dx + (o.z - alvoCam.z) * dz) / (hl * hl);
    if (t <= 0 || t > cam.dist) continue;
    const cx = alvoCam.x + dx * t, cz = alvoCam.z + dz * t;
    if (Math.hypot(cx - o.x, cz - o.z) < o.r + 0.35) distCam = Math.min(distCam, Math.max(1.5, t - o.r - 0.6));
  }
  // paredes (caixas): anda pelo segmento e para antes de entrar numa construção
  for (let t = 1; t < distCam; t += 0.5) {
    const px = alvoCam.x + off.x / cam.dist * t, pz = alvoCam.z + off.z / cam.dist * t, py = alvoCam.y + off.y / cam.dist * t;
    if (py > 6) break;
    let dentro = false;
    for (const o of obstaculos) {
      if (o.r !== undefined || Math.abs(o.x - px) > 20 || Math.abs(o.z - pz) > 20 || o.hw < 1.5) continue;
      const c = Math.cos(o.rot), sn = Math.sin(o.rot), dx = px - o.x, dz = pz - o.z;
      const lx = dx * c - dz * sn, lz = dx * sn + dz * c;
      if (Math.abs(lx) < o.hw + 0.3 && Math.abs(lz) < o.hd + 0.3) { dentro = true; break; }
    }
    if (dentro) { distCam = Math.max(1.2, t - 0.6); break; }
  }
  const posCam = alvoCam.clone().add(off.clone().multiplyScalar(distCam / cam.dist));
  { const ac = alt(posCam.x, posCam.z) + 0.6; if (posCam.y < ac) posCam.y = ac; }
    camera.position.lerp(posCam, DEBUG ? 1 : Math.min(1, dt * 16));
  camera.lookAt(alvoCam);
  if (cena) cameraDaCena();
  if (DEBUG && qs.has('top')) { camera.position.set(estado.pos.x, +qs.get('top') || 300, estado.pos.z + 1); camera.lookAt(estado.pos); }

  // sombra acompanha o jogador
  sol.position.set(estado.pos.x - 80, 140, estado.pos.z + 60); sol.target.position.copy(estado.pos);

  // bandeira, fogueira, farol, água
  bandeiraAlt += (bandeiraAlvo - bandeiraAlt) * Math.min(1, dt * 2);
  bandeira.position.y = bandeiraAlt; bandeira.rotation.y = Math.sin(tempo * 1.5) * 0.15;
  if (sede.chamas.visible) { sede.chamas.children.forEach((c, i) => { if (c.isMesh) { c.scale.y = 0.8 + Math.sin(tempo * 9 + i) * 0.3; c.rotation.y += dt * 2; } else c.intensity = 1.6 + Math.sin(tempo * 12) * 0.4; }); }
  M.agua.color.setHSL(0.57, 0.62, 0.31 + Math.sin(tempo * 0.7) * 0.015);

  // cachorros: rabo abanando, e o Fantasma segue o jogador quando encontrado
  for (const c of cachorros) {
    if ((cena || noite) && c === phantom) continue;
    c.fase += dt * 6;
    c.rabo.rotation.y = Math.sin(c.fase * 2) * 0.5;
    if (c.seguindo) {
      const alvo = (c.alvoSeguir && c.alvoSeguir.visible) ? c.alvoSeguir.position : estado.pos;
      const dx = alvo.x - c.mesh.position.x, dz = alvo.z - c.mesh.position.z, d = Math.hypot(dx, dz);
      const alvoV = d > 3 ? Math.min(36, d * 8) : 0;
      c.vel += (alvoV - c.vel) * Math.min(1, dt * 6);
      if (d > 0.1) { c.mesh.position.x += dx / d * c.vel * dt; c.mesh.position.z += dz / d * c.vel * dt; c.mesh.rotation.y = Math.atan2(dx, dz); }
      c.mesh.position.y = alt(c.mesh.position.x, c.mesh.position.z);
      const sw = c.vel > 0.3 ? Math.sin(c.fase * 2.5) * 0.7 : 0;
      c.pernas.forEach((p, i) => p.rotation.x = (i % 2 ? sw : -sw));
      if (c === phantom && Math.hypot(c.mesh.position.x - ALISSON[0], c.mesh.position.z + ALISSON[1]) < 6 && !missoes.find(z => z.id === 'phantom').ok) {
        c.seguindo = false; c.estagio = 4; c.mesh.position.set(ALISSON[0] + 1.5, altO(ALISSON[0] + 1.5, ALISSON[1] - 1), -ALISSON[1] + 1); c.mesh.rotation.y = 2.6; c.vel = 0; c.pernas.forEach(p => p.rotation.x = 0);
        aviso('Alisson: "FANTASMAAA! Aeee, ' + PERSONAGENS[personagemId].nome + ', cê achou ele, valeu demais! Ele é do camping, mas hoje ele fica com a gente. E ó, ele deixa montar nele, tá ligado?" 🐕🐺', 6500);
        completa('phantom');
      }
    } else if (c.vel === 0 && !(c === phantom && c.estagio >= 4)) {
      c.pernas.forEach(p => p.rotation.x = 0);
    }
  }

  if (jogador.userData.emoteAte && tempo > jogador.userData.emoteAte) aplicaEmote(jogador, 'feliz', 0);
  atualizaNoite(dt);
  atualizaAjudantes(dt);
  atualizaSeguidores(dt);
  // o Pai fica olhando o celular (programando com o Claude) sempre que está parado
  if (pai && !(cena && cena.intro)) { const u = pai.userData; u.bracoD.rotation.x = -1.35 + Math.sin(tempo * 1.3) * 0.03; u.bracoD.rotation.z = -0.25; u.bracoE.rotation.x = -1.1; u.bracoE.rotation.z = 0.3; if (u.celular) u.celular.rotation.z = Math.sin(tempo * 7) * 0.02; }
  // NPCs olham para o jogador
  for (const n of npcs) {
    if (cena && (n.mesh === pai || n.mesh === outroLobinho)) continue;   // na cutscene eles andam pra frente
    if (dia2 && ajudantes.some(a => a.mesh === n.mesh && a.estado !== 'espera')) continue;
    if (n.mesh === pai) continue;
    if (n.doidinho) {
      n.mesh.position.y = alt(n.mesh.position.x, n.mesh.position.z) + Math.abs(Math.sin(tempo * 5)) * 0.18;
      const u = n.mesh.userData; u.bracoE.rotation.x = Math.sin(tempo * 10) * 1.2 - 1.2; u.bracoD.rotation.x = -Math.sin(tempo * 10) * 1.2 - 1.2; u.bracoE.rotation.z = 0.6; u.bracoD.rotation.z = -0.6;
    } const d = Math.hypot(estado.pos.x - n.mesh.position.x, estado.pos.z - n.mesh.position.z); if (d < 8) n.mesh.rotation.y = Math.atan2(estado.pos.x - n.mesh.position.x, estado.pos.z - n.mesh.position.z); }

  // missões por localização
  const ox = estado.pos.x, oy = -estado.pos.z;
  if (pontoNoPoligono(ox, oy, MAPA.praia)) completa('praia');
  if (Math.hypot(ox - 244, oy + 130) < 14) completa('molhe');

  // HUD
  let nomeLocal = 'Camping Municipal';
  for (const l of locais) {
    if (l.agua) { if (!emTerra(ox, -oy)) { nomeLocal = l.nome; break; } continue; }
    if (l.poly ? pontoNoPoligono(ox, oy, l.poly) : Math.hypot(ox - l.x, oy - l.y) < l.r) { nomeLocal = l.nome; break; }
  }
  localEl.textContent = nomeLocal;
  const it = interativoProximo();
  dicaEl.textContent = (it ? 'E — ' + it.nome : 'E para interagir') + (HABILIDADES[personagemId] ? '  ·  Q — ' + HABILIDADES[personagemId].nome : '');
  dicaEl.style.opacity = it ? 1 : 0.5;
  desenhaMinimapa();

  renderTudo();
}
animar();
})();
