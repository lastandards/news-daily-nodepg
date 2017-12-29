import consign from 'consign';
import express from 'express';

const app = express();

// A chave 'verbose' oculta os logs do consign
consign({verbose: false})
  .include("conecta_ai.js")
  .then("models")
  .then("config/middlewares.js")
  .then("routes")
  .then("config/boot.js")
  .into(app);