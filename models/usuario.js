module.exports = app => {
  return {
    criar: (nome, senha, email, perfil_id) => {
      let cadastro = 'INSERT INTO newsdaily.usuario (nome, senha, email, perfil_id) VALUES ($1, $2, $3, $4)';
      let vl_cadastro = [nome, senha, email, perfil_id];
      let dados = app.conecta_ai.consultar(cadastro, vl_cadastro).catch(erro => {
        return erro;
      });
      return dados;
    },
    
    alterar: () => {
      let dados = app.conecta_ai.consultar('SELECT * FROM newsdaily.usuario', []).catch(erro => {
        return erro;
      });
      return dados;
    },

    excluir: () => {
      let dados = app.conecta_ai.consultar('SELECT * FROM newsdaily.usuario', []).catch(erro => {
        return erro;
      });
      return dados;
    },

    logar: (email, senha) => {
      let putaqui = 'SELECT u.nome AS nome, u.email AS email, u.senha AS senha, p.nome AS perfil_acessso, p.descricao AS descricao_perfil FROM newsdaily.usuario AS u INNER JOIN newsdaily.perfil AS p ON u.perfil_id = p.id_perfil WHERE email = $1';
      let dados = app.conecta_ai.consultar(putaqui, [email]).catch(erro => {
        return erro;
      });

      if(dados.rows instanceof Array) {
        console.log("instância de um array..")
        dados = dados.rows
      }
      return dados;
    }
  };
};