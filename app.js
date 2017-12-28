import express from 'express';
import consign from 'consign';

const app = express();

consign().include("db").then("routes").into(app);

app.listen(3000, () => {
  console.log('App rodando!');
})