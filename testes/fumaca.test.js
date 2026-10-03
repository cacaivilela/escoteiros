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
g.window = g; g.THREE = fantasma; g.document = fantasma; g.navigator = fantasma;
const guardado = {}; g.localStorage = { getItem: k => k in guardado ? guardado[k] : null, setItem: (k, v) => { guardado[k] = String(v); }, removeItem: k => { delete guardado[k]; } };   // de verdade: o save precisa voltar igual
g.innerWidth = 1280; g.innerHeight = 720; g.devicePixelRatio = 1;
g.location = { search: '', href: 'http://localhost/', hash: '' };
g.addEventListener = () => {}; g.removeEventListener = () => {}; g.requestAnimationFrame = () => 0; g.cancelAnimationFrame = () => {};
g.AudioContext = fantasma; g.webkitAudioContext = fantasma; g.Image = fantasma; g.Audio = fantasma; g.performance = { now: () => 0 };
if (typeof g.URLSearchParams === 'undefined') g.URLSearchParams = class { constructor() {} has() { return false; } get() { return null; } };
g.alert = () => {}; g.prompt = () => null; g.confirm = () => false; g.fetch = () => Promise.reject(new Error('sem rede'));

const ordem = ['som.js', 'mapa.js', 'motor/missoes.js', 'motor/dialogos.js', 'dados/personagens.js', 'dados/itens.js', 'dados/cap1_lugares.js',
  'dados/cap1_missoes.js', 'dados/cap1_dialogos.js', 'dados/cap2_missoes.js', 'dados/cap3_missoes.js', 'dados/cap4_missoes.js', 'dados/distintivos.js', 'game.js', 'cap2.js', 'cap3.js', 'cap4.js', 'mods.js', 'extras.js', 'toque.js', 'grama.js', 'online.js'];   // a ordem do index.html
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
  print('• robô: salvar e continuar');
  estado.pos.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };   // o Vector3 de mentira não guarda nada
  introFeita = true; cena = null; estado.pos.set(60, 0, 40); estado.yaw = 1.2; salvaCap1();
  const sv = JSON.parse(localStorage.getItem('escoteiros.save') || 'null'), antes = JSON.stringify(Missoes.exporta());
  ok(sv && sv.cap === 1 && sv.missoes && sv.pos[0] === 60 && sv.pos[1] === -40, 'salvou o cap. 1 com missões e posição: ' + JSON.stringify(sv && sv.pos));
  // "fecha o navegador": tudo volta ao começo; aí o botão Continuar entra pelo save
  Missoes.carrega(DADOS.cap1Missoes); introFeita = false; estado.temPederneira = false; sede.chamas.visible = false; estado.pos.set(0, 0, 0);
  continuarCap1 = sv; iniciaIntro();
  ok(JSON.stringify(Missoes.exporta()) === antes, 'motor voltou igual ao salvo');
  ok(estado.temPederneira && sede.chamas.visible === true && estado.pos.x === 60 && estado.pos.z === 40 && introFeita, 'mundo voltou: pederneira, fogueira acesa, posição');
  ok(JSON.stringify(missoes.map(m => m.id + (m.ok ? '✔' : ''))) === JSON.stringify(Missoes.lista().map(m => m.id + (m.ok ? '✔' : ''))), 'HUD igual ao motor depois de continuar');
  salvaProgresso({ cap: 3, ponto: 'noite' }); ok(JSON.parse(localStorage.getItem('escoteiros.save')).ponto === 'noite', 'ponto de retomar dos caps. 2-3 salvo');
  ganhaDistintivo('pesca'); ok(JSON.parse(localStorage.getItem('escoteiros.distintivos') || '{}').pesca > 0, 'distintivo ganho fica salvo');
} catch (e) { falhas++; print('  ✘ ERRO no robô: ' + e.message + ' (' + (e.fileName || '').split('/').pop() + ':' + e.lineNumber + ')'); }
print(falhas ? '✘ capítulo 1 dentro do jogo QUEBROU: ' + falhas + ' problema(s)' : '✔ capítulo 1 dentro do jogo OK (' + passos + ' conferências)');

