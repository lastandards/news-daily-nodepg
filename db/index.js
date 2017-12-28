import { Client } from "pg";

// Cria uma nova conexão com o banco
const client = new Client({
  user: 'ndadmin',
  host: '172.17.0.1',
  database: 'datand',
  password: '123',
  port: 5432
});

client.connect();
client.query('SELECT VERSION()', (err, res) => {

  // Se houver um erro, entra no if abaixo
  if(err) {
    console.log("OoOoops! Um erro.");
    console.log(err.message);
    console.log("Stacktrace--");
    console.log(err.stack);
  }
  else {
    // No sucesso ao conectar no banco, exibe a versão do banco
    console.log(res.rows[0].version);
  }
  // TODO: Verificar se é necessário realizar o fechamento das conexões manualmente
  //client.end();
});

// Exporta o módulo `db`
module.exports = {
  conn: client,
  query: (text, params, callback) => {
    return client.query(text, params, callback);
  }
}