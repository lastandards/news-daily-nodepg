// Operações HTTP com os perfis (DEMO)
module.exports = (app) => {
  
  const Perfis = app.models.perfil;

  app.get('/perfis', (req, res, next) => {
    Perfis.findAll().then((resp) => {
      console.log(resp.rows)
      res.json(resp.rows);
    });
  });
  app.get('/perfis/search', (req, res) => {
    
    console.log(req.query);

    if(req.query.nome == null || req.query.nome === '') {
      res.json({ mensagem: "manda alguma coisa aí, rapá!" });
    }
    
    Perfis.pesquisarPorNome(req.query.nome).then(resp => { 
      res.json(resp.rows); 
    });
  });
}