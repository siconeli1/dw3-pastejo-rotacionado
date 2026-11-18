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

function dw3FormatarData(data) {
  // Converte 2026-11-01 para 01/11/2026
  if (!data) {
    return '';
  }

  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}
