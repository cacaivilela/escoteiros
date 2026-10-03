// ---------- CELULAR E TABLET: joystick, botões na tela e câmera com o dedo ----------
// Liga sozinho em tela de toque (ou com ?toque no endereço; ?semtoque desliga). Os botões "apertam teclas de mentira"
// (KeyboardEvent com o mesmo code do teclado), então tudo que funciona no teclado funciona aqui sem mexer no jogo:
// falas, minijogos (segurar ✋ = segurar E), setas do gavião/remo/pipa etc. Só o andar (TOQUE.mx/mz), o correr
// (TOQUE.correr) e o entrar/pausar (mudouTrava) são ligados direto em game.js.

(function () {
  if (!TOQUE.ativo) return;
  document.body.classList.add('toque');
  inicio.querySelector('.btn:not(#btnContinuar)').textContent = 'Toque para começar';
  pausaEl.querySelector('div').textContent = '⏸ Pausado — toque para continuar';
  // tela cheia e deitada ao começar (some a barra do navegador). Só funciona com um toque de verdade, por isso fica nos botões;
  // o iPhone não deixa tela cheia fora de vídeo: lá o jogo segue normal
  function telaCheia() {
    const d = document.documentElement, pede = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!pede || document.fullscreenElement || document.webkitFullscreenElement) return;
    try { const p = pede.call(d, { navigationUI: 'hide' }); if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {}); } catch (e) {}
  }
  for (const el of [inicio.querySelector('.btn:not(#btnContinuar)'), document.getElementById('btnContinuar'), pausaEl]) el.addEventListener('click', telaCheia);

  const raiz = document.getElementById('toque');
  raiz.innerHTML = `
    <div class="zona esq"></div><div class="zona dir"></div>
    <div class="base"><div class="pino"></div></div>
    <div class="setas"><b data-k="ArrowUp" class="cima">▲</b><b data-k="ArrowLeft" class="esq">◀</b><b data-k="ArrowRight" class="dir">▶</b><b data-k="ArrowDown" class="baixo">▼</b></div>
    <div class="botoes">
      <b data-k="KeyE" class="grande e">✋<small></small></b>
      <b data-k="Space" class="pula">⤒</b>
      <b data-acao="correr" class="corre">🏃</b>
      <b data-k="KeyQ">⭐</b>
      <b data-k="KeyM">🗺️</b>
      <b data-acao="foto">📷</b>
      <b data-acao="cara">😊</b>
      <b data-acao="frases" class="frases">💬</b>
    </div>
    <b class="pausa" data-acao="pausa">⏸</b>
    <div class="gire">📱↻ Vire o celular de lado pra jogar melhor</div>`;

  // depois do toque o navegador ainda manda um "clique fantasma" no mesmo ponto: no ⏸ ele caía no "Pausado" (que acabou de
  // aparecer ali) e despausava na hora. Cancelar o touchend nos controles some com esse clique.
  raiz.addEventListener('touchend', e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
  let pausouEm = 0;
  pausaEl.addEventListener('click', e => { if (performance.now() - pausouEm < 600) e.stopImmediatePropagation(); }, true);

  // tecla de mentira: o jogo recebe igualzinho a uma tecla de verdade
  function tecla(code, desce) { document.dispatchEvent(new KeyboardEvent(desce ? 'keydown' : 'keyup', { code, key: code, bubbles: true, cancelable: true })); }

  // botões: segurar = tecla apertada (o fogo e a pesca precisam de "segurar E")
  let cara = 0;
  raiz.querySelectorAll('[data-k],[data-acao]').forEach(b => {
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); b.classList.add('apertado');
      if (b.dataset.k) return tecla(b.dataset.k, true);
      const a = b.dataset.acao;
      if (a === 'correr') { TOQUE.correr = !TOQUE.correr; b.classList.toggle('ligado', TOQUE.correr); }
      if (a === 'foto' && typeof tiraFoto === 'function') tiraFoto();
      if (a === 'cara') { tecla('Digit' + (cara % 4 + 1), true); tecla('Digit' + (cara % 4 + 1), false); cara++; }
      if (a === 'frases' && typeof mostraFrases === 'function') mostraFrases(frasesEl.style.display !== 'block');
      if (a === 'pausa') { pausouEm = performance.now(); soltaTudo(); TOQUE.mx = TOQUE.mz = 0; mudouTrava(false); }
    });
    const solta = e => { if (!b.classList.contains('apertado')) return; b.classList.remove('apertado'); if (b.dataset.k) tecla(b.dataset.k, false); };
    b.addEventListener('pointerup', solta); b.addEventListener('pointercancel', solta); b.addEventListener('pointerleave', solta);
  });

  // joystick: aparece onde o dedo encosta, no lado esquerdo
  const base = raiz.querySelector('.base'), pino = raiz.querySelector('.pino'), R = 55;
  let dedoJoy = null, ox = 0, oy = 0;
  const zEsq = raiz.querySelector('.zona.esq');
  zEsq.addEventListener('pointerdown', e => { e.preventDefault(); if (dedoJoy !== null) return; dedoJoy = e.pointerId; zEsq.setPointerCapture(e.pointerId); ox = e.clientX; oy = e.clientY; base.style.left = ox + 'px'; base.style.top = oy + 'px'; base.style.display = 'block'; pino.style.transform = ''; });
  zEsq.addEventListener('pointermove', e => {
    if (e.pointerId !== dedoJoy) return;
    let dx = e.clientX - ox, dy = e.clientY - oy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
    pino.style.transform = `translate(${dx}px,${dy}px)`;
    const k = d < 8 ? 0 : 1 / R; TOQUE.mx = dx * k; TOQUE.mz = dy * k;
  });
  const soltaJoy = e => { if (e.pointerId !== dedoJoy) return; dedoJoy = null; TOQUE.mx = TOQUE.mz = 0; base.style.display = 'none'; };
  zEsq.addEventListener('pointerup', soltaJoy); zEsq.addEventListener('pointercancel', soltaJoy);

  // câmera: arrastar no lado direito (com dois dedos lá, afastar/aproximar faz o zoom)
  const zDir = raiz.querySelector('.zona.dir'), dedos = new Map();
  let pinca = 0;
  zDir.addEventListener('pointerdown', e => { e.preventDefault(); zDir.setPointerCapture(e.pointerId); dedos.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinca = 0; });
  zDir.addEventListener('pointermove', e => {
    const a = dedos.get(e.pointerId); if (!a) return;
    if (dedos.size === 1) { cam.yaw -= (e.clientX - a.x) * 0.006; cam.pitch = Math.max(-0.2, Math.min(1.2, cam.pitch + (e.clientY - a.y) * 0.004)); }
    a.x = e.clientX; a.y = e.clientY;
    if (dedos.size === 2) { const [p, q] = [...dedos.values()], d = Math.hypot(p.x - q.x, p.y - q.y); if (pinca) cam.dist = Math.max(3, Math.min(14, cam.dist - (d - pinca) * 0.03)); pinca = d; }
  });
  const soltaDedo = e => { dedos.delete(e.pointerId); pinca = 0; };
  zDir.addEventListener('pointerup', soltaDedo); zDir.addEventListener('pointercancel', soltaDedo);

  // o que aparece depende do momento: nada no menu; setas nos minijogos e nas cenas (gavião, remo, pipa); joystick andando
  const setas = raiz.querySelector('.setas'), rotE = raiz.querySelector('.e small');
  function atualiza() {
    requestAnimationFrame(atualiza);
    const noMenu = inicio.style.display !== 'none' || pausado();
    raiz.style.display = noMenu ? 'none' : 'block';
    if (noMenu) { if (dedoJoy !== null) { dedoJoy = null; TOQUE.mx = TOQUE.mz = 0; base.style.display = 'none'; } return; }
    const comSetas = !!(mini || cena);
    setas.style.display = comSetas ? 'block' : 'none'; zEsq.style.display = comSetas ? 'none' : 'block';
    if (comSetas && dedoJoy !== null) { dedoJoy = null; TOQUE.mx = TOQUE.mz = 0; base.style.display = 'none'; }
    raiz.querySelector('.frases').style.display = typeof naSala === 'function' && naSala() ? '' : 'none';   // 💬 só numa sala online
    const it = !cena && !mini && interativoProximo();
    rotE.textContent = it ? it.nome : '';
  }
  atualiza();
})();
