// script.js - lógica principal (localStorage, painel, galeria, lightbox)
(() => {
  const SITE_DATA_KEY = 'dev-bn-silva.netlify.app';
  const ADMIN_USER = 'jean';
  const ADMIN_PASS = 'jean@';

  // Elements
  const admUser = document.getElementById('admUser');
  const admPass = document.getElementById('admPass');
  const doLogin = document.getElementById('doLogin');
  const btnTogglePanel = document.getElementById('btnTogglePanel');

  const panelOverlay = document.getElementById('panelOverlay');
  const adminControls = document.getElementById('adminControls');
  const closePanelBtn = document.getElementById('closePanelBtn');
  const logoutAdmin = document.getElementById('logoutAdmin');

  const siteTitle = document.getElementById('siteTitle');
  const aboutInput = document.getElementById('aboutInput');
  const contactInput = document.getElementById('contactInput');

  const fileInput = document.getElementById('fileInput');
  const imgTitle = document.getElementById('imgTitle');
  const imgDesc = document.getElementById('imgDesc');
  const uploadBtn = document.getElementById('uploadBtn');

  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');

  const adminList = document.getElementById('adminList');
  const stats = document.getElementById('stats');
  const gallery = document.getElementById('gallery');
  const aboutTextArea = document.getElementById('aboutTextArea');
  const contactArea = document.getElementById('contactArea');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeLightbox = document.getElementById('closeLightbox');

  const panelCloseX = document.getElementById('modalCloseX');

  // Helpers / defaults
  function defaultData(){
    return {
      title: 'Jean Carlos | Fotógrafo Profissional',
      about: '<p>Sou Jean Carlos, fotógrafo profissional com foco em retratos e eventos. Transformo memórias em imagens únicas e atemporais.</p>',
      contact: '<p>📍 São Paulo — SP<br>📧 braiansilva76g@gmail.com<br>📸 <a href="https://www.instagram.com/jc.fotografiaoficial/#" target="_blank" rel="noopener noreferrer">@jc.fotografiaoficial</a></p>',
      images: []
    };
  }
  function loadData(){
    const raw = localStorage.getItem(SITE_DATA_KEY);
    if(!raw){ localStorage.setItem(SITE_DATA_KEY, JSON.stringify(defaultData())); return defaultData(); }
    try { return JSON.parse(raw); } catch(e){ console.error('parse error', e); localStorage.setItem(SITE_DATA_KEY, JSON.stringify(defaultData())); return defaultData(); }
  }
  function saveData(obj){ localStorage.setItem(SITE_DATA_KEY, JSON.stringify(obj)); renderAll(); }

  // Auth
  function isLogged(){ return sessionStorage.getItem('jc_logged') === '1'; }
  function login(u,p){
    if(u === ADMIN_USER && p === ADMIN_PASS){
      sessionStorage.setItem('jc_logged','1');
      openPanelOverlay();
      return true;
    }
    return false;
  }

  doLogin.addEventListener('click', () => {
    const u = admUser.value.trim(), p = admPass.value.trim();
    if(login(u,p)){ showControls(); admUser.value=''; admPass.value=''; } else alert('Usuário ou senha incorretos.');
  });

  // toggle panel open
  btnTogglePanel.addEventListener('click', () => {
    if(isLogged()) openPanelOverlay(); else alert('Acesse com usuário/senha para abrir o painel.');
  });

  // open/close overlay
  function openPanelOverlay(){ panelOverlay.classList.add('show'); panelOverlay.setAttribute('aria-hidden','false'); if(!isLogged()) return; showControls(); }
  function closePanelOverlay(){ panelOverlay.classList.remove('show'); panelOverlay.setAttribute('aria-hidden','true'); }
  closePanelBtn.addEventListener('click', closePanelOverlay);
  panelCloseX.addEventListener('click', closePanelOverlay);
  panelOverlay.addEventListener('click', e => { if(e.target === panelOverlay) closePanelOverlay(); });

  // show controls when logged
  function showControls(){
    adminControls.style.display = 'block';
    fillAdminFields();
  }

  logoutAdmin.addEventListener('click', ()=> {
    sessionStorage.removeItem('jc_logged');
    adminControls.style.display = 'none';
    closePanelOverlay();
  });

  // fill admin fields
  function fillAdminFields(){
    const d = loadData();
    siteTitle.value = d.title || '';
    aboutInput.value = stripHtml(d.about) || d.about || '';
    contactInput.value = stripHtml(d.contact) || d.contact || '';
    renderAdminList();
    updateStats();
  }

  // upload
  uploadBtn.addEventListener('click', ()=>{
    const file = fileInput.files[0];
    const title = imgTitle.value.trim() || 'Sem título';
    const desc = imgDesc.value.trim() || '';
    if(!file) return alert('Selecione um arquivo.');
    const reader = new FileReader();
    reader.onload = ()=> {
      const d = loadData();
      d.images.unshift({
        id: Date.now() + '_' + Math.floor(Math.random()*9999),
        title,
        desc,
        dataURL: reader.result,
        created_at: (new Date()).toLocaleString()
      });
      saveData(d);
      fileInput.value=''; imgTitle.value=''; imgDesc.value='';
      alert('Imagem adicionada localmente!');
    };
    reader.readAsDataURL(file);
  });

  // render gallery & admin list
  function renderAll(){
    const d = loadData();
    document.getElementById('siteMainTitle').textContent = d.title || 'Jean Carlos | Fotógrafo Profissional';
    gallery.innerHTML = '';
    if(!d.images.length) gallery.innerHTML = '<div class="muted center">Nenhuma imagem</div>';
    d.images.forEach(img => {
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<img src="${img.dataURL}" alt="${escapeHtml(img.title)}"><div class="meta"><h4>${escapeHtml(img.title)}</h4><p>${escapeHtml(img.created_at)}</p></div>`;
      card.querySelector('img').addEventListener('click', ()=> openLightbox(img.dataURL));
      gallery.appendChild(card);
    });
    aboutTextArea.innerHTML = d.about || '';
    contactArea.innerHTML = d.contact || '';
    renderAdminList();
    updateStats();
  }

  function renderAdminList(){
    const d = loadData();
    adminList.innerHTML = '';
    if(!d.images.length){ adminList.innerHTML = '<div class="muted">Nenhuma imagem cadastrada</div>'; return; }
    d.images.forEach(img => {
      const div = document.createElement('div'); div.className='list-item';
      div.innerHTML = `<img class="thumb" src="${img.dataURL}" alt=""><div style="flex:1"><strong>${escapeHtml(img.title)}</strong><div class="muted" style="font-size:.8rem">${escapeHtml(img.created_at)}</div></div><div><span class="action-link" data-id="${img.id}">Excluir</span></div>`;
      adminList.appendChild(div);
    });
    adminList.querySelectorAll('.action-link').forEach(el=>{
      el.addEventListener('click', (e)=>{
        if(!confirm('Excluir imagem permanentemente?')) return;
        const id = e.currentTarget.dataset.id;
        const d = loadData(); d.images = d.images.filter(i=> i.id !== id); saveData(d);
      });
    });
  }

  function updateStats(){ const d = loadData(); stats.textContent = 'Imagens: ' + (d.images.length || 0); }

  // save title/about/contact
  siteTitle.addEventListener('change', ()=> { const d = loadData(); d.title = siteTitle.value.trim() || d.title; saveData(d); });
  aboutInput.addEventListener('change', ()=> { const d = loadData(); d.about = aboutInput.value.trim() || '<p></p>'; saveData(d); });
  contactInput.addEventListener('change', ()=> { const d = loadData(); d.contact = contactInput.value.trim() || '<p></p>'; saveData(d); });

  // export/import
  exportBtn.addEventListener('click', ()=> {
    const raw = localStorage.getItem(SITE_DATA_KEY) || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'jc_backup_' + Date.now() + '.json'; a.click();
    URL.revokeObjectURL(a.href);
  });
  importFile.addEventListener('change', (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=> {
      try { const obj = JSON.parse(r.result);
        if(confirm('Importar backup substituirá os dados atuais. Confirmar?')) { localStorage.setItem(SITE_DATA_KEY, JSON.stringify(obj)); renderAll(); alert('Backup importado.'); }
      } catch { alert('Arquivo inválido.'); }
    };
    r.readAsText(f);
  });

  // lightbox
  function openLightbox(src){ lightboxImg.src = src; lightbox.classList.add('show'); lightbox.setAttribute('aria-hidden','false'); }
  function closeLB(){ lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden','true'); }
  closeLightbox.addEventListener('click', closeLB);
  lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLB(); });

  // helpers
  function stripHtml(str){ return String(str||'').replace(/<\/?[^>]+(>|$)/g, ""); }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // scroll reveal
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.style.opacity='1'; entry.target.style.transform='none'; entry.target.style.transition='all .8s ease'; observer.unobserve(entry.target); }
    });
  }, {threshold:0.18});
  document.querySelectorAll('section').forEach(s=>{ s.style.opacity='0'; s.style.transform='translateY(18px)'; observer.observe(s); });

  // init
  (function init(){ if(!localStorage.getItem(SITE_DATA_KEY)) localStorage.setItem(SITE_DATA_KEY, JSON.stringify(defaultData())); renderAll(); })();

  // ESC closes overlays
  document.addEventListener('keydown', e => { if(e.key==='Escape'){ closeLB(); closePanelOverlay(); } });

  // close overlay helper for internal use
  function closePanelOverlay(){ panelOverlay.classList.remove('show'); panelOverlay.setAttribute('aria-hidden','true'); }
  // openPanelOverlay used by login handler earlier
})();
// URL e chave anon da sua instância Supabase (substitua pelos seus dados)
const SUPABASE_URL = 'https://shiezjgnywzrrxxuukwx.supabase.co'; // seu endpoint
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // sua anon key

// Inicializa o cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Pega o container da galeria
const galleryEl = document.getElementById('gallery');

// Função para buscar e exibir fotos
async function loadGallery() {
  // Busca todos os registros da tabela galeria
  const { data, error } = await supabase
    .from('galeria')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar fotos:', error);
    galleryEl.innerHTML = `<p>Erro ao carregar a galeria.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    galleryEl.innerHTML = `<p>Nenhuma foto encontrada.</p>`;
    return;
  }

  // Limpa galeria antes de popular
  galleryEl.innerHTML = '';

  // Monta HTML para cada foto
  data.forEach(({ id, url, titulo, descricao }) => {
    const div = document.createElement('div');
    div.classList.add('foto-item');

    div.innerHTML = `
      <img src="${url}" alt="${titulo || 'Foto'}" loading="lazy" />
      <h4>${titulo || ''}</h4>
      <p>${descricao || ''}</p>
    `;

    galleryEl.appendChild(div);
  });
}

// Carrega galeria assim que a página abrir
window.addEventListener('DOMContentLoaded', loadGallery);
