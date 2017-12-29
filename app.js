import express from 'express';
import consign from 'consign';

const app = express();

consign()
  .include("conecta_ai.js")
  .then("models")
  .then("config/middlewares.js")
  .then("routes")
  .then("config/boot.js")
  .into(app);
