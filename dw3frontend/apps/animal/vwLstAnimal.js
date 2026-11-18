// arquivo: apps/animal/vwLstAnimal.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('animalListagem');
  var alertBox = document.getElementById('animalAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesAnimal();
  vwGetAllAnimais(servidorDw3, alertBox);
});

// Busca todos os animais no backend (API getAllAnimais)
async function vwGetAllAnimais(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllAnimais', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de animais.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaAnimal(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar animais.');
    inicializarTabelaAnimal([]);
  }
}

function inicializarTabelaAnimal(animais) {
  new DataTable('#tblAnimal', {
    data: animais,
    columns: [
      { data: 'animalid', defaultContent: '' },
      { data: 'nome', defaultContent: '' },
      {
        data: 'datanasc',
        defaultContent: '',
        render: function(data, type) {
          // Mostra no formato brasileiro, mas ordena pela data original (AAAA-MM-DD)
          return type === 'display' ? dw3FormatarData(data) : data;
        }
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function(data, type, row) {
          if (type !== 'display') {
            return '';
          }

          var animalId = dw3EscaparHtml(row.animalid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do animal">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-animalid="' + animalId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-animalid="' + animalId + '" title="Alterar" aria-label="Alterar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-animalid="' + animalId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    order: [[1, 'asc']],
    language: dw3IdiomaDataTable
  });
}

// Abre o formulário de acordo com o botão clicado na tabela
function configurarOperacoesAnimal() {
  var tabela = document.getElementById('tblAnimal');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-animalid]');

    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var animalId = encodeURIComponent(botao.dataset.animalid);

    if (action === 'visualizar') {
      window.location.href = '/animal/form?oper=Re&animalId=' + animalId;
      return;
    }

    if (action === 'atualizar') {
      window.location.href = '/animal/form?oper=Up&animalId=' + animalId;
      return;
    }

    if (action === 'remover') {
      window.location.href = '/animal/form?oper=De&animalId=' + animalId;
    }
  });
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('d-none');
}
