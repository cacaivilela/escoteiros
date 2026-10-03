// ---------- GRAMA: fios de verdade que o vento balança e que deitam embaixo de quem passa ----------
// Três "tapetes" quadrados em volta do jogador, cada um com N fios desenhados numa chamada só (InstancedBufferGeometry):
//   perto (50 m): fios finos e densos (uns 300 mil fios somando os três tapetes), que deitam embaixo de quem passa;
//   meio (170 m) e longe (520 m): fios cada vez mais largos e espaçados — de longe parecem gramado cheio, e a neblina faz o resto.
// Cada tapete começa a aparecer onde o de dentro some (as bordas se cruzam), então o mapa inteiro fica coberto.
// Cada fio tem um lugar fixo (aOfs) dentro de um quadrado de LADO×LADO; no shader ele é repetido pelo mapa inteiro
// (mod LADO), então o tapete anda junto com o jogador sem nenhum fio mudar de lugar no chão e sem JS por fio.
// (3 milhões de fios finos cobririam os 12 hectares, mas travariam o jogo.)
// A altura do chão e "onde pode ter grama" vêm de uma textura feita uma vez a partir do relevo (REL, grade de 2 m):
//   R = altura (0 a 4 m), G = densidade (0 na água, praia, estradas, dentro de construções e na cancha de bocha).
// Quem deita a grama: até MAX_COL escoteiros (jogador, NPCs, jogadores extras), cachorros e bichos do DLC mais perto,
// com o raio que cada um tem (o jogador gigante dos mods deita uma área enorme). Passa ?grama=0 pra desligar
// (ou ?grama=0.5 / 2 pra metade / dobro de fios).

