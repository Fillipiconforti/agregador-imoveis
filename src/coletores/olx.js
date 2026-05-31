const axios = require('axios');
const pool = require('../db/conexao');

async function coletarMercadoLivre(cidade) {
  try {
    console.log(`Coletando MercadoLivre Imóveis: ${cidade}`);

    const resposta = await axios.get(
      `https://api.mercadolibre.com/sites/MLB/search?category=MLB1459&q=${encodeURIComponent(cidade)}&limit=50`
    );

    const anuncios = resposta.data.results || [];
    console.log(`Encontrados: ${anuncios.length} anúncios`);

    for (const anuncio of anuncios) {
      const preco = anuncio.price || null;
      const titulo = anuncio.title || '';
      const url_anuncio = anuncio.permalink || '';
      const foto_url = anuncio.thumbnail || null;
      const cidade_anuncio = cidade;
      const tipo_transacao = anuncio.title?.toLowerCase().includes('aluguel') ? 'aluguel' : 'compra';

      await pool.query(
        `INSERT INTO imoveis 
          (fonte, titulo, preco, tipo_imovel, tipo_transacao, cidade, foto_url, url_anuncio)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        ['MercadoLivre', titulo, preco, 'apartamento', tipo_transacao, cidade_anuncio, foto_url, url_anuncio]
      );
    }

    console.log('Coleta finalizada!');
  } catch (err) {
    console.error('Erro na coleta:', err.message);
  }
}

module.exports = { coletarMercadoLivre };