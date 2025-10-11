// Helpers
const $ = (s, d=document) => d.querySelector(s);

// Estado del sidebar
const body = document.body;
const burger = $('.hamburger');
burger.addEventListener('click', () => {
  const open = body.classList.toggle('sidebar-open');
  burger.setAttribute('aria-expanded', String(open));
});

// Cierra sidebar al hacer click fuera (desktop)
document.addEventListener('click', (e) => {
  if (!body.classList.contains('sidebar-open')) return;
  const insideSidebar = e.target.closest('.sidebar');
  const insideBurger  = e.target.closest('.hamburger');
  if (!insideSidebar && !insideBurger && window.matchMedia('(max-width: 768px)').matches){
    body.classList.remove('sidebar-open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// Tema: Light / Dark / System
const root = document.documentElement;
const themeBtn = $('#themeBtn');
const themeLabel = $('#themeLabel');
const cycle = ['system', 'light', 'dark'];
let idx = cycle.indexOf(localStorage.getItem('theme') || 'system');

function applyTheme(){
  const mode = cycle[idx];
  root.setAttribute('data-theme', mode);
  themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1);
  localStorage.setItem('theme', mode);
}
themeBtn.addEventListener('click', () => { idx = (idx + 1) % cycle.length; applyTheme(); });
applyTheme();

// Share: Web Share API + fallback modal
const shareBtn = $('#shareBtn');
const shareModal = $('#shareModal');
const shareLink = $('#shareLink');
const copyLink = $('#copyLink');
const closeShare = $('#closeShare');

function openShare(){
  const url = location.href;
  if (navigator.share){
    navigator.share({ title: document.title, url }).catch(()=>{});
  } else {
    shareLink.value = url;
    shareModal.showModal();
  }
}
shareBtn.addEventListener('click', openShare);
copyLink.addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(shareLink.value);
    copyLink.textContent = 'Copied!';
    setTimeout(()=>copyLink.textContent='Copy', 1200);
  }catch{}
});
closeShare.addEventListener('click', () => shareModal.close());

// Idioma (placeholder)
$('#lang').addEventListener('change', (e) => {
  // Aquí podrías cargar traducciones dinámicas o redirigir a /es, /en, etc.
  console.log('Language:', e.target.value);
});

