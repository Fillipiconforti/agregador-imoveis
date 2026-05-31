const express = require('express');
const router = express.Router();
const pool = require('../db/conexao');

router.get('/', async (req, res) => {
  const { cidade, tipo_transacao, tipo_imovel, preco_min, preco_max } = req.query;

  let query = 'SELECT * FROM imoveis WHERE 1=1';
  let params = [];
  let i = 1;

  if (cidade) {
    query += ` AND cidade ILIKE $${i++}`;
    params.push(`%${cidade}%`);
  }
  if (tipo_transacao) {
    query += ` AND tipo_transacao = $${i++}`;
    params.push(tipo_transacao);
  }
  if (tipo_imovel) {
    query += ` AND tipo_imovel = $${i++}`;
    params.push(tipo_imovel);
  }
  if (preco_min) {
    query += ` AND preco >= $${i++}`;
    params.push(preco_min);
  }
  if (preco_max) {
    query += ` AND preco <= $${i++}`;
    params.push(preco_max);
  }

  query += ' ORDER BY coletado_em DESC LIMIT 50';

  try {
    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar imóveis' });
  }
});
router.get('/id/:id', async (req, res) => {
    try {
      const resultado = await pool.query('SELECT * FROM imoveis WHERE id = $1', [req.params.id]);
      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Imóvel não encontrado' });
      }
      res.json(resultado.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar imóvel' });
    }
  });
module.exports = router;