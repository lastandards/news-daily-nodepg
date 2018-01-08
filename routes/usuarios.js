module.exports = app => {
  
  const Usuario = app.models.usuario;

  app.route("/usuarios").all((req, res, next) => {
    next();
  }).post((req, res) => {
    Usuario.criar(req.body.nome, req.body.senha, req.body.email, req.body.perfil_id).then((dados) => {
      //console.log(req.body || "Não retornou nada.");
      res.status(201).json(dados);
    });
  });

  app.post("/login", (req, res) =>{
    Usuario.logar(req.body.email, req.body.senha).then((cracha) => {
      console.log(cracha.rows);
      if(!cracha.rows || cracha.name === 'erro'){
        res.status(500).json(cracha);
        return;
      }

      if(cracha.rows && cracha.rowCount < 1){
        res.status(404).send(false);
        return;
      }

      if(cracha.rows && cracha.rowCount > 0 && cracha.rows[0].senha === req.body.senha){
        delete cracha.rows[0].senha;
        res.status(200).json(cracha.rows[0]);
        return;
      }
      else{
        res.status(401).send(false);
        return;
      }
    });
  });
}