import contaEmail from './secret/mail-access';

module.exports = {
  host: 'smtp.openmailbox.org',
  port: 587,
  secure: true,
  auth: contaEmail
};