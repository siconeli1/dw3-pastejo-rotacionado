//-- arquivo: apps/alocado/model/mdlAlocado.js

const db = require("../../../database/databaseconfig");

const GetAllAlocados = async () => {
  return (
    await db.query(
      "SELECT *, " +
        "(SELECT nome from animal where animalid = alocado.animalidifk) as animalnome, " +
        "(SELECT descricao from piquete where piqueteid = alocado.piqueteidfk) as piquetedescricao " +
        "FROM alocado where removido = false ORDER BY datainicio DESC"
    )
  ).rows;
};

const GetAlocadoByID = async (alocadoIDPar) => {
  return (
    await db.query(
      "SELECT *, " +
        "(SELECT nome from animal where animalid = alocado.animalidifk) as animalnome, " +
        "(SELECT descricao from piquete where piqueteid = alocado.piqueteidfk) as piquetedescricao " +
        "FROM alocado WHERE alocadoid = $1 and removido = false ORDER BY datainicio DESC",
      [alocadoIDPar]
    )
  ).rows;
};

//@ Usado para preencher o select de animais no formulário de alocado
const GetAnimaisToAlocado = async () => {
  return (
    await db.query(
      "select animalid, nome from animal where removido = false ORDER BY nome ASC"
    )
  ).rows;
};

//@ Usado para preencher o select de piquetes no formulário de alocado
const GetPiquetesToAlocado = async () => {
  return (
    await db.query(
      "select piqueteid, descricao from piquete where removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const InsertAlocado = async (registroPar) => {
  //@ A variável msg é usada para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO alocado " + "values(default, $1, $2, $3, $4, $5)",
        [
          registroPar.animalidifk,
          registroPar.piqueteidfk,
          registroPar.datainicio,
          registroPar.datafinal || null, // data final pode ficar em aberto
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado|InsertAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateAlocado = async (alocadoIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET " +
          "animalidifk = $2, " +
          "piqueteidfk = $3, " +
          "datainicio = $4, " +
          "datafinal = $5, " +
          "removido = $6 " +
          "WHERE alocadoid = $1",
        [
          alocadoIDPar,
          registroPar.animalidifk,
          registroPar.piqueteidfk,
          registroPar.datainicio,
          registroPar.datafinal || null,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado|UpdateAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteAlocado = async (alocadoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET " + "removido = true " + "WHERE alocadoid = $1",
        [alocadoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado|DeleteAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAlocados,
  GetAlocadoByID,
  GetAnimaisToAlocado,
  GetPiquetesToAlocado,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};
