import express from 'express';
import mountRoutes from './routes';
import { Client } from 'pg';

const app = express();
mountRoutes(app);

const client = new Client({
  user: 'ndadmin',
  host: '172.17.0.1',
  database: 'datand',
  password: '123',
  port: 5432
});

client.connect();
client.query('SELECT VERSION()', (err, res) => {
  if(err) {
    console.log("OoOoops! Um erro.");
    console.log(err.message);
    console.log("Stacktrace--");
    console.log(err.stack);
  }
  else {
    console.log(res.rows[0].version);
  }
  client.end();
});

app.listen(3000, () => {
  console.log('App rodando!');
})