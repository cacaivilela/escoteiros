// ---------- DISTINTIVOS DO JOGO (só dados) ----------
// Cada distintivo ganho aparece costurado na manga do uniforme e na tela "🎖️ Distintivos" do menu.
// São conquistas do jogo, não as especialidades oficiais do Ramo Lobinho.
//
// Campos:
//   id     nome curto usado no código (o dos minijogos é o próprio tipo do minijogo: 'bandeira', 'fogo', 'pesca'…)
//   em     emoji desenhado no distintivo
//   cor    cor da borda do distintivo de pano
//   nome   nome que aparece no aviso e no menu
//   como   o que precisa fazer pra ganhar
//   missao (opcional) ganha quando essa missão do motor é concluída

var DADOS = globalThis.DADOS || {};
DADOS.distintivos = [
  { id: 'bandeira', em: '🚩', cor: '#c62828', nome: 'Bandeira', como: 'Fazer a bandeira na árvore do lobinhos.com' },
  { id: 'fogo', em: '🔥', cor: '#ef6c00', nome: 'Fogueira', como: 'Acender a fogueira com faíscas na zona laranja' },
  { id: 'martelar', em: '🔨', cor: '#6d4c41', nome: 'Martelo', como: 'Martelar todos os pregos de uma construção' },
  { id: 'serrar', em: '🪚', cor: '#8d6e63', nome: 'Serrote', como: 'Serrar as tábuas' },
  { id: 'amarrar', em: '🪢', cor: '#2e7d32', nome: 'Nós', como: 'Dar os nós na ordem certa' },
  { id: 'pesca', em: '🎣', cor: '#1565c0', nome: 'Pescador', como: 'Pescar 3 peixes na Lagoa dos Patos' },
  { id: 'bocha', em: '🎯', cor: '#6a1b9a', nome: 'Bocha', como: 'Chegar a menos de 3 m do bolim' },
  { id: 'futebol', em: '⚽', cor: '#37474f', nome: 'Artilheiro', como: 'Fazer 3 gols em 5 chutes no Campo do Camping' },
  { id: 'fantasma', em: '🐕', cor: '#212121', nome: 'Amigo do Fantasma', como: 'Achar o Fantasma pro Alisson', missao: 'phantom' },
  { id: 'molhe', em: '🌊', cor: '#00838f', nome: 'Molhe', como: 'Chegar ao molhe na ponta do camping', missao: 'molhe' },
  { id: 'explorador', em: '🧭', cor: '#f9a825', nome: 'Explorador', como: 'Visitar 12 lugares diferentes do camping' },
  { id: 'fotografo', em: '📷', cor: '#455a64', nome: 'Fotógrafo', como: 'Tirar 5 fotos pro álbum' },
  { id: 'fotoFantasma', em: '📸', cor: '#424242', nome: 'Foto do Fantasma', como: 'Tirar uma foto com o Fantasma bem perto' },
];
