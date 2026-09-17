// Sons do jogo — tudo sintetizado com Web Audio (sem arquivos externos)
const SOM = (function () {
  let ctx = null, master = null, mudo = false, menuTimer = null, menuTocando = false;
  let fogo = null, ambiente = null, motor = null;
  const ok = () => !!ctx && !mudo;
  function liga() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
  }
  function ruido(dur) {
    const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = b; return src;
  }
  // ---- palma (bater de mãos): rajada de ruído com filtro passa-banda ----
  function palma(t, vol) {
    if (!ok()) return;
    const src = ruido(0.12), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.frequency.value = 1100 + Math.random() * 400; f.Q.value = 0.9;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.9, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + 0.13);
  }
  // Palma escoteira: tatatata, tata, tata, tatatata, tata, tata, tatatata, tatatata, ta (em loop, no menu)
  function palmaEscoteira() {
    if (!ok() || !menuTocando) return;
    const t0 = ctx.currentTime + 0.05, r = 0.17, pausa = 0.2;
    const grupos = [4, 2, 2, 4, 2, 2, 4, 4, 1];
    let t = t0;
    for (const n of grupos) {
      for (let i = 0; i < n; i++) { palma(t, n === 1 ? 1 : 0.85); t += r; }
      t += pausa;
    }
    t += 1.2;
    // um violãozinho leve por baixo
    acorde(t0, [196, 247, 294], 1.4, 0.05); acorde(t0 + 2.2, [175, 220, 262], 1.4, 0.05); acorde(t0 + 4.4, [196, 247, 294, 392], 1.6, 0.06);
    menuTimer = setTimeout(palmaEscoteira, (t - ctx.currentTime) * 1000);
  }
  function acorde(t, freqs, dur, vol) {
    for (const f of freqs) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
    }
  }
  function tom(freq, dur, tipo, vol, t, freqFim) {
    if (!ok()) return;
    t = t || ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  return {
    liga,
    mudo() { mudo = !mudo; if (master) master.gain.value = mudo ? 0 : 0.6; return mudo; },
    menu(on) {
      if (!ctx) return; if (on && !menuTocando) { menuTocando = true; palmaEscoteira(); }
      if (!on) { menuTocando = false; clearTimeout(menuTimer); }
    },
    passo(correndo, agua) {
      if (!ok()) return;
      const t = ctx.currentTime, src = ruido(0.08), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = agua ? 'bandpass' : 'lowpass'; f.frequency.value = agua ? 900 : 500;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(correndo ? 0.25 : 0.15, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + (agua ? 0.12 : 0.07));
      src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + 0.13);
    },
    pulo() { tom(300, 0.18, 'sine', 0.18, null, 600); },
    coleta() { const t = ctx ? ctx.currentTime : 0; tom(880, 0.12, 'sine', 0.18, t); tom(1320, 0.2, 'sine', 0.16, t + 0.08); },
    missao() { const t = ctx ? ctx.currentTime : 0; [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.3, 'triangle', 0.18, t + i * 0.12)); },
    fim() { const t = ctx ? ctx.currentTime : 0; [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tom(f, 0.4, 'triangle', 0.2, t + i * 0.15)); },
    fala(n) { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < Math.min(14, n); i++) tom(260 + Math.random() * 220, 0.05, 'square', 0.03, t + i * 0.055); },
    latido() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 2; i++) { tom(520, 0.09, 'sawtooth', 0.14, t + i * 0.22, 260); tom(300, 0.12, 'square', 0.06, t + i * 0.22 + 0.02, 180); } },
    uivo() { tom(380, 1.2, 'sine', 0.15, null, 620); },
    grr() { if (!ok()) return; const t = ctx.currentTime; tom(120, 0.4, 'sawtooth', 0.12, t, 90); },
    aww() { tom(500, 0.5, 'sine', 0.12, null, 300); },
    uau() { tom(400, 0.3, 'sine', 0.14, null, 800); },
    entrou() { const t = ctx ? ctx.currentTime : 0; tom(660, 0.1, 'square', 0.1, t); tom(990, 0.15, 'square', 0.1, t + 0.1); },
    bau() { const t = ctx ? ctx.currentTime : 0; tom(200, 0.15, 'square', 0.1, t, 150); tom(700, 0.25, 'triangle', 0.12, t + 0.15); },
    faisca() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 3; i++) { const s = ruido(0.05), g = ctx.createGain(); g.gain.setValueAtTime(0.3, t + i * 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.05); s.connect(g); g.connect(master); s.start(t + i * 0.08); } },
    fogueira(on) {
      if (!ctx) return;
      if (on && !fogo) { const s = ruido(2); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const g = ctx.createGain(); g.gain.value = 0.12; s.connect(f); f.connect(g); g.connect(master); s.start(); fogo = { s, g }; }
      if (!on && fogo) { fogo.s.stop(); fogo = null; }
    },
    ambiente(on) {
      if (!ctx) return;
      if (on && !ambiente) {
        const s = ruido(3); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350; const g = ctx.createGain(); g.gain.value = 0.05;
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain); lfo.start();
        s.connect(f); f.connect(g); g.connect(master); s.start(); ambiente = { s, g, lfo };
        const passaro = () => { if (!ambiente) return; if (ok()) { const t = ctx.currentTime; const n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) tom(1800 + Math.random() * 1200, 0.08, 'sine', 0.05, t + i * 0.12, 2400 + Math.random() * 800); } setTimeout(passaro, 2500 + Math.random() * 5000); };
        setTimeout(passaro, 1500);
      }
      if (!on && ambiente) { ambiente.s.stop(); ambiente.lfo.stop(); ambiente = null; }
    },
    noite(on, calma) {
      if (!ctx) return;
      if (on && !this._noite) {
        const s = ruido(3); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 300; f.Q.value = 0.6;
        const g = ctx.createGain(); g.gain.value = 0.06; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.gain); lfo.start();
        const lfo2 = ctx.createOscillator(), lg2 = ctx.createGain(); lfo2.frequency.value = 0.05; lg2.gain.value = 180; lfo2.connect(lg2); lg2.connect(f.frequency); lfo2.start();
        s.connect(f); f.connect(g); g.connect(master); s.start(); this._noite = { s, lfo, lfo2 };
        const susto = () => { if (!this._noite) return; if (ok()) { const r = Math.random(); if (calma) { if (r < 0.5) this.coruja(); else this.grilo(); } else if (r < 0.4) this.coruja(); else if (r < 0.7) this.sussurro(); else this.risada(); } setTimeout(susto, 6000 + Math.random() * 9000); };
        setTimeout(susto, 4000);
      }
      if (!on && this._noite) { this._noite.s.stop(); this._noite.lfo.stop(); this._noite.lfo2.stop(); this._noite = null; }
    },
    grilo() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 6; i++) tom(4200, 0.03, 'sine', 0.03, t + i * 0.07); },
    coruja() { if (!ok()) return; const t = ctx.currentTime; tom(520, 0.25, 'sine', 0.12, t, 440); tom(520, 0.4, 'sine', 0.12, t + 0.35, 400); },
    sussurro() { if (!ok()) return; const t = ctx.currentTime, s = ruido(1.2), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.Q.value = 4; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(2600, t + 1.1); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 1.25); },
    risada() { if (!ok()) return; const t = ctx.currentTime; [900, 800, 700, 600, 500].forEach((f, i) => tom(f, 0.1, 'square', 0.05, t + i * 0.11, f * 0.8)); },
    tap() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 2; i++) { const s = ruido(0.05), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'lowpass'; f.frequency.value = 400; g.gain.setValueAtTime(0.5, t + i * 0.25); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.06); s.connect(f); f.connect(g); g.connect(master); s.start(t + i * 0.25); } },
    sonho() { if (!ok()) return; const t = ctx.currentTime; [[523, 0], [659, 0.4], [784, 0.8], [1047, 1.2], [1319, 1.6], [1047, 2.4], [784, 2.8], [659, 3.2]].forEach(([f, d]) => tom(f, 2.2, 'sine', 0.07, t + d)); acorde(t + 3.8, [262, 330, 392, 523], 4, 0.05); acorde(t + 8, [294, 370, 440, 587], 4, 0.05); acorde(t + 12, [262, 330, 392, 523], 5, 0.05); },
    galo() { if (!ok()) return; const t = ctx.currentTime; [[600, 0.2], [800, 0.25], [1000, 0.5], [750, 0.6]].forEach(([f, d], i) => tom(f, d, 'sawtooth', 0.08, t + i * 0.22)); },
    aspirador(on) {
      if (!ctx) return;
      if (on && !this._asp) {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, ctx.currentTime); o.frequency.linearRampToValueAtTime(260, ctx.currentTime + 1.2);
        f.type = 'lowpass'; f.frequency.value = 900; g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
        const s = ruido(2); s.loop = true; const fs = ctx.createBiquadFilter(); fs.type = 'bandpass'; fs.frequency.value = 2200; const gs = ctx.createGain(); gs.gain.value = 0.06;
        o.connect(f); f.connect(g); g.connect(master); s.connect(fs); fs.connect(gs); gs.connect(master); o.start(); s.start(); this._asp = { o, g, s, gs };
      }
      if (!on && this._asp) { const a = this._asp; a.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); a.gs.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); setTimeout(() => { a.o.stop(); a.s.stop(); }, 400); this._asp = null; }
    },
    pop() { const t = ctx ? ctx.currentTime : 0; tom(300, 0.12, 'sine', 0.25, t, 900); },
    motor(on) {
      if (!ctx) return;
      if (on && !motor) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 55; f.type = 'lowpass'; f.frequency.value = 220; g.gain.value = 0.08; o.connect(f); f.connect(g); g.connect(master); o.start(); motor = { o, g }; }
      if (!on && motor) { motor.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); const m = motor; setTimeout(() => m.o.stop(), 500); motor = null; }
      if (motor && on) motor.o.frequency.setTargetAtTime(on === true ? 70 : on, ctx.currentTime, 0.2);
    },
  };
})();