// ---------- fase 3: começa os capítulos 2, 3 e 4 (e um do DLC) dentro do jogo e joga um trecho de cada ----------
// Pega o bug #10 (tela preta ao começar os caps. 2 a 5: erro logo depois de escurecer) e confere que a lista do HUD
// segue o motor: troca de capítulo limpa a lista, retomar marca o que já foi feito. As cenas com tempo (setTimeout,
// animação) não rodam aqui: o robô faz na mão o que elas fariam (ex.: o ônibus chegar).
const falhas1 = falhas; passos = 0;
const errosMotor = []; Missoes.ao('erro', m => errosMotor.push(m));
// (aqui as ações são achadas pelo nome sem olhar o raio: no THREE de mentira mesh.userData.noite é um fantasma "verdadeiro",
// então preparaSabado zera o raio de todo NPC como se fosse figurante da noite — no navegador isso não acontece)
function acao(nome) { const i = interativos.find(i => i.nome === nome); ok(i, 'não achei a ação "' + nome + '"'); if (!i) return; ok(!i.cond || i.cond(), '"' + nome + '" está indisponível'); i.acao(); }
const ids = () => Missoes.lista().map(m => m.id + (m.ok ? '✔' : ''));
const hudOk = cap => ok(JSON.stringify(missoes.map(m => m.id + (m.ok ? '✔' : ''))) === JSON.stringify(ids()), cap + ': HUD diferente do motor: ' + missoes.map(m => m.id).join(',') + ' × ' + ids().join(','));
const falas = () => { let n = 0; while (cena && cena.falas && n++ < 20) c2ProximaFala(); };
try {
  print('• robô: capítulo 2');
  capituloEscolhido = 2; iniciaCapitulo();
  ok(CAP2.ativo, 'cap. 2 começou'); ok(ids().join() === 'c2_akela', 'cap. 2 começa só com a Akelá: ' + ids().join()); hudOk('cap. 2');
  cena = null; CAP2.fase = 'akela';
  acao('Falar com Akelá'); ok(Missoes.concluida('c2_akela') && Missoes.ativa('c2_rastro'), 'Akelá manda seguir o rastro');
  for (let i = 0; i < 4; i++) acao('Olhar o rastro');
  ok(Missoes.concluida('c2_rastro') && Missoes.ativa('c2_cobra'), '4 rastros levam à cobra: ' + Missoes.texto('c2_rastro'));
  ok(Missoes.chegou(-80, 0).includes('c2_cobra'), 'chegar na pedra conclui');
  Missoes.da('c2_diego');   // o que o setTimeout do susto da cobra faz
  acao('Falar com Chefe Diego'); ok(Missoes.concluida('c2_diego') && Missoes.ativa('c2_gaviao'), 'Chefe Diego dá o gavião');
  for (let i = 0; i < C2_ETAPAS.length; i++) cap2Etapa();
  ok(Missoes.concluida('c2_gaviao') && Missoes.ativa('c2_pilotar'), 'gavião pronto: ' + Missoes.texto('c2_gaviao'));
  hudOk('cap. 2');
  CAP2.ativo = false; CAP2.continuar = 'bandeira'; iniciaCap2();
  ok(ids().join() === 'c2_akela✔,c2_rastro✔,c2_cobra✔,c2_diego✔,c2_gaviao✔,c2_pilotar✔,c2_pegar✔,bandeira✔,c2_barco', 'retomar "bandeira": ' + ids().join()); hudOk('cap. 2 retomado');
  ok(/23\/23/.test(Missoes.texto('c2_gaviao')), 'retomar: gavião 23/23');
  CAP2.continuar = null;

  print('• robô: capítulo 3');
  capituloEscolhido = 3; iniciaCapitulo();
  ok(CAP3.ativo && !CAP2.ativo, 'cap. 3 começou'); ok(ids().join() === 'c3_akela', 'cap. 3 começa só com a Akelá (nada do cap. 2): ' + ids().join()); hudOk('cap. 3');
  cena = null; CAP3.fase = 'akela';
  acao('Falar com Akelá'); ok(Missoes.ativa('c3_pai'), 'Akelá manda falar com o Pai');
  ok(!podeUsar('Pegar papel de seda na cantina'), 'papel indisponível antes do Pai');
  acao('Falar com Pai'); falas(); ok(Missoes.concluida('c3_pai') && ['c3_bambu', 'c3_papel', 'c3_linha'].every(Missoes.ativa), 'Pai pede os 3 materiais');
  for (let i = 0; i < 3; i++) acao('Cortar vareta de bambu');
  acao('Pegar papel de seda na cantina'); acao('Pegar o carretel de linha');
  ok(['c3_bambu', 'c3_papel', 'c3_linha'].every(Missoes.concluida), 'materiais coletados: ' + Missoes.texto('c3_bambu'));
  acao('Falar com Pai'); ok(Missoes.ativa('c3_montar'), 'Pai monta a pipa');
  for (let i = 0; i < 3; i++) cap3Etapa();
  ok(Missoes.concluida('c3_montar') && Missoes.ativa('c3_empinar'), 'pipa montada: ' + Missoes.texto('c3_montar'));
  hudOk('cap. 3');
  CAP3.ativo = false; CAP3.continuar = 'noite'; iniciaCap3();
  ok(Missoes.ativas().join() === 'c3_grito' && Missoes.lista().filter(m => m.ok).length === 10, 'retomar "noite": ' + ids().join()); hudOk('cap. 3 retomado');
  CAP3.continuar = null;

  print('• robô: capítulo 4');
  capituloEscolhido = 4; CAP4.continuar = null; iniciaCapitulo();
  ok(CAP4.ativo && !CAP3.ativo, 'cap. 4 começou'); ok(ids().join() === 'c4_akela', 'cap. 4 começa só com a Akelá: ' + ids().join()); hudOk('cap. 4');
  cena = null; CAP4.fase = 'akela';
  acao('Falar com Akelá'); ok(Missoes.ativa('c4_onibus'), 'Akelá manda receber o ônibus');
  cena = { cap2: true, cap4: true, tipo: 'onibus', t: 5, idx: CARRO_CAMINHO.length - 1, indo: false, chegou: true }; atualizaOnibus(0.1);   // o ônibus chegou
  ok(Missoes.concluida('c4_onibus') && Missoes.ativa('c4_abertura'), 'ônibus recebido');
  acao('Falar com Chefe Diego'); falas(); ok(Missoes.concluida('c4_abertura') && Missoes.ativa('c4_gym_pedra'), 'Chefe abre o Distrital');
  abreQuiz('pedra'); cena.sel = GINASIOS[0].quiz[2]; respondeQuiz();
  ok(Missoes.concluida('c4_gym_pedra') && Missoes.ativa('c4_gym_cascata') && CAP4.insignias.pedra, 'insígnia da Pedra → Cascata');
  hudOk('cap. 4');
  CAP4.ativo = false; CAP4.continuar = 'pedra'; iniciaCap4();
  ok(ids().join() === 'c4_akela✔,c4_onibus✔,c4_abertura✔,c4_gym_pedra', 'retomar "pedra": ' + ids().join()); hudOk('cap. 4 retomado');

  print('• robô: capítulo 5 (DLC)');
  dlcInicia(5);
  ok(Missoes.lista().length === 0, 'DLC esvazia o motor'); ok(missoes.length > 0 && missoes.every(m => /^dlc/.test(m.id)), 'HUD só com as tarefas do DLC: ' + missoes.map(m => m.id).join());
  ok(errosMotor.length === 0, 'nenhum erro do motor nos capítulos: ' + errosMotor.join('; '));
} catch (e) { falhas++; print('  ✘ ERRO no robô dos capítulos: ' + e.message + ' (' + (e.fileName || '').split('/').pop() + ':' + e.lineNumber + ')'); }
aviso = _aviso;
print(falhas > falhas1 ? '✘ capítulos 2–5 dentro do jogo QUEBRARAM: ' + (falhas - falhas1) + ' problema(s)' : '✔ capítulos 2–5 dentro do jogo OK (' + passos + ' conferências)');
imports.system.exit(falhas ? 1 : 0);
