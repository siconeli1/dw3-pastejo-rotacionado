//-- arquivo: routes/rtAnimal.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('animal/vwLstAnimal', {
    title: 'Animais',
    showNavbar: true,
    activeMenu: 'animal',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois o front em html não tem acesso ao arquivo .env
  });
});

router.get('/form', function(req, res) {
  res.render('animal/vwFormAnimal', {
    title: 'Formulário de animais',
    showNavbar: true,
    activeMenu: 'animal',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
