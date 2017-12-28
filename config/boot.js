module.exports = (app) => {
  app.listen(app.get("THE_DOOR"), () => {
    console.log(`App rodando na porta ${app.get("THE_DOOR")}!`);
  });
}