// ---------- MOTOR DE DIÁLOGOS ----------
// As falas ficam em dados/capN_dialogos.js, em formato de roteiro: pra cada personagem, uma lista de
// entradas; a primeira cuja condição ("se") passa é a que vale. O código só escolhe e executa.
//
// Entrada: { se: [...condições], fala: 'texto' | ['vários', 'aleatório'], ms: 5000,
//            da: 'missao' | ['m1', 'm2'], conclui: 'missao', emote: 'bravo' | ['bravo', 'feliz'], acao: 'nomeDaAcao' }
//
// Condições (todas precisam passar; "!" na frente nega):
//   ativa:ID  concluida:ID  disponivel:ID  escondida:ID   — estado de uma missão
//   personagem:lara                                        — quem está jogando
//   var:chave=valor                                        — variável que o jogo expõe (ex.: var:fantasma=2)
//
// Curingas no texto: {nome} (quem joga), {gemeo} (nome do irmão/irmã), {irmao} ("o Caio, seu irmão gêmeo,"),
//   {filho} (filha/filho), e qualquer outro que o jogo passar em ctx.textos.
//
// Puro (sem DOM/THREE): roda nos testes com gjs.

var Dialogos = (function () {
  function testa(cond, ctx) {
    if (typeof cond !== 'string') throw new Error('condição precisa ser texto: ' + JSON.stringify(cond));
    let c = cond.trim(), neg = false;
    if (c[0] === '!') { neg = true; c = c.slice(1).trim(); }
    const i = c.indexOf(':'); if (i < 0) throw new Error('condição sem ":" — ' + cond);
    const tipo = c.slice(0, i), arg = c.slice(i + 1);
    let r;
    if (['ativa', 'concluida', 'disponivel', 'escondida'].includes(tipo)) r = ctx.estadoMissao(arg) === tipo;
    else if (tipo === 'personagem') r = ctx.personagem === arg;
    else if (tipo === 'var') { const [k, v] = arg.split('='); r = String(ctx.vars && ctx.vars[k]) === String(v); }
    else throw new Error('condição desconhecida: ' + cond);
    return neg ? !r : r;
  }
  // primeira entrada cujas condições passam (uma entrada sem "se" sempre passa)
  function escolhe(entradas, ctx) {
    for (const e of entradas || []) if ((e.se || []).every(c => testa(c, ctx))) return e;
    return null;
  }
  function preenche(texto, ctx) {
    return String(texto).replace(/\{(\w+)\}/g, (m, k) => (ctx.textos && ctx.textos[k] !== undefined) ? ctx.textos[k] : m);
  }
  const sorteia = (v, rnd) => Array.isArray(v) ? v[Math.floor((rnd || Math.random)() * v.length)] : v;
  // escolhe a entrada e devolve o que o jogo precisa mostrar/fazer
  function fala(entradas, ctx, rnd) {
    const e = escolhe(entradas, ctx); if (!e) return null;
    const texto = e.fala !== undefined ? preenche(sorteia(e.fala, rnd), ctx) : '';
    return { entrada: e, texto, ms: e.ms, da: [].concat(e.da || []), conclui: [].concat(e.conclui || []), emote: sorteia(e.emote, rnd), acao: e.acao };
  }
  // confere um arquivo de diálogos: condições que não parseiam, missões que não existem, ações desconhecidas
  function valida(dialogos, missaoIds, acoes) {
    const probs = [];
    const ctxFake = { estadoMissao: () => 'escondida', personagem: 'lara', vars: {} };
    for (const nome in dialogos) {
      const lista = dialogos[nome];
      if (!Array.isArray(lista)) { probs.push(nome + ': precisa ser uma lista de entradas'); continue; }
      lista.forEach((e, i) => {
        const onde = nome + ' #' + (i + 1);
        if (e.fala === undefined && !e.da && !e.conclui && !e.acao) probs.push(onde + ': entrada vazia');
        for (const c of e.se || []) { try { testa(c, ctxFake); } catch (err) { probs.push(onde + ': ' + err.message); }
          const m = /^!?\s*(ativa|concluida|disponivel|escondida):(.+)$/.exec(c.trim()); if (m && missaoIds && !missaoIds.includes(m[2])) probs.push(onde + ': condição usa missão inexistente "' + m[2] + '"'); }
        for (const id of [].concat(e.da || [], e.conclui || [])) if (missaoIds && !missaoIds.includes(id)) probs.push(onde + ': missão inexistente "' + id + '"');
        if (e.acao && acoes && !acoes.includes(e.acao)) probs.push(onde + ': ação desconhecida "' + e.acao + '"');
        if (e.se && e.se.length === 0) probs.push(onde + ': "se" vazio (pode tirar)');
      });
      // a última entrada sem "se" é o padrão; entradas depois dela nunca são usadas
      const semSe = lista.findIndex(e => !e.se || !e.se.length);
      if (semSe >= 0 && semSe < lista.length - 1) probs.push(nome + ': a entrada #' + (semSe + 1) + ' não tem "se", então as seguintes nunca são usadas');
    }
    return probs;
  }
  return { testa, escolhe, preenche, fala, valida };
})();
