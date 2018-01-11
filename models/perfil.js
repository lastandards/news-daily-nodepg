module.exports = app => {
  return {
    pesquisarPorNome: (nome) => {
      let qry = 'SELECT * FROM newsdaily.perfil WHERE nome LIKE $1';
      let qryParams = [`%${nome}%`];
      return app.conecta_ai.consultar(qry, qryParams).then(data => {
        return data.rows;
      }).catch((erro) => {
        return erro;
      });
    },
    findAll: () => {
      return app.conecta_ai.consultar('SELECT * FROM newsdaily.perfil', []).then(dados => {
        return dados.rows;
      }).catch((err) => {
        return err;
      });
    }
  };
};