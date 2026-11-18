// arquivo: public/js/dw3frontend.js
// Funções usadas por todas as telas do sistema.

function dw3IsLogged() {
  // Verifica se o Cookie IsLogged existe.
  const isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (!isLogged) {
    window.location.href = '/login';
    return false;
  }

  return true;
}

function dw3ClearIsLoggedCookie() {
  // Limpa o Cookie IsLogged
  var isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (isLogged) {
    document.cookie = 'IsLogged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  return isLogged;
}

function dw3MontarHeadersAutenticacao(headers) {
  var token = localStorage.getItem('token');
  var finalHeaders = headers || {};

  if (token) {
    finalHeaders.Authorization = 'Bearer ' + token;
  }

  return finalHeaders;
}

function dw3OcultarBotao(id) {
  var botao = document.getElementById(id);

  if (botao) {
    botao.classList.add('d-none');
  }
}

function dw3VerificarSessao(data) {
  // Quando o JWT expira, o backend retorna auth = false. Nesse caso volta para o login.
  if (data && data.auth === false) {
    alert(data.message || 'Sessão expirada. Faça login novamente.');
    window.location.href = '/login';
    return false;
  }

  return true;
}

function dw3EscaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function dw3FormatarNumero(valor, casas) {
  // Formata números no padrão brasileiro: 1234.5 -> 1.234,50
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }

  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

// Textos do DataTables em português, usados em todas as listas do sistema.
var dw3IdiomaDataTable = {
  emptyTable: 'Nenhum registro cadastrado.',
  info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
  infoEmpty: 'Mostrando 0 até 0 de 0 registros',
  infoFiltered: '(filtrado de _MAX_ registros no total)',
  lengthMenu: 'Mostrar _MENU_ registros',
  loadingRecords: 'Carregando...',
  processing: 'Processando...',
  search: 'Pesquisar:',
  zeroRecords: 'Nenhum registro encontrado',
  paginate: {
    first: 'Primeiro',
    last: 'Último',
    next: 'Próximo',
    previous: 'Anterior'
  }
};

function dw3ValidarFormulario(form) {
  // Valida os campos obrigatórios do formulário.
  var invalido = form.querySelector(':invalid');

  if (!invalido) {
    return true;
  }

  // O Select2 esconde o select original, então o navegador não consegue mostrar o aviso nele.
  if (invalido.classList.contains('select2-hidden-accessible')) {
    var label = form.querySelector('label[for="' + invalido.id + '"]');
    alert('Selecione o campo ' + (label ? label.textContent : invalido.name) + '.');
    $(invalido).select2('open');
    return false;
  }

  form.reportValidity();
  return false;
}

function dw3LinkMapa(latitude, longitude) {
  // Monta o endereço do Google Maps para a coordenada informada.
  if (latitude === null || latitude === undefined || latitude === '' ||
      longitude === null || longitude === undefined || longitude === '') {
    return '';
  }

  return 'https://www.google.com/maps?q=' + encodeURIComponent(latitude + ',' + longitude);
}

function dw3DataDeHoje() {
  // Retorna a data de hoje no formato AAAA-MM-DD, usado nos campos do tipo date.
  var hoje = new Date();
  var mes = String(hoje.getMonth() + 1).padStart(2, '0');
  var dia = String(hoje.getDate()).padStart(2, '0');

  return hoje.getFullYear() + '-' + mes + '-' + dia;
}

function dw3FormatarData(data) {
  // Converte 2026-11-01 para 01/11/2026
  if (!data) {
    return '';
  }

  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}
