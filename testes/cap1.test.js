#!/usr/bin/gjs
// ---------- TESTE DE INTEGRAÇÃO DO CAPÍTULO 1 ----------
// Um "robô" joga o capítulo 1 usando o motor de missões e o roteiro de diálogos, do jeito que game.js usa,
// e confere as regras. Roda sem navegador (gjs, o JavaScript do GNOME):
//     ./testes/roda.sh            (ou:  gjs testes/cap1.test.js)
// Responde "capítulo 1 OK" ou lista o que quebrou. QUEBRA=1 sabota os dados de propósito pra mostrar que o teste acusa.

const GLib = imports.gi.GLib;
const raiz = GLib.path_get_dirname(GLib.path_get_dirname(GLib.canonicalize_filename(imports.system.programInvocationName, null)));
function le(arq) { const [ok, bytes] = GLib.file_get_contents(raiz + '/' + arq); if (!ok) throw new Error('não li ' + arq); return new TextDecoder().decode(bytes); }
function carrega(arq) { (0, eval)(le(arq)); }   // eval "global": os var dos arquivos viram globais, como no navegador

let falhas = 0, passos = 0;
function ok(cond, msg) { passos++; if (!cond) { falhas++; print('  ✘ ' + msg); } }
function igual(a, b, msg) { ok(JSON.stringify(a) === JSON.stringify(b), msg + ' — esperado ' + JSON.stringify(b) + ', veio ' + JSON.stringify(a)); }
function grupo(nome, fn) { print('• ' + nome); try { fn(); } catch (e) { falhas++; print('  ✘ ERRO: ' + e.message + (e.stack ? '\n    ' + e.stack.split('\n')[0] : '')); } }

// ---- 1. todo arquivo do jogo pelo menos compila (um erro de vírgula quebra o jogo inteiro) ----
grupo('sintaxe de todos os arquivos', () => {
  for (const arq of ['som.js', 'mapa.js', 'game.js', 'cap2.js', 'cap3.js', 'cap4.js', 'mods.js', 'motor/missoes.js', 'motor/dialogos.js',
    'dados/personagens.js', 'dados/itens.js', 'dados/cap1_lugares.js', 'dados/cap1_missoes.js', 'dados/cap1_dialogos.js',
    'dados/cap2_missoes.js', 'dados/cap3_missoes.js', 'dados/cap4_missoes.js']) {
    try { new Function(le(arq)); ok(true); } catch (e) { ok(false, arq + ': ' + e.message + ' (linha ' + e.lineNumber + ')'); }
  }
});

// ---- 2. carrega motor e dados (sem THREE, sem DOM) ----
carrega('motor/missoes.js'); carrega('motor/dialogos.js');
carrega('dados/personagens.js'); carrega('dados/itens.js'); carrega('dados/cap1_lugares.js'); carrega('dados/cap1_missoes.js'); carrega('dados/cap1_dialogos.js');
const MIS = DADOS.cap1Missoes, DLG = DADOS.cap1Dialogos, FICHAS = DADOS.personagens;
if (GLib.getenv('QUEBRA')) {   // sabotagem de propósito: o Chefe não abre mais a bandeira
  const b = MIS.find(m => m.id === 'chefe'); b.abre = [];
  print('(QUEBRA=1: tirei o "abre" da missão chefe — o teste tem que acusar)');
}
const ACOES = ['mostraCachorros', 'joaquimVoltaBravo'];   // as que game.js implementa em ACOES_DIALOGO
const nomes = Object.values(FICHAS).map(p => p.npc || p.nome).concat(Object.values(FICHAS).map(p => p.nome), Object.values(DADOS.cachorros).map(c => c.nome));

