import bcrypt from 'bcrypt';
import moduloDeEmail from '../utilitarios/email_module';

/*
 * TODO: Criar uma forma de inicializar o server em modo desenvolvedor e em modo produção 
 * TODO: Implementar a comparação de senhas bcrypt do metodo login (abaixo)
 * TODO: Discutir o uso (e a gravação do banco) dos ids de URL: http://g1.com.br/mundo/pessoa-vive-ate-120-a-54668/
 * TODO: Verificar código da consulta/banco: uma hora funciona de jeito x, em outra de jeito y
 * TODO: Fazer debug nos formatos das datas Javascript em UTC e do CURRENT_TIMESTAMP do postgres
 * */
module.exports = app => {
  return {
    criar: (nome, senha, email, perfil_id) => {
      
      let cadastro = 'INSERT INTO newsdaily.tmp_usuario (nome, senha, email, perfil_id) VALUES ($1, $2, $3, $4)';
      let vl_cadastro = [nome, senha, email, perfil_id];
      
      /* Tempero da senha no formato de hash. */
      const resultCadastro = bcrypt.genSalt().then((sal_a_gosto) => {
        return bcrypt.hash(vl_cadastro[1], sal_a_gosto).then((s) => {
          
          // Monta a query de insercao e pega o obj. com o resultado
          vl_cadastro[1] = s;
          return app.conecta_ai.consultar(cadastro, vl_cadastro).then(() => {
            let consulta = 'SELECT u.nome AS nome, u.email AS email, u.data_validade AS validade \
            FROM newsdaily.tmp_usuario AS u \
            WHERE u.nome=$1 AND u.senha=$2 AND u.email=$3 AND u.perfil_id=$4';
            return app.conecta_ai.consultar(consulta, vl_cadastro).then(retorno => {
              let dataBanco = new Date(Date.parse(retorno.rows[0].validade));
              //SELECT CURRENT_TIMESTAMP(0) = '2018-01-17T16:07:50';
              /*let dataVal = new Date();
              dataVal.setUTCFullYear(dataBanco.getFullYear());
              dataVal.setUTCMonth(dataBanco.getMonth());
              dataVal.setUTCDate(dataBanco.getDate());
              dataVal.setUTCHours(dataBanco.getHours());
              dataVal.setUTCMinutes(dataBanco.getMinutes());
              dataVal.setUTCSeconds(dataBanco.getSeconds());
              dataVal.setUTCMilliseconds(dataBanco.getMilliseconds());*/
              //console.log(dataVal.getUTCTime().toString());
              //console.log(dataVal.toISOString());
              let dadosConfirmacao = {
                email: new Buffer(retorno.rows[0].email).toString('base64'),
                validade: new Buffer(dataBanco.toISOString()).toString('base64') // tempo passado, em milisegundos, desde 1970 até a data registrada. Ex.: 1515907385099
              };
              //console.log(dadosConfirmacao);

              let emailEnviado = moduloDeEmail.enviar(
                retorno.rows[0].email,
                `[NEWS DAILY] Bom dia sr. ${vl_cadastro[0]}!`,
                `${retorno.rows[0].nome}, parabéns por ter se cadastrado em nosso sistema! Seus dados de acesso a ele são:<br/>Usuário:${retorno.rows[0].email} e Senha: ${senha}. Para usufruir dos benefícios, é necessário confirmar sua conta. Para isso, cole o seguinte link no seu navegador http://localhost:3000/valida-cadastro?email=${dadosConfirmacao.email}&validade=${dadosConfirmacao.validade}. Você tem o prazo de 72h para ativar sua conta.`,
                `<h1>Bem vindo, ${retorno.rows[0].nome}!</h1><p>Agora você ficará por dentro das notícias mais quentes da sua cidade.^^ </p><p>Seus dados de acesso são:<br/>Usuário: ${retorno.rows[0].email}<br/>Senha: ${senha}</p><br/><a href="http://localhost:3000/valida-cadastro?email=${dadosConfirmacao.email}&validade=${dadosConfirmacao.validade}">Confirmar cadastro</a><br/><center><small>OBS: Você tem o prazo de 72h para ativar sua conta.</small></center><br/><small>Essa conta não é sua? <a href="#">Clique aqui</a> para cancelar notificações.</small>`
              );

              console.log(
                '\n===[LINK ENVIADO PARA O E-MAIL]====================\n%s\n===========================\n', 
                `http://localhost:3000/validacao?email=${dadosConfirmacao.email}&validade=${dadosConfirmacao.validade}`
              );

              if(!emailEnviado) {
                return { codigo: 201, usuarioCriado: true, emailEnviado: false };
              }

              return { codigo: 201, usuarioCriado: true, emailEnviado: true };

            }).catch(erro => {
              return { codigo: 500, usuarioCriado: true, emailEnviado: false, data: erro };
            });
          }).catch(erro => {
            return { codigo: 500, usuarioCriado: false, emailEnviado: false, data: erro };
          }); //catch/then 1ª query
        }).catch((err) => {
          return { codigo: 500, message: "Falha durante a criação de hash!", data: err };
        }); // then bcrypt.hash
      }).catch((err) => {
        return { codigo: 500, message: "Falha ao iniciar procedimento de criação de hash", data: err };
      }); // then bcrypt.genSalt
      return resultCadastro;
    },

    validar: (email, val) => {
      const eAiManoEAi = app.conecta_ai.consultar('SELECT * FROM newsdaily.tmp_usuario WHERE email = $1', [email]).then((rslt) => {
        if(!rslt.rows || rslt.rows.length < 1) {
          return { codigo: 404, usuarioValidado: false };
        }
        let dataValBanco = new Date(rslt.rows[0].data_validade);
        //console.log(dataValBanco.getTime());
        //console.log(val.getTime());
        if(val.getTime() > dataValBanco.getTime()) {
          return {
            codigo: 410,
            usuarioValidado: false
          };
        }
        // Tudo OK? Então guarda o usuário na tabela de usuários fixos do sistema...
        return app.conecta_ai.consultar('INSERT INTO newsdaily.usuario (nome, email, senha, perfil_id) VALUES ($1, $2, $3, $4)', [rslt.rows[0].nome, rslt.rows[0].email, rslt.rows[0].senha, rslt.rows[0].perfil_id]).then(() => {
          // ... e remove o registro da tabela temporária.
          return app.conecta_ai.consultar('DELETE FROM newsdaily.tmp_usuario WHERE id_tmp_usuario = $1 AND nome = $2 AND email = $3 AND senha = $4 AND perfil_id = $5', [rslt.rows[0].id_tmp_usuario, rslt.rows[0].nome, rslt.rows[0].email, rslt.rows[0].senha, rslt.rows[0].perfil_id]).then(resultsDosFinalmentes => {
            
            // Avisa o usuário que sua conta foi devidamente validada.
            moduloDeEmail.enviar(
              rslt.rows[0].email,
              `[NEWS DAILY] Bem vindo ao News Daily :cool:!`,
              `Parabéns, ${rslt.rows[0].nome}, sua conta foi validada com sucesso. Agora você poderá ficar sabendo das principais novidades do país e do mundo. Comece filtrando os assuntos que você deseja, através deste link: http://localhost:3000/categorias.`,
              `<h1>Parabéns, ${rslt.rows[0].nome}!</h1><p>Sua conta foi validada com sucesso. Agora sim, você ficará por dentro das notícias mais quentes da sua cidade. ~.~ </p><p>Comece a ler os melhores conteudos publicados na Web, <a href="http://localhost:3000/categorias">vá até sua conta</a>, escolha seus assuntos favoritos e aproveite!</p><br/><small>Essa conta não é sua? <a href="#">Clique aqui</a> para cancelar notificações.</small>`
            );

            // TODO: Adicionar chave 'antigoRegistroExcluido' apenas em modo de desenvolvimento...
            if(resultsDosFinalmentes.rowCount === 1) {
              return { codigo: 200, usuarioValidado: true, antigoRegistroExcluido: true, emailEnviado: true };
            }
            if(resultsDosFinalmentes.rowCount === 0) {
              return { codigo: 200, usuarioValidado: true, antigoRegistroExcluido: false, emailEnviado: true };                
            }

          }).catch(err => {
            console.log(err);
            return { codigo: err.code, mensagem: "Não foi possivel remover registro temporário do usuário." };
          });
        }).catch(erro => {
          console.log(erro);
          return { codigo: erro.code, mensagem: "Não foi possivel inserir usuário na relação permanente." };
        });
      }).catch((error) => {
        console.log(error);
        return { codigo: error.code, mensagem: "Não foi possivel inserir usuário na relação permanente." };
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
      let putaqui = 'SELECT u.nome AS nome, u.email AS email, u.senha AS senha, u.situacao AS situacao, p.nome AS perfil_acessso, p.descricao AS descricao_perfil FROM newsdaily.usuario AS u INNER JOIN newsdaily.perfil AS p ON u.perfil_id = p.id_perfil WHERE email = $1 AND situacao = true';
      let informacoesValidas = app.conecta_ai.consultar(putaqui, [email]).then((dados) => {

        if(dados.rows && dados.rowCount === 1) {
          return bcrypt.compare(senha, dados.rows[0].senha).then((compat) => {
            if(compat === true) {
              delete dados.rows[0].senha;
              return {
                dadosValidos: compat,
                data: dados.rows[0]
              };
            }
            // retorna falso se senhas diferem
            return { dadosValidos: compat };
          });
        }
        // retorna falso se não for encontrado usuário ativo com o email informado
        return { dadosValidos: false };
      }).catch(erro => {
        return erro;
      });
      return informacoesValidas;
    }
  };
};