// arquivo: apps/alocado/vwFormAlocado.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmAlocado');

  if (!form) {
    return;
  }

  var servidorDw3 = form.dataset.servidorDw3;

  inicializarSelects();
  configurarDatas();

  // oper: Cr = inserir, Re = visualizar, Up = atualizar, De = remover
  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var titulo = document.getElementById('tituloForm');

  if (oper === 'Cr') {
    titulo.textContent = 'Nova alocação';
    var btnInserir = document.getElementById('btnInserirAlocado');
    btnInserir.classList.remove('d-none'); // Torna o botão visível.
    document.getElementById('datainicio').value = dw3DataDeHoje();
    atualizarDataMinima();
    await Promise.all([
      vwGetAnimaisToAlocado(servidorDw3),
      vwGetPiquetesToAlocado(servidorDw3)
    ]);
    btnInserir.addEventListener('click', function() {
      vwInsertAlocado();
    });
  }

  if (oper === 'Re') {
    titulo.textContent = 'Visualizar alocação';
    await vwGetAlocadoByID();
    bloquearCampos();
  }

  if (oper === 'Up') {
    titulo.textContent = 'Alterar alocação';
    var btnAtualizar = document.getElementById('btnAtualizarAlocado');
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetAlocadoByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdateAlocado();
    });
  }

  if (oper === 'De') {
    titulo.textContent = 'Remover alocação';
    var btnRemover = document.getElementById('btnRemoverAlocado');
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = !(await vwGetAlocadoByID());
    bloquearCampos();
    btnRemover.addEventListener('click', function() {
      vwDeleteAlocado();
    });
  }
});

// Aqui são inicializados os componentes Select2 em branco
function inicializarSelects() {
  $('#animalidifk').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um animal',
    width: '100%'
  });

  $('#piqueteidfk').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um piquete',
    width: '100%'
  });
}

// A data final não pode ser anterior à data de início
function configurarDatas() {
  document.getElementById('datainicio').addEventListener('change', atualizarDataMinima);
}

function atualizarDataMinima() {
  document.getElementById('datafinal').min = document.getElementById('datainicio').value;
}

// Na visualização e na remoção os campos ficam somente leitura
function bloquearCampos() {
  document.getElementById('datainicio').readOnly = true;
  document.getElementById('datafinal').readOnly = true;
  $('#animalidifk').prop('disabled', true);
  $('#piqueteidfk').prop('disabled', true);
}

function obterAlocadoIdDaUrl() {
  var alocadoId = new URLSearchParams(window.location.search).get('alocadoId');

  if (!alocadoId || !/^\d+$/.test(alocadoId) || Number(alocadoId) <= 0) {
    throw new Error('ID da alocação inválido.');
  }

  return alocadoId;
}

function montarAlocadoDoFormulario() {
  return {
    animalidifk: Number(document.getElementById('animalidifk').value),
    piqueteidfk: Number(document.getElementById('piqueteidfk').value),
    datainicio: document.getElementById('datainicio').value,
    datafinal: document.getElementById('datafinal').value || null, // em branco = animal ainda no piquete
    removido: document.getElementById('removido').value === 'true'
  };
}

function preencherSelect(id, registros, campoValor, campoTexto, textoVazio) {
  var select = document.getElementById(id);

  select.innerHTML = '<option value="">' + textoVazio + '</option>';

  registros.forEach(function(registro) {
    var option = document.createElement('option');
    option.value = registro[campoValor];
    option.textContent = registro[campoTexto];
    select.appendChild(option);
  });

  $('#' + id).trigger('change');
}

