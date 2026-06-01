const axios = require('axios');
const pool = require('../db/conexao');

async function coletarCaixa() {
  try {
    console.log('Coletando imóveis da Caixa Econômica...');

    const url = 'https://venda-imoveis.caixa.gov.br/listaweb/Lista_imoveis_1.json';

    const resposta = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      timeout: 30000
    });

    const imoveis = resposta.data;
    console.log(`Encontrados: ${imoveis.length} imóveis`);

    let inseridos = 0;

    for (const imovel of imoveis.slice(0, 100)) {
      try {
        const titulo = `${imovel.tipo_imovel || 'Imóvel'} - ${imovel.bairro || ''} ${imovel.cidade || ''}`.trim();
        const preco = parseFloat(imovel.preco_venda?.replace(/[^0-9,]/g, '').replace(',', '.')) || null;
        const cidade = imovel.cidade || '';
        const bairro = imovel.bairro || '';
        const endereco = imovel.logradouro || '';
        const area = parseFloat(imovel.area_total) || null;
        const url_anuncio = imovel.link_acesso || 'https://venda-imoveis.caixa.gov.br';
        const foto_url = imovel.foto || null;
        const descricao = `Imóvel da Caixa Econômica. ${imovel.descricao || ''}`.trim();
        const tipo_imovel = (imovel.tipo_imovel || 'imóvel').toLowerCase();

        await pool.query(
          `INSERT INTO imoveis 
            (fonte, titulo, preco, tipo_imovel, tipo_transacao, endereco, bairro, cidade, area_m2, foto_url, url_anuncio, descricao)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT DO NOTHING`,
          ['Caixa Econômica', titulo, preco, tipo_imovel, 'compra', endereco, bairro, cidade, area, foto_url, url_anuncio, descricao]
        );
        inseridos++;
      } catch (err) {
        console.error('Erro ao inserir imóvel:', err.message);
      }
    }

    console.log(`Inseridos: ${inseridos} imóveis`);
  } catch (err) {
    console.error('Erro na coleta da Caixa:', err.message);
  }
}

module.exports = { coletarCaixa };