//-- arquivo: routes/rtPiquete.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('piquete/vwLstPiquete', {
    title: 'Piquetes',
    showNavbar: true,
    activeMenu: 'piquete',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois o front em html não tem acesso ao arquivo .env
  });
});

router.get('/form', function(req, res) {
  res.render('piquete/vwFormPiquete', {
    title: 'Formulário de piquetes',
    showNavbar: true,
    activeMenu: 'piquete',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
