//-- arquivo: apps/pasto/model/mdlPasto.js

const db = require("../../../database/databaseconfig");

const GetAllPastos = async () => {
  return (
    await db.query(
      "SELECT * " + "FROM pasto where removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const GetPastoByID = async (pastoIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM pasto WHERE pastoid = $1 and removido = false ORDER BY descricao ASC",
      [pastoIDPar]
    )
  ).rows;
};

const InsertPasto = async (registroPar) => {
  //@ A variável msg é usada para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO pasto " + "values(default, $1, $2, $3)",
        [
          registroPar.descricao,
          registroPar.areatotal,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto|InsertPasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePasto = async (pastoIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET " +
          "descricao = $2, " +
          "areatotal = $3, " +
          "removido = $4 " +
          "WHERE pastoid = $1",
        [
          pastoIDPar,
          registroPar.descricao,
          registroPar.areatotal,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto|UpdatePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePasto = async (pastoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET " + "removido = true " + "WHERE pastoid = $1",
        [pastoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto|DeletePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPastos,
  GetPastoByID,
  InsertPasto,
  UpdatePasto,
  DeletePasto,
};
