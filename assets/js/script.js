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
 
// =========================================================
//  PÁGINA: DIÁRIO (index.html)
// =========================================================
function iniciarDiario() {
  const form = document.getElementById('form-refeicao');
  if (!form) return;
 
  const tbody = document.getElementById('lista-refeicoes');
  const campoBusca = document.getElementById('busca');
  const filtroRefeicao = document.getElementById('filtro-refeicao');
  const ordenacao = document.getElementById('ordenacao');
  const formFiltros = document.getElementById('form-filtros');
  const botaoSubmit = document.getElementById('botao-submit');
  const botaoCancelar = document.getElementById('botao-cancelar');
  const tituloForm = document.getElementById('titulo-form');
 
  // ----- Listagem (com busca + filtro + ordenação) -----
  function obterListaVisivel() {
    const termo = normalizar(campoBusca.value);
    const refeicaoEscolhida = filtroRefeicao.value;
 
    let lista = refeicoes.filter(item => {
      const bateNome = normalizar(item.nome).includes(termo);
      const bateRefeicao = refeicaoEscolhida === 'todas' || item.refeicao === refeicaoEscolhida;
      return bateNome && bateRefeicao;
    });
 
    switch (ordenacao.value) {
      case 'caloricos':
        lista.sort((a, b) => b.calorias - a.calorias);
        break;
      case 'alfabetica':
        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        break;
      default: // recentes
        lista.sort((a, b) => b.criadoEm - a.criadoEm);
    }
    return lista;
  }
 
  function renderizarLista() {
    const lista = obterListaVisivel();
    tbody.innerHTML = '';
 
    if (lista.length === 0) {
      const linha = criar('tr', {}, [
        criar('td', { colspan: '7', texto: 'Nenhum item encontrado.' })
      ]);
      tbody.append(linha);
    }
 
    lista.forEach(item => {
      const celulaFoto = criar('td');
      if (item.foto) {
        celulaFoto.append(criar('img', { src: item.foto, alt: item.nome, width: '80', height: '80' }));
      } else {
        celulaFoto.textContent = '🍽️';
      }
 
      const acoes = criar('td', {}, [
        criar('button', { type: 'button', texto: 'Detalhes', onclick: () => mostrarDetalhes(item.id) }),
        criar('button', { type: 'button', texto: 'Editar', onclick: () => iniciarEdicao(item.id) }),
        criar('button', { type: 'button', texto: 'Excluir', onclick: () => excluir(item.id) })
      ]);
 
      const linha = criar('tr', {}, [
        celulaFoto,
        criar('td', {}, [criar('strong', { texto: item.nome })]),
        criar('td', { texto: NOMES_REFEICAO[item.refeicao] || item.refeicao }),
        criar('td', { texto: formatarNumero(item.quantidade) + ' g' }),
        criar('td', {}, [criar('strong', { texto: formatarNumero(item.calorias) }), ' kcal']),
        criar('td', { texto: NOMES_GRUPO[item.grupo] || item.grupo }),
        acoes
      ]);
      tbody.append(linha);
    });
 
    document.getElementById('contador').textContent =
      lista.length + (lista.length === 1 ? ' item encontrado' : ' itens encontrados');
 
    atualizarResumo();
  }
 
  // ----- Resumo / métricas -----
  function atualizarResumo() {
    const total = refeicoes.reduce((soma, item) => soma + item.calorias, 0);
    const proteinas = refeicoes.reduce((soma, item) => soma + (item.proteinas || 0), 0);
    const percentual = Math.min(Math.round((total / META_CALORIAS) * 100), 999);
    const restante = Math.max(META_CALORIAS - total, 0);
 
    // maior refeição (por calorias somadas)
    const porRefeicao = {};
    refeicoes.forEach(item => {
      porRefeicao[item.refeicao] = (porRefeicao[item.refeicao] || 0) + item.calorias;
    });
    let maior = '-';
    let maiorValor = 0;
    for (const chave in porRefeicao) {
      if (porRefeicao[chave] > maiorValor) {
        maiorValor = porRefeicao[chave];
        maior = NOMES_REFEICAO[chave] || chave;
      }
    }
 
    definirTexto('resumo-total', formatarNumero(total));
    definirTexto('resumo-percentual', percentual + '% - Meta diária: ' + formatarNumero(META_CALORIAS) + ' kcal');
    definirTexto('resumo-itens', 'Itens registrados: ' + refeicoes.length);
    definirTexto('resumo-restante', 'Restante hoje: ' + formatarNumero(restante) + ' kcal');
    definirTexto('resumo-maior', 'Maior refeição: ' + maior);
    definirTexto('metrica-calorias', formatarNumero(total));
    definirTexto('metrica-proteinas', formatarNumero(proteinas) + ' g');
    definirTexto('banner-percentual', 'Você já completou ' + percentual + '% da meta de hoje. Continue registrando para manter sua sequência.');
  }
 
  function definirTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
  }
 
  // ----- Cadastro / edição -----
  function lerFormulario() {
    return {
      nome: document.getElementById('nome').value.trim(),
      refeicao: document.getElementById('refeicao').value,
      quantidade: parseFloat(document.getElementById('quantidade').value),
      calorias: parseFloat(document.getElementById('calorias').value),
      grupo: document.getElementById('grupo').value,
      proteinas: numeroOuZero(document.getElementById('proteinas').value),
      carboidratos: numeroOuZero(document.getElementById('carboidratos').value),
      gorduras: numeroOuZero(document.getElementById('gorduras').value),
      sodio: numeroOuZero(document.getElementById('sodio').value),
      observacoes: document.getElementById('observacoes').value.trim()
    };
  }
 
  function validar(dados) {
    if (dados.nome.length < 2) return 'Informe o nome do alimento (mínimo 2 caracteres).';
    if (!dados.refeicao) return 'Selecione o tipo de refeição.';
    if (isNaN(dados.quantidade) || dados.quantidade <= 0) return 'A quantidade deve ser maior que zero.';
    if (isNaN(dados.calorias) || dados.calorias < 0) return 'Informe as calorias (valor igual ou maior que zero).';
    if (!dados.grupo) return 'Selecione o grupo alimentar.';
    if (dados.proteinas < 0 || dados.carboidratos < 0 || dados.gorduras < 0 || dados.sodio < 0) {
      return 'Os valores nutricionais não podem ser negativos.';
    }
    return null;
  }
 
  function aoEnviarFormulario(evento) {
    evento.preventDefault();
    const dados = lerFormulario();
    const erro = validar(dados);
    if (erro) {
      mostrarMensagem(erro, 'erro');
      return;
    }
 
    if (idEmEdicao !== null) {
      const indice = refeicoes.findIndex(i => i.id === idEmEdicao);
      if (indice >= 0) {
        refeicoes[indice] = { ...refeicoes[indice], ...dados };
      }
      salvar();
      const idEditado = idEmEdicao;
      cancelarEdicao();
      renderizarLista();
      if (idSelecionado === idEditado) mostrarDetalhes(idEditado);
      mostrarMensagem('Item atualizado com sucesso!', 'sucesso');
    } else {
      refeicoes.push({ id: gerarId(), criadoEm: Date.now(), foto: '', ...dados });
      salvar();
      form.reset();
      renderizarLista();
      mostrarMensagem('Item cadastrado com sucesso!', 'sucesso');
    }
  }
 
  // ----- Detalhes -----
  function mostrarDetalhes(id) {
    const item = refeicoes.find(i => i.id === id);
    const secao = document.getElementById('detalhes');
    if (!item) {
      idSelecionado = null;
      secao.hidden = true;
      return;
    }
    idSelecionado = id;
    secao.hidden = false;
    definirTexto('detalhes-titulo', item.nome);
    definirTexto('detalhes-info',
      (NOMES_REFEICAO[item.refeicao] || item.refeicao) + ' · ' + formatarNumero(item.quantidade) + ' g · ' +
      (NOMES_GRUPO[item.grupo] || item.grupo) + ' · ' + formatarNumero(item.calorias) + ' kcal');
    definirTexto('detalhes-proteinas', formatarNumero(item.proteinas || 0) + ' g');
    definirTexto('detalhes-carboidratos', formatarNumero(item.carboidratos || 0) + ' g');
    definirTexto('detalhes-gorduras', formatarNumero(item.gorduras || 0) + ' g');
    definirTexto('detalhes-sodio', formatarNumero(item.sodio || 0) + ' mg');
    definirTexto('detalhes-obs', item.observacoes ? 'Obs.: ' + item.observacoes : '');
    secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 
  // ----- Exclusão -----
  function excluir(id) {
    const item = refeicoes.find(i => i.id === id);
    if (!item) return;
    if (!confirm('Excluir "' + item.nome + '"?')) return;
 
    refeicoes = refeicoes.filter(i => i.id !== id);
    salvar();
    if (idEmEdicao === id) cancelarEdicao();
    if (idSelecionado === id) mostrarDetalhes(null);
    renderizarLista();
    mostrarMensagem('Item excluído.', 'sucesso');
  }
 
  function iniciarEdicao(id) {
    const item = refeicoes.find(i => i.id === id);
    if (!item) return;
    idEmEdicao = id;
    document.getElementById('nome').value = item.nome;
    document.getElementById('refeicao').value = item.refeicao;
    document.getElementById('quantidade').value = item.quantidade;
    document.getElementById('calorias').value = item.calorias;
    document.getElementById('grupo').value = item.grupo;
    document.getElementById('proteinas').value = item.proteinas || '';
    document.getElementById('carboidratos').value = item.carboidratos || '';
    document.getElementById('gorduras').value = item.gorduras || '';
    document.getElementById('sodio').value = item.sodio || '';
    document.getElementById('observacoes').value = item.observacoes || '';
    botaoSubmit.textContent = 'Salvar alterações';
    tituloForm.textContent = 'Editar alimento';
    botaoCancelar.hidden = false;
    document.getElementById('cadastro').scrollIntoView({ behavior: 'smooth' });
  }
 
  function cancelarEdicao() {
    idEmEdicao = null;
    form.reset();
    botaoSubmit.textContent = 'Cadastrar item';
    tituloForm.textContent = 'Cadastrar novo alimento';
    botaoCancelar.hidden = true;
  }
 
  // ----- Eventos -----
  form.addEventListener('submit', aoEnviarFormulario);
  botaoCancelar.addEventListener('click', cancelarEdicao);
  document.getElementById('detalhes-editar').addEventListener('click', () => iniciarEdicao(idSelecionado));
  document.getElementById('detalhes-excluir').addEventListener('click', () => excluir(idSelecionado));
  formFiltros.addEventListener('submit', e => { e.preventDefault(); renderizarLista(); });
  campoBusca.addEventListener('input', renderizarLista);
  filtroRefeicao.addEventListener('change', renderizarLista);
  ordenacao.addEventListener('change', renderizarLista);
 
  document.getElementById('detalhes').hidden = true;
  renderizarLista();
}
 
document.addEventListener('DOMContentLoaded', () => {
  carregar();
  iniciarDiario();
});