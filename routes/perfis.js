// Operações HTTP com os perfis (DEMO)
module.exports = (app) => {
  
  const Perfis = app.models.perfil;

  app.get('/perfis', (req, res) => {
    Perfis.findAll().then((data) => {
      
      if(data.name === 'error') {
        // Retorna um JSON no seguinte formato:
        //   { error: <mensagem-de-erro> }
        res.status(500).json(data);
      }

      if(data.rows && data.rowCount < 1) {
        res.status(404).json(data.rows);
      }

      if(data.rows && data.rowCount > 0) {
        // Retorna os dados conforme o esperado
        res.status(200).json(data.rows);
      }

    });
  });
  
  app.get('/perfis/search', (req, res) => {
    
    console.log(req.query);

    if(req.query.nome == null || req.query.nome === '') {
      res.json({ mensagem: "manda alguma coisa aí, rapá!" });
    }
    
    Perfis.pesquisarPorNome(req.query.nome).then(resp => { 
      
      if(resp.name === 'error') {
        res.status(500).json(resp);
      }
      else if(resp.rowCount && resp.rowCount < 1) {
        res.status(404).json(resp.rows);
      }
      else {
        res.status(200).json(resp.rows);
      }
    });
  });
};