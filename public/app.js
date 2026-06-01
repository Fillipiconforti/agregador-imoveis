let visualizacao = 'grid';
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cidade').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') buscar();
    });
  });
function toggleFiltros() {
  const sec = document.getElementById('filtros-secundarios');
  const label = document.getElementById('toggle-label');
  if (sec.style.display === 'none') {
    sec.style.display = 'flex';
    label.textContent = '− Menos filtros';
  } else {
    sec.style.display = 'none';
    label.textContent = '+ Mais filtros';
  }
}

function setVis(tipo) {
  visualizacao = tipo;
  document.getElementById('btn-grid').classList.toggle('ativo', tipo === 'grid');
  document.getElementById('btn-lista').classList.toggle('ativo', tipo === 'lista');
  const cards = document.getElementById('cards');
  cards.className = tipo;
  renderCards(window.ultimosResultados || []);
}

async function buscar() {
  const cidade = document.getElementById('cidade').value;
  if (!cidade) { alert('Digite uma cidade para buscar!'); return; }

  document.getElementById('contador').textContent = 'Buscando...';
  document.getElementById('cards').innerHTML = '';
  document.getElementById('resultados-header').style.display = 'none';

  let url = `/busca?cidade=${encodeURIComponent(cidade)}`;
  const tipo_transacao = document.getElementById('tipo_transacao').value;
  const tipo_imovel = document.getElementById('tipo_imovel').value;
  const preco_min = document.getElementById('preco_min').value;
  const preco_max = document.getElementById('preco_max').value;
  const quartos = document.getElementById('quartos').value;

  if (tipo_transacao) url += `&tipo_transacao=${tipo_transacao}`;
  if (tipo_imovel) url += `&tipo_imovel=${tipo_imovel}`;
  if (preco_min) url += `&preco_min=${preco_min}`;
  if (preco_max) url += `&preco_max=${preco_max}`;
  if (quartos) url += `&quartos=${quartos}`;

  try {
    const resposta = await fetch(url);
    let imoveis = await resposta.json();

    // filtros secundários client-side
    const garagem = document.getElementById('garagem').checked;
    const mobiliado = document.getElementById('mobiliado').checked;
    const aceita_pet = document.getElementById('aceita_pet').checked;
    const quintal = document.getElementById('quintal').checked;
    const piscina = document.getElementById('piscina').checked;
    const academia = document.getElementById('academia').checked;

    if (garagem) imoveis = imoveis.filter(i => i.descricao?.toLowerCase().includes('vaga') || i.descricao?.toLowerCase().includes('garagem'));
    if (mobiliado) imoveis = imoveis.filter(i => i.descricao?.toLowerCase().includes('mobili'));
    if (aceita_pet) imoveis = imoveis.filter(i => i.descricao?.toLowerCase().includes('pet'));
    if (quintal) imoveis = imoveis.filter(i => i.descricao?.toLowerCase().includes('quintal'));
    if (piscina) imoveis = imoveis.filter(i => i.descricao?.toLowerCase().includes('piscina'));
    if (academia) imoveis = imoveis.filter(i => i.descricao?.toLowerCase().includes('academia'));

    window.ultimosResultados = imoveis;

    document.getElementById('resultados-header').style.display = 'flex';
    document.getElementById('contador').textContent = `${imoveis.length} imóvel(is) encontrado(s)`;

    if (imoveis.length === 0) {
      document.getElementById('cards').innerHTML = '<div class="sem-resultado">😕 Nenhum imóvel encontrado com esses filtros.</div>';
      return;
    }

    document.getElementById('cards').className = visualizacao;
    renderCards(imoveis);

  } catch (err) {
    document.getElementById('contador').textContent = 'Erro ao buscar. Tente novamente.';
    console.error(err);
  }
}

async function buscarFoto(urlAnuncio, id) {
    try {
      const res = await fetch(`/busca/foto?url=${encodeURIComponent(urlAnuncio)}`);
      const data = await res.json();
      if (data.foto) {
        const img = document.getElementById(`foto-${id}`);
        if (img) img.src = data.foto;
      }
    } catch (e) {}
  }
  
  function renderCards(imoveis) {
    const isLista = visualizacao === 'lista';
  
    const cards = imoveis.map(imovel => {
      const preco = Number(imovel.preco);
      const precoFormatado = preco > 10000
        ? `R$ ${preco.toLocaleString('pt-BR')}`
        : `R$ ${preco.toLocaleString('pt-BR')}/mês`;
  
      const tags = [];
      if (imovel.descricao?.toLowerCase().includes('vaga') || imovel.descricao?.toLowerCase().includes('garagem')) tags.push('🚗 Garagem');
      if (imovel.descricao?.toLowerCase().includes('mobili')) tags.push('🛋️ Mobiliado');
      if (imovel.descricao?.toLowerCase().includes('pet')) tags.push('🐾 Aceita pet');
      if (imovel.descricao?.toLowerCase().includes('quintal')) tags.push('🌿 Quintal');
      if (imovel.descricao?.toLowerCase().includes('piscina')) tags.push('🏊 Piscina');
      if (imovel.descricao?.toLowerCase().includes('academia')) tags.push('💪 Academia');
  
      const lat = imovel.latitude || -22.9068;
      const lng = imovel.longitude || -43.1729;
      const fotoDefault = `https://via.placeholder.com/400x300/1D9E75/ffffff?text=${encodeURIComponent(imovel.tipo_imovel?.toUpperCase() || 'IMÓVEL')}`;
  
      return `
        <div class="card ${isLista ? 'lista-item' : ''}">
          <img id="foto-${imovel.id}" src="${imovel.foto_url || fotoDefault}" alt="${imovel.titulo}" />
          <div class="card-body">
            <div class="card-fonte">${imovel.fonte}</div>
            <div class="card-titulo">${imovel.titulo}</div>
            <div class="card-preco">${precoFormatado}</div>
            <div class="card-detalhes">
              ${imovel.area_m2 ? imovel.area_m2 + ' m²' : ''}
              ${imovel.quartos ? '· ' + imovel.quartos + ' quartos' : ''}
              ${imovel.bairro ? '· ' + imovel.bairro : ''}
            </div>
            ${tags.length ? `<div class="card-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            <div class="card-descricao">${imovel.descricao || ''}</div>
            <a class="card-link" href="/imovel.html?id=${imovel.id}">Ver detalhes →</a>
          </div>
        </div>
      `;
    }).join('');
  
    document.getElementById('cards').innerHTML = cards;
  
    // Busca fotos reais em paralelo
    imoveis.forEach(imovel => {
      if (!imovel.foto_url && imovel.url_anuncio) {
        buscarFoto(imovel.url_anuncio, imovel.id);
      }
    });
  }