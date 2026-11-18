//-- arquivo: apps/alocado/controller/ctlAlocado.js

const mdlAlocado = require("../model/mdlAlocado");

//@ Elimina a parte final de uma data como essa: 2000-01-23T01:23:45.123
const FormataDatas = (registro) => {
  for (let i = 0; i < registro.length; i++) {
    const row = registro[i];
    if (row.datainicio) {
      row.datainicio = row.datainicio.toISOString().split("T")[0];
    }
    if (row.datafinal) {
      row.datafinal = row.datafinal.toISOString().split("T")[0];
    }
  }
  return registro;
};

const GetAllAlocados = (req, res) =>
  (async () => {
    let registro = await mdlAlocado.GetAllAlocados();
    res.json({ status: "ok", registro: FormataDatas(registro) });
  })();

const GetAlocadoByID = (req, res) =>
  (async () => {
    const alocadoID = parseInt(req.params.alocadoid);
    let registro = await mdlAlocado.GetAlocadoByID(alocadoID);
    res.json({ status: "ok", registro: FormataDatas(registro) });
  })();

const GetAnimaisToAlocado = (req, res) =>
  (async () => {
    let registro = await mdlAlocado.GetAnimaisToAlocado();
    res.json({ status: "ok", registro: registro });
  })();

const GetPiquetesToAlocado = (req, res) =>
  (async () => {
    let registro = await mdlAlocado.GetPiquetesToAlocado();
    res.json({ status: "ok", registro: registro });
  })();

const InsertAlocado = (request, res) =>
  (async () => {
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocado.InsertAlocado(alocadoREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const UpdateAlocado = (request, res) =>
  (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocado.UpdateAlocado(alocadoID, alocadoREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const DeleteAlocado = (request, res) =>
  (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    let { msg, linhasAfetadas } = await mdlAlocado.DeleteAlocado(alocadoID);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

module.exports = {
  GetAllAlocados,
  GetAlocadoByID,
  GetAnimaisToAlocado,
  GetPiquetesToAlocado,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};
