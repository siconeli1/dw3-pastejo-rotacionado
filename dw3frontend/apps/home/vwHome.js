// arquivo: apps/home/vwHome.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) { // Função em ./public/js/dw3frontend.js que verifica se o cookie IsLogged existe.
    return;
  }

  var nomeUsuario = document.getElementById('nomeUsuario');
  var username = localStorage.getItem('username');

  if (nomeUsuario && username) {
    nomeUsuario.textContent = username;
  }
});
