// arquivo: apps/login/vwLogin.js

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('loginForm');
  var errorBox = document.getElementById('loginError');

  if (!form) {
    return;
  }

  var servidorDw3 = form.dataset.servidorDw3; // Valor que vem de routes/rtLogin.js

  // Ao abrir a tela de login (inclusive pelo menu Sair), encerra a sessão anterior.
  if (dw3ClearIsLoggedCookie()) {
    vwLogout(servidorDw3);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('username');

  // Submete os dados de Login
  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    var usuario = document.getElementById('usuario').value;
    var senha = document.getElementById('senha').value;
    var submitButton = form.querySelector('button[type="submit"]');

    if (errorBox) {
      errorBox.classList.add('d-none');
      errorBox.textContent = '';
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Entrando...';
    }

    try {
      var response = await fetch(servidorDw3 + '/Login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          username: usuario,
          password: senha
        })
      });

      if (!response.ok) {
        throw new Error('Não foi possível acessar o servidor.');
      }

      var data = await response.json();

      if (!data.token) {
        // O backend retorna a mensagem do erro: usuário não identificado ou login inválido.
        throw new Error(data.message || 'Usuário ou senha inválidos.');
      }

      localStorage.setItem('token', data.token); // Salva o token para ser usado nas chamadas ao backend.
      localStorage.setItem('username', data.username || usuario);
      document.cookie = 'IsLogged=true; path=/'; // Usado para verificar se o usuário está ou não logado.

      window.location.href = '/home';
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || 'Não foi possível realizar o login.';
        errorBox.classList.remove('d-none');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
      }
    }
  });
});

async function vwLogout(servidorDw3) {
  // Avisa o backend que o usuário saiu do sistema.
  try {
    await fetch(servidorDw3 + '/Logout', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
    });
  } catch (error) {
    // Mesmo que o backend não responda, a sessão local já foi encerrada.
  }
}
