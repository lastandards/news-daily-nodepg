import contaEmail from './secret/mail-access';

module.exports = {
  host: '<mysmtpserver>',
  port: 587,
  secure: false,
  auth: contaEmail
};