// Busca os animais (API getAnimaisToAlocado) para preencher o Select2
async function vwGetAnimaisToAlocado(servidorDw3) {
  try {
    var response = await fetch(servidorDw3 + '/getAnimaisToAlocado', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar os animais.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    preencherSelect('animalidifk', data.registro, 'animalid', 'nome', 'Selecione um animal');
  } catch (error) {
    alert(error.message || 'Erro ao carregar animais.');
  }
}

// Busca os piquetes (API getPiquetesToAlocado) para preencher o Select2
async function vwGetPiquetesToAlocado(servidorDw3) {
  try {
    var response = await fetch(servidorDw3 + '/getPiquetesToAlocado', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar os piquetes.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    preencherSelect('piqueteidfk', data.registro, 'piqueteid', 'descricao', 'Selecione um piquete');
  } catch (error) {
    alert(error.message || 'Erro ao carregar piquetes.');
  }
}

// Valida os campos obrigatórios e se a data final não é anterior à de início
function validarAlocado(form) {
  if (!dw3ValidarFormulario(form)) {
    return false;
  }

  var datainicio = document.getElementById('datainicio').value;
  var datafinal = document.getElementById('datafinal').value;

  if (datafinal && datafinal < datainicio) {
    alert('A data final não pode ser anterior à data de início.');
    document.getElementById('datafinal').focus();
    return false;
  }

  return true;
}

// Busca a alocação pelo ID (API getAlocadoByID) e preenche o formulário
async function vwGetAlocadoByID() {
  var form = document.getElementById('frmAlocado');

  try {
    var alocadoId = obterAlocadoIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    var response = await fetch(servidorDw3 + '/getAlocadoByID/' + encodeURIComponent(alocadoId), {
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a alocação.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var alocado = data.registro[0];

    if (!alocado) {
      throw new Error('Alocação não encontrada.');
    }

    document.getElementById('alocadoid').value = alocado.alocadoid;
    document.getElementById('datainicio').value = alocado.datainicio ? alocado.datainicio.slice(0, 10) : '';
    document.getElementById('datafinal').value = alocado.datafinal ? alocado.datafinal.slice(0, 10) : '';
    document.getElementById('removido').value = String(alocado.removido === true);
    atualizarDataMinima();

    // Carrega os componentes Select2 e marca os valores da alocação.
    await Promise.all([
      vwGetAnimaisToAlocado(servidorDw3),
      vwGetPiquetesToAlocado(servidorDw3)
    ]);
    $('#animalidifk').val(alocado.animalidifk).trigger('change');
    $('#piqueteidfk').val(alocado.piqueteidfk).trigger('change');

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar alocação.');
    return false;
  }
}

// Envia uma nova alocação para o backend (API insertAlocado)
async function vwInsertAlocado() {
  var form = document.getElementById('frmAlocado');
  var btnInserir = document.getElementById('btnInserirAlocado');

  if (!validarAlocado(form)) {
    return;
  }

  try {
    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + '/insertAlocado', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAlocadoDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível inserir a alocação.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir a alocação.');
    }

    alert('Alocação inserida com sucesso.');
    window.location.href = '/alocado';
  } catch (error) {
    alert(error.message || 'Erro ao inserir alocação.');
  } finally {
    btnInserir.disabled = false;
  }
}

// Envia os dados alterados para o backend (API updateAlocado)
async function vwUpdateAlocado() {
  var form = document.getElementById('frmAlocado');
  var btnAtualizar = document.getElementById('btnAtualizarAlocado');

  if (btnAtualizar.disabled || !validarAlocado(form)) {
    return;
  }

  try {
    var alocadoId = obterAlocadoIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnAtualizar.disabled = true;

    var response = await fetch(servidorDw3 + '/updateAlocado/' + encodeURIComponent(alocadoId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAlocadoDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível atualizar a alocação.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar a alocação.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma alocação foi atualizada.');
    }

    alert('Alocação atualizada com sucesso.');
    window.location.href = '/alocado';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar alocação.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

// Remove a alocação (API deleteAlocado). No backend é feito soft delete.
async function vwDeleteAlocado() {
  var form = document.getElementById('frmAlocado');
  var btnRemover = document.getElementById('btnRemoverAlocado');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção desta alocação?')) {
    return;
  }

  try {
    var alocadoId = obterAlocadoIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deleteAlocado/' + encodeURIComponent(alocadoId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível remover a alocação.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover a alocação.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma alocação foi removida.');
    }

    alert('Alocação removida com sucesso.');
    window.location.href = '/alocado';
  } catch (error) {
    alert(error.message || 'Erro ao remover alocação.');
  } finally {
    btnRemover.disabled = false;
  }
}
