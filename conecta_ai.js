import { Pool } from "pg";
import dbconfig from "./config/manhattan_connection";

let db = null;

module.exports = () => {
  
  if(!db) {

    const piscina = new Pool(dbconfig);

    piscina.query('SELECT VERSION()', (err, res) => {
    
      // Se houver um erro, entra no if abaixo
      if(err) {
        console.log("OoOoops! Um erro.");
        console.log(err.message);
        console.log("Stacktrace--");
        console.log(err.stack);
      }else {
        console.log(res.rows[0].version);
      }
    });
    
    // Exporta o módulo `db`
    db = {
      consultar: (text, params, callback) => piscina.query(text, params, callback)
    };
  }

  return db;
};