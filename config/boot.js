module.exports = (app) => {
  //prompt("Insira o numero da porta", 3000);
  app.listen(app.get("THE_DOOR"), () => {
    console.log("É sucesso!");
  }).once('listening', () => {
    console.log(`App rodando na porta ${app.get("THE_DOOR")}!`);
  }).once('error', e => {
    console.log("Erro!!!!");
    if(e.code !== 'EADDRINUSE') {
      app.close();
      console.log(e);
      return;
    }
    console.log(`Porta ${app.get("THE_DOOR")} em uso. A escolher outra porta...`);
    while(app.get('THE_DOOR') <= 1024 || app.get('THE_DOOR') === 3000 || app.get('THE_DOOR') >= 65536) {
      app.set('THE_DOOR', Math.floor((Math.random() * 6000) + 1)); 
    }
    console.log(`Agora sim, App rodando na porta ${app.get("THE_DOOR")}!`);
  });
};