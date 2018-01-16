import bodyParser from "body-parser";
import cors from "cors";
//import express from "express";

module.exports = (app) => {
  // Fazer: Pesquisar como verificar se uma porta está em uso
  app.set("THE_DOOR", 3000);
  app.options(cors({
    origin: ["http://197.168.214.42:457"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.set("json spaces", 2);
  app.use(bodyParser.json());
  /*app.use((req, res, next) => {
    if('OPTIONS' === req.method) {
      res.header('Access-Control-Allow-Origins', 'http://google.com/');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.header('X-Powered-By', 'Your Mother');
      res.status(204);
    }

    delete req.body.id;
    res.header('X-Powered-By', 'Your Mother');
    next();
  });*/
  //app.use(express.static("public"));
};