import contaEmail from './secret/mail-access';

module.exports = {
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: contaEmail
};