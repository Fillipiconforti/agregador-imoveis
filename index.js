const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.static('public'));

const buscaRouter = require('./src/routes/busca');
app.use('/busca', buscaRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});