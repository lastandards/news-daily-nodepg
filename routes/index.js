import perfis from './perfis.js';

module.exports = (app) => {
  app.use('/perfis', perfis);
}