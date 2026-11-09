// Constatantes 
const CHAVE_STORAGE = 'nutrinamao:refeicoes:v2';
const CHAVE_PLANO = 'nutrinamao:plano';
const CHAVE_COMPRAS = 'nutrinamao:compras';
const META_CALORIAS = 2100;
const META_PROTEINA = 110;
const META_AGUA = 2.2;
 
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
// Bowl: 468 kcal (39 g de proteína, 42 g de carboidrato e 16 g de gordura), igual ao que está no HTML.
// Somando os 4 itens: 468 + 284 + 326 + 352 = 1.430 kcal.
const DADOS_INICIAIS = [
  { id: 1, nome: 'Bowl de frango e quinoa', refeicao: 'almoco', quantidade: 320, calorias: 468, grupo: 'proteinas',
    proteinas: 39, carboidratos: 42, gorduras: 16, sodio: 380, observacoes: '', foto: 'assets/img/foto2.jpg', criadoEm: 1 },
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
      // primeira visita: popula com exemplos (todos com a data de hoje)
      refeicoes = DADOS_INICIAIS.map(item => ({ ...item, data: hojeISO() }));
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
 
// Lê e grava qualquer coisa no localStorage (usado no planejamento)
function lerJson(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto === null ? padrao : JSON.parse(bruto);
  } catch (erro) {
    console.error('Erro ao ler ' + chave + ':', erro);
    return padrao;
  }
}
 
function salvarJson(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.error('Erro ao salvar ' + chave + ':', erro);
  }
}
 
function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
 
// Data de hoje no formato 2026-06-12 (para somar só o que foi comido hoje)
function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return agora.getFullYear() + '-' + mes + '-' + dia;
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
 
// ---- funções de segurança: não quebram se algum id não existir no HTML ----
function definirTexto(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}
 
function valorDoCampo(id) {
  const campo = document.getElementById(id);
  return campo ? campo.value : '';
}
 
function definirCampo(id, valor) {
  const campo = document.getElementById(id);
  if (campo) campo.value = valor;
}
 
function aoClicar(id, funcao) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', funcao);
}
 
// Confere se os ids que a página precisa existem. Se faltar algum, avisa no Console (F12).
function verificarIds(pagina, ids) {
  const faltando = ids.filter(id => !document.getElementById(id));
  if (faltando.length > 0) {
    console.error(pagina + ': faltam estes ids no HTML: ' + faltando.join(', '));
    return false;
  }
  return true;
}
 
