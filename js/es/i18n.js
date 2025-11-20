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
        // Mensajes para errores en consola
        errorCopy: 'Error copying URL:',

        // Mensajes para compartir en redes
        msgX:
          '🚻 Find accessible, free and private bathrooms in NYC.\n' +
          '#NYC #NYCTips #DeliveryLife #Tourist',

        msgWa:
          '🚻 Looking for accessible, free or private bathrooms in NYC?\n' +
          'Check this map:',
      },
    },
    es: {
      theme: {
        lightLabel: 'Modo claro',
        darkLabel: 'Modo oscuro',
      },
      share: {
        // Mensajes para errores en consola
        errorCopy: 'Error copiando URL:',

        // Mensaje para X (Twitter)
        msgX:
          '🚻 Encuentra baños accesibles, gratuitos y privados en NYC.\n' +
          '#NuevaYork #TurismoNY #NYC #NYCTips #DeliveryLife',

        // Mensaje para WhatsApp
        msgWa:
          '🚻 ¿Buscas baños accesibles, gratuitos o privados en New York City?\n' +
          'Mira este mapa:',
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

