#!/usr/bin/gjs
// ---------- TESTE DOS CAPÍTULOS 2, 3 E 4 (motor de missões) ----------
// Igual ao cap1.test.js, mas parametrizado: pra cada capítulo, confere os dados (dados/capN_missoes.js) e um "robô" joga
// o capítulo pelo motor na ordem da história (da → gatilho → conclui → abre a próxima) até todas as obrigatórias concluídas.
// Também testa os pontos de "retomar" (avancaAte) e o salvar/restaurar (exporta/importa). Roda sem navegador:
//     ./testes/roda.sh            (ou:  gjs testes/capitulos.test.js)
// Responde "capítulos 2–4 OK" ou lista o que quebrou. QUEBRA=1 sabota os dados de propósito pra mostrar que o teste acusa.

const GLib = imports.gi.GLib;
const raiz = GLib.path_get_dirname(GLib.path_get_dirname(GLib.canonicalize_filename(imports.system.programInvocationName, null)));
function le(arq) { const [ok, bytes] = GLib.file_get_contents(raiz + '/' + arq); if (!ok) throw new Error('não li ' + arq); return new TextDecoder().decode(bytes); }
function carrega(arq) { (0, eval)(le(arq)); }   // eval "global": os var dos arquivos viram globais, como no navegador

let falhas = 0, passos = 0;
function ok(cond, msg) { passos++; if (!cond) { falhas++; print('  ✘ ' + msg); } }
function igual(a, b, msg) { ok(JSON.stringify(a) === JSON.stringify(b), msg + ' — esperado ' + JSON.stringify(b) + ', veio ' + JSON.stringify(a)); }
function grupo(nome, fn) { print('• ' + nome); try { fn(); } catch (e) { falhas++; print('  ✘ ERRO: ' + e.message + (e.stack ? '\n    ' + e.stack.split('\n')[0] : '')); } }

carrega('motor/missoes.js'); carrega('dados/personagens.js'); carrega('dados/itens.js');
for (const n of [1, 2, 3, 4]) carrega('dados/cap' + n + '_missoes.js');
if (GLib.getenv('QUEBRA')) {   // sabotagem de propósito: o Chefe Diego não abre mais o gavião no cap. 2
  DADOS.cap2Missoes.find(m => m.id === 'c2_diego').abre = [];
  print('(QUEBRA=1: tirei o "abre" da missão c2_diego — o teste tem que acusar)');
}
const FICHAS = DADOS.personagens;
const nomes = Object.values(FICHAS).map(p => p.npc || p.nome).concat(Object.values(FICHAS).map(p => p.nome), Object.values(DADOS.cachorros).map(c => c.nome));
const LUGARES_MAPA = ['praia', 'camping', 'iate', 'raso', 'campo'];   // polígonos de mapa.js

// cada capítulo: dados, quem começa (o código dá na abertura), pontos de retomar (save → missão que fica ativa)
const CAPS = [
  { n: 2, mis: DADOS.cap2Missoes, arq: 'cap2.js', inicio: 'c2_akela', retomar: { bandeira: 'c2_barco' } },
  { n: 3, mis: DADOS.cap3Missoes, arq: 'cap3.js', inicio: 'c3_akela', retomar: { noite: 'c3_grito' } },
  { n: 4, mis: DADOS.cap4Missoes, arq: 'cap4.js', inicio: 'c4_akela', retomar: { pedra: 'c4_gym_pedra' } },
];

// a lista do HUD como game.js monta (mesmos ouvintes da seção "missões"), pra conferir que ela segue o motor
const hud = [], erros = [], eventos = [];
Missoes.ao('ativa', id => { eventos.push('ativa:' + id); if (!hud.find(m => m.id === id)) hud.push({ id, ok: false }); });
Missoes.ao('concluida', id => { eventos.push('concluida:' + id); const m = hud.find(x => x.id === id); if (m) m.ok = true; });
Missoes.ao('recarrega', () => { eventos.push('recarrega'); hud.splice(0, hud.length, ...Missoes.lista().map(m => ({ id: m.id, ok: m.ok }))); });
Missoes.ao('erro', m => erros.push(m));
Missoes.dentro = (lugar, x, y) => false;
const lista = () => Missoes.lista().map(m => m.id + (m.ok ? '✔' : ''));
const hudTxt = () => hud.map(m => m.id + (m.ok ? '✔' : ''));

