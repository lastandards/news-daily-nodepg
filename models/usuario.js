import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

/*
 * TODO: Criar uma forma de inicializar o server em modo desenvolvedor com o ESLint 
 * mostrando as mudanças a serem feitas depois de carregado o servidor;
 * TODO: Implementar utilitário de envio de e-mails de confirmação
 * TODO: Implementar a comparação de senhas bcrypt do metodo login (abaixo)
 * TODO: Verificar a preferência entre um cadastro completo (de primeira) e um semi-cadastro
 * */
module.exports = app => {
  return {
    criar: (nome, senha, email, perfil_id) => {
      
      let cadastro = 'INSERT INTO newsdaily.tmp_usuario (nome, senha, email, perfil_id) VALUES ($1, $2, $3, $4)';
      let vl_cadastro = [nome, senha, email, perfil_id];
      
      /* BIZARRE SCENE da deep web... nem sei se isso realmente deveria existir 
         Tempero da senha no formato de hash. */
      bcrypt.genSalt().then((sal_a_gosto) => {
        bcrypt.hash(vl_cadastro[1], sal_a_gosto).then((s) => {
          
          // Monta a query de insercao e pega o obj. com o resultado
          vl_cadastro[1] = s;
          let dados; /* TODO: Verificar código da consulta: uma hora funciona de jeito x, em outra de jeito y */
          app.conecta_ai.consultar(cadastro, vl_cadastro).catch(erro => {
            dados = erro;
          });

          console.log(dados);
          // Se a insercao for bem sucedida, realiza o envio de email com os dados de acesso
          if(!dados) {

            let transportadora = nodemailer.createTransport({
              host: 'smtp.weeb.com',
              port: 587,
              secure: false,
              auth: {
                user: 'mySPAMBox@mailserver.com',
                pass: '*******' 
              }
            });

            transportadora.sendMail({
              from: 'SPAMBox@mailserver.com',
              to: 'otherSPAMBOX@mailserver.com',
              subject: '[NEWS DAILY] Cadastro de um desconhecido...',
              text: `Só passando pra avisar que ${vl_cadastro[0]} (${vl_cadastro[2]}) se cadastrou nessa joça.`,
              html: '<h1>Olá, seja bem vindooo!!!</h1><p>Meu nome é Valdehcyr da Conceição e te escrevo para te parabenizar por ter se cadastrado em nosso sistema!^^</p><button onclick="javascript:alert(\'Pegou verus! Sefu, kkjjj!\');">Confirmar conta</button>'
            }, (e, i) => {
              if(e) {
                console.log("FALHA AO ENVIAR MENSAGEM!!!");
                console.log(e);
              }
              console.log("MENSAGEM ENVIADA COM SUCESSO!");
              console.log(i);
            });
            return true;
          }
          return false;
        });
      });
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
      let putaqui = 'SELECT u.nome AS nome, u.email AS email, u.senha AS senha, u.situacao AS situacao, p.nome AS perfil_acessso, p.descricao AS descricao_perfil FROM newsdaily.usuario AS u INNER JOIN newsdaily.perfil AS p ON u.perfil_id = p.id_perfil WHERE email = $1';
      let dados;
      
      app.conecta_ai.consultar(putaqui, [email]).then((usrdt) => {
        dados = usrdt.rows[0];
      }).catch(erro => {
        return erro;
      });

      console.log(dados);
      if(dados instanceof Array) {
        /* presumimos que para ter chegado até aqui, é porque deu tudo certo */
        console.log("instância de um array..");
        console.log(dados);
      }

      if(dados != {} && dados != null) {
        bcrypt.compare(senha, dados.senha).then((compat) => {
          console.log(compat);
          if(compat === true) {
            delete dados.senha;
            return dados;
          }
          return {};
        });
      }
      return dados;
    }
  };
};