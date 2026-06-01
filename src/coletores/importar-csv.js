const fs = require('fs');
const path = require('path');
const pool = require('../db/conexao');

async function importarCSV(arquivo) {
  const conteudo = fs.readFileSync(arquivo, 'latin1');
  const linhas = conteudo.split('\n');
  
  let inseridos = 0;
  let erros = 0;

  for (let i = 2; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const cols = linha.split(';');
    if (cols.length < 11) continue;

    try {
      const cidade = cols[2]?.trim() || '';
      const bairro = cols[3]?.trim() || '';
      const endereco = cols[4]?.trim() || '';
      const precoStr = cols[5]?.trim().replace(/\./g, '').replace(',', '.') || '0';
      const preco = parseFloat(precoStr) || null;
      const descricao = cols[9]?.trim() || '';
      const modalidade = cols[10]?.trim() || '';
      const url_anuncio = cols[11]?.trim() || '';

      const tipo_transacao = modalidade.toLowerCase().includes('leil') ? 'leilao' : 'compra';
      
      const quartos = descricao.match(/(\d+)\s*qto/)?.[1] ? parseInt(descricao.match(/(\d+)\s*qto/)[1]) : null;
      const area = descricao.match(/(\d+[\.,]\d+)\s*de\s*área privativa/)?.[1]?.replace(',', '.') || null;
      const vagas = descricao.match(/(\d+)\s*vaga/)?.[1] ? parseInt(descricao.match(/(\d+)\s*vaga/)[1]) : 0;

      let tipo_imovel = 'imóvel';
      if (descricao.toLowerCase().startsWith('casa')) tipo_imovel = 'casa';
      else if (descricao.toLowerCase().startsWith('apto') || descricao.toLowerCase().startsWith('apartamento')) tipo_imovel = 'apartamento';
      else if (descricao.toLowerCase().startsWith('terreno')) tipo_imovel = 'terreno';
      else if (descricao.toLowerCase().startsWith('loja') || descricao.toLowerCase().startsWith('sala')) tipo_imovel = 'comercial';

      const titulo = `${tipo_imovel.charAt(0).toUpperCase() + tipo_imovel.slice(1)} - ${bairro}, ${cidade}`;

      const descricaoCompleta = `${descricao}. Modalidade: ${modalidade}.${vagas > 0 ? ` ${vagas} vaga(s) de garagem.` : ''}`;

      await pool.query(
        `INSERT INTO imoveis 
          (fonte, titulo, preco, tipo_imovel, tipo_transacao, endereco, bairro, cidade, area_m2, quartos, url_anuncio, descricao)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT DO NOTHING`,
        ['Caixa Econômica', titulo, preco, tipo_imovel, tipo_transacao, endereco, bairro, cidade, area ? parseFloat(area) : null, quartos, url_anuncio, descricaoCompleta]
      );
      inseridos++;
    } catch (err) {
      erros++;
    }
  }

  console.log(`Importados: ${inseridos} imóveis, Erros: ${erros}`);
  process.exit();
}

const arquivo = process.argv[2] || path.join(process.env.HOME, 'Downloads/Lista_imoveis_RJ.csv');
importarCSV(arquivo);