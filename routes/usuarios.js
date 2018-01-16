import { Buffer } from "buffer";

module.exports = app => {
  
  const Usuario = app.models.usuario;

  app.route("/usuarios").all((req, res, next) => {
    next();
  }).post((req, res) => {
    if(!req.body.nome || !req.body.senha || !req.body.email || !req.body.perfil_id) {
      return res.status(400).json({ message: "Campos requeridos não informados!" });
    }
    let dados = Usuario.criar(req.body.nome, req.body.senha, req.body.email, req.body.perfil_id);
    return res.status((dados != {} ? 201 : 500)).json(dados);
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
  
    console.log("=============================");
    console.log(dataValInfo.getTime());
    console.log(Date.now().valueOf());
    console.log("=============================");
    if (dataValInfo.getTime() < Date.now().valueOf()) {
      return res.status(400).json({ isValidated: false });
    }

    let resultadoValidacao = Usuario.validar(usuMail, dataValInfo);
    //return res.status(501).json(dataValInfo);
    return res.status((resultadoValidacao.isValidated?200:400)).json(resultadoValidacao);
  });
};