grupo('dados batem entre si', () => {
  igual(Missoes.valida(MIS), [], 'missões válidas');
  igual(Dialogos.valida(DLG, MIS.map(m => m.id), ACOES), [], 'diálogos válidos');
  for (const m of MIS) ok(nomes.includes(m.quem), 'missão ' + m.id + ': "quem" (' + m.quem + ') não está nas fichas');
  for (const m of MIS) if (m.gatilho.tipo === 'falar') ok(nomes.includes(m.gatilho.com), 'missão ' + m.id + ': fala com alguém que não existe: ' + m.gatilho.com);
  for (const m of MIS) if (m.gatilho.tipo === 'item') ok(!!DADOS.itens[m.gatilho.item], 'missão ' + m.id + ': item "' + m.gatilho.item + '" não está na tabela de itens');
  for (const m of MIS) if (m.gatilho.tipo === 'chegar' && m.gatilho.lugar) ok(['praia', 'camping', 'iate', 'raso', 'campo'].includes(m.gatilho.lugar), 'missão ' + m.id + ': lugar "' + m.gatilho.lugar + '" não é polígono de mapa.js');
  for (const n in DLG) ok(nomes.includes(n), 'roteiro fala de "' + n + '", que não está nas fichas');
  for (const n of DADOS.cap1Lugares.npcs) ok(!!FICHAS[n.id], 'lugares: npc "' + n.id + '" sem ficha');
  for (const c of DADOS.cap1Lugares.cachorros) ok(!!DADOS.cachorros[c.id], 'lugares: cachorro "' + c.id + '" sem ficha');
  // toda missão que alguém dá numa fala precisa ter esse alguém como "quem"
  for (const n in DLG) for (const e of DLG[n]) for (const id of [].concat(e.da || [])) { const m = MIS.find(x => x.id === id); ok(m && m.quem === n, n + ' dá a missão ' + id + ', mas "quem" dela é ' + (m && m.quem)); }
  // toda missão que precisa ser dada por conversa tem alguma fala que a dá (as do Pai vêm da cutscene)
  for (const m of MIS) if (m.quem !== 'Pai') ok(Object.values(DLG).some(l => l.some(e => [].concat(e.da || []).includes(m.id))), 'ninguém dá a missão ' + m.id + ' em fala nenhuma');
  for (const id in FICHAS) ok((FICHAS[id].tracos || []).length >= 2, id + ': ficha com menos de 2 traços reconhecíveis');
});

// ---- 3. o robô joga o capítulo 1 ----
// simula o que game.js faz: fala com alguém = Dialogos.fala + efeitos; minigame = Missoes.minigame; andar = Missoes.chegou
const vars = { fantasma: 0 };
let personagem = 'lara';
function ctx() { return { personagem, estadoMissao: id => Missoes.estado(id), vars, textos: { nome: 'Lara', gemeo: 'Caio', gemeoArtigo: 'o Caio', irmao: 'o Caio, seu irmão gêmeo,', filho: 'filha' } }; }
const acoesRodadas = [];
function fala(nome) {
  const r = Dialogos.fala(DLG[nome], ctx()); ok(!!r, nome + ' não tem fala pra essa situação'); if (!r) return null;
  if (r.acao) acoesRodadas.push(r.acao);
  Missoes.falou(nome); for (const id of r.conclui) Missoes.conclui(id); for (const id of r.da) Missoes.da(id);
  return r;
}
const erros = [];
Missoes.ao('erro', m => erros.push(m));
Missoes.dentro = (lugar, x, y) => lugar === 'praia' && Math.hypot(x - 60, y + 40) < 20;   // "praia" fake em volta de (60,-40)
const lista = () => Missoes.lista().map(m => m.id + (m.ok ? '✔' : ''));

grupo('começo: lista vazia, nada coletável, nada dado antes da hora', () => {
  Missoes.carrega(MIS);
  igual(Missoes.lista(), [], 'lista de tarefas começa vazia');
  ok(!Missoes.podeColetar('lenha'), 'lenha não pode ser pega antes da missão');
  ok(!Missoes.podeColetar('pederneira'), 'baú não faz nada antes da missão');
  igual(Missoes.coletou('lenha', 1), [], 'pegar lenha sem missão não conta');
  ok(!Missoes.da('bandeira'), 'bandeira não pode ser dada antes do Chefe');
  igual(Missoes.estado('bandeira'), 'escondida', 'bandeira continua escondida');
  ok(erros.length === 1, 'o motor acusou a tentativa (' + erros.join('; ') + ')');
  erros.length = 0;
});

