import { Buffer } from "buffer";

module.exports = app => {
  
  const Usuario = app.models.usuario;

  app.route("/usuarios").all((req, res, next) => {
    next();
  }).post((req, res) => {
    if(!req.body.nome || !req.body.senha || !req.body.email || !req.body.perfil_id) {
      return res.status(400).json({ message: "Campos requeridos não informados!" });
    }
    Usuario.criar(req.body.nome, req.body.senha, req.body.email, req.body.perfil_id).then((dados) => {
      return res.status(dados && dados != {} ? 201 : 500).json(dados);
    }).catch((ern) => {
      return res.status(500).json(ern);
    });
  });

  app.post("/login", (req, res) => {
    let cracha = Usuario.logar(req.body.email, req.body.senha);
    console.log(cracha.rows);
    if(!cracha || cracha === 'erro'){
      return res.status(500).json(cracha);
    }

    if(cracha === {}){
      return res.status(404).send(false);
    }

    if(cracha && cracha.rowCount > 0 && cracha.rows[0].senha === req.body.senha) {
      if (cracha.rows[0].senha) {
        console.log("Não deveria, mas veio com a senha...");
        delete cracha.rows[0].senha;
      }
      return res.status(200).json(cracha.rows[0]);
    }
    return res.status(401).json({});
  });

  app.post("/valida-cadastro", (req, res) => {
    if (!req.query.email || !req.query.validade) {
      return res.status(400).json({ isValidated: false });
    }
    let usuMail = new Buffer(req.query.email, 'base64').toString();
    let usuVal = new Buffer(req.query.validade, 'base64').toString();
    let dataValInfo =  new Date(Date.parse(usuVal));
  
    if (dataValInfo.getTime() < Date.now().valueOf()) {
      return res.status(400).json({ isValidated: false });
    }

    Usuario.validar(usuMail, dataValInfo).then(resultadoValidacao => {
      return res.status((resultadoValidacao.code || 501)).json(resultadoValidacao);
    }).catch((er) => {
      return res.status(500).json(er);
    });
  });
};