// ---- o robô: dá a próxima missão disponível na ordem da história e dispara o gatilho dela ----
// Devolve false quando não tem mais nada pra fazer. Cada passo confere as regras do motor.
function passo(c) {
  const id = Missoes.todas().find(x => Missoes.disponivel(x) && !Missoes.def(x).opcional) || Missoes.ativas()[0];
  if (!id) return false;
  const d = Missoes.def(id), g = d.gatilho;
  if (!Missoes.ativa(id)) {
    // antes de ser dada, o gatilho não faz nada
    if (g.tipo === 'falar') igual(Missoes.falou(g.com), [], c.n + '/' + id + ': falar antes de receber a missão não conclui');
    if (g.tipo === 'minigame') igual(Missoes.minigame(g.nome), [], c.n + '/' + id + ': minigame antes da missão não conclui');
    if (g.tipo === 'chegar' && g.x !== undefined) igual(Missoes.chegou(g.x, g.y), [], c.n + '/' + id + ': chegar antes da missão não conclui');
    if (g.tipo === 'item') ok(!Missoes.podeColetar(g.item), c.n + '/' + id + ': ' + g.item + ' coletável antes da missão');
    ok(!Missoes.conclui(id), c.n + '/' + id + ': concluiu sem estar ativa');
    ok(Missoes.da(id), c.n + '/' + id + ': não deu pra dar a missão (estado ' + Missoes.estado(id) + ')');
  }
  ok(lista().includes(id), c.n + '/' + id + ': missão dada não aparece na lista');
  // gatilho errado não conclui
  if (d.marcador && g.tipo !== 'chegar') Missoes.chegou(d.marcador[0], d.marcador[1]);
  if (g.tipo !== 'falar') Missoes.falou('Akelá');
  ok(Missoes.ativa(id), c.n + '/' + id + ': concluiu por gatilho errado (chegar perto/falar)');
  // gatilho certo
  if (g.tipo === 'falar') { Missoes.falou('Ninguém'); ok(Missoes.ativa(id), c.n + '/' + id + ': falar com outro concluiu'); ok(Missoes.falou(g.com).includes(id), c.n + '/' + id + ': falar com ' + g.com + ' não concluiu'); }
  else if (g.tipo === 'chegar') { igual(Missoes.chegou(99999, 99999), [], c.n + '/' + id + ': longe não conclui'); ok(Missoes.chegou(g.x, g.y).includes(id), c.n + '/' + id + ': chegar em ' + g.x + ',' + g.y + ' não concluiu'); }
  else if (g.tipo === 'minigame') { igual(Missoes.minigame('nenhum'), [], c.n + '/' + id + ': outro minigame concluiu'); ok(Missoes.minigame(g.nome).includes(id), c.n + '/' + id + ': minigame ' + g.nome + ' não concluiu'); }
  else if (g.tipo === 'item') {
    ok(Missoes.podeColetar(g.item), c.n + '/' + id + ': ' + g.item + ' não coletável com a missão ativa');
    for (let i = 1; i <= g.meta; i++) {
      if (i < g.meta) { Missoes.coletou(g.item, 1); ok(Missoes.ativa(id), c.n + '/' + id + ': concluiu antes da meta'); if (/\{n\}/.test(d.txt)) ok(Missoes.texto(id).includes(i + '/' + g.meta), c.n + '/' + id + ': texto sem progresso: ' + Missoes.texto(id)); }
      else Missoes.coletou(g.item, 1);
    }
  } else ok(Missoes.conclui(id), c.n + '/' + id + ': custom não concluiu');
  ok(Missoes.concluida(id), c.n + '/' + id + ': não ficou concluída');
  for (const a of d.abre || []) ok(Missoes.estado(a) !== 'escondida', c.n + '/' + id + ': concluiu mas não abriu ' + a);
  // regras gerais
  ok(Missoes.lista().every(m => Missoes.ativa(m.id) || Missoes.concluida(m.id)), c.n + ': lista com missão não dada');
  ok(Missoes.marcadores().every(m => Missoes.ativa(m.id)), c.n + ': marcador de missão que não está ativa');
  igual(hudTxt(), lista(), c.n + '/' + id + ': HUD diferente do motor');
  return true;
}
function jogaAteOFim(c) { let n = 0; while (passo(c) && n < 100) n++; return n; }
const obrigatorias = c => c.mis.filter(m => !m.opcional).map(m => m.id);

