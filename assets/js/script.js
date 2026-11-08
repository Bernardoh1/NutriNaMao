// ---------- CONSTANTES ----------
const CHAVE_STORAGE = 'nutrinamao:refeicoes';
const META_CALORIAS = 2100;

const NOMES_REFEICAO = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar'
};

const NOMES_GRUPO = {
  proteinas: 'Proteínas',
  carboidratos: 'Carboidratos',
  vegetais: 'Vegetais',
  frutas: 'Frutas',
  laticinios: 'Laticínios',
  gorduras: 'Gorduras'
};

// Dados iniciais (só usados na primeira vez que a página abre)
const DADOS_INICIAIS = [
  { id: 1, nome: 'Bowl de frango e quinoa', refeicao: 'almoco', quantidade: 320, calorias: 520, grupo: 'proteinas',
    proteinas: 38, carboidratos: 42, gorduras: 14, sodio: 380, observacoes: '', foto: 'assets/img/foto2.jpg', criadoEm: 1 },
  { id: 2, nome: 'Iogurte com frutas', refeicao: 'cafe', quantidade: 240, calorias: 284, grupo: 'laticinios',
    proteinas: 12, carboidratos: 38, gorduras: 8, sodio: 120, observacoes: '', foto: 'assets/img/foto3.jpg', criadoEm: 2 },
  { id: 3, nome: 'Torrada com avocado', refeicao: 'lanche', quantidade: 180, calorias: 326, grupo: 'carboidratos',
    proteinas: 9, carboidratos: 34, gorduras: 18, sodio: 290, observacoes: '', foto: 'assets/img/foto4.jpg', criadoEm: 3 },
  { id: 4, nome: 'Salada mediterrânea', refeicao: 'jantar', quantidade: 280, calorias: 352, grupo: 'vegetais',
    proteinas: 10, carboidratos: 18, gorduras: 26, sodio: 410, observacoes: '', foto: 'assets/img/foto5.jpg', criadoEm: 4 }
];

// ---------- ESTADO ----------
let refeicoes = [];
let idEmEdicao = null;
let idSelecionado = null;

// ---------- UTILITÁRIOS ----------
function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    if (bruto === null) {
      // primeira visita: popula com exemplos
      refeicoes = DADOS_INICIAIS.map(item => ({ ...item }));
      salvar();
    } else {
      const lista = JSON.parse(bruto);
      refeicoes = Array.isArray(lista) ? lista : [];
    }
  } catch (erro) {
    console.error('Erro ao ler localStorage:', erro);
    refeicoes = [];
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(refeicoes));
  } catch (erro) {
    console.error('Erro ao salvar no localStorage:', erro);
  }
}

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function normalizar(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

// Cria elementos sem usar innerHTML (evita injetar HTML vindo da API)
function criar(tag, atributos = {}, filhos = []) {
  const elemento = document.createElement(tag);
  for (const chave in atributos) {
    if (chave === 'texto') elemento.textContent = atributos[chave];
    else if (chave === 'classe') elemento.className = atributos[chave];
    else if (chave.startsWith('on')) elemento.addEventListener(chave.slice(2), atributos[chave]);
    else elemento.setAttribute(chave, atributos[chave]);
  }
  filhos.forEach(filho => elemento.append(filho));
  return elemento;
}

function mostrarMensagem(texto, tipo = 'sucesso', idAlvo = 'mensagem') {
  const caixa = document.getElementById(idAlvo);
  if (!caixa) return;
  caixa.textContent = texto;
  caixa.className = 'mensagem mensagem-' + tipo;
  caixa.hidden = false;
  clearTimeout(caixa._timer);
  caixa._timer = setTimeout(() => { caixa.hidden = true; }, 4000);
}

function numeroOuZero(valor) {
  const n = parseFloat(valor);
  return isNaN(n) ? 0 : n;
}

document.addEventListener('DOMContentLoaded', () => {
  carregar();
});