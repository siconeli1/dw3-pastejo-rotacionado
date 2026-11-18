//-- arquivo: routes/router.js

const express = require("express");
const routerApp = express.Router();

const appPasto = require("../apps/pasto/controller/ctlPasto");
const appPiquete = require("../apps/piquete/controller/ctlPiquete");
const appAnimal = require("../apps/animal/controller/ctlAnimal");
const appLogin = require("../apps/login/controller/ctlLogin");

// middleware that is specific to this router
routerApp.use((req, res, next) => {
  next();
});

routerApp.get("/", (req, res) => {
  res.send("Servidor backend do pastejo rotacionado!");
});

//@ Rotas de Pasto
routerApp.get("/getAllPastos", appLogin.AutenticaJWT, appPasto.GetAllPastos);
routerApp.get("/getPastoByID/:pastoid", appLogin.AutenticaJWT, appPasto.GetPastoByID);
routerApp.post("/insertPasto", appLogin.AutenticaJWT, appPasto.InsertPasto);
routerApp.put("/updatePasto/:pastoid", appLogin.AutenticaJWT, appPasto.UpdatePasto);
routerApp.delete("/deletePasto/:pastoid", appLogin.AutenticaJWT, appPasto.DeletePasto);

//@ Rotas de Piquete
routerApp.get("/getAllPiquetes", appLogin.AutenticaJWT, appPiquete.GetAllPiquetes);
routerApp.get("/getPiqueteByID/:piqueteid", appLogin.AutenticaJWT, appPiquete.GetPiqueteByID);
routerApp.get("/getPastosToPiquete", appLogin.AutenticaJWT, appPiquete.GetPastosToPiquete);
routerApp.post("/insertPiquete", appLogin.AutenticaJWT, appPiquete.InsertPiquete);
routerApp.put("/updatePiquete/:piqueteid", appLogin.AutenticaJWT, appPiquete.UpdatePiquete);
routerApp.delete("/deletePiquete/:piqueteid", appLogin.AutenticaJWT, appPiquete.DeletePiquete);

//@ Rotas de Animal
routerApp.get("/getAllAnimais", appLogin.AutenticaJWT, appAnimal.GetAllAnimais);
routerApp.get("/getAnimalByID/:animalid", appLogin.AutenticaJWT, appAnimal.GetAnimalByID);
routerApp.post("/insertAnimal", appLogin.AutenticaJWT, appAnimal.InsertAnimal);
routerApp.put("/updateAnimal/:animalid", appLogin.AutenticaJWT, appAnimal.UpdateAnimal);
routerApp.delete("/deleteAnimal/:animalid", appLogin.AutenticaJWT, appAnimal.DeleteAnimal);

//@ Rotas de Alocado

//@ Rota Login
routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

module.exports = routerApp;
