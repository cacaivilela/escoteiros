// ---------- TABELA DE ITENS (só dados) ----------
// id: nome curto usado nas missões (gatilho item) e no código; empilha: junta várias unidades no inventário.
var DADOS = globalThis.DADOS || {};
DADOS.itens = {
  lenha:      { nome: 'Lenha',      icone: '🪵', empilha: true,  descricao: 'Três toras. Seis acendem a fogueira do conselho; com a pederneira, três.' },
  galho:      { nome: 'Galho',      icone: '🌿', empilha: true,  descricao: 'Cai da árvore quando o Caio batuca. Dois galhos viram uma lenha.' },
  pederneira: { nome: 'Pederneira', icone: '🔥', empilha: false, descricao: 'Fica no baú da casinha do salva-vidas. Faz faísca: a fogueira acende com só 3 lenhas.' },
  madeira:    { nome: 'Madeira',    icone: '🪚', empilha: true,  descricao: 'Estoque das construções do dia 2 (mirante, casa na árvore, sede).' },
};