grupo('Pai → Chefe Diego → bandeira', () => {
  ok(Missoes.da('chefe'), 'o Pai dá a missão do Chefe na chegada');
  igual(lista(), ['chefe'], 'só a missão do Chefe aparece');
  igual(Missoes.marcadores().map(m => m.id), ['chefe'], 'marcador só da missão ativa');
  igual(Missoes.chegou(190, 211), [], 'chegar perto do Chefe NÃO conclui "falar com o Chefe"');
  igual(Missoes.estado('chefe'), 'ativa', 'continua ativa até falar');
  fala('Akelá'); igual(Missoes.estado('bandeira'), 'escondida', 'Akelá antes do Chefe não dá a bandeira');
  const r = fala('Chefe Diego');
  ok(/Bem-vindo ao Camping/.test(r.texto) && /o Caio, seu irmão gêmeo,/.test(r.texto), 'fala do Chefe preenchida: ' + r.texto);
  igual(Missoes.estado('chefe'), 'concluida', 'falar com o Chefe conclui');
  igual(Missoes.estado('bandeira'), 'ativa', 'e o Chefe dá a bandeira');
  igual(lista(), ['chefe✔', 'bandeira'], 'lista mostra o que foi dado');
  ok(!Missoes.podeColetar('lenha') && Missoes.estado('lenha') === 'escondida', 'lenha ainda escondida');
  igual(Missoes.minigame('fogo'), [], 'minigame do fogo antes da hora não faz nada');
  igual(Missoes.minigame('bandeira'), ['bandeira'], 'minigame da bandeira conclui a missão');
  for (const id of ['lenha', 'fogueira', 'praia', 'molhe']) igual(Missoes.estado(id), 'disponivel', id + ' fica disponível depois da bandeira');
  igual(lista(), ['chefe✔', 'bandeira✔'], 'disponíveis NÃO aparecem na lista');
});

grupo('Akelá → lenha e fogueira', () => {
  const r = fala('Akelá'); ok(/lenha/i.test(r.texto), 'Akelá pede lenha');
  igual(Missoes.estado('lenha'), 'ativa', 'lenha ativa'); igual(Missoes.estado('fogueira'), 'ativa', 'fogueira ativa');
  ok(Missoes.podeColetar('lenha'), 'agora dá pra pegar lenha');
  Missoes.coletou('lenha', 1); Missoes.coletou('lenha', 1);
  ok(Missoes.texto('lenha').includes('(2/6)'), 'texto mostra o progresso: ' + Missoes.texto('lenha'));
  // (a fogueira só acende com a lenha completa: quem barra é o interativo "Acender a fogueira" em game.js)
});
grupo('lenha até a meta e a pederneira encurtando', () => {
  for (let i = 0; i < 4; i++) Missoes.coletou('lenha', 1);
  igual(Missoes.estado('lenha'), 'concluida', '6 lenhas concluem');
  igual(Missoes.minigame('fogo'), ['fogueira'], 'minigame do fogo conclui a fogueira');
  // cenário alternativo: com a pederneira bastam 3
  Missoes.carrega(MIS); Missoes.da('chefe'); fala('Chefe Diego'); Missoes.minigame('bandeira'); fala('Akelá');
  const r = fala('Lobinha Larissa'); ok(/pederneira/i.test(r.texto), 'Larissa dá a pederneira');
  igual(Missoes.estado('pederneira'), 'ativa', 'pederneira ativa'); ok(Missoes.podeColetar('pederneira'), 'baú agora funciona');
  Missoes.coletou('lenha', 3); igual(Missoes.estado('lenha'), 'ativa', '3 lenhas sem pederneira: continua');
  Missoes.coletou('pederneira', 1); igual(Missoes.estado('pederneira'), 'concluida', 'pegou a pederneira');
  Missoes.meta('lenha', 3); igual(Missoes.estado('lenha'), 'concluida', 'com a pederneira, 3 lenhas bastam');
  ok(Missoes.texto('lenha').includes('(3/3)'), 'texto com a meta nova: ' + Missoes.texto('lenha'));
  igual(Missoes.minigame('fogo'), ['fogueira'], 'e a fogueira acende');
});

