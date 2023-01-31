const app = require('./app');

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API TrybeClub está sendo executada na porta ${PORT}`);
});