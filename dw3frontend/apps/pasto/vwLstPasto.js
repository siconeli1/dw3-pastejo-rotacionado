// arquivo: apps/pasto/vwLstPasto.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('pastoListagem');
  var alertBox = document.getElementById('pastoAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3; // data-servidor-dw3 vira dataset.servidorDw3

  configurarOperacoesPasto();
  vwGetAllPastos(servidorDw3, alertBox);
});

// Busca todos os pastos no backend (API getAllPastos)
async function vwGetAllPastos(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllPastos', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de pastos.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaPasto(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar pastos.');
    inicializarTabelaPasto([]);
  }
}

function inicializarTabelaPasto(pastos) {
  new DataTable('#tblPasto', {
    data: pastos,
    columns: [
      { data: 'pastoid', defaultContent: '' },
      { data: 'descricao', defaultContent: '' },
      {
        data: 'areatotal',
        defaultContent: '',
        render: function(data) {
          return dw3FormatarNumero(data, 2);
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

          var pastoId = dw3EscaparHtml(row.pastoid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do pasto">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-pastoid="' + pastoId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-pastoid="' + pastoId + '" title="Alterar" aria-label="Alterar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-pastoid="' + pastoId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
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
function configurarOperacoesPasto() {
  var tabela = document.getElementById('tblPasto');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-pastoid]');

    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var pastoId = encodeURIComponent(botao.dataset.pastoid);

    if (action === 'visualizar') {
      window.location.href = '/pasto/form?oper=Re&pastoId=' + pastoId;
      return;
    }

    if (action === 'atualizar') {
      window.location.href = '/pasto/form?oper=Up&pastoId=' + pastoId;
      return;
    }

    if (action === 'remover') {
      window.location.href = '/pasto/form?oper=De&pastoId=' + pastoId;
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
