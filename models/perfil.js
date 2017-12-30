module.exports = app => {
  return {
    pesquisarPorNome: (nome) => {
      let qry = 'SELECT * FROM newsdaily.perfil WHERE nome LIKE $1';
      let qryParams = [`%${nome}%`];
      let data = app.conecta_ai.consultar(qry, qryParams).catch((erro) => {
        return erro;
      });
      
      return data;
    },
    findAll: () => {
      let dados = app.conecta_ai.consultar('SELECT * FROM newsdaily.perfil', []).catch((err) => {
        return err;
      });

      return dados;
    }
  };
};