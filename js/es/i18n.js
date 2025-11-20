// js/i18n.js
(function (global) {
  // Detectar idioma a partir del <html lang="...">
  const htmlLang = (document.documentElement.lang || '').toLowerCase();
  let currentLang = 'en'; // por defecto

  if (htmlLang.startsWith('es')) {
    currentLang = 'es';
  } else if (htmlLang.startsWith('en')) {
    currentLang = 'en';
  }

  // Diccionario de textos de UI
  const STRINGS = {
    en: {
      theme: {
        lightLabel: 'Light mode',
        darkLabel: 'Dark mode',
      },
      share: {
        errorCopy: 'Error copying URL:',
      },
    },
    es: {
      theme: {
        lightLabel: 'Modo claro',
        darkLabel: 'Modo oscuro',
      },
      share: {
        errorCopy: 'Error copiando URL:',
      },
    },
  };

  // Función helper para leer claves tipo "theme.lightLabel"
  function t(key) {
    const langPack = STRINGS[currentLang] || STRINGS.en;
    const parts = key.split('.');
    let value = langPack;

    for (const p of parts) {
      if (value && Object.prototype.hasOwnProperty.call(value, p)) {
        value = value[p];
      } else {
        // Si no existe la clave, devolvemos la propia key como fallback
        return key;
      }
    }
    return value;
  }

  // Exponer un pequeño objeto global
  global.GB_I18N = {
    t,
    lang: currentLang,
  };
})(window);

