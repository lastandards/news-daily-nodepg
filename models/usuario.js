import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { user as userFrom } from '../config/secret/mail-access';
import sedexConfig from '../config/configuracao_sedex';

/*
 * TODO: Criar uma forma de inicializar o server em modo desenvolvedor com o ESLint 
 * mostrando as mudanças a serem feitas depois de carregado o servidor;
 * TODO: Implementar utilitário de envio de e-mails de confirmação
 * TODO: Implementar a comparação de senhas bcrypt do metodo login (abaixo)
 * TODO: Verificar a preferência entre um cadastro completo (de primeira) e um semi-cadastro
 * TODO: Discutir o uso (e a gravação do banco) dos ids de URL: http://g1.com.br/mundo/pessoa-vive-ate-120-a-54668/
 * TODO: Verificar código da consulta/banco: uma hora funciona de jeito x, em outra de jeito y
 * */
module.exports = app => {
  return {
    criar: (nome, senha, email, perfil_id) => {
      
      let rc;
      let cadastro = 'INSERT INTO newsdaily.tmp_usuario (nome, senha, email, perfil_id) VALUES ($1, $2, $3, $4)';
      let vl_cadastro = [nome, senha, email, perfil_id];
      
      /* Tempero da senha no formato de hash. */
      bcrypt.genSalt().then((sal_a_gosto) => {
        bcrypt.hash(vl_cadastro[1], sal_a_gosto).then((s) => {
          
          // Monta a query de insercao e pega o obj. com o resultado
          vl_cadastro[1] = s;
          app.conecta_ai.consultar(cadastro, vl_cadastro).then(() => {
            let consulta = 'SELECT u.nome AS nome, u.email AS email, u.data_validade AS validade \
            FROM newsdaily.tmp_usuario AS u \
            WHERE u.nome=$1 AND u.senha=$2 AND u.email=$3 AND u.perfil_id=$4';
            app.conecta_ai.consultar(consulta, vl_cadastro).then(retorno => {
              let dataBanco = new Date(Date.parse(retorno.rows[0].validade));
              let dataVal = new Date();
              dataVal.setUTCFullYear(dataBanco.getFullYear());
              dataVal.setUTCMonth(dataBanco.getMonth());
              dataVal.setUTCDate(dataBanco.getDate());
              dataVal.setUTCHours(dataBanco.getHours());
              dataVal.setUTCMinutes(dataBanco.getMinutes());
              dataVal.setUTCSeconds(dataBanco.getSeconds());
              dataVal.setUTCMilliseconds(dataBanco.getMilliseconds());
              //console.log(dataVal.getUTCTime().toString());
              //console.log(dataVal.toISOString());
              let dadosConfirmacao = {
                email: new Buffer(retorno.rows[0].email).toString('base64'),
                validade: new Buffer(dataVal.toISOString()).toString('base64') // tempo passado, em milisegundos, desde 1970 até a data registrada. Ex.: 1515907385099
              };
              //console.log(dadosConfirmacao);
              let transportadora = nodemailer.createTransport(sedexConfig);

              let infoDestino = {
                from: userFrom,
                to: retorno.rows[0].email,
                subject: `[NEWS DAILY] Bom dia sr. ${vl_cadastro[0]}!`,
                text: `${retorno.rows[0].nome}, parabéns por ter se cadastrado em nosso sistema! Seus dados de acesso a ele são:<br/>Usuário:${retorno.rows[0].email} e Senha: ${senha}. Para usufruir dos benefícios, é necessário confirmar sua conta. Para isso, cole o seguinte link no seu navegador http://localhost:3000/valida-cadastro?email=${dadosConfirmacao.email}&validade=${dadosConfirmacao.validade}. Você tem o prazo de 72h para ativar sua conta.`,
                html: `<h1>Bem vindo, ${retorno.rows[0].nome}!</h1><p>Agora você ficará por dentro das notícias mais quentes da sua cidade.^^ </p><p>Seus dados de acesso são:<br/>Usuário: ${retorno.rows[0].email}<br/>Senha: ${senha}</p><br/><a href="http://localhost:3000/valida-cadastro?email=${dadosConfirmacao.email}&validade=${dadosConfirmacao.validade}">Confirmar cadastro</a><br/><center><small>OBS: Você tem o prazo de 72h para ativar sua conta.</small></center><br/><small>Essa conta não é sua? <a href="#">Clique aqui</a> para cancelar notificações.</small>`
              };

              transportadora.sendMail(infoDestino, (e, i) => {
                console.log(`http://localhost:3000/valida-cadastro?email=${dadosConfirmacao.email}&validade=${dadosConfirmacao.validade}`);
                if(e) {
                  console.error(`Falha ao enviar mensagem para ${infoDestino.to}: ${e.name}\n${e.message}`);
                  console.log('Realizando segunda tentativa...');
                  transportadora.sendMail(infoDestino, (e, i) => {
                    if(e) {
                      console.error("Não foi possível realizar envio de e-mail!\nDetalhes do erro:");
                      console.log(`\t${e.stack}`);
                      rc = { code: 201, isCreated: true, sendEmail: false };
                    }
                  });
                }
                if (i) {
                  console.info("Mensagem de e-mail enviada com sucesso ao destino.");
                  console.info(i.response);
                  rc = { code: 201, isCreated: true, sendEmail: true };
                }
              });
            }).catch(erro => {
              console.log(erro);
            });
          }).catch(erro => {
            rc = { code: 500, isCreated: false, sendEmail: false, data: erro };
          }); //catch/then 1ª query
        }).catch((err) => {
          console.log(err);
        }); // then bcrypt.hash
      }).catch((err) => {
        console.log(err);
      }); // then bcrypt.genSalt
      return rc;
    },

    validar: (email, val) => {
      let eAiManoEAi;
      app.conecta_ai.consultar('SELECT * FROM newsdaily.tmp_usuario WHERE email = $1', [email]).then((rslt) => {
        if(!rslt.rows || rslt.rows.length < 1) {
          console.log("caiu no primeiro if");
          eAiManoEAi = { code: 404, isValidated: false };
          return eAiManoEAi;
        }
        let dataValBanco = new Date(rslt.rows[0].data_validade);
        console.log(dataValBanco.getTime());
        console.log(val.getTime());
        if(val.getTime() > dataValBanco.getTime()) {
          console.log("caiu no segndo if;");
          eAiManoEAi = {
            code: 410,
            isValidated: false
          };
          return eAiManoEAi;
        }
        console.log(rslt.rows[0]);
        eAiManoEAi = rslt.rows[0];
      }).catch((poMano) => {
        console.log(poMano);
        eAiManoEAi = { deuRuim: true };
      });
      return eAiManoEAi;
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