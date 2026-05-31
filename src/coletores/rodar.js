const { coletarMercadoLivre } = require('./olx');

async function rodarColeta() {
  await coletarMercadoLivre('Rio de Janeiro');
  await coletarMercadoLivre('São Paulo');
  process.exit();
}

rodarColeta();