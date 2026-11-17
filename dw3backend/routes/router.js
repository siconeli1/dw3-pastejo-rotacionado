//-- arquivo: routes/router.js

const express = require("express");
const routerApp = express.Router();

const appLogin = require("../apps/login/controller/ctlLogin");

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
routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

module.exports = routerApp;
