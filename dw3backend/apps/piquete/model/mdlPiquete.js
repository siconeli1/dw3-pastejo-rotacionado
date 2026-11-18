//-- arquivo: apps/piquete/model/mdlPiquete.js

const db = require("../../../database/databaseconfig");

const GetAllPiquetes = async () => {
  return (
    await db.query(
      "SELECT *, (SELECT descricao from pasto where pastoid = piquete.pastoidfk) as pastodescricao " +
        "FROM piquete where removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const GetPiqueteByID = async (piqueteIDPar) => {
  return (
    await db.query(
      "SELECT *, (SELECT descricao from pasto where pastoid = piquete.pastoidfk) as pastodescricao " +
        "FROM piquete WHERE piqueteid = $1 and removido = false ORDER BY descricao ASC",
      [piqueteIDPar]
    )
  ).rows;
};

//@ Usado para preencher o select de pastos no formulário de piquete
const GetPastosToPiquete = async () => {
  return (
    await db.query(
      "select pastoid, descricao from pasto where removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const InsertPiquete = async (registroPar) => {
  //@ A variável msg é usada para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO piquete " + "values(default, $1, $2, $3, $4, $5)",
        [
          registroPar.descricao,
          registroPar.latitude,
          registroPar.longitude,
          registroPar.pastoidfk,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete|InsertPiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePiquete = async (piqueteIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET " +
          "descricao = $2, " +
          "latitude = $3, " +
          "longitude = $4, " +
          "pastoidfk = $5, " +
          "removido = $6 " +
          "WHERE piqueteid = $1",
        [
          piqueteIDPar,
          registroPar.descricao,
          registroPar.latitude,
          registroPar.longitude,
          registroPar.pastoidfk,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete|UpdatePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePiquete = async (piqueteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET " + "removido = true " + "WHERE piqueteid = $1",
        [piqueteIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete|DeletePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPiquetes,
  GetPiqueteByID,
  GetPastosToPiquete,
  InsertPiquete,
  UpdatePiquete,
  DeletePiquete,
};
