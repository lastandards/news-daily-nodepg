import { Pool } from "pg";
import dbconfig from "./config/manhattan_connection";

let db = null;

module.exports = () => {
  
  if(!db) {

    const piscina = new Pool(dbconfig);

    piscina.query('SELECT VERSION() AS versao, CURRENT_TIMESTAMP AS datahora', (err, res) => {
    
      // Se houver um erro, entra no if abaixo
      if(err) {
        // Ṕara evitar erro de many connections, será necessário por enquanto o uso de:
        // - sudo -u ndadmin psql datand -c "<comando>", para rodar algum comando desejado
        console.error("OoOoops! Um erro.");
        console.error(err.message);
      }
      else {
        console.info('Hora: ' + res.rows[0].datahora + '\nVersão do banco: ' + res.rows[0].versao);
      }
    });
    
    // Exporta o módulo `db`
    db = {
      consultar: (text, params, callback) => piscina.query(text, params, callback)
    };
  }

  return db;
};