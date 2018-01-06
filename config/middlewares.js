import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

module.exports = (app) => {
  // Fazer: Pesquisar como verificar se uma porta está em uso
  app.set("THE_DOOR", 3000);
  app.use(cors({
    origin: ["http://google.com.br"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.set("json spaces", 2);
  app.use(bodyParser.json());
  app.use(express.static("public"));
};