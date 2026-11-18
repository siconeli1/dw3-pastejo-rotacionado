// arquivo: apps/piquete/vwLstPiquete.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('piqueteListagem');
  var alertBox = document.getElementById('piqueteAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesPiquete();
  vwGetAllPiquetes(servidorDw3, alertBox);
});

// Busca todos os piquetes no backend (API getAllPiquetes)
async function vwGetAllPiquetes(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllPiquetes', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de piquetes.');
    }

    var data = await response.json();

    if (!dw3VerificarSessao(data)) {
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaPiquete(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar piquetes.');
    inicializarTabelaPiquete([]);
  }
}

function inicializarTabelaPiquete(piquetes) {
  new DataTable('#tblPiquete', {
    data: piquetes,
    columns: [
      { data: 'piqueteid', defaultContent: '' },
      { data: 'descricao', defaultContent: '' },
      { data: 'pastodescricao', defaultContent: '' },
      { data: 'latitude', defaultContent: '' },
      { data: 'longitude', defaultContent: '' },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function(data, type, row) {
          var link = dw3LinkMapa(row.latitude, row.longitude);

          if (type !== 'display' || !link) {
            return '';
          }

          return '<a class="btn btn-sm btn-outline-secondary" href="' + dw3EscaparHtml(link) + '" target="_blank" rel="noopener" title="Ver no mapa" aria-label="Ver no mapa"><i class="bi bi-geo-alt"></i></a>';
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

          var piqueteId = dw3EscaparHtml(row.piqueteid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do piquete">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-piqueteid="' + piqueteId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-piqueteid="' + piqueteId + '" title="Alterar" aria-label="Alterar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-piqueteid="' + piqueteId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
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
function configurarOperacoesPiquete() {
  var tabela = document.getElementById('tblPiquete');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-piqueteid]');

    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var piqueteId = encodeURIComponent(botao.dataset.piqueteid);

    if (action === 'visualizar') {
      window.location.href = '/piquete/form?oper=Re&piqueteId=' + piqueteId;
      return;
    }

    if (action === 'atualizar') {
      window.location.href = '/piquete/form?oper=Up&piqueteId=' + piqueteId;
      return;
    }

    if (action === 'remover') {
      window.location.href = '/piquete/form?oper=De&piqueteId=' + piqueteId;
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
