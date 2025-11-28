/*____________________________________________________________________________________________________________*/
/*                                                /ES/AVISOS/                                                 */
/*____________________________________________________________________________________________________________*/


// ===========================
// 1: /es/avisos – Filtro de avisos
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

  function applyFilter(term) {
    const query = term.trim().toLowerCase();
    let matches = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();

      // 🔹 leer los tags del atributo data-tags (si existe)
      const tags = (card.dataset.tags || '').toLowerCase();

      // 🔹 coincidencia en texto visible O en tags
      const hasMatch =
        !query ||            // si no hay query, siempre muestra
        text.includes(query) ||
        tags.includes(query);

      if (hasMatch) {
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
  }

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

  // Evitar recarga al enviar el form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilter(input.value);
  });

  // Click en la lupa = ejecutar búsqueda
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      input.focus();
      applyFilter(input.value);
    });
  }

  // Click en la X = limpiar y mostrar todo
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      input.value = '';
      field.classList.remove('has-text');
      input.focus();
      applyFilter('');
    });
  }

  // Estado inicial: mostrar todo
  applyFilter('');
})();