// =========================================================
//  PÁGINA: DIÁRIO (index.html)
// =========================================================
function iniciarDiario() {
  const form = document.getElementById('form-refeicao');
  if (!form) return;
 
  const idsObrigatorios = [
    'lista-refeicoes', 'busca', 'filtro-refeicao', 'ordenacao', 'botao-submit',
    'botao-cancelar', 'titulo-form', 'nome', 'refeicao', 'quantidade', 'calorias', 'grupo', 'observacoes'
  ];
  if (!verificarIds('Diário', idsObrigatorios)) return;
 
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
 
    definirTexto('contador',
      lista.length + (lista.length === 1 ? ' item encontrado' : ' itens encontrados'));
 
    atualizarResumo();
  }
 
  // ----- Resumo / métricas (só o que foi registrado HOJE) -----
  function atualizarResumo() {
    const doDia = refeicoes.filter(item => item.data === hojeISO());
 
    const total = doDia.reduce((soma, item) => soma + item.calorias, 0);
    const proteinas = doDia.reduce((soma, item) => soma + (item.proteinas || 0), 0);
    const percentual = Math.min(Math.round((total / META_CALORIAS) * 100), 999);
    const restante = Math.max(META_CALORIAS - total, 0);
 
    // maior refeição (por calorias somadas)
    const porRefeicao = {};
    doDia.forEach(item => {
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
    definirTexto('resumo-itens', 'Itens registrados: ' + doDia.length);
    definirTexto('resumo-restante', 'Restante hoje: ' + formatarNumero(restante) + ' kcal');
    definirTexto('resumo-maior', 'Maior refeição: ' + maior);
    definirTexto('metrica-calorias', formatarNumero(total));
    definirTexto('metrica-proteinas', formatarNumero(proteinas) + ' g');
    definirTexto('banner-percentual', 'Você já completou ' + percentual + '% da meta de hoje. Continue registrando para manter sua sequência.');
  }
 
  // ----- Detalhes -----
  function mostrarDetalhes(id) {
    const item = refeicoes.find(i => i.id === id);
    const secao = document.getElementById('detalhes');
    if (!secao) return;
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
 
  // ----- Cadastro / edição -----
  function lerFormulario() {
    return {
      nome: valorDoCampo('nome').trim(),
      refeicao: valorDoCampo('refeicao'),
      quantidade: parseFloat(valorDoCampo('quantidade')),
      calorias: parseFloat(valorDoCampo('calorias')),
      grupo: valorDoCampo('grupo'),
      proteinas: numeroOuZero(valorDoCampo('proteinas')),
      carboidratos: numeroOuZero(valorDoCampo('carboidratos')),
      gorduras: numeroOuZero(valorDoCampo('gorduras')),
      sodio: numeroOuZero(valorDoCampo('sodio')),
      observacoes: valorDoCampo('observacoes').trim()
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
      refeicoes.push({ id: gerarId(), criadoEm: Date.now(), data: hojeISO(), foto: '', ...dados });
      salvar();
      form.reset();
      renderizarLista();
      mostrarMensagem('Item cadastrado com sucesso!', 'sucesso');
    }
  }
 
  function iniciarEdicao(id) {
    const item = refeicoes.find(i => i.id === id);
    if (!item) return;
    idEmEdicao = id;
    definirCampo('nome', item.nome);
    definirCampo('refeicao', item.refeicao);
    definirCampo('quantidade', item.quantidade);
    definirCampo('calorias', item.calorias);
    definirCampo('grupo', item.grupo);
    definirCampo('proteinas', item.proteinas || '');
    definirCampo('carboidratos', item.carboidratos || '');
    definirCampo('gorduras', item.gorduras || '');
    definirCampo('sodio', item.sodio || '');
    definirCampo('observacoes', item.observacoes || '');
    botaoSubmit.textContent = 'Salvar alterações';
    tituloForm.textContent = 'Editar alimento';
    botaoCancelar.hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
  }
 
  function cancelarEdicao() {
    idEmEdicao = null;
    form.reset();
    botaoSubmit.textContent = 'Cadastrar item';
    tituloForm.textContent = 'Cadastrar novo alimento';
    botaoCancelar.hidden = true;
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
 
  // ----- Atalhos "Adicionar novamente" -----
  document.querySelectorAll('[data-atalho]').forEach(botao => {
    botao.addEventListener('click', () => {
      refeicoes.push({
        id: gerarId(),
        criadoEm: Date.now(),
        data: hojeISO(),
        nome: botao.dataset.nome,
        refeicao: botao.dataset.refeicao,
        quantidade: parseFloat(botao.dataset.quantidade),
        calorias: parseFloat(botao.dataset.calorias),
        grupo: botao.dataset.grupo,
        proteinas: 0, carboidratos: 0, gorduras: 0, sodio: 0,
        observacoes: 'Adicionado pelo atalho', foto: ''
      });
      salvar();
      renderizarLista();
      mostrarMensagem('"' + botao.dataset.nome + '" adicionado ao diário!', 'sucesso');
    });
  });
 
  // ----- Eventos -----
  form.addEventListener('submit', aoEnviarFormulario);
  botaoCancelar.addEventListener('click', cancelarEdicao);
  if (formFiltros) formFiltros.addEventListener('submit', e => { e.preventDefault(); renderizarLista(); });
  campoBusca.addEventListener('input', renderizarLista);
  filtroRefeicao.addEventListener('change', renderizarLista);
  ordenacao.addEventListener('change', renderizarLista);
  aoClicar('detalhes-editar', () => iniciarEdicao(idSelecionado));
  aoClicar('detalhes-excluir', () => excluir(idSelecionado));
 
  const secaoDetalhes = document.getElementById('detalhes');
  if (secaoDetalhes) secaoDetalhes.hidden = true;
  renderizarLista();
}
 
// =========================================================
//  PÁGINA: BIBLIOTECA (biblioteca.html) + API Open Food Facts
// =========================================================
const ALIMENTOS_BASE = [
  { nome: 'Ovo cozido', grupo: 'proteinas', kcal: 155, prot: 13, carb: 1.1, gord: 11, sodio: 124, foto: 'assets/img/foto6.jpg' },
  { nome: 'Salmão grelhado', grupo: 'proteinas', kcal: 208, prot: 20, carb: 0, gord: 13, sodio: 59, foto: 'assets/img/foto7.jpg' },
  { nome: 'Abacate', grupo: 'frutas', kcal: 160, prot: 2, carb: 8.5, gord: 14.7, sodio: 7, foto: 'assets/img/foto11.jpg' },
  { nome: 'Quinoa cozida', grupo: 'carboidratos', kcal: 120, prot: 4.4, carb: 21, gord: 1.9, sodio: 7, foto: 'assets/img/foto8.jpg' },
  { nome: 'Brócolis', grupo: 'vegetais', kcal: 35, prot: 2.4, carb: 7.2, gord: 0.4, sodio: 33, foto: 'assets/img/foto9.jpg' },
  { nome: 'Iogurte natural', grupo: 'laticinios', kcal: 63, prot: 5.3, carb: 7, gord: 1.6, sodio: 70, foto: 'assets/img/foto10.jpg' }
];
 
function iniciarBiblioteca() {
  const lista = document.getElementById('lista-alimentos');
  if (!lista) return;
 
  const idsObrigatorios = ['form-busca', 'busca-alimento', 'status-busca', 'titulo-lista'];
  if (!verificarIds('Biblioteca', idsObrigatorios)) return;
 
  const formBusca = document.getElementById('form-busca');
  const campoBusca = document.getElementById('busca-alimento');
  const status = document.getElementById('status-busca');
  const tituloLista = document.getElementById('titulo-lista');
 
  // Descobre um grupo provável a partir do texto do produto (a API não traz nosso grupo).
  // \b = limite de palavra: assim "macarrão" não é confundido com "maçã" (maca).
  function adivinharGrupo(nome) {
    const n = normalizar(nome);
    if (/\b(leite|iogurte|queijo|requeij\w*|manteiga)s?\b/.test(n)) return 'laticinios';
    if (/\b(frango|carne|ovo|peixe|atum|salmao|presunto|linguica|bife)s?\b/.test(n)) return 'proteinas';
    if (/\b(banana|maca|laranja|uva|morango|fruta|abacate|manga)s?\b/.test(n)) return 'frutas';
    if (/\b(alface|tomate|brocolis|cenoura|legume|vegetal|salada|couve)s?\b/.test(n)) return 'vegetais';
    if (/\b(oleo|azeite|castanha|amendoim|nozes)s?\b/.test(n)) return 'gorduras';
    return 'carboidratos';
  }
 
  // Monta um card; "alimento" tem valores por 100 g
  function criarCard(alimento, veioDaApi) {
    const selectRefeicao = criar('select', { 'aria-label': 'Refeição' });
    Object.keys(NOMES_REFEICAO).forEach(chave => {
      selectRefeicao.append(criar('option', { value: chave, texto: NOMES_REFEICAO[chave] }));
    });
 
    const campoQtd = criar('input', { type: 'number', value: '100', min: '1', 'aria-label': 'Quantidade em gramas' });
 
    const selectGrupo = criar('select', { 'aria-label': 'Grupo alimentar' });
    Object.keys(NOMES_GRUPO).forEach(chave => {
      selectGrupo.append(criar('option', { value: chave, texto: NOMES_GRUPO[chave] }));
    });
    selectGrupo.value = alimento.grupo;
 
    const botao = criar('button', { type: 'button', texto: '+ Adicionar ao diário' });
    botao.addEventListener('click', () => {
      const quantidade = parseFloat(campoQtd.value);
      if (isNaN(quantidade) || quantidade <= 0) {
        mostrarMensagem('Informe uma quantidade válida em gramas.', 'erro');
        return;
      }
      const fator = quantidade / 100;
      refeicoes.push({
        id: gerarId(),
        criadoEm: Date.now(),
        data: hojeISO(),
        nome: alimento.nome,
        refeicao: selectRefeicao.value,
        quantidade: quantidade,
        calorias: Math.round(alimento.kcal * fator),
        grupo: selectGrupo.value,
        proteinas: Math.round(alimento.prot * fator * 10) / 10,
        carboidratos: Math.round(alimento.carb * fator * 10) / 10,
        gorduras: Math.round(alimento.gord * fator * 10) / 10,
        sodio: Math.round(alimento.sodio * fator),
        observacoes: veioDaApi ? 'Importado da Open Food Facts' : 'Adicionado pela biblioteca',
        foto: alimento.foto || ''
      });
      salvar();
      mostrarMensagem('"' + alimento.nome + '" adicionado ao diário!', 'sucesso');
    });
 
    const imagem = alimento.foto
      ? criar('img', { src: alimento.foto, alt: alimento.nome, width: '200', height: '200', loading: 'lazy' })
      : criar('span', { texto: '🍽️' });
 
    return criar('article', {}, [
      imagem,
      criar('span', { texto: NOMES_GRUPO[alimento.grupo].toUpperCase() }),
      criar('h3', { texto: alimento.nome }),
      criar('p', {}, [criar('strong', { texto: formatarNumero(alimento.kcal) }), ' kcal']),
      criar('p', { texto: 'Porção base: 100 g' }),
      criar('p', { texto: 'Proteína: ' + formatarNumero(alimento.prot) + ' g' }),
      criar('label', { texto: 'Refeição ' }, [selectRefeicao]),
      criar('label', { texto: 'Quantidade (g) ' }, [campoQtd]),
      veioDaApi ? criar('label', { texto: 'Grupo ' }, [selectGrupo]) : document.createTextNode(''),
      botao
    ]);
  }
 
  function desenhar(alimentos, veioDaApi) {
    lista.innerHTML = '';
    alimentos.forEach(a => lista.append(criarCard(a, veioDaApi)));
  }
 
  // ----- Categorias (filtram a lista local) -----
  function filtrarCategoria(categoria) {
    const filtrados = categoria === 'todos'
      ? ALIMENTOS_BASE
      : ALIMENTOS_BASE.filter(a => a.grupo === categoria);
    tituloLista.textContent = 'Alimentos Disponíveis';
    status.textContent = filtrados.length + ' alimento(s) na lista.';
    desenhar(filtrados, false);
  }
 
  document.querySelectorAll('[data-categoria]').forEach(botao => {
    botao.addEventListener('click', () => {
      campoBusca.value = '';
      filtrarCategoria(botao.dataset.categoria);
    });
  });
 
  // ----- Busca na API -----
  // Transforma um produto da API no formato que o nosso card entende (ou null se faltar dado)
  function converterProduto(p) {
    const nome = String(p.product_name || '').trim();
    const n = p.nutriments || {};
    if (nome === '' || n['energy-kcal_100g'] === undefined) return null;
 
    const marca = Array.isArray(p.brands) ? p.brands[0] : String(p.brands || '').split(',')[0].trim();
    return {
      nome: marca ? nome + ' (' + marca + ')' : nome,
      grupo: adivinharGrupo(nome),
      kcal: Math.round(numeroOuZero(n['energy-kcal_100g'])),
      prot: numeroOuZero(n['proteins_100g']),
      carb: numeroOuZero(n['carbohydrates_100g']),
      gord: numeroOuZero(n['fat_100g']),
      sodio: Math.round(numeroOuZero(n['sodium_100g']) * 1000),   // a API traz em gramas
      foto: p.image_front_small_url || ''
    };
  }
 
  // O endereço antigo (cgi/search.pl) pode sair do ar: a própria documentação da Open Food Facts
  // diz que ele não é recomendado. Por isso tentamos o Search-a-licious primeiro e, se falhar,
  // o endereço antigo.
  async function consultarProdutos(termo) {
    const campos = 'product_name,brands,nutriments,image_front_small_url';
    const busca = encodeURIComponent(termo);
    const enderecos = [
      'https://search.openfoodfacts.org/search?q=' + busca + '&page_size=12&fields=' + campos,
      'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + busca +
        '&search_simple=1&action=process&json=1&page_size=12&fields=' + campos
    ];
 
    for (const url of enderecos) {
      try {
        const resposta = await fetch(url);
        if (!resposta.ok) continue;
        const dados = await resposta.json();
        const brutos = dados.hits || dados.products || [];
        const alimentos = brutos.map(converterProduto).filter(a => a !== null);
        if (alimentos.length > 0) return alimentos;
      } catch (erro) {
        console.error('Falha em ' + url, erro);
      }
    }
    return [];
  }
 
  async function buscarNaApi(termo) {
    status.textContent = 'Buscando "' + termo + '"...';
    lista.innerHTML = '';
 
    const alimentos = await consultarProdutos(termo);
 
    if (alimentos.length === 0) {
      filtrarCategoria('todos');          // volta a mostrar a lista local
      status.textContent = 'Nenhum resultado para "' + termo + '" (ou a API está fora do ar agora). Mostrando a lista local.';
      return;
    }
    tituloLista.textContent = 'Resultados para "' + termo + '"';
    status.textContent = alimentos.length + ' resultado(s) encontrados na Open Food Facts.';
    desenhar(alimentos, true);
  }
 
  formBusca.addEventListener('submit', evento => {
    evento.preventDefault();
    const termo = campoBusca.value.trim();
    if (termo.length < 2) {
      status.textContent = 'Digite pelo menos 2 caracteres para buscar.';
      return;
    }
    buscarNaApi(termo);
  });
 
  filtrarCategoria('todos');
}
 
// =========================================================
//  PÁGINA: PLANEJAMENTO (planejamento.html)
// =========================================================
const ROTULOS_DIA = {
  seg: 'Segunda-feira', ter: 'Terça-feira', qua: 'Quarta-feira', qui: 'Quinta-feira',
  sex: 'Sexta-feira', sab: 'Sábado', dom: 'Domingo'
};
 
// Cada refeição: [hora, tipo, nome, kcal, proteínas (g), carboidratos (g), gorduras (g)]
// Dados demonstrativos.
const PLANO_PADRAO = {
  seg: [
    ['07:30', 'Café da manhã', 'Pão integral com ovo mexido', 340, 18, 36, 12],
    ['12:30', 'Almoço', 'Arroz, feijão e filé de frango', 560, 40, 66, 14],
    ['16:00', 'Lanche', 'Banana com pasta de amendoim', 250, 7, 32, 11],
    ['20:00', 'Jantar', 'Omelete de legumes com salada', 380, 24, 14, 24]
  ],
  ter: [
    ['07:30', 'Café da manhã', 'Tapioca com queijo e café com leite', 330, 14, 42, 11],
    ['12:30', 'Almoço', 'Carne moída com purê e brócolis', 580, 38, 58, 22],
    ['16:00', 'Lanche', 'Iogurte natural com mel', 180, 9, 28, 4],
    ['20:00', 'Jantar', 'Sopa de feijão com legumes', 400, 20, 54, 11]
  ],
  qua: [
    ['07:30', 'Café da manhã', 'Overnight oats com banana', 380, 14, 62, 9],
    ['12:30', 'Almoço', 'Frango grelhado, quinoa e legumes', 540, 42, 52, 16],
    ['16:00', 'Lanche', 'Iogurte, frutas e granola', 260, 12, 38, 7],
    ['20:00', 'Jantar', 'Sopa de legumes com torradas', 420, 28, 32, 20]
  ],
  qui: [
    ['07:30', 'Café da manhã', 'Vitamina de frutas com aveia', 320, 12, 52, 7],
    ['12:30', 'Almoço', 'Salmão assado com arroz integral', 600, 40, 55, 24],
    ['16:00', 'Lanche', 'Mix de castanhas e uma maçã', 270, 6, 28, 15],
    ['20:00', 'Jantar', 'Wrap de frango com salada', 410, 30, 38, 14]
  ],
  sex: [
    ['07:30', 'Café da manhã', 'Pão com queijo branco e mamão', 310, 15, 40, 9],
    ['12:30', 'Almoço', 'Feijoada leve com couve e laranja', 620, 36, 60, 24],
    ['16:00', 'Lanche', 'Queijo minas com goiabada', 230, 10, 30, 7],
    ['20:00', 'Jantar', 'Pizza de frigideira com salada', 450, 22, 46, 20]
  ],
  sab: [
    ['08:30', 'Café da manhã', 'Panqueca de banana com aveia', 350, 13, 52, 10],
    ['13:00', 'Almoço', 'Macarrão ao sugo com frango desfiado', 650, 38, 84, 14],
    ['16:30', 'Lanche', 'Frutas picadas com iogurte', 200, 8, 36, 3],
    ['20:00', 'Jantar', 'Sanduíche natural de atum', 380, 28, 36, 12]
  ],
  dom: [
    ['09:00', 'Café da manhã', 'Ovos mexidos com torrada integral', 340, 20, 28, 16],
    ['13:00', 'Almoço', 'Strogonoff de frango leve com arroz', 640, 40, 70, 20],
    ['16:00', 'Lanche', 'Bolo de cenoura (1 fatia)', 280, 5, 42, 11],
    ['20:00', 'Jantar', 'Caldo verde leve', 360, 16, 38, 15]
  ]
};
 
// Transforma as listas acima em objetos (mais fáceis de editar)
function criarPlanoPadrao() {
  const plano = {};
  for (const dia in PLANO_PADRAO) {
    plano[dia] = PLANO_PADRAO[dia].map(([hora, tipo, nome, kcal, p, c, g]) => ({ hora, tipo, nome, kcal, p, c, g }));
  }
  return plano;
}
 
function iniciarPlanejamento() {
  const listaPlano = document.getElementById('lista-plano');
  if (!listaPlano) return;
 
  const botoesDia = document.querySelectorAll('[data-dia]');
  let plano = lerJson(CHAVE_PLANO, null) || criarPlanoPadrao();
  let diaAtual = 'qua';
 
  function desenharDia() {
    const refeicoesDoDia = plano[diaAtual] || [];
    listaPlano.innerHTML = '';
 
    refeicoesDoDia.forEach((item, indice) => {
      listaPlano.append(criar('article', {}, [
        criar('time', { datetime: item.hora, texto: item.hora }),
        criar('span', { texto: item.tipo }),
        criar('h3', { texto: item.nome }),
        criar('span', { texto: formatarNumero(item.kcal) + ' kcal' }),
        criar('button', { type: 'button', texto: 'Editar', onclick: () => editarRefeicao(indice) })
      ]));
    });
 
    // totais do dia
    const kcal = refeicoesDoDia.reduce((soma, item) => soma + item.kcal, 0);
    const proteinas = refeicoesDoDia.reduce((soma, item) => soma + item.p, 0);
    const carboidratos = refeicoesDoDia.reduce((soma, item) => soma + item.c, 0);
    const gorduras = refeicoesDoDia.reduce((soma, item) => soma + item.g, 0);
 
    definirTexto('plano-dia-nome', ROTULOS_DIA[diaAtual].toUpperCase());
    definirTexto('plano-kcal', formatarNumero(kcal) + ' kcal previstas');
    definirTexto('meta-kcal', formatarNumero(kcal));
    definirTexto('meta-proteinas', formatarNumero(proteinas) + ' g');
    definirTexto('meta-carboidratos', formatarNumero(carboidratos) + ' g');
    definirTexto('meta-gorduras', formatarNumero(gorduras) + ' g');
 
    const barra = document.getElementById('meta-barra');
    if (barra) {
      barra.max = META_CALORIAS;
      barra.value = kcal;
      barra.textContent = kcal + ' kcal';
    }
 
    // botão do dia selecionado fica destacado
    botoesDia.forEach(botao => {
      const ativo = botao.dataset.dia === diaAtual;
      botao.classList.toggle('ativo', ativo);
      botao.setAttribute('aria-pressed', String(ativo));
    });
  }
 
  function editarRefeicao(indice) {
    const item = plano[diaAtual][indice];
    const novoNome = prompt('Nome da refeição:', item.nome);
    if (novoNome === null) return;                 // clicou em Cancelar
    const novasKcal = prompt('Calorias (kcal):', item.kcal);
    if (novasKcal === null) return;
 
    const kcal = parseFloat(String(novasKcal).replace(',', '.'));
    if (novoNome.trim().length < 2 || isNaN(kcal) || kcal < 0) {
      mostrarMensagem('Informe um nome (mínimo 2 letras) e calorias válidas.', 'erro');
      return;
    }
 
    item.nome = novoNome.trim();
    item.kcal = kcal;
    salvarJson(CHAVE_PLANO, plano);
    desenharDia();
    mostrarMensagem('Refeição atualizada!', 'sucesso');
  }
 
  botoesDia.forEach(botao => {
    botao.addEventListener('click', () => {
      diaAtual = botao.dataset.dia;
      desenharDia();
    });
  });
 
  desenharDia();
 
  // ----- Lista de compras (marcados ficam salvos) -----
  const listaCompras = document.getElementById('lista-compras');
  if (listaCompras) {
    const caixas = listaCompras.querySelectorAll('input[type="checkbox"]');
    const marcados = lerJson(CHAVE_COMPRAS, []);
 
    const atualizarCompras = () => {
      const nomesMarcados = [];
      caixas.forEach(caixa => {
        if (caixa.checked) nomesMarcados.push(caixa.parentElement.textContent.trim());
      });
      salvarJson(CHAVE_COMPRAS, nomesMarcados);
      definirTexto('compras-contador', nomesMarcados.length + '/' + caixas.length);
    };
 
    caixas.forEach(caixa => {
      caixa.checked = marcados.includes(caixa.parentElement.textContent.trim());
      caixa.addEventListener('change', atualizarCompras);
    });
    atualizarCompras();
  }
}
 
// =========================================================
//  PÁGINA: PROGRESSO (progresso.html)
// =========================================================
// Dados demonstrativos da semana de 10 a 16 de junho.
// Todos os totais e médias da página são CALCULADOS a partir desta lista,
// então nunca ficam diferentes da tabela.
const DADOS_SEMANA = [
  { dia: 'Segunda', curto: 'Seg', kcal: 1428, prot: 82, agua: 2.0 },
  { dia: 'Terça', curto: 'Ter', kcal: 1722, prot: 98, agua: 2.2 },
  { dia: 'Quarta', curto: 'Qua', kcal: 1596, prot: 91, agua: 1.8 },
  { dia: 'Quinta', curto: 'Qui', kcal: 1932, prot: 112, agua: 2.3 },
  { dia: 'Sexta', curto: 'Sex', kcal: 1302, prot: 68, agua: 1.5 },
  { dia: 'Sábado', curto: 'Sáb', kcal: 1806, prot: 104, agua: 2.1 },
  { dia: 'Domingo', curto: 'Dom', kcal: 1512, prot: 84, agua: 1.7 }
];
 
function formatarAgua(litros) {
  return litros.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' L';
}
 
function avaliarDia(dia) {
  if (dia.agua < 1.6) return 'Atenção';
  if (dia.prot >= 95) return 'Excelente';
  return 'Bom';
}
 
function iniciarProgresso() {
  const corpoTabela = document.getElementById('tabela-semana');
  if (!corpoTabela) return;
 
  const quantidade = DADOS_SEMANA.length;
  const totalKcal = DADOS_SEMANA.reduce((soma, d) => soma + d.kcal, 0);
  const mediaKcal = totalKcal / quantidade;
  const mediaProteina = DADOS_SEMANA.reduce((soma, d) => soma + d.prot, 0) / quantidade;
  const mediaAgua = DADOS_SEMANA.reduce((soma, d) => soma + d.agua, 0) / quantidade;
  const diasRegistrados = DADOS_SEMANA.filter(d => d.kcal > 0).length;
 
  // cartões "Resumo Geral"
  definirTexto('resumo-media', formatarNumero(Math.round(mediaKcal)) + ' kcal');
  definirTexto('resumo-dias', diasRegistrados + ' de ' + quantidade);
  definirTexto('resumo-meta', Math.round((mediaKcal / META_CALORIAS) * 100) + '%');
  definirTexto('resumo-agua', formatarAgua(mediaAgua));
 
  // lista "Calorias por dia"
  const listaGrafico = document.getElementById('grafico-calorias');
  if (listaGrafico) {
    listaGrafico.innerHTML = '';
    DADOS_SEMANA.forEach(d => {
      listaGrafico.append(criar('li', {}, [d.curto + ': ', criar('strong', { texto: formatarNumero(d.kcal) + ' kcal' })]));
    });
  }
 
  // tabela do relatório
  corpoTabela.innerHTML = '';
  DADOS_SEMANA.forEach(d => {
    corpoTabela.append(criar('tr', {}, [
      criar('td', { texto: d.dia }),
      criar('td', { texto: formatarNumero(d.kcal) + ' kcal' }),
      criar('td', { texto: d.prot + ' g' }),
      criar('td', { texto: formatarAgua(d.agua) }),
      criar('td', { texto: avaliarDia(d) })
    ]));
  });
 
  // cartões do relatório
  definirTexto('relatorio-total', formatarNumero(totalKcal) + ' kcal');
  definirTexto('relatorio-media', 'Média de ' + formatarNumero(Math.round(mediaKcal)) + '/dia');
  definirTexto('relatorio-proteina', Math.round(mediaProteina) + ' g/dia');
  definirTexto('relatorio-proteina-meta', Math.round((mediaProteina / META_PROTEINA) * 100) + '% da meta');
 
  // filtro de período: só temos dados de 7 dias
  const periodo = document.getElementById('periodo');
  const aviso = document.getElementById('aviso-periodo');
  if (periodo && aviso) {
    periodo.addEventListener('change', () => {
      aviso.hidden = periodo.value === '7dias';
      aviso.textContent = 'Os dados demonstrativos cobrem só os últimos 7 dias, por isso o relatório continua mostrando a semana de 10 a 16 de junho.';
    });
  }
 
  aoClicar('botao-imprimir', () => window.print());
}
 
// =========================================================
//  INICIALIZAÇÃO
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  carregar();
  iniciarDiario();
  iniciarBiblioteca();
  iniciarPlanejamento();
  iniciarProgresso();
});