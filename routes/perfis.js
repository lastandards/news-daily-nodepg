import db from '../db';

// Operações HTTP com os perfis (DEMO)
module.exports = (app) => {
  app.get('/perfis', (req, res, next) => {
    
    //Cria uma pesquisa pelos perfis. O segundo atributo é o parâmetro WHERE;
    db.query('SELECT * FROM newsdaily.perfil', null, (err, result) => {
      
      //Se houver algum erro, cai no if abaixo
      if(err) {
        console.log("Falha ao realizar pesquisa. Descrição do erro:")
        return next(err);
      }

      //Ao realizar as pesquisas com sucesso...
      res.send(result.rows);

    }); // FIM db.query
  }); // FIM app.get /perfis
}