grupo('missões opcionais: praia, molhe, Fantasma', () => {
  personagem = 'lara';
  const rm = fala('Lobinha Maria'); ok(/praia/i.test(rm.texto), 'Maria chama pra praia'); igual(Missoes.estado('praia'), 'ativa', 'praia ativa');
  igual(Missoes.chegou(0, 0), [], 'longe da praia: nada');
  igual(Missoes.chegou(62, -42), ['praia'], 'entrar na praia conclui');
  fala('Lobinho Davi'); igual(Missoes.estado('molhe'), 'ativa', 'Davi dá o molhe');
  igual(Missoes.chegou(244, -130), ['molhe'], 'chegar no molhe conclui');
  const ra = fala('Lobinho Alisson'); ok(/Fantasma/.test(ra.texto), 'Alisson fala do Fantasma');
  igual(Missoes.estado('phantom'), 'ativa', 'Alisson dá o Fantasma'); ok(acoesRodadas.includes('mostraCachorros'), 'e os cachorros aparecem');
  vars.fantasma = 1; ok(/chuveiro/.test(fala('Lobinho Alisson').texto), 'Alisson sabe que o Fantasma foi pro chuveiro');
  vars.fantasma = 2; ok(/portaria/.test(fala('Lobinho Alisson').texto), 'Alisson sabe que o Fantasma foi pra portaria');
  igual(Missoes.chegou(-34, 2), [], 'chegar na árvore não conclui o Fantasma (é custom)');
  ok(Missoes.conclui('phantom'), 'levar o Fantasma conclui'); vars.fantasma = 4;
  ok(/biscoito/.test(fala('Lobinho Alisson').texto), 'Alisson feliz com o Fantasma');
  const obrig = MIS.filter(m => !m.opcional).map(m => m.id);
  ok(obrig.every(id => Missoes.concluida(id)), 'todas as obrigatórias concluídas: ' + obrig.join(', '));
  igual(Missoes.ativas(), [], 'nada ficou pendurado');
  ok(erros.length === 0, 'nenhum erro do motor no caminho feliz: ' + erros.join('; '));
});

grupo('falas dependem de quem joga', () => {
  personagem = 'caio';
  const c = { personagem: 'caio', estadoMissao: () => 'escondida', vars, textos: { nome: 'Caio', gemeo: 'Lara', gemeoArtigo: 'a Lara' } };
  const dudu = Dialogos.fala(DLG['Lobinho Dudu'], c, () => 0); ok(/CAIOOO/.test(dudu.texto), 'Dudu reconhece o Caio: ' + dudu.texto);
  const maria = Dialogos.fala(DLG['Lobinha Maria'], c, () => 0); ok(/Cadê a Lara/.test(maria.texto), 'Maria pergunta pelo Caio: ' + maria.texto);
  c.personagem = 'lara'; const d2 = Dialogos.fala(DLG['Lobinho Dudu'], c, () => 0); ok(/Eu sou o Dudu/.test(d2.texto), 'Dudu se apresenta pra Lara');
  const s67 = Dialogos.fala(DLG['Lobinho Dudu'], c, () => 0.99); ok(/tu e a Lara não gostam/.test(s67.texto), 'curinga {gemeoArtigo} preenchido: ' + s67.texto);
});

print('');
if (falhas) { print('✘ capítulo 1 QUEBROU: ' + falhas + ' problema(s) em ' + passos + ' conferências'); imports.system.exit(1); }
else { print('✔ capítulo 1 OK (' + passos + ' conferências)'); imports.system.exit(0); }
