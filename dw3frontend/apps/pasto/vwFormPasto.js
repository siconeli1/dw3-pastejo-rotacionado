// arquivo: apps/pasto/vwFormPasto.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPasto');

  if (!form) {
    return;
  }

  // oper: Cr = inserir, Re = visualizar, Up = atualizar, De = remover
  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var titulo = document.getElementById('tituloForm');

  if (oper === 'Cr') {
    titulo.textContent = 'Novo pasto';
    var btnInserir = document.getElementById('btnInserirPasto');
    btnInserir.classList.remove('d-none'); // Torna o botão visível.
    btnInserir.addEventListener('click', function() {
      vwInsertPasto();
    });
  }

  if (oper === 'Re') {
    titulo.textContent = 'Visualizar pasto';
    await vwGetPastoByID();
    bloquearCampos();
  }

  if (oper === 'Up') {
    titulo.textContent = 'Alterar pasto';
    var btnAtualizar = document.getElementById('btnAtualizarPasto');
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetPastoByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePasto();
    });
  }

  if (oper === 'De') {
    titulo.textContent = 'Remover pasto';
    var btnRemover = document.getElementById('btnRemoverPasto');
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = !(await vwGetPastoByID());
    bloquearCampos();
    btnRemover.addEventListener('click', function() {
      vwDeletePasto();
    });
  }
});

// Na visualização e na remoção os campos ficam somente leitura
function bloquearCampos() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('areatotal').readOnly = true;
}

function obterPastoIdDaUrl() {
  var pastoId = new URLSearchParams(window.location.search).get('pastoId');

  if (!pastoId || !/^\d+$/.test(pastoId) || Number(pastoId) <= 0) {
    throw new Error('ID do pasto inválido.');
  }

  return pastoId;
}

function montarPastoDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value.trim(),
    areatotal: Number(document.getElementById('areatotal').value),
    removido: document.getElementById('removido').value === 'true'
  };
}

// Busca o pasto pelo ID (API getPastoByID) e preenche o formulário
async function vwGetPastoByID() {
  var form = document.getElementById('frmPasto');

  try {
    var pastoId = obterPastoIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    var response = await fetch(servidorDw3 + '/getPastoByID/' + encodeURIComponent(pastoId), {
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o pasto.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var pasto = data.registro[0];

    if (!pasto) {
      throw new Error('Pasto não encontrado.');
    }

    document.getElementById('pastoid').value = pasto.pastoid;
    document.getElementById('descricao').value = pasto.descricao ?? '';
    document.getElementById('areatotal').value = pasto.areatotal ?? '';
    document.getElementById('removido').value = String(pasto.removido === true);

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar pasto.');
    return false;
  }
}

// Envia um novo pasto para o backend (API insertPasto)
async function vwInsertPasto() {
  var form = document.getElementById('frmPasto');
  var btnInserir = document.getElementById('btnInserirPasto');

  if (!form.reportValidity()) {
    return;
  }

  try {
    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + '/insertPasto', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPastoDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível inserir o pasto.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir o pasto.');
    }

    alert('Pasto inserido com sucesso.');
    window.location.href = '/pasto';
  } catch (error) {
    alert(error.message || 'Erro ao inserir pasto.');
  } finally {
    btnInserir.disabled = false;
  }
}

// Envia os dados alterados para o backend (API updatePasto)
async function vwUpdatePasto() {
  var form = document.getElementById('frmPasto');
  var btnAtualizar = document.getElementById('btnAtualizarPasto');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var pastoId = obterPastoIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnAtualizar.disabled = true;

    var response = await fetch(servidorDw3 + '/updatePasto/' + encodeURIComponent(pastoId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPastoDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível atualizar o pasto.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar o pasto.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum pasto foi atualizado.');
    }

    alert('Pasto atualizado com sucesso.');
    window.location.href = '/pasto';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar pasto.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

// Remove o pasto (API deletePasto). No backend é feito soft delete.
async function vwDeletePasto() {
  var form = document.getElementById('frmPasto');
  var btnRemover = document.getElementById('btnRemoverPasto');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção deste pasto?')) {
    return;
  }

  try {
    var pastoId = obterPastoIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deletePasto/' + encodeURIComponent(pastoId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível remover o pasto.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover o pasto.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum pasto foi removido.');
    }

    alert('Pasto removido com sucesso.');
    window.location.href = '/pasto';
  } catch (error) {
    alert(error.message || 'Erro ao remover pasto.');
  } finally {
    btnRemover.disabled = false;
  }
}
