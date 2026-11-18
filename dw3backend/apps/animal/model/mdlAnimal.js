//-- arquivo: apps/animal/model/mdlAnimal.js

const db = require("../../../database/databaseconfig");

const GetAllAnimais = async () => {
  return (
    await db.query(
      "SELECT * " + "FROM animal where removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetAnimalByID = async (animalIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM animal WHERE animalid = $1 and removido = false ORDER BY nome ASC",
      [animalIDPar]
    )
  ).rows;
};

const InsertAnimal = async (registroPar) => {
  //@ A variável msg é usada para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO animal " + "values(default, $1, $2, $3)",
        [
          registroPar.nome,
          registroPar.datanasc,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal|InsertAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateAnimal = async (animalIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET " +
          "nome = $2, " +
          "datanasc = $3, " +
          "removido = $4 " +
          "WHERE animalid = $1",
        [
          animalIDPar,
          registroPar.nome,
          registroPar.datanasc,
          registroPar.removido,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal|UpdateAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteAnimal = async (animalIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET " + "removido = true " + "WHERE animalid = $1",
        [animalIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal|DeleteAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAnimais,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};
