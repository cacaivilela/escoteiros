// ---------- FICHAS DOS PERSONAGENS (só dados) ----------
// Um único modelo base (escoteiro() em game.js) + esta ficha por pessoa. O que importa é RECONHECIBILIDADE:
// cada pessoa tem 2 ou 3 traços que ninguém mais tem ("tracos" é a lista pra conferir no teste de reconhecimento,
// index.html?debug&fichas enfileira todo mundo pra perguntar "quem é esse?").
//
// Campos da ficha (todos opcionais; o modelo base preenche o resto):
//   escala        altura (1 = adulto médio; lobinhos ~0.85)
//   corPele       cor da pele (hex)
//   estiloCabelo  'curto' (padrão) | 'longo' | 'cacheado' | 'rabo' | 'trancas' | 'coque'     corCabelo hex
//   bone          true = uniforme de lobinho (camisa azul, lenço azul, boné do lobo)   boneEstilo 'ash'|'tiara'|'bandana'|'chapeu'|'nenhum'
//   touca / semChapeu / moletom                                                        corCamisa, corShort, corCalca, corLenco, corTenis, corMochila
//   oculos true + oculosEstilo 'redondo'|'quadrado' + corOculos                        gordo, semBochecha
//   acessórios: sensor (Libre no braço), bolsa, baquetas, biscoito, pulseira (hex), relogio, aura
// Comportamento (não é visual, mas faz parte de quem a pessoa é): doidinho (pula sem parar), brabinho (cara fechada), serio

var DADOS = globalThis.DADOS || {};
DADOS.personagens = {
  // ---- jogáveis ----
  lara:  { nome: 'Lara', jogavel: true, tracos: ['cabelo preto comprido e solto', 'bolsa branca a tiracolo', 'sensor Libre no braço'],
           ficha: { bone: true, escala: 0.84, estiloCabelo: 'longo', corCabelo: 0x141414, sensor: true, bolsa: true } },
  caio:  { nome: 'Caio', jogavel: true, tracos: ['cabelo preto cacheado e curto', 'baquetas na mão', 'mochila laranja'],
           ficha: { bone: true, escala: 0.9, estiloCabelo: 'cacheado', corCabelo: 0x141414, baquetas: true } },
  dudu:  { nome: 'Dudu', jogavel: true, npc: 'Lobinho Dudu', tracos: ['cabelo loiro', 'óculos redondos', 'não para de pular'],
           ficha: { bone: true, escala: 0.85, corCabelo: 0xe8c95a, oculos: true, doidinho: true } },
  maria: { nome: 'Maria', jogavel: true, npc: 'Lobinha Maria', tracos: ['cabelo castanho comprido', 'pulseira de miçanga verde', 'biscoito na mão'],
           ficha: { bone: true, escala: 0.84, estiloCabelo: 'longo', corCabelo: 0x5a3a1e, pulseira: 0x8be78b, biscoito: true } },

  // ---- alcateia ----
  joaquim: { nome: 'Lobinho Joaquim', tracos: ['o menor de todos', 'loiro de óculos igual ao irmão Dudu', 'cara fechada'],
             ficha: { bone: true, escala: 0.72, corCabelo: 0xe8c95a, oculos: true, doidinho: true, brabinho: true } },
  davi:    { nome: 'Lobinho Davi', tracos: ['o mais alto dos lobinhos', 'cabelo castanho', 'relógio no pulso'],
             ficha: { bone: true, escala: 0.92, corCabelo: 0x6b4a2b, relogio: true } },
  larissa: { nome: 'Lobinha Larissa', tracos: ['rabo de cavalo com laço amarelo', 'cabelo ruivo', 'tênis rosa'],
             ficha: { bone: true, escala: 0.85, estiloCabelo: 'rabo', corCabelo: 0xb5502a, corLaco: 0xffd54a, corTenis: 0xf28ab0 } },
  alisson: { nome: 'Lobinho Alisson', tracos: ['o mais baixinho', 'gordinho', 'amigo do Fantasma'],
             ficha: { bone: true, escala: 0.74, gordo: true } },

  // ---- adultos ----
  pai:   { nome: 'Pai', tracos: ['moletom cinza claro', 'cabelo raspado', 'celular na mão programando com o Claude'],
           ficha: { escala: 1.25, moletom: true, semChapeu: true, semBochecha: true, corCamisa: 0xc9c9c9, corCalca: 0x3a4250, corCabelo: 0x2a2a2a, serio: true, celular: true } },
  chefe: { nome: 'Chefe Diego', tracos: ['touca preta', 'camisa verde escoteira com lenço amarelo', 'o mais alto depois do Pai'],
           ficha: { escala: 1.15, corCamisa: 0x1f8a4c, corLenco: 0xf2c94c, touca: true } },
  akela: { nome: 'Akelá', tracos: ['chapéu escoteiro de aba larga', 'camisa verde com lenço amarelo', 'cabelo castanho'],
           ficha: { escala: 1.1, corCamisa: 0x1f8a4c, corLenco: 0xf2c94c } },
  pedro: { nome: 'Escoteiro Pedro', tracos: ['uniforme bege de escoteiro', 'chapéu', 'lenço verde'],
           ficha: { corCabelo: 0x2a2a2a } },
  lucas: { nome: 'Escoteiro Lucas', tracos: ['uniforme bege de escoteiro', 'óculos quadrados', 'lenço verde'],
           ficha: { oculos: true, oculosEstilo: 'quadrado', corCabelo: 0x6b4a2b } },
};

// os cães do camping, pelo mesmo princípio: um modelo (cachorro() em game.js) + ficha
DADOS.cachorros = {
  fantasma: { nome: 'Fantasma', tracos: ['galgo magrelo', 'preto em cima, branco embaixo'], ficha: { galgo: true, cima: 0x222222, baixo: 0xf4f4f4, escala: 1.05 } },
  caramelo: { nome: 'Caramelo', tracos: ['vira-lata caramelo'], ficha: { cima: 0xc98a3a, escala: 0.95 } },
  mel:      { nome: 'Mel', tracos: ['golden peluda', 'grande'], ficha: { cima: 0xe0b860, baixo: 0xf0dca0, escala: 1.1 } },
  pingo:    { nome: 'Pingo', tracos: ['preto e branco', 'gordinho de perna curta'], ficha: { cima: 0x222222, baixo: 0xf4f4f4, escala: 0.8 } },
  fumaca:   { nome: 'Fumaça', tracos: ['galgo cinza'], ficha: { galgo: true, cima: 0x8a8a8a, baixo: 0xdddddd, escala: 1.0 } },
  bolota:   { nome: 'Bolota', tracos: ['branquinho enroladinho', 'pequeno'], ficha: { cima: 0xffffff, baixo: 0xffffff, escala: 0.75 } },
  thor:     { nome: 'Thor', tracos: ['rottweiler', 'grande'], ficha: { cima: 0x3a2a1a, baixo: 0xb08050, escala: 1.15 } },
};
