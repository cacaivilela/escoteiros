// ---------- CAPÍTULO 1 — DIÁLOGOS (roteiro; só dados) ----------
// Pra cada personagem, uma lista de entradas. A PRIMEIRA cuja condição ("se") passa é a que vale,
// então as mais específicas vêm antes e a última (sem "se") é o padrão.
// Formato de cada entrada e lista de condições/curingas: veja o cabeçalho de motor/dialogos.js.
//
// Ações disponíveis (o jogo implementa; o teste confere que existem): mostraCachorros, joaquimVoltaBravo

var DADOS = globalThis.DADOS || {};
DADOS.cap1Dialogos = {
  'Pai': [
    { fala: [
      'Vai lá, {filho}. As barracas da alcateia já estão montadas na sede.',
      'Cuidado na árvore do lobinhos.com.',
      'Não dá comida pro Fantasma.',
      'Qualquer coisa, estou aqui. Só vou terminar esse código com o Claude.',
      '...só um minuto, o Claude tá quase acertando esse bug.',
    ] },
  ],

  'Chefe Diego': [
    { se: ['ativa:chefe'], conclui: 'chefe', da: 'bandeira', ms: 7000,
      fala: 'Bem-vindo ao Camping Municipal, {nome}! Vi que {irmao} chegou junto com o Henrique na Trailblazer. Siga a estrada até a cantina: a alcateia está em roda na árvore do lobinhos.com, esperando vocês pra fazer a bandeira.' },
    { se: ['ativa:bandeira'], fala: 'A Akelá está esperando a alcateia na árvore do lobinhos.com, em frente à cantina. Aperte E perto da árvore pra fazer a bandeira.' },
    { se: ['concluida:fogueira'], fala: 'Fogueira acesa, bandeira no alto... belo sábado, {nome}. Agora é descansar na barraca.' },
    { fala: 'Bom sábado, {nome}! Vai lá com a Akelá.' },
  ],

  'Akelá': [
    { se: ['concluida:bandeira', 'disponivel:lenha'], da: ['lenha', 'fogueira'], ms: 7000,
      fala: 'Melhor possível, {nome}! Agora a alcateia precisa de lenha pra fogueira do conselho: junta 6 lenhas na mata (a Larissa sabe de um atalho) e acende a fogueira lá na sede do Grupo Escoteiro.' },
    { se: ['ativa:lenha'], fala: 'Cadê a lenha, {nome}? Tem bastante espalhada pela mata, perto das estradinhas. Com a pederneira do baú bastam 3.' },
    { se: ['ativa:fogueira'], fala: 'Lenha juntada! Agora vai na sede acender a fogueira do conselho. Aperte E perto dela.' },
    { se: ['concluida:fogueira'], fala: 'Fogueira acesa! Quando quiser, vai dormir na barraca da sede... se conseguir, hehe.' },
    { se: ['ativa:bandeira'], fala: 'Lobinhos, em roda na árvore do lobinhos.com! Aperte E perto dela pra fazer a bandeira, e depois podem subir nos galhos pelo A de bambu que a gente amarrou.' },
    { fala: 'Lobinhos, em roda na árvore do lobinhos.com — o nome que a própria alcateia escolheu! O Henrique trouxe os gêmeos e a carona — Maria, Dudu e Joaquim —, então estamos completos. Primeiro se apresenta pro Chefe Diego na portaria, {nome}.' },
  ],

  'Lobinho Dudu': [
    { se: ['personagem:caio'], ms: 5500, fala: [
      'CAIOOO! Meu parceiro! Bora subir na árvore do lobinhos.com de cabeça pra baixo? Zoeira... ou não, hein!',
      'Caio, tua irmã gêmea é igualzinha a ti, só que com o cabelo comprido. Eu quase chamei ela de Caio, hehe!',
      'Mano, eu falei pra alcateia inteira que a gente é a dupla mais doida do camping. Melhor possível, uhul!',
      'Caio, aposto que chego na praia antes de ti. Vale correr? VALE! Já era, tô indo! ...brincadeira, tô com preguiça.',
      'O Tio Henrique deixa a gente entrar na Trailblazer? Só pra buzinar uma vez, prometo!',
      'Tô fazendo 42 há tanto tempo que farmei 500 mil de aura! Eu sei que tu e {gemeoArtigo} não gostam de 42... mas QUATRO DOIS! Hehe!',
    ] },
    { ms: 5500, fala: [
      'E aí! Eu sou o Dudu, o mais doidão da alcateia, hehe. Cê viu o Caio por aí? Ele é meu melhor amigo, o cara!',
      'Lara, cê e o Caio são gêmeos mesmo, né? Igualzinhos! Se cê botar o boné do mesmo jeito eu não sei quem é quem, hehe.',
      'Foi a gente que batizou a árvore de lobinhos.com, saca? Eu queria lobinhos.com.br, mas não coube na placa, que chato.',
      'Se cê trombar com o Caio, fala que o Dudu tá aqui esperando pra jogar pega-pega, beleza?',
      'Ó, dizem que eu sou doidinho. Eu prefiro "cheio de energia". Ou "muito doidinho" mesmo, tanto faz, hehe!',
      'Tô fazendo 42 há tanto tempo que farmei 500 mil de aura! Eu sei que tu e {gemeoArtigo} não gostam de 42... mas QUATRO DOIS! Hehe!',
    ] },
  ],

  'Lobinha Maria': [
    { se: ['personagem:lara', 'disponivel:praia'], da: 'praia', ms: 5500, fala: 'LARA! Bandeira feita! Agora bora na Praia do Camping, eu te encontro lá. Amigas pra sempre!' },
    { se: ['disponivel:praia'], da: 'praia', ms: 5500, fala: 'Caio, fala pra Lara que eu vou pra Praia do Camping. Vai lá também, vai ser legal!' },
    { se: ['personagem:lara', 'ativa:praia'], fala: 'Lara, te encontro na praia! Vai pela estrada e desce na areia.' },
    { se: ['personagem:lara'], ms: 5000, fala: [
      'LARA! Minha melhor amiga chegou! Bora fazer a bandeira juntas e depois ir na praia?',
      'Lara, trouxe pulseirinha de miçanga pra gente, uma pra cada uma. Amigas pra sempre!',
      'Depois da bandeira a gente vai na cantina, tá? Eu pago o picolé, prometo!',
      'Lara, o Dudu tá me enchendo o saco pra ir buscar o Caio. Deixa eles, vem cá!',
      'O Tio Henrique trouxe vocês na Trailblazer? Que chique! Pede pra ele me dar carona na volta, hehe.',
    ] },
    { ms: 5000, fala: [
      'Oi, Caio! Cadê a Lara? Ela é minha melhor amiga, avisa ela que eu tô aqui na roda!',
      'Caio, fala pra Lara que eu guardei um lugar do lado do meu na roda, tá?',
      'Vocês dois são igualzinhos, mas a Lara é mais legal. Brincadeira! ...ou não, hehe.',
    ] },
  ],

  'Lobinho Davi': [
    { se: ['disponivel:molhe'], da: 'molhe', ms: 6000, fala: 'Lá de cima da árvore do lobinhos.com dá pra ver a lagoa inteira! Vai até o molhe, na ponta do camping, que de lá dá pra ver o farol de pertinho.' },
    { se: ['ativa:molhe'], fala: 'O molhe fica na ponta do camping, passando a praia e a quadra de vôlei. Segue a beira da lagoa!' },
    { fala: 'Lá de cima da árvore do lobinhos.com dá pra ver a lagoa inteira! E a Trailblazer do Tio Henrique lá na portaria.' },
  ],

  'Lobinha Larissa': [
    { se: ['disponivel:pederneira'], da: 'pederneira', ms: 5500, fala: 'Psiu, {nome}: a pederneira fica no baú da casinha do salva-vidas, lá na praia! Com ela a fogueira acende com só 3 lenhas. O pai da Lara que me contou.' },
    { se: ['ativa:pederneira'], fala: 'A casinha do salva-vidas é a de madeira na Praia do Camping. O baú fica do lado dela.' },
    { fala: 'Com a pederneira a fogueira acende fácil, viu? Segredo de escoteiro.' },
  ],

  'Lobinho Joaquim': [
    { emote: ['bravo', 'bravo', 'feliz'], acao: 'joaquimVoltaBravo', ms: 5000, fala: [
      'Eu sou o Joaquim, irmão do Dudu! E NÃO sou pequeno, tá?! Eu subo na árvore do lobinhos.com mais rápido que ele!',
      'O Dudu disse que eu sou doidinho que nem ele. Eu sou MAIS doido! E mais brabo! Grrr!',
      'Vamos uivar bem alto no Grande Uivo! AUUUUU! Eu uivo mais alto que o Dudu, o Tio Henrique ouve lá da Trailblazer!',
      'Quem mexer com o meu irmão vai ter que se ver comigo! ...mas o Dudu também é chato, viu. Hmpf.',
      'O Dudu fica fazendo 42 o dia inteiro. QUATRO DOIS, QUATRO DOIS... Eu vou explodir!! Hehe, brincadeira. Ou não.',
    ] },
  ],

  'Lobinho Alisson': [
    { se: ['disponivel:phantom'], da: 'phantom', acao: 'mostraCachorros', ms: 6500,
      fala: 'Ô {nome}, cê viu o Fantasma? Aquele cachorro magrelo do camping, preto em cima e branco embaixo... ele nem tem dono, mas é meu amigo! Acho que o maluco subiu na árvore do lobinhos.com, vai lá dar uma olhada pra mim?' },
    { se: ['var:fantasma=0'], ms: 5500, fala: 'Cê viu o Fantasma? Acho que o maluco subiu na árvore do lobinhos.com, vai lá dar uma olhada pra mim!' },
    { se: ['var:fantasma=1'], ms: 5500, fala: 'Pô, {nome}, o Fantasma vazou pro chuveiro da praia! Corre lá, vai!' },
    { se: ['var:fantasma=2'], ms: 5500, fala: 'Caraca, ele disparou pra portaria, perto do Chefe de moletom cinza! Chama ele que ele vem, ele é de boa.' },
    { se: ['var:fantasma=3'], ms: 5500, fala: 'Traz ele aqui, {nome}! Ele te segue se cê chamar.' },
    { ms: 5500, fala: 'Fantasma, seu doido! Fica aqui com a gente, vai... tem biscoito! O Chefe trouxe, aquele do moletom cinza, lá da Trailblazer.' },
  ],

  'Escoteiro Pedro': [{ fala: 'A mata aqui é cheia de figueiras e butiás. Cuidado pra não se perder!' }],
  'Escoteiro Lucas': [{ fala: 'Depois do futebol vamos pro Iate Clube ver os barcos.' }],

  // o gêmeo que não está sendo jogado (vira NPC quando ninguém pega o segundo controle)
  'Lara': [{ fala: 'Vou lá na roda ver a Maria, mano. Te encontro na árvore do lobinhos.com! Gêmeos têm que ficar juntos, né?' }],
  'Caio': [{ fala: 'Vou lá na roda ver o Dudu, mana. Te encontro na árvore do lobinhos.com! E não conta pra ninguém que eu sou 3 minutos mais velho... ah, todo mundo já sabe.' }],

  // os cachorros do camping (o que se vê ao olhar cada um, procurando o Fantasma)
  'Caramelo': [{ ms: 3500, fala: 'Um vira-lata caramelo. Simpático, mas não é o Fantasma.' }],
  'Mel': [{ ms: 3500, fala: 'Uma golden peluda. Não é o Fantasma.' }],
  'Pingo': [{ ms: 3500, fala: 'Preto em cima e branco embaixo... mas é gordinho e de perna curta. Não é o Fantasma!' }],
  'Fumaça': [{ ms: 3500, fala: 'Um cachorro magro cinza. Parecido, mas o Fantasma é preto em cima!' }],
  'Bolota': [{ ms: 3500, fala: 'Um cachorrinho branco todo enroladinho. Não é o Fantasma.' }],
  'Thor': [{ ms: 3500, fala: 'Um rottweiler dormindo perto das barracas. Não é o Fantasma.' }],
};
