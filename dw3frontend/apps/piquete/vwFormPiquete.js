// arquivo: apps/piquete/vwFormPiquete.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPiquete');

  if (!form) {
    return;
  }

  var servidorDw3 = form.dataset.servidorDw3;

  inicializarSelectPastos();
  configurarLinkMapa();

  // oper: Cr = inserir, Re = visualizar, Up = atualizar, De = remover
  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var titulo = document.getElementById('tituloForm');

  if (oper === 'Cr') {
    titulo.textContent = 'Novo piquete';
    var btnInserir = document.getElementById('btnInserirPiquete');
    btnInserir.classList.remove('d-none'); // Torna o botão visível.
    await vwGetPastosToPiquete(servidorDw3);
    btnInserir.addEventListener('click', function() {
      vwInsertPiquete();
    });
  }

  if (oper === 'Re') {
    titulo.textContent = 'Visualizar piquete';
    await vwGetPiqueteByID();
    bloquearCampos();
  }

  if (oper === 'Up') {
    titulo.textContent = 'Alterar piquete';
    var btnAtualizar = document.getElementById('btnAtualizarPiquete');
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetPiqueteByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePiquete();
    });
  }

  if (oper === 'De') {
    titulo.textContent = 'Remover piquete';
    var btnRemover = document.getElementById('btnRemoverPiquete');
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = !(await vwGetPiqueteByID());
    bloquearCampos();
    btnRemover.addEventListener('click', function() {
      vwDeletePiquete();
    });
  }
});

// Aqui é inicializado o componente Select2 em branco
function inicializarSelectPastos() {
  $('#pastoidfk').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um pasto',
    width: '100%'
  });
}

// Atualiza o botão "Ver no mapa" sempre que a latitude ou a longitude mudam
function configurarLinkMapa() {
  var latitude = document.getElementById('latitude');
  var longitude = document.getElementById('longitude');

  latitude.addEventListener('input', atualizarLinkMapa);
  longitude.addEventListener('input', atualizarLinkMapa);
}

function atualizarLinkMapa() {
  var lnkMapa = document.getElementById('lnkMapa');
  var link = dw3LinkMapa(
    document.getElementById('latitude').value,
    document.getElementById('longitude').value
  );

  lnkMapa.href = link || '#';
  lnkMapa.classList.toggle('disabled', !link);
}

// Na visualização e na remoção os campos ficam somente leitura
function bloquearCampos() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('latitude').readOnly = true;
  document.getElementById('longitude').readOnly = true;
  $('#pastoidfk').prop('disabled', true);
}

function obterPiqueteIdDaUrl() {
  var piqueteId = new URLSearchParams(window.location.search).get('piqueteId');

  if (!piqueteId || !/^\d+$/.test(piqueteId) || Number(piqueteId) <= 0) {
    throw new Error('ID do piquete inválido.');
  }

  return piqueteId;
}

function montarPiqueteDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value.trim(),
    latitude: Number(document.getElementById('latitude').value),
    longitude: Number(document.getElementById('longitude').value),
    pastoidfk: Number(document.getElementById('pastoidfk').value),
    removido: document.getElementById('removido').value === 'true'
  };
}

// Busca os pastos (API getPastosToPiquete) para preencher o Select2
async function vwGetPastosToPiquete(servidorDw3) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getPastosToPiquete', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar os pastos.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    preencherSelectPastos(data.registro);
  } catch (error) {
    alert(error.message || 'Erro ao carregar pastos.');
  }
}

function preencherSelectPastos(pastos) {
  var pastoSelect = document.getElementById('pastoidfk');

  pastoSelect.innerHTML = '<option value="">Selecione um pasto</option>';

  pastos.forEach(function(pasto) {
    var option = document.createElement('option');
    option.value = pasto.pastoid;
    option.textContent = pasto.descricao;
    pastoSelect.appendChild(option);
  });

  $('#pastoidfk').trigger('change');
}

// Busca o piquete pelo ID (API getPiqueteByID) e preenche o formulário
async function vwGetPiqueteByID() {
  var form = document.getElementById('frmPiquete');

  try {
    var piqueteId = obterPiqueteIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    var response = await fetch(servidorDw3 + '/getPiqueteByID/' + encodeURIComponent(piqueteId), {
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o piquete.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var piquete = data.registro[0];

    if (!piquete) {
      throw new Error('Piquete não encontrado.');
    }

    document.getElementById('piqueteid').value = piquete.piqueteid;
    document.getElementById('descricao').value = piquete.descricao ?? '';
    document.getElementById('latitude').value = piquete.latitude ?? '';
    document.getElementById('longitude').value = piquete.longitude ?? '';
    document.getElementById('removido').value = String(piquete.removido === true);
    atualizarLinkMapa();

    await vwGetPastosToPiquete(servidorDw3); // Carrega o componente Select2.
    $('#pastoidfk').val(piquete.pastoidfk).trigger('change');

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar piquete.');
    return false;
  }
}

// Envia um novo piquete para o backend (API insertPiquete)
async function vwInsertPiquete() {
  var form = document.getElementById('frmPiquete');
  var btnInserir = document.getElementById('btnInserirPiquete');

  if (!dw3ValidarFormulario(form)) {
    return;
  }

  try {
    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + '/insertPiquete', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPiqueteDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível inserir o piquete.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir o piquete.');
    }

    alert('Piquete inserido com sucesso.');
    window.location.href = '/piquete';
  } catch (error) {
    alert(error.message || 'Erro ao inserir piquete.');
  } finally {
    btnInserir.disabled = false;
  }
}

// Envia os dados alterados para o backend (API updatePiquete)
async function vwUpdatePiquete() {
  var form = document.getElementById('frmPiquete');
  var btnAtualizar = document.getElementById('btnAtualizarPiquete');

  if (btnAtualizar.disabled || !dw3ValidarFormulario(form)) {
    return;
  }

  try {
    var piqueteId = obterPiqueteIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnAtualizar.disabled = true;

    var response = await fetch(servidorDw3 + '/updatePiquete/' + encodeURIComponent(piqueteId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPiqueteDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível atualizar o piquete.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar o piquete.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum piquete foi atualizado.');
    }

    alert('Piquete atualizado com sucesso.');
    window.location.href = '/piquete';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar piquete.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

// Remove o piquete (API deletePiquete). No backend é feito soft delete.
async function vwDeletePiquete() {
  var form = document.getElementById('frmPiquete');
  var btnRemover = document.getElementById('btnRemoverPiquete');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção deste piquete?')) {
    return;
  }

  try {
    var piqueteId = obterPiqueteIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deletePiquete/' + encodeURIComponent(piqueteId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível remover o piquete.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover o piquete.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum piquete foi removido.');
    }

    alert('Piquete removido com sucesso.');
    window.location.href = '/piquete';
  } catch (error) {
    alert(error.message || 'Erro ao remover piquete.');
  } finally {
    btnRemover.disabled = false;
  }
}