for (const c of CAPS) {
  const MIS = c.mis, ids = MIS.map(m => m.id), src = le(c.arq);

  grupo('cap. ' + c.n + ': dados batem entre si', () => {
    igual(Missoes.valida(MIS), [], 'cap. ' + c.n + ': missões válidas');
    for (const m of MIS) ok(nomes.includes(m.quem), 'cap. ' + c.n + ' ' + m.id + ': "quem" (' + m.quem + ') não está nas fichas');
    for (const m of MIS) if (m.gatilho.tipo === 'falar') ok(nomes.includes(m.gatilho.com), 'cap. ' + c.n + ' ' + m.id + ': fala com alguém que não existe: ' + m.gatilho.com);
    for (const m of MIS) if (m.gatilho.tipo === 'item') ok(!!DADOS.itens[m.gatilho.item], 'cap. ' + c.n + ' ' + m.id + ': item "' + m.gatilho.item + '" não está na tabela de itens');
    for (const m of MIS) if (m.gatilho.tipo === 'chegar' && m.gatilho.lugar) ok(LUGARES_MAPA.includes(m.gatilho.lugar), 'cap. ' + c.n + ' ' + m.id + ': lugar "' + m.gatilho.lugar + '" não é polígono de mapa.js');
    for (const m of MIS) if (m.marcador) ok(m.marcador.length === 2 && m.marcador.every(v => typeof v === 'number' && Math.abs(v) < 500), 'cap. ' + c.n + ' ' + m.id + ': marcador fora do camping');
    igual(MIS.filter(m => m.inicio).map(m => m.id), [c.inicio], 'cap. ' + c.n + ': só a missão de abertura começa disponível');
    // o código do capítulo e os dados combinam: toda missão é dada em algum lugar, toda custom é concluída em algum lugar
    const gym = id => id.startsWith('c4_gym_');
    const daNoCodigo = id => new RegExp("Missoes\\.da\\([^)]*'" + id + "'").test(src) || new RegExp("for \\(const id of \\[[^\\]]*'" + id + "'[^\\]]*\\]\\) Missoes\\.da\\(id\\)").test(src)
      || (gym(id) && src.includes("Missoes.da(prox ? 'c4_gym_' + prox.id"));
    for (const id of ids) if (id !== c.inicio) ok(daNoCodigo(id), 'cap. ' + c.n + ': ' + c.arq + ' nunca dá a missão ' + id);
    for (const m of MIS) if (m.gatilho.tipo === 'custom') ok(gym(m.id) ? src.includes("Missoes.conclui('c4_gym_' + id)") : src.includes("Missoes.conclui('" + m.id + "')"), 'cap. ' + c.n + ': ' + c.arq + ' nunca conclui a missão custom ' + m.id);
    ok(!/missoes\.(splice|push)|completa\(/.test(src), 'cap. ' + c.n + ': ' + c.arq + ' ainda escreve direto na lista (missoes.push/splice ou completa)');
  });

  grupo('cap. ' + c.n + ': o robô joga do começo ao fim', () => {
    // vindo de outro capítulo: carregar limpa a lista do HUD
    Missoes.carrega(DADOS.cap1Missoes); Missoes.da('chefe'); Missoes.falou('Chefe Diego'); Missoes.da('bandeira'); igual(hudTxt(), ['chefe✔', 'bandeira'], 'cap. 1 no HUD antes de trocar');
    erros.length = 0;
    Missoes.carrega(MIS);
    igual(hud, [], 'cap. ' + c.n + ': HUD vazio depois de carregar (nada do capítulo anterior)');
    igual(Missoes.lista(), [], 'cap. ' + c.n + ': lista começa vazia');
    for (const id of ids) if (id !== c.inicio) { ok(!Missoes.da(id), 'cap. ' + c.n + ': ' + id + ' dada antes da hora'); break; }
    igual(erros.length, 1, 'cap. ' + c.n + ': motor acusou a missão dada antes da hora'); erros.length = 0;
    ok(Missoes.da(c.inicio), 'cap. ' + c.n + ': abertura dá ' + c.inicio);
    igual(lista(), [c.inicio], 'cap. ' + c.n + ': lista começa só com o que foi dado');
    const feitos = jogaAteOFim(c);
    ok(feitos >= obrigatorias(c).length, 'cap. ' + c.n + ': robô deu ' + feitos + ' passos');
    ok(obrigatorias(c).every(id => Missoes.concluida(id)), 'cap. ' + c.n + ': sobrou obrigatória: ' + obrigatorias(c).filter(id => !Missoes.concluida(id)).join(', '));
    igual(Missoes.ativas(), [], 'cap. ' + c.n + ': nada ficou pendurado');
    igual(erros, [], 'cap. ' + c.n + ': nenhum erro do motor no caminho feliz');
  });

  grupo('cap. ' + c.n + ': pontos de retomar', () => {
    for (const ponto in c.retomar) {
      const ate = c.retomar[ponto];
      Missoes.carrega(MIS); Missoes.da(c.inicio); eventos.length = 0; erros.length = 0;
      Missoes.avancaAte(ate);
      const i = ids.indexOf(ate);
      ok(ids.slice(0, i).filter(id => !Missoes.def(id).opcional).every(id => Missoes.concluida(id)), 'retomar "' + ponto + '": tudo antes de ' + ate + ' concluído');
      igual(Missoes.ativas(), [ate], 'retomar "' + ponto + '": só ' + ate + ' ativa');
      ok(ids.slice(i + 1).every(id => !Missoes.ativa(id) && !Missoes.concluida(id)), 'retomar "' + ponto + '": nada depois de ' + ate + ' dado');
      for (const m of MIS.slice(0, i)) if (m.gatilho.tipo === 'item') igual(Missoes.progresso(m.id), m.gatilho.meta, 'retomar "' + ponto + '": ' + m.id + ' com o item completo');
      igual(hudTxt(), lista(), 'retomar "' + ponto + '": HUD igual ao motor');
      igual(erros, [], 'retomar "' + ponto + '": sem erro do motor');
      // e dá pra jogar até o fim a partir dali
      jogaAteOFim(c); ok(obrigatorias(c).every(id => Missoes.concluida(id)), 'retomar "' + ponto + '": termina o capítulo');
    }
    Missoes.carrega(MIS); erros.length = 0; igual(Missoes.avancaAte('nao_existe'), [], 'avancaAte de missão que não existe não faz nada'); igual(erros.length, 1, 'e o motor acusa');
  });

  grupo('cap. ' + c.n + ': salvar e restaurar (exporta/importa)', () => {
    Missoes.carrega(MIS); Missoes.da(c.inicio);
    const meio = Math.floor(ids.length / 2); for (let i = 0; i < meio; i++) passo(c);
    Missoes.da(Missoes.todas().find(Missoes.disponivel));   // a próxima foi dada e está em andamento
    // mexe em texto, meta e marcador pra conferir que tudo volta
    const atv = Missoes.ativas()[0]; ok(!!atv, 'cap. ' + c.n + ': tem missão ativa no meio do capítulo');
    Missoes.texto(atv, 'Texto mudado no meio (2/5)'); Missoes.marca(atv, [12, 34]);
    const comItem = MIS.find(m => m.gatilho.tipo === 'item' && Missoes.concluida(m.id)); if (comItem) Missoes.meta(comItem.id, 2);
    const antes = { lista: Missoes.lista(), estado: ids.map(Missoes.estado), prog: ids.map(Missoes.progresso), txt: ids.map(id => Missoes.texto(id)), marc: Missoes.marcadores(), metas: ids.map(id => Missoes.meta(id)) };
    const snap = JSON.parse(JSON.stringify(Missoes.exporta()));   // passa por JSON, como no localStorage
    igual(snap.versao, 1, 'snapshot tem versão'); igual(snap.ids, ids, 'snapshot guarda os ids');
    ok(!('c_inexistente' in snap.estado) && Object.keys(snap.txts).length === 1, 'snapshot só guarda o texto que mudou: ' + JSON.stringify(snap.txts));
    // recarrega o capítulo (como abrir o jogo de novo) e importa
    Missoes.carrega(MIS); igual(Missoes.lista(), [], 'recarregado: lista vazia');
    eventos.length = 0; erros.length = 0;
    igual(Missoes.importa(snap), [], 'importa sem problemas');
    const depois = { lista: Missoes.lista(), estado: ids.map(Missoes.estado), prog: ids.map(Missoes.progresso), txt: ids.map(id => Missoes.texto(id)), marc: Missoes.marcadores(), metas: ids.map(id => Missoes.meta(id)) };
    igual(depois, antes, 'cap. ' + c.n + ': estado igual depois de importar');
    igual(eventos, ['recarrega'], 'importa não dispara ativa/concluida (sem aviso nem som), só recarrega');
    igual(hudTxt(), lista(), 'HUD refeito pelo recarrega');
    igual(erros, [], 'sem erro do motor ao importar');
    jogaAteOFim(c); ok(obrigatorias(c).every(id => Missoes.concluida(id)), 'cap. ' + c.n + ': depois de importar dá pra terminar');
    // snapshots ruins
    erros.length = 0;
    ok(Missoes.importa(null).length === 1 && erros.length === 1, 'importa(null) acusa');
    const velho = JSON.parse(JSON.stringify(snap)); velho.estado.missao_que_sumiu = 'ativa'; velho.estado[c.inicio] = 'voando';
    Missoes.carrega(MIS); const probs = Missoes.importa(velho);
    igual(probs.length, 2, 'importa acusa missão que não existe e estado inválido: ' + probs.join('; '));
    igual(Missoes.estado(c.inicio), 'disponivel', 'estado inválido fica como no começo');
  });
}

grupo('cap. 4: ginásios na ordem de Kanto, iguais aos de cap4.js', () => {
  const src = le('cap4.js'), bloco = src.slice(src.indexOf('const GINASIOS = ['), src.indexOf('const LIGA_QUIZ'));
  const gyms = [...bloco.matchAll(/\{ id: '(\w+)'/g)].map(m => 'c4_gym_' + m[1]);
  igual(DADOS.cap4Missoes.filter(m => m.id.startsWith('c4_gym_')).map(m => m.id), gyms, 'ginásios dos dados = GINASIOS de cap4.js, na mesma ordem');
  Missoes.carrega(DADOS.cap4Missoes); Missoes.avancaAte('c4_gym_pedra');
  igual(Missoes.estado('c4_gym_cascata'), 'escondida', 'Cascata escondida antes da Pedra');
  ok(!Missoes.da('c4_gym_trovao'), 'Trovão não pode ser dado antes da hora');
});
grupo('cap. 2 e 3: textos com contagem batem com o código', () => {
  const s2 = le('cap2.js'), et = s2.slice(s2.indexOf('const C2_ETAPAS = ['), s2.indexOf('const C2_ETAPAS_PARTE'));
  const n = (et.match(/\['(serrar|martelar|amarrar)'/g) || []).length;
  ok(DADOS.cap2Missoes.find(m => m.id === 'c2_gaviao').txt.includes('(0/' + n + ' etapas)'), 'texto do gavião com ' + n + ' etapas');
  const s3 = le('cap3.js'), et3 = s3.slice(s3.indexOf('ETAPAS: ['), s3.indexOf(']],', s3.indexOf('ETAPAS: [')));
  const n3 = (et3.match(/\['(serrar|martelar|amarrar)'/g) || []).length;
  ok(DADOS.cap3Missoes.find(m => m.id === 'c3_montar').txt.includes('(0/' + n3 + ' etapas)'), 'texto de montar a pipa com ' + n3 + ' etapas');
  Missoes.carrega(DADOS.cap3Missoes); Missoes.avancaAte('c3_bambu');
  ok(Missoes.texto('c3_bambu').endsWith('(0/3)'), 'bambu começa em 0/3: ' + Missoes.texto('c3_bambu'));
  ok(!Missoes.podeColetar('papel'), 'papel só depois do Pai dar a missão');
});

print('');
if (falhas) { print('✘ capítulos 2–4 QUEBRARAM: ' + falhas + ' problema(s) em ' + passos + ' conferências'); imports.system.exit(1); }
else { print('✔ capítulos 2–4 OK (' + passos + ' conferências)'); imports.system.exit(0); }
