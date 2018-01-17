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

  app.post("/autenticacao", (req, res) => {
    Usuario.logar(req.body.email, req.body.senha).then((caraCracha) => {
      if(caraCracha.name === 'erro'){
        return res.status(500).json(caraCracha);
      }
  
      if(caraCracha === {} || !caraCracha){
        return res.status(404).json(caraCracha);
      }
  
      if(caraCracha && !caraCracha.senha) {
        return res.status(200).json(caraCracha);
      }
      return res.status(401).json({});
    }).catch((e) => {
      return res.status(500).json(e);
    });
  });

  app.post("/validacao", (req, res) => {
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