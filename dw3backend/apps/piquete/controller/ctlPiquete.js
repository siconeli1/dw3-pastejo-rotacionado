//-- arquivo: apps/piquete/controller/ctlPiquete.js

const mdlPiquete = require("../model/mdlPiquete");

const GetAllPiquetes = (req, res) =>
  (async () => {
    let registro = await mdlPiquete.GetAllPiquetes();
    res.json({ status: "ok", registro: registro });
  })();

const GetPiqueteByID = (req, res) =>
  (async () => {
    const piqueteID = parseInt(req.params.piqueteid);
    let registro = await mdlPiquete.GetPiqueteByID(piqueteID);
    res.json({ status: "ok", registro: registro });
  })();

const GetPastosToPiquete = (req, res) =>
  (async () => {
    let registro = await mdlPiquete.GetPastosToPiquete();
    res.json({ status: "ok", registro: registro });
  })();

const InsertPiquete = (request, res) =>
  (async () => {
    const piqueteREG = request.body;
    let { msg, linhasAfetadas } = await mdlPiquete.InsertPiquete(piqueteREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const UpdatePiquete = (request, res) =>
  (async () => {
    const piqueteID = parseInt(request.params.piqueteid);
    const piqueteREG = request.body;
    let { msg, linhasAfetadas } = await mdlPiquete.UpdatePiquete(piqueteID, piqueteREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const DeletePiquete = (request, res) =>
  (async () => {
    const piqueteID = parseInt(request.params.piqueteid);
    let { msg, linhasAfetadas } = await mdlPiquete.DeletePiquete(piqueteID);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

module.exports = {
  GetAllPiquetes,
  GetPiqueteByID,
  GetPastosToPiquete,
  InsertPiquete,
  UpdatePiquete,
  DeletePiquete,
};
