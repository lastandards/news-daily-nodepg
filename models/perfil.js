module.exports = app =>{
  return {
    pesquisarPorNome: (nome) => {
      let data = app.conecta_ai.consultar('SELECT * FROM newsdaily.perfil WHERE nome LIKE $1', [`%${nome}%`]);
      return data;
    },
    findAll: () => {
      let dados = app.conecta_ai.consultar ('SELECT * FROM newsdaily.perfil', []);
      console.log(dados);
      return dados;
    }
  }
}