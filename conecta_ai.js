import { Client, Pool } from "pg";
import dbconfig from "./config/manhattan_connection";

let db = null;

module.exports = (app) => {
  
  if(!db) {

    console.log(dbconfig);
    const piscina = new Pool(dbconfig);

    //client.connect();
    piscina.query('SELECT VERSION()', (err, res) => {
    
      // Se houver um erro, entra no if abaixo
      if(err) {
        console.log("OoOoops! Um erro.");
        console.log(err.message);
        console.log("Stacktrace--");
        console.log(err.stack);
      }
      else {
        console.log(res.rows[0].version);
      }
    });
    
    // Exporta o módulo `db`
    db = {
      consultar: (text, params, callback) => {
        return piscina.query(text, params, callback);
      }
    };
  }
  return db;

};