// arquivo: apps/alocado/vwLstAlocado.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('alocadoListagem');
  var alertBox = document.getElementById('alocadoAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesAlocado();
  vwGetAllAlocados(servidorDw3, alertBox);
});

// Busca todas as alocações no backend (API getAllAlocados)
async function vwGetAllAlocados(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllAlocados', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de alocações.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaAlocado(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar alocações.');
    inicializarTabelaAlocado([]);
  }
}

function inicializarTabelaAlocado(alocados) {
  new DataTable('#tblAlocado', {
    data: alocados,
    columns: [
      { data: 'alocadoid', defaultContent: '' },
      { data: 'animalnome', defaultContent: '' },
      { data: 'piquetedescricao', defaultContent: '' },
      {
        data: 'datainicio',
        defaultContent: '',
        render: function(data, type) {
          // Mostra no formato brasileiro, mas ordena pela data original (AAAA-MM-DD)
          return type === 'display' ? dw3FormatarData(data) : data;
        }
      },
      {
        data: 'datafinal',
        defaultContent: '',
        render: function(data, type) {
          if (type !== 'display') {
            return data || '9999-12-31'; // Alocações em andamento ficam por último ao ordenar
          }

          if (!data) {
            return '<span class="badge text-bg-success">No piquete</span>';
          }

          return dw3FormatarData(data);
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

          var alocadoId = dw3EscaparHtml(row.alocadoid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações da alocação">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-alocadoid="' + alocadoId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-alocadoid="' + alocadoId + '" title="Alterar" aria-label="Alterar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-alocadoid="' + alocadoId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    order: [[3, 'desc']],
    language: dw3IdiomaDataTable
  });
}

// Abre o formulário de acordo com o botão clicado na tabela
function configurarOperacoesAlocado() {
  var tabela = document.getElementById('tblAlocado');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-alocadoid]');

    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var alocadoId = encodeURIComponent(botao.dataset.alocadoid);

    if (action === 'visualizar') {
      window.location.href = '/alocado/form?oper=Re&alocadoId=' + alocadoId;
      return;
    }

    if (action === 'atualizar') {
      window.location.href = '/alocado/form?oper=Up&alocadoId=' + alocadoId;
      return;
    }

    if (action === 'remover') {
      window.location.href = '/alocado/form?oper=De&alocadoId=' + alocadoId;
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
