//-- arquivo: routes/rtPasto.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('pasto/vwLstPasto', {
    title: 'Pastos',
    showNavbar: true,
    activeMenu: 'pasto',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois o front em html não tem acesso ao arquivo .env
  });
});

router.get('/form', function(req, res) {
  res.render('pasto/vwFormPasto', {
    title: 'Formulário de pastos',
    showNavbar: true,
    activeMenu: 'pasto',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
