/*____________________________________________________________________________________________________________*/
/*                                                /ES/AVISOS/                                                 */
/*____________________________________________________________________________________________________________*/


// ===========================
// 1: /es/avisos – Filtro + resaltado
// ===========================
(function setupNoticeFilter() {
  // Solo en la página de avisos
  if (!document.body.classList.contains('page-avisos')) return;

  const form       = document.querySelector('.notice-search');
  const field      = document.querySelector('.notice-search-field');
  const input      = document.getElementById('noticeSearchInput');
  const searchBtn  = document.querySelector('.notice-search-icon');
  const clearBtn   = document.querySelector('.notice-clear-btn');
  const cards      = document.querySelectorAll('.notice-card');
  const emptyState = document.getElementById('noticeEmpty');

  if (!form || !field || !input || !cards.length) return;

  // Estado de si el resaltado está activo o no
  let highlightOn = false;
  let lastQuery   = '';

  // ---------------------------
  // Helpers para resaltado
  // ---------------------------

  function clearHighlights() {
    const marks = document.querySelectorAll('.notice-highlight');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      // Reemplazar el <mark> por su texto plano
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize(); // fusionar nodos de texto contiguos
    });
  }

  function highlightInElement(el, query) {
    if (!el) return;
    const text = el.textContent;
    const q = query.trim();
    if (!q) return;

    // Escapar caracteres especiales del query para regex
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex   = new RegExp(`(${escaped})`, 'gi');

    // Solo trabajamos con texto simple dentro del elemento
    el.innerHTML = text.replace(
      regex,
      '<span class="notice-highlight">$1</span>'
    );
  }

  function applyHighlights(query) {
    const q = query.trim();
    if (!q) return;

    cards.forEach(card => {
      // Solo resaltamos en las tarjetas visibles
      if (card.style.display === 'none') return;

      const title = card.querySelector('.notice-title');
      const meta  = card.querySelector('.notice-meta');
      const desc  = card.querySelector('.notice-desc');

      highlightInElement(title, q);
      highlightInElement(meta,  q);
      highlightInElement(desc,  q);
    });
  }

  // ---------------------------
  // Filtro de tarjetas
  // ---------------------------
  function applyFilter(term) {
    const query = term.trim().toLowerCase();
    let matches = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();

      if (!query || text.includes(query)) {
        card.style.display = '';   // visible
        matches++;
      } else {
        card.style.display = 'none'; // oculto
      }
    });

    // Mostrar / ocultar mensaje de "sin resultados"
    if (emptyState) {
      if (query && matches === 0) {
        emptyState.hidden = false;
      } else {
        emptyState.hidden = true;
      }
    }

    lastQuery = term;

    // Si el resaltado está activado, volvemos a aplicarlo con el nuevo filtro
    if (highlightOn) {
      clearHighlights();
      applyHighlights(term);
    }
  }

  // ---------------------------
  // Eventos input / submit
  // ---------------------------

  // Actualizar clase has-text (para mostrar la X) + filtrar en vivo
  input.addEventListener('input', () => {
    const value = input.value;

    if (value.trim() !== '') {
      field.classList.add('has-text');
    } else {
      field.classList.remove('has-text');
    }

    applyFilter(value);
  });

  // Evitar recarga al enviar el form (por Enter)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilter(input.value);
  });

  // ---------------------------
  // Lupa: filtrar + toggle highlight ON/OFF
  // ---------------------------
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const term = input.value;

      // 1) Siempre aplicar filtro por si acaso
      applyFilter(term);
      input.focus();

      const hasQuery = term.trim() !== '';
      if (!hasQuery) {
        // Si no hay texto, desactivamos resaltado
        highlightOn = false;
        clearHighlights();
        return;
      }

      // 2) Toggle ON/OFF del resaltado
      if (!highlightOn) {
        // Encender
        clearHighlights();
        applyHighlights(term);
        highlightOn = true;
      } else {
        // Apagar
        clearHighlights();
        highlightOn = false;
      }
    });
  }

  // ---------------------------
  // X: limpiar y mostrar todo
  // ---------------------------
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      input.value = '';
      field.classList.remove('has-text');
      input.focus();

      highlightOn = false;
      clearHighlights();

      applyFilter('');
    });
  }

  // Estado inicial: mostrar todo sin resaltado
  applyFilter('');
})();



/*____________________________________________________________________________________________________________*/
/* ===========================================================================================================*/
/*                                                /ES/LEGAL/                                                */
/* ===========================================================================================================*/
/*____________________________________________________________________________________________________________*/

/*____________________________________________________________________________________________________________*/
/*                                           /ES/LEGAL/PRIVACIDAD – COPY EMAIL                                */
/*____________________________________________________________________________________________________________*/

document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('.email-copy-btn'));
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email =
        btn.dataset.email ||
        (btn.previousElementSibling &&
         btn.previousElementSibling.textContent.trim());

      if (!email) return;

      const feedbackEl = btn.parentElement.querySelector('.email-copy-feedback');
      const iconEl = btn.querySelector('i');

      const showFeedback = (msg) => {
        if (!feedbackEl) return;
        feedbackEl.textContent = msg;
        feedbackEl.classList.add('is-visible');
        setTimeout(() => feedbackEl.classList.remove('is-visible'), 2000);
      };

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const tmp = document.createElement('textarea');
          tmp.value = email;
          tmp.style.position = 'fixed';
          tmp.style.left = '-9999px';
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
        }

        if (iconEl) {
          iconEl.classList.remove('fa-copy');
          iconEl.classList.add('fa-check');
        }
        btn.classList.add('is-copied');
        showFeedback('Copiado');

        setTimeout(() => {
          btn.classList.remove('is-copied');
          if (iconEl) {
            iconEl.classList.remove('fa-check');
            iconEl.classList.add('fa-copy');
          }
        }, 1600);
      } catch {
        showFeedback('No se pudo copiar');
      }
    });
  });
});
