#!/usr/bin/gjs
// ---------- TESTE DE FUMAÇA: o jogo carrega num "navegador de mentira" ----------
// Não tem WebGL nem DOM aqui, então tudo que é THREE/document vira um objeto-fantasma que aceita qualquer coisa.
// O que este teste pega: erro de referência (variável que não existe), função chamada antes de ser definida,
// dado faltando (DADOS.xxx undefined) — os erros que aparecem na hora de abrir a página. Não pega bug visual.

const GLib = imports.gi.GLib;
const raiz = GLib.path_get_dirname(GLib.path_get_dirname(GLib.canonicalize_filename(imports.system.programInvocationName, null)));
function le(arq) { const [ok, bytes] = GLib.file_get_contents(raiz + '/' + arq); return new TextDecoder().decode(bytes); }

// objeto-fantasma: qualquer propriedade, chamada ou "new" devolve outro fantasma; vira 0 em contas e "" em textos.
// O que o jogo atribui fica guardado (obj.x = 1 → obj.x é 1), pra dar pra simular estado (ex.: fogueira apagada).
function novoFantasma() {
  const alvo = function () {};
  return new Proxy(alvo, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === Symbol.toPrimitive) return hint => hint === 'number' ? 0 : '';
      if (k === 'then' || k === Symbol.iterator) return undefined;
      if (k === 'length') return 0;
      if (k === 'valueOf') return () => 0;
      if (k === 'toString') return () => '';
      return (t[k] = novoFantasma());
    },
    set(t, k, v) { t[k] = v; return true; }, has() { return true; }, apply() { return novoFantasma(); }, construct() { return novoFantasma(); },
    getOwnPropertyDescriptor(t, k) { return { configurable: true, enumerable: false, writable: true, value: t[k] }; },
  });
}
const fantasma = novoFantasma();
const g = globalThis;
g.window = g; g.THREE = fantasma; g.document = fantasma; g.navigator = fantasma; g.localStorage = fantasma;
g.innerWidth = 1280; g.innerHeight = 720; g.devicePixelRatio = 1;
g.location = { search: '', href: 'http://localhost/', hash: '' };
g.addEventListener = () => {}; g.removeEventListener = () => {}; g.requestAnimationFrame = () => 0; g.cancelAnimationFrame = () => {};
g.AudioContext = fantasma; g.webkitAudioContext = fantasma; g.Image = fantasma; g.Audio = fantasma; g.performance = { now: () => 0 };
if (typeof g.URLSearchParams === 'undefined') g.URLSearchParams = class { constructor() {} has() { return false; } get() { return null; } };
g.alert = () => {}; g.prompt = () => null; g.confirm = () => false; g.fetch = () => Promise.reject(new Error('sem rede'));

const ordem = ['som.js', 'mapa.js', 'motor/missoes.js', 'motor/dialogos.js', 'dados/personagens.js', 'dados/itens.js', 'dados/cap1_lugares.js',
  'dados/cap1_missoes.js', 'dados/cap1_dialogos.js', 'game.js', 'cap2.js', 'cap3.js', 'cap4.js', 'mods.js'];   // a ordem do index.html
// no navegador todos os <script> dividem o mesmo escopo global (const/let inclusive). Um eval por arquivo não faz isso,
// então os const/let de topo (sem indentação) viram var — só no teste — pra continuarem visíveis pro arquivo seguinte.
let falhas = 0;
for (const arq of ordem) {
  const src = le(arq).replace(/^(const|let) /gm, 'var ').replace(/^'use strict';/m, '');   // em modo estrito o eval esconderia os var
  try { (0, eval)(src); print('  ✔ ' + arq); }
  catch (e) { falhas++; print('  ✘ ' + arq + ': ' + e.constructor.name + ': ' + e.message + (e.lineNumber ? ' (linha ' + e.lineNumber + ')' : '')); }
}
if (falhas) { print('✘ fumaça: ' + falhas + ' arquivo(s) com erro ao carregar'); imports.system.exit(1); }
print('✔ fumaça OK: todos os arquivos carregam');