const GRAMA = (function () {
  const qsG = new URLSearchParams(location.search);
  const fator = qsG.has('grama') ? Math.max(0, +qsG.get('grama') || 0) : 1;
  if (!fator) return null;
  const celular = typeof TOQUE !== 'undefined' && TOQUE.ativo;
  const MAX_COL = 24, H_MAX = 4;
  // lado do quadrado, quantos fios, e quanto cada fio engorda/cresce (os de longe são poucos e largos)
  const CAMADAS = celular
    ? [{ lado: 36, n: 26000, larg: 1, alto: 1 }, { lado: 120, n: 26000, larg: 2.6, alto: 1.25 }, { lado: 360, n: 22000, larg: 6, alto: 1.6 }]
    : [{ lado: 50, n: 120000, larg: 1, alto: 1 }, { lado: 170, n: 100000, larg: 2.2, alto: 1.2 }, { lado: 520, n: 80000, larg: 5, alto: 1.5 }];
  const LADO = CAMADAS[0].lado;

  // ---- textura de altura + densidade ----
  const nx = REL.nx, ny = REL.ny, px = new Uint8Array(nx * ny * 4);
  const caixas = obstaculos.filter(o => o.r === undefined && o.hw > 0.6);   // paredes, mesas grandes, quadras
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = REL.x0 + i * REL.passo, y = REL.y0 + j * REL.passo, k = j * nx + i, h = REL.h[k];
    let d = 1;
    if (h < 0) d = 0;                                                      // água (o chão da mata pode ter altura 0: não é água)
    else if (pontoNoPoligono(x, y, MAPA.praia)) d = 0;                     // areia
    else {
      const de = distEstradas(x, y); if (de < 4) d = Math.max(0, (de - 2.4) / 1.6);   // estradinhas de terra (borda vai rareando)
      if (d > 0) for (const o of caixas) {
        const c = Math.cos(o.rot), s = Math.sin(o.rot), dx = x - o.x, dz = -y - o.z;
        if (Math.abs(dx * c - dz * s) < o.hw + 0.4 && Math.abs(dx * s + dz * c) < o.hd + 0.4) { d = 0; break; }
      }
    }
    px[k * 4] = Math.round(Math.max(0, Math.min(1, h / H_MAX)) * 255); px[k * 4 + 1] = Math.round(d * 255); px[k * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(px, nx, ny, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;

  // ---- um fio: tira estreita de 4 gomos que afina até a ponta (y vai de 0 a 1; o shader estica) ----
  const G = 4, base = [], cor = [], idx = [];
  for (let s = 0; s <= G; s++) {
    const t = s / G, w = 0.5 * (1 - t * 0.85);
    if (s < G) { base.push(-w, t, 0, w, t, 0); } else base.push(0, 1, 0);
    const c0 = [0.20, 0.38, 0.12], c1 = [0.47, 0.70, 0.27];                // pé escuro → ponta clara
    const cc = c0.map((v, q) => v + (c1[q] - v) * t);
    cor.push(...cc); if (s < G) cor.push(...cc);
  }
  for (let s = 0; s < G - 1; s++) { const a = s * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  idx.push((G - 1) * 2, (G - 1) * 2 + 1, G * 2);
  const cols = Array.from({ length: MAX_COL }, () => new THREE.Vector3(0, 0, 0));
  const U = { uCentro: { value: new THREE.Vector2() }, uAlt: { value: tex }, uRel: { value: new THREE.Vector4(REL.x0, REL.y0, REL.x1 - REL.x0, REL.y1 - REL.y0) }, uCol: { value: cols } };
  const camadas = CAMADAS.map((c, i) => criaCamada(c, i ? CAMADAS[i - 1].lado : 0, i === 0));
  function criaCamada(cfg, ladoDentro, comColisao) {
    const L = cfg.lado, N = Math.round(cfg.n * fator);
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(base.length).fill(0).map((v, q) => q % 3 === 1 ? 1 : 0), 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
    geo.setIndex(idx);
    const ofs = new Float32Array(N * 4);
    for (let q = 0; q < N; q++) { ofs[q * 4] = Math.random() * L; ofs[q * 4 + 1] = Math.random() * L; ofs[q * 4 + 2] = Math.random(); ofs[q * 4 + 3] = Math.random(); }
    geo.setAttribute('aOfs', new THREE.InstancedBufferAttribute(ofs, 4));
    geo.instanceCount = N;
    const f = n => n.toFixed(1);
    // as bordas: este tapete some entre 36% e 50% do lado; o de fora aparece exatamente nessa mesma faixa do de dentro
    const fadeDentro = ladoDentro ? `vive *= smoothstep(${f(ladoDentro * 0.36)}, ${f(ladoDentro * 0.5)}, md);` : '';
    const colisao = comColisao ? `
          for (int i = 0; i < ${MAX_COL}; i++) {
            vec3 c = uCol[i]; if (c.z <= 0.0) continue;
            vec2 d = p - c.xy; float dist = length(d), alcance = c.z * 1.5;
            if (dist < alcance) dobra += (dist > 0.001 ? d / dist : vec2(1.0, 0.0)) * pow(1.0 - dist / alcance, 0.7) * 1.6;
          }` : '';
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U, { uTempo: ventoU.uTempo, uVento: ventoU.uVento });
      sh.vertexShader = `attribute vec4 aOfs;
        uniform vec2 uCentro; uniform sampler2D uAlt; uniform vec4 uRel; uniform vec3 uCol[${MAX_COL}];
        uniform float uTempo; uniform float uVento;
        ` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);')   // luz de gramado (de cima): o fio não fica preto de costas
        .replace('#include <color_vertex>', '#include <color_vertex>\n vColor *= 0.82 + 0.36 * aOfs.w;')
        .replace('#include <begin_vertex>', `
          // onde este fio está no mundo: o ponto congruente a aOfs (mod LADO) dentro do quadrado em volta do centro
          vec2 canto = uCentro - ${f(L / 2)};
          vec2 p = canto + mod(aOfs.xy - canto, ${f(L)});
          vec2 uvG = vec2((p.x - uRel.x) / uRel.z, (p.y - uRel.y) / uRel.w);   // p já está em coordenadas do mapa (y = norte)
          vec4 tg = texture2D(uAlt, uvG);
          float dentro = step(0.0, uvG.x) * step(uvG.x, 1.0) * step(0.0, uvG.y) * step(uvG.y, 1.0);
          float md = max(abs(p.x - uCentro.x), abs(p.y - uCentro.y));
          float vive = dentro * step(aOfs.z, tg.g) * (1.0 - smoothstep(${f(L * 0.36)}, ${f(L * 0.5)}, md));   // aOfs.z sorteia: densidade 0,3 = 30% dos fios
          ${fadeDentro}
          float alto = (0.14 + 0.2 * fract(aOfs.w * 7.3)) * ${cfg.alto.toFixed(2)} * vive;
          float t = position.y;
          // vento (o mesmo minuano das copas) + quem está em cima
          vec2 dobra = vec2(sin(uTempo * 1.7 + p.x * 0.23 + p.y * 0.17), cos(uTempo * 1.3 + p.x * 0.11 - p.y * 0.21)) * (0.12 + 0.1 * uVento) * vec2(1.0, 0.6);${colisao}
          float forca = min(length(dobra), 1.35); dobra = forca > 0.0 ? normalize(dobra) * forca : dobra;
          float giro = aOfs.w * 6.2832, cg = cos(giro), sg = sin(giro);
          float larg = (0.055 + 0.03 * aOfs.z) * ${cfg.larg.toFixed(2)};
          vec3 transformed = vec3(position.x * larg * cg, 0.0, position.x * larg * sg);
          float curva = t * t;                                      // a ponta dobra mais que o pé
          transformed.x += dobra.x * curva * alto;
          transformed.z -= dobra.y * curva * alto;                  // y do mapa (osm) = -z do mundo
          transformed.y = t * alto * (1.0 - 0.55 * min(forca, 1.0) * t);
          transformed += vec3(p.x, tg.r * ${f(H_MAX)} - 0.01, -p.y);`);
    };
    mat.customProgramCacheKey = () => 'grama' + L + '_' + ladoDentro + '_' + comColisao;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.receiveShadow = comColisao;   // sombra só no tapete de perto (longe ninguém vê e pesa)
    scene.add(mesh);
    return { mesh, geo, N };
  }
  const mesh = camadas[0].mesh;

  // quem deita a grama neste quadro: os mais perto do centro (pés no chão, visíveis, dentro do tapete)
  const cand = [];
  function junta(o, raio) {
    if (!o || !o.visible || !o.parent) return;
    const p = o.position, dx = p.x - U.uCentro.value.x, dy = -p.z - U.uCentro.value.y;
    if (Math.abs(dx) > LADO / 2 + raio || Math.abs(dy) > LADO / 2 + raio) return;
    if (p.y - alt(p.x, p.z) > raio * 1.2 + 0.3) return;                // pulando / em cima da árvore: não encosta
    cand.push({ x: p.x, y: -p.z, r: raio, d: dx * dx + dy * dy });
  }
  // computador sem placa de vídeo: se o jogo ficar abaixo de ~28 quadros por segundo, usa menos fios (e volta se melhorar)
  let ultimo = performance.now(), media = 1 / 60, desde = 0;
  function ajustaQualidade() {
    const agora = performance.now(), dt = Math.min(0.5, (agora - ultimo) / 1000); ultimo = agora;
    if (pausado() || inicio.style.display !== 'none') return;
    media += (dt - media) * 0.1; desde += dt; if (desde < 2) return; desde = 0;   // olha a cada 2 s (contar quadros demorava quando o jogo estava lento)
    const c0 = camadas[0];
    if (media > 1 / 28 && c0.geo.instanceCount > c0.N / 4) for (const c of camadas) c.geo.instanceCount = Math.round(c.geo.instanceCount / 2);
    else if (media < 1 / 50 && c0.geo.instanceCount < c0.N) for (const c of camadas) c.geo.instanceCount = Math.min(c.N, c.geo.instanceCount * 2);
  }
  function atualiza() {
    if (!mesh.visible) return;
    ajustaQualidade();
    U.uCentro.value.set(estado.pos.x, -estado.pos.z);   // o tapete anda com o jogador 1
    cand.length = 0;
    for (const b of bonecos) junta(b, 0.42 * (b.scale.x || 1));
    for (const c of cachorros) junta(c.mesh, 0.5 * (c.mesh.scale.x || 1));
    if (typeof DLC !== 'undefined' && DLC.bichos) for (const b of DLC.bichos) junta(b.mesh, 0.6 * (b.mesh.scale.x || 1));
    cand.sort((a, b) => a.d - b.d);
    for (let i = 0; i < MAX_COL; i++) { const c = cand[i]; if (c) cols[i].set(c.x, c.y, c.r); else cols[i].set(0, 0, 0); }
  }
  return { mesh, atualiza, camadas, N: camadas.reduce((t, c) => t + c.N, 0), LADO, geo: camadas[0].geo };
})();
function atualizaGrama() { if (GRAMA) GRAMA.atualiza(); }
