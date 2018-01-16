import nodemailer from 'nodemailer';
import { user as remetente } from '../config/secret/mail-access';
import sedexConfig from '../config/configuracao_sedex';

let transportadora = nodemailer.createTransport(sedexConfig);

module.exports = {
  enviar: (destinatario, assunto, corpo_como_texto, corpo_como_html) => {

    // ... ao ver o nome da variavel abaixo, você pode estar imaginando: Putz! Isso não é sério...
    let objetoQueSimbolizaOCorreioEletronico = {
      from: remetente,
      to: destinatario,
      subject: assunto,
      text: corpo_como_texto,
      html: corpo_como_html
    };
    // ... é, você tem toda a razão.

    transportadora.sendMail(objetoQueSimbolizaOCorreioEletronico, (err, info) => {
      
      if(err) {
        console.error(`Falha ao enviar mensagem para ${destinatario}: ${err.name}\n${err.message}`);
        console.log('Realizando segunda tentativa...');
        transportadora.sendMail(objetoQueSimbolizaOCorreioEletronico, (er, inf) => {
          if(er) {
            console.error("Não foi possível realizar envio de e-mail!\nDetalhes do erro:");
            console.log(`\t${er.stack}`);
            return false;
          }
          if (inf) {
            console.info("Mensagem de e-mail enviada com sucesso ao destino na segunda tentativa.");
            console.info(inf.response);
            return true;
          }
        });
      }
      if (info) {
        console.info("Mensagem de e-mail enviada com sucesso ao destino.");
        console.info(info.response);
        return true;
      }
    });
  } // FIM função 'enviar' email
}; // FIM JSON Object