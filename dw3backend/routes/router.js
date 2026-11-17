//-- arquivo: routes/router.js

const express = require("express");
const routerApp = express.Router();

// middleware that is specific to this router
routerApp.use((req, res, next) => {
  next();
});

routerApp.get("/", (req, res) => {
  res.send("Servidor backend do pastejo rotacionado!");
});

//@ Rotas de Pasto

//@ Rotas de Piquete

//@ Rotas de Animal

//@ Rotas de Alocado

//@ Rota Login

module.exports = routerApp;