// ---------- fase 2: o robô joga o capítulo 1 DENTRO do game.js ----------
// Usa os pontos de interação de verdade ("Falar com X", "Pegar lenha"...) e as funções do jogo. Os minigames de
// bandeira e fogo são pulados no ponto em que o jogo chama Missoes.minigame (eles precisam de tempo real e tecla).
let passos = 0;
function ok(c, msg) { passos++; if (!c) { falhas++; print('  ✘ ' + msg); } }
function ponto(nome) { const i = interativos.find(i => i.nome === nome && i.r > 0); ok(i, 'não achei o ponto "' + nome + '"'); return i; }
function usa(nome) { const i = ponto(nome); if (!i) return; ok(!i.cond || i.cond(), '"' + nome + '" está indisponível'); i.acao(); }
function podeUsar(nome) { const i = interativos.find(i => i.nome === nome && i.r > 0); return !!i && (!i.cond || i.cond()); }
const avisos = []; const _aviso = aviso; aviso = (t, ms) => { avisos.push(String(t)); };
try {
  print('• robô: chegada e Chefe');
  ok(Missoes.lista().length === 0, 'lista começa vazia');
  ok(!podeUsar('Fazer a bandeira'), 'bandeira indisponível antes do Chefe');
  ok(!podeUsar('Abrir o baú'), 'baú indisponível sem a missão');
  ok(interativos.filter(i => i.nome === 'Pegar lenha').length === 0, 'nenhuma lenha no chão antes da missão');
  Missoes.da('chefe');   // o que a cutscene do Pai faz ao chegar
  usa('Falar com Chefe Diego');
  ok(Missoes.concluida('chefe') && Missoes.ativa('bandeira'), 'Chefe conclui a apresentação e dá a bandeira');
  ok(avisos.some(a => /Chefe Diego: "Bem-vindo ao Camping/.test(a)), 'fala do Chefe apareceu: ' + avisos.slice(-3).join(' | '));
  print('• robô: bandeira e Akelá');
  ok(podeUsar('Fazer a bandeira'), 'bandeira disponível');
  usa('Fazer a bandeira'); ok(mini && mini.tipo === 'bandeira', 'minigame da bandeira abriu'); fechaMini();
  Missoes.minigame('bandeira');
  usa('Falar com Akelá');
  ok(Missoes.ativa('lenha') && Missoes.ativa('fogueira'), 'Akelá dá lenha e fogueira');
  const lenhasNoChao = interativos.filter(i => i.nome === 'Pegar lenha' && i.r > 0);
  ok(lenhasNoChao.length === 20, 'lenha espalhada em quantidade generosa (20): ' + lenhasNoChao.length);
  ok(podeUsar('Pegar lenha'), 'agora dá pra pegar lenha');
  sede.chamas.visible = false;   // no three.js de verdade a fogueira começa apagada; no fantasma tudo é "verdadeiro" até ser atribuído
  usa('Acender a fogueira'); ok(!mini, 'sem lenha o minigame do fogo não abre'); ok(avisos.some(a => /falta lenha/i.test(a)), 'avisou que falta lenha');
  print('• robô: Larissa, baú e pederneira');
  usa('Falar com Lobinha Larissa'); ok(Missoes.ativa('pederneira'), 'Larissa dá a pederneira');
  ok(podeUsar('Abrir o baú'), 'baú funciona com a missão'); usa('Abrir o baú');
  ok(Missoes.concluida('pederneira') && estado.temPederneira, 'pederneira pega'); ok(Missoes.meta('lenha') === 3, 'meta de lenha caiu pra 3');
  for (const i of lenhasNoChao.slice(0, 3)) i.acao();
  ok(Missoes.concluida('lenha'), '3 lenhas com pederneira concluem: ' + Missoes.texto('lenha'));
  print('• robô: fogueira e dormir');
  ok(podeUsar('Acender a fogueira'), 'fogueira pronta'); usa('Acender a fogueira'); ok(mini && mini.tipo === 'fogo', 'minigame do fogo abriu'); fechaMini();
  Missoes.minigame('fogo'); ok(Missoes.concluida('fogueira'), 'fogueira concluída');
  ok(podeUsar('Dormir na barraca'), 'agora dá pra dormir na barraca');
  print('• robô: opcionais');
  usa('Falar com Lobinho Alisson'); ok(Missoes.ativa('phantom') && alissonFalou, 'Alisson dá o Fantasma e mostra os cachorros');
  ok(podeUsar('Ver o cachorro Caramelo'), 'dá pra olhar os outros cachorros'); usa('Ver o cachorro Caramelo'); ok(avisos.some(a => /Caramelo: "Um vira-lata/.test(a)), 'descrição do Caramelo');
  usa('Falar com Lobinha Maria'); ok(Missoes.ativa('praia'), 'Maria dá a praia');
  usa('Falar com Lobinho Davi'); ok(Missoes.ativa('molhe'), 'Davi dá o molhe');
  ok(Missoes.chegou(62, -42).includes('praia') && Missoes.chegou(244, -130).includes('molhe'), 'chegar na praia e no molhe conclui');
  usa('Falar com Lobinho Joaquim'); ok(avisos.some(a => /Lobinho Joaquim: "/.test(a)), 'Joaquim fala');
  ok(Missoes.marcadores().every(m => Missoes.ativa(m.id)), 'marcadores só de missões ativas');
} catch (e) { falhas++; print('  ✘ ERRO no robô: ' + e.message + ' (' + (e.fileName || '').split('/').pop() + ':' + e.lineNumber + ')'); }
aviso = _aviso;
print(falhas ? '✘ capítulo 1 dentro do jogo QUEBROU: ' + falhas + ' problema(s)' : '✔ capítulo 1 dentro do jogo OK (' + passos + ' conferências)');
imports.system.exit(falhas ? 1 : 0);
