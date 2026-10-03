// ---------- TABELA DE ITENS (só dados) ----------
// id: nome curto usado nas missões (gatilho item) e no código; empilha: junta várias unidades no inventário.
var DADOS = globalThis.DADOS || {};
DADOS.itens = {
  lenha:      { nome: 'Lenha',      icone: '🪵', empilha: true,  descricao: 'Três toras. Seis acendem a fogueira do conselho; com a pederneira, três.' },
  galho:      { nome: 'Galho',      icone: '🌿', empilha: true,  descricao: 'Cai da árvore quando o Caio batuca. Dois galhos viram uma lenha.' },
  pederneira: { nome: 'Pederneira', icone: '🔥', empilha: false, descricao: 'Fica no baú da casinha do salva-vidas. Faz faísca: a fogueira acende com só 3 lenhas.' },
  madeira:    { nome: 'Madeira',    icone: '🪚', empilha: true,  descricao: 'Estoque das construções do dia 2 (mirante, casa na árvore, sede).' },
  // capítulo 3: materiais da pipa do Pai
  bambu:      { nome: 'Vareta de bambu', icone: '🎋', empilha: true, descricao: 'Cortada nos bambuzais da mata, atrás da cancha de bocha. A pipa precisa de 3.' },
  papel:      { nome: 'Papel de seda',   icone: '📄', empilha: false, descricao: 'Vermelho. A moça da cantina deu de presente.' },
  linha:      { nome: 'Carretel de linha', icone: '🧵', empilha: false, descricao: 'Linha 10. Tava na caixa de pioneiria, na frente da sede.' },
};
