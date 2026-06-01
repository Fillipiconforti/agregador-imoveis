const { coletarCaixa } = require('./caixa');

async function rodarColeta() {
  await coletarCaixa();
  process.exit();
}

rodarColeta();