// Operações HTTP com os perfis (DEMO)
module.exports = (app) => {
  app.get('/', (req, res, next) => {
    res.json({raiz :"Pasta raiz"});
  });
}