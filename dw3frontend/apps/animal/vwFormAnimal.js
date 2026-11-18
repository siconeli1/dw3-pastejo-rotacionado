// arquivo: apps/animal/vwFormAnimal.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmAnimal');

  if (!form) {
    return;
  }

  // A data de nascimento não pode ser maior que a data de hoje.
  document.getElementById('datanasc').max = dw3DataDeHoje();

  // oper: Cr = inserir, Re = visualizar, Up = atualizar, De = remover
  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get('oper') || parametros.get('Oper');
  var titulo = document.getElementById('tituloForm');

  if (oper === 'Cr') {
    titulo.textContent = 'Novo animal';
    var btnInserir = document.getElementById('btnInserirAnimal');
    btnInserir.classList.remove('d-none'); // Torna o botão visível.
    btnInserir.addEventListener('click', function() {
      vwInsertAnimal();
    });
  }

  if (oper === 'Re') {
    titulo.textContent = 'Visualizar animal';
    await vwGetAnimalByID();
    bloquearCampos();
  }

  if (oper === 'Up') {
    titulo.textContent = 'Alterar animal';
    var btnAtualizar = document.getElementById('btnAtualizarAnimal');
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = !(await vwGetAnimalByID());
    btnAtualizar.addEventListener('click', function() {
      vwUpdateAnimal();
    });
  }

  if (oper === 'De') {
    titulo.textContent = 'Remover animal';
    var btnRemover = document.getElementById('btnRemoverAnimal');
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = !(await vwGetAnimalByID());
    bloquearCampos();
    btnRemover.addEventListener('click', function() {
      vwDeleteAnimal();
    });
  }
});

// Na visualização e na remoção os campos ficam somente leitura
function bloquearCampos() {
  document.getElementById('nome').readOnly = true;
  document.getElementById('datanasc').readOnly = true;
}

function obterAnimalIdDaUrl() {
  var animalId = new URLSearchParams(window.location.search).get('animalId');

  if (!animalId || !/^\d+$/.test(animalId) || Number(animalId) <= 0) {
    throw new Error('ID do animal inválido.');
  }

  return animalId;
}

function montarAnimalDoFormulario() {
  return {
    nome: document.getElementById('nome').value.trim(),
    datanasc: document.getElementById('datanasc').value,
    removido: document.getElementById('removido').value === 'true'
  };
}

// Busca o animal pelo ID (API getAnimalByID) e preenche o formulário
async function vwGetAnimalByID() {
  var form = document.getElementById('frmAnimal');

  try {
    var animalId = obterAnimalIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;

    var response = await fetch(servidorDw3 + '/getAnimalByID/' + encodeURIComponent(animalId), {
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o animal.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return false;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var animal = data.registro[0];

    if (!animal) {
      throw new Error('Animal não encontrado.');
    }

    document.getElementById('animalid').value = animal.animalid;
    document.getElementById('nome').value = animal.nome ?? '';
    document.getElementById('datanasc').value = animal.datanasc ? animal.datanasc.slice(0, 10) : '';
    document.getElementById('removido').value = String(animal.removido === true);

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar animal.');
    return false;
  }
}

// Envia um novo animal para o backend (API insertAnimal)
async function vwInsertAnimal() {
  var form = document.getElementById('frmAnimal');
  var btnInserir = document.getElementById('btnInserirAnimal');

  if (!form.reportValidity()) {
    return;
  }

  try {
    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + '/insertAnimal', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAnimalDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível inserir o animal.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível inserir o animal.');
    }

    alert('Animal inserido com sucesso.');
    window.location.href = '/animal';
  } catch (error) {
    alert(error.message || 'Erro ao inserir animal.');
  } finally {
    btnInserir.disabled = false;
  }
}

// Envia os dados alterados para o backend (API updateAnimal)
async function vwUpdateAnimal() {
  var form = document.getElementById('frmAnimal');
  var btnAtualizar = document.getElementById('btnAtualizarAnimal');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var animalId = obterAnimalIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnAtualizar.disabled = true;

    var response = await fetch(servidorDw3 + '/updateAnimal/' + encodeURIComponent(animalId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAnimalDoFormulario())
    });

    if (!response.ok) {
      throw new Error('Não foi possível atualizar o animal.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível atualizar o animal.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum animal foi atualizado.');
    }

    alert('Animal atualizado com sucesso.');
    window.location.href = '/animal';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar animal.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

// Remove o animal (API deleteAnimal). No backend é feito soft delete.
async function vwDeleteAnimal() {
  var form = document.getElementById('frmAnimal');
  var btnRemover = document.getElementById('btnRemoverAnimal');

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm('Confirma a remoção deste animal?')) {
    return;
  }

  try {
    var animalId = obterAnimalIdDaUrl();
    var servidorDw3 = form.dataset.servidorDw3;
    btnRemover.disabled = true;

    var response = await fetch(servidorDw3 + '/deleteAnimal/' + encodeURIComponent(animalId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível remover o animal.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok') {
      throw new Error(data.status || 'Não foi possível remover o animal.');
    }

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum animal foi removido.');
    }

    alert('Animal removido com sucesso.');
    window.location.href = '/animal';
  } catch (error) {
    alert(error.message || 'Erro ao remover animal.');
  } finally {
    btnRemover.disabled = false;
  }
}
