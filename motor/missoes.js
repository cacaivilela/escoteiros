// ---------- MOTOR DE MISSÕES: estados e gatilhos ----------
// Cada missão tem um estado e só muda por um gatilho:
//
//   escondida ──(uma missão que a "abre" é concluída)──▶ disponível ──(alguém dá: Missoes.da)──▶ ativa ──(gatilho)──▶ concluída
//
// Regras fixas (issue #3):
//   • nada aparece na lista antes de ser dado (só missões ATIVAS e CONCLUÍDAS aparecem);
//   • item de missão só pode ser coletado enquanto a missão está ativa (Missoes.podeColetar);
//   • missão de "falar com X" só termina com Missoes.falou(X) — nunca por chegar perto;
//   • marcador no mapa só para missões ativas (Missoes.marcadores).
//
// Este arquivo é PURO: não usa DOM nem THREE, por isso roda nos testes (gjs) sem navegador.
// game.js liga os ouvintes (Missoes.ao) pra atualizar HUD, som e avisos.
// As definições ficam em dados/cap1_missoes.js (veja o formato lá).

var Missoes = (function () {
  const ESTADOS = ['escondida', 'disponivel', 'ativa', 'concluida'];
  let defs = {}, ordem = [], estado = {}, prog = {}, txts = {}, marcas = {};
  const ouvintes = { ativa: [], concluida: [], muda: [], erro: [] };
  // quem testa "estou dentro do lugar X?" (o jogo liga com os polígonos do mapa; os testes com uma função fake)
  let dentro = () => false;

  function avisa(tipo, id) { for (const f of ouvintes[tipo]) f(id, defs[id]); }
  function erro(msg) { avisa('erro', msg); if (!ouvintes.erro.length && typeof console !== 'undefined') console.warn('[missoes] ' + msg); return false; }

  // carrega as definições de um capítulo (zera tudo)
  function carrega(lista) {
    defs = {}; ordem = []; estado = {}; prog = {}; txts = {}; marcas = {}; for (const k in metas) delete metas[k];
    for (const d of lista) {
      defs[d.id] = d; ordem.push(d.id);
      estado[d.id] = d.inicio ? 'disponivel' : 'escondida';
      prog[d.id] = 0; txts[d.id] = d.txt; if (d.marcador) marcas[d.id] = d.marcador.slice();
    }
    const probs = valida(lista);
    for (const p of probs) erro(p);
    return probs;
  }

  // confere as definições: ids repetidos, "abre" apontando pro nada, missão que nunca destrava, gatilho inválido
  function valida(lista) {
    const probs = [], ids = new Set(), abertas = new Set();
    const TIPOS = ['falar', 'chegar', 'item', 'minigame', 'custom'];
    for (const d of lista) {
      if (!d.id) probs.push('missão sem id: ' + JSON.stringify(d));
      if (ids.has(d.id)) probs.push('id repetido: ' + d.id); ids.add(d.id);
      if (!d.txt) probs.push(d.id + ': sem texto');
      if (!d.quem) probs.push(d.id + ': sem "quem" (quem dá a missão)');
      if (!d.gatilho || !TIPOS.includes(d.gatilho.tipo)) probs.push(d.id + ': gatilho inválido (tipos: ' + TIPOS.join(', ') + ')');
      else {
        const g = d.gatilho;
        if (g.tipo === 'falar' && !g.com) probs.push(d.id + ': gatilho falar sem "com"');
        if (g.tipo === 'item' && (!g.item || !(g.meta >= 1))) probs.push(d.id + ': gatilho item precisa de "item" e "meta" >= 1');
        if (g.tipo === 'chegar' && !g.lugar && !(g.x !== undefined && g.y !== undefined && g.r > 0)) probs.push(d.id + ': gatilho chegar precisa de "lugar" ou x,y,r');
        if (g.tipo === 'minigame' && !g.nome) probs.push(d.id + ': gatilho minigame sem "nome"');
      }
      for (const a of d.abre || []) abertas.add(a);
    }
    for (const d of lista) for (const a of d.abre || []) if (!ids.has(a)) probs.push(d.id + ' abre "' + a + '", que não existe');
    for (const d of lista) if (!d.inicio && !abertas.has(d.id)) probs.push(d.id + ': nunca destrava (não é "inicio" e nenhuma missão a abre)');
    return probs;
  }

  function existe(id) { return !!defs[id]; }
  function estadoDe(id) { return estado[id] || null; }
  const ativa = id => estado[id] === 'ativa';
  const concluida = id => estado[id] === 'concluida';
  const disponivel = id => estado[id] === 'disponivel';

  // alguém dá a missão (conversa, cutscene): só se ela já estiver disponível
  function da(id) {
    if (!defs[id]) return erro('da(' + id + '): missão não existe');
    if (estado[id] === 'ativa' || estado[id] === 'concluida') return false;   // já dada: nada a fazer
    if (estado[id] === 'escondida') return erro('da(' + id + '): ainda escondida — alguma missão precisa abrir ela antes');
    estado[id] = 'ativa'; avisa('ativa', id); return true;
  }
  // conclui uma missão ativa e abre as que ela destrava
  function conclui(id) {
    if (!defs[id]) return erro('conclui(' + id + '): missão não existe');
    if (estado[id] !== 'ativa') return false;
    estado[id] = 'concluida';
    for (const a of defs[id].abre || []) if (estado[a] === 'escondida') { estado[a] = 'disponivel'; avisa('muda', a); }
    avisa('concluida', id); return true;
  }

  // ---- gatilhos ----
  // falou com alguém: conclui as missões ativas cujo gatilho é falar com essa pessoa
  function falou(nome) {
    const feitas = [];
    for (const id of ordem) { const g = defs[id].gatilho; if (ativa(id) && g.tipo === 'falar' && g.com === nome && conclui(id)) feitas.push(id); }
    return feitas;
  }
  // chegou num ponto (x,y em coordenadas do mapa/osm): conclui só missões de "chegar"
  function chegou(x, y) {
    const feitas = [];
    for (const id of ordem) {
      const g = defs[id].gatilho; if (!ativa(id) || g.tipo !== 'chegar') continue;
      const ok = g.lugar ? dentro(g.lugar, x, y) : Math.hypot(x - g.x, y - g.y) < g.r;
      if (ok && conclui(id)) feitas.push(id);
    }
    return feitas;
  }
  // pode coletar esse item? só se alguma missão ativa pede ele
  function podeColetar(item) { return ordem.some(id => ativa(id) && defs[id].gatilho.tipo === 'item' && defs[id].gatilho.item === item); }
  // coletou q unidades: soma no progresso e conclui quando bate a meta. Devolve as missões que avançaram.
  function coletou(item, q) {
    const mudou = [];
    for (const id of ordem) {
      const g = defs[id].gatilho; if (!ativa(id) || g.tipo !== 'item' || g.item !== item) continue;
      prog[id] += q || 1; mudou.push(id); avisa('muda', id);
      if (prog[id] >= meta(id)) conclui(id);
    }
    return mudou;
  }
  // terminou um minigame
  function minigame(nome) {
    const feitas = [];
    for (const id of ordem) { const g = defs[id].gatilho; if (ativa(id) && g.tipo === 'minigame' && g.nome === nome && conclui(id)) feitas.push(id); }
    return feitas;
  }

  // ---- progresso, textos e marcadores ----
  const progresso = id => prog[id] || 0;
  const metas = {};   // meta pode mudar durante o jogo (ex.: com a pederneira bastam 3 lenhas)
  function meta(id, nova) { if (nova !== undefined) { metas[id] = nova; avisa('muda', id); if (ativa(id) && prog[id] >= nova) conclui(id); } return metas[id] !== undefined ? metas[id] : (defs[id] && defs[id].gatilho.meta) || 0; }
  function texto(id, novo) {
    if (novo !== undefined) { txts[id] = novo; avisa('muda', id); }
    let t = txts[id] || ''; const g = defs[id] && defs[id].gatilho;
    if (g && g.tipo === 'item') t = t.replace('{n}', Math.min(progresso(id), meta(id))).replace('{meta}', meta(id));
    return t;
  }
  function marca(id, xy) { if (xy) marcas[id] = xy.slice(); else delete marcas[id]; avisa('muda', id); }
  const marcadores = () => ordem.filter(id => ativa(id) && marcas[id]).map(id => ({ id, x: marcas[id][0], y: marcas[id][1], txt: texto(id) }));

  // lista pra HUD: só o que já foi dado (ativas e concluídas), na ordem em que foi definido
  const lista = () => ordem.filter(id => ativa(id) || concluida(id)).map(id => ({ id, txt: texto(id), ok: concluida(id), n: progresso(id) }));
  const ativas = () => ordem.filter(ativa);
  const todas = () => ordem.slice();
  const def = id => defs[id];
  function ao(tipo, f) { if (!ouvintes[tipo]) throw new Error('evento desconhecido: ' + tipo); ouvintes[tipo].push(f); }
  function reseta() { defs = {}; ordem = []; estado = {}; prog = {}; txts = {}; marcas = {}; for (const k in metas) delete metas[k]; }

  return { ESTADOS, carrega, valida, existe, estado: estadoDe, ativa, concluida, disponivel, da, conclui, falou, chegou, podeColetar, coletou, minigame,
    progresso, meta, texto, marca, marcadores, lista, ativas, todas, def, ao, reseta, set dentro(f) { dentro = f; }, get dentro() { return dentro; } };